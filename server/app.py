import os
import tempfile
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI
import whisperx

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("VITE_OPENAI_API_KEY", "")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "whisper-1")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def normalize_arabic(text: str) -> str:
    import re

    # Remove diacritics and non‑arabic chars
    text = re.sub(r"[\u064B-\u065F\u0670\u06D6-\u06ED]", "", text)
    text = re.sub(r"[^\u0600-\u06FF\s]", "", text)
    return " ".join(text.split())


@app.post("/score")
async def score_audio(audio: UploadFile = File(...), reference_text: str = ""):
    if client is None:
        return JSONResponse({"error": "Missing OPENAI_API_KEY"}, status_code=500)

    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        # 1) Whisper transcription
        with open(tmp_path, "rb") as f:
            trans = client.audio.transcriptions.create(
                model=WHISPER_MODEL,
                file=f,
                language="ar",
            )
        transcript = getattr(trans, "text", "") or ""

        # 2) Forced alignment (whisperx)
        device = "cpu"
        model = whisperx.load_model("small", device=device, language="ar")
        result = model.transcribe(tmp_path)
        align_model, metadata = whisperx.load_align_model(language_code="ar", device=device)
        aligned = whisperx.align(result["segments"], align_model, metadata, tmp_path, device)

        # 3) Basic per‑char diff (placeholder)
        ref = normalize_arabic(reference_text)
        hyp = normalize_arabic(transcript)
        errors = []
        max_len = max(len(ref), len(hyp), 1)
        for i in range(max_len):
            exp = ref[i] if i < len(ref) else ""
            got = hyp[i] if i < len(hyp) else ""
            if exp != got:
                errors.append(
                    {
                        "index": i,
                        "expected": exp,
                        "got": got,
                        "severity": "medium",
                    }
                )

        # Score simple
        score = max(0, round(100 - (len(errors) / max_len) * 100))
        feedback = "Pelafalan sudah baik, lanjutkan."
        if score < 90 and score >= 70:
            feedback = "Masih ada beberapa bagian yang kurang jelas."
        elif score < 70:
            feedback = "Perlu perbaikan. Fokus pada kejelasan huruf dan makhraj."

        return {
            "transcript": transcript,
            "score": score,
            "feedback": feedback,
            "errors": errors,
            "alignment": aligned,
        }
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

