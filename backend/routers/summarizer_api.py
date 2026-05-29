import io
import os
import docx
import pdfplumber
from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from pydantic import BaseModel, Field

router = APIRouter()

class TextRequest(BaseModel):
    text: str = Field(..., min_length=30)
    compression: float = Field(0.35, ge=0.1, le=0.9)
    num_beams: int = Field(4, ge=1, le=8)

class SummaryResponse(BaseModel):
    summary: str
    original_word_count: int
    summary_word_count: int
    compression_achieved: float
    chunks_processed: int

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())

def extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="ignore")

@router.post("/summarize/text", response_model=SummaryResponse)
async def summarize_text(req: TextRequest, request: Request):
    try:
        # Grab the summarizer instance from the app state
        summarizer = request.app.state.summarizer
        result = summarizer.summarize(req.text, req.compression, req.num_beams)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {e}")

@router.post("/summarize/file", response_model=SummaryResponse)
async def summarize_file(
    request: Request,
    file: UploadFile = File(...),
    compression: float = 0.35,
    num_beams: int = 4,
):
    allowed = {".txt", ".pdf", ".docx"}
    ext = os.path.splitext(file.filename or "")[-1].lower()

    if ext not in allowed:
        raise HTTPException(status_code=415, detail=f"Unsupported file type '{ext}'.")

    file_bytes = await file.read()

    try:
        if ext == ".pdf":
            text = extract_text_from_pdf(file_bytes)
        elif ext == ".docx":
            text = extract_text_from_docx(file_bytes)
        else:
            text = extract_text_from_txt(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in file.")

    try:
        # Grab the summarizer instance from the app state
        summarizer = request.app.state.summarizer
        result = summarizer.summarize(text, compression, num_beams)
        return SummaryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {e}")