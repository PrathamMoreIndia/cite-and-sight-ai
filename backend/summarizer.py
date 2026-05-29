import torch
import re
from transformers import BartTokenizer, BartForConditionalGeneration


class AbstractiveSummarizer:
    def __init__(self, model_name: str = "facebook/bart-large-cnn"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Summarizer] Loading model '{model_name}' on {self.device}...")

        self.tokenizer = BartTokenizer.from_pretrained(model_name)
        self.model = BartForConditionalGeneration.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
        ).to(self.device)

        self.model.eval()
        self.max_chunk_tokens = 900
        print("[Summarizer] Model ready.")

    def _split_into_chunks(self, text: str) -> list[str]:
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        chunks, current_chunk, current_length = [], [], 0

        for sentence in sentences:
            token_len = len(self.tokenizer.encode(sentence, add_special_tokens=False))
            if current_length + token_len > self.max_chunk_tokens and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [sentence]
                current_length = token_len
            else:
                current_chunk.append(sentence)
                current_length += token_len

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def _summarize_chunk(self, text: str, compression: float, num_beams: int) -> str:
        
        # FIX 1: Count TOKENS instead of words for accurate generation limits
        input_tokens = len(self.tokenizer.encode(text, add_special_tokens=False))
        
        # Calculate targets based on tokens, capped at BART's absolute maximum
        target_len = int(input_tokens * compression)
        max_len = min(target_len, 1024) 
        
        # FIX 2: Force a much higher minimum length (80% of the target) 
        # to stop the AI from ending the summary prematurely
        min_len = int(max_len * 0.80) 
        
        # Safety checks to prevent pipeline crashes
        max_len = max(max_len, 40)
        min_len = max(min_len, 20)
        if min_len >= max_len:
            min_len = max_len - 1

        inputs = self.tokenizer(
            text, return_tensors="pt", truncation=True, max_length=1024
        ).to(self.device)

        with torch.no_grad():
            summary_ids = self.model.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                num_beams=num_beams,
                length_penalty=2.0,
                max_length=max_len,
                min_length=min_len,
                no_repeat_ngram_size=3,
                early_stopping=True,
            )

        return self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    def summarize(self, text: str, compression: float = 0.35, num_beams: int = 4) -> dict:
        text = text.strip()
        if not text:
            raise ValueError("Input text is empty.")
        if len(text.split()) < 30:
            raise ValueError("Text is too short to summarize (minimum 30 words).")

        original_word_count = len(text.split())
        chunks = self._split_into_chunks(text)

        chunk_summaries = [
            self._summarize_chunk(chunk, compression, num_beams)
            for chunk in chunks
        ]

        # FIX 3: Remove the destructive double-compression. 
        # If the chunks are already compressed to the target ratio, just stitch them together.
        if len(chunk_summaries) > 1:
            final_summary = " ".join(chunk_summaries)
        else:
            final_summary = chunk_summaries[0]

        summary_word_count = len(final_summary.split())

        return {
            "summary": final_summary,
            "original_word_count": original_word_count,
            "summary_word_count": summary_word_count,
            "compression_achieved": round(summary_word_count / original_word_count, 3),
            "chunks_processed": len(chunks),
        }