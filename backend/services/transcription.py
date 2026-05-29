import onnxruntime as ort
from transformers import pipeline, AutoProcessor
from optimum.onnxruntime import ORTModelForSpeechSeq2Seq

# =========================================
# DETECT AND PRIORITIZE PROVIDERS
# =========================================

available_providers = ort.get_available_providers()
print("Available Providers:", available_providers)

# Create a prioritized list: GPU first, CPU as the ultimate fallback
target_providers = []

if "CUDAExecutionProvider" in available_providers:
    target_providers.append("CUDAExecutionProvider")
elif "DmlExecutionProvider" in available_providers:
    target_providers.append("DmlExecutionProvider")

target_providers.append("CPUExecutionProvider")

# =========================================
# LOAD WHISPER MODEL WITH FALLBACK
# =========================================

model_id = "openai/whisper-base"
model = None
active_provider = None

# Attempt to load the model, iterating through the prioritized list
for provider in target_providers:
    print(f"Attempting to load model with: {provider}...")
    try:
        model = ORTModelForSpeechSeq2Seq.from_pretrained(
            model_id,
            provider=provider
        )
        active_provider = provider
        print(f"Success! Model loaded using {active_provider}.")
        break  # Exit the loop if loading is successful
    except Exception as e:
        print(f"Failed to load with {provider}. Error: {e}")
        print("Falling back to the next provider...")

# Safety check if all providers fail
if model is None:
    raise RuntimeError("Critical Error: Failed to load the Whisper model with any provider.")

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor
)

# =========================================
# TRANSCRIBE AUDIO
# =========================================

def transcribe_audio(audio_path):
    result = pipe(
        audio_path,
        generate_kwargs={
            "language": "english"
        }
    )
    return result["text"]