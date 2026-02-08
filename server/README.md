# VPS Whisper Alignment Service (Python)

Service ini menangani:
- Transkripsi audio (Whisper)
- Forced alignment (per‑huruf/per‑phoneme)
- Scoring + feedback detail

Direkomendasikan deploy di VPS (GPU kalau ada).

## Setup (Ubuntu)
1. Install system deps:
   - `ffmpeg`
   - `python3.10+`
2. Buat venv:
   - `python -m venv .venv`
   - `. .venv/bin/activate`
3. Install:
   - `pip install -r requirements.txt`
4. Jalankan:
   - `uvicorn app:app --host 0.0.0.0 --port 8081`

## Env
Set di VPS (bukan di frontend):
- `OPENAI_API_KEY=...`k
- `WHISPER_MODEL=whisper-1` 

## Endpoint
POST `/score`
Form‑data:
- `audio`: file audio (webm/wav)
- `reference_text`: teks ayat arab

Response:
```
{
  "transcript": "...",
  "score": 87,
  "feedback": "....",
  "errors": [
    { "index": 12, "expected": "ق", "got": "ك", "severity": "medium" }
  ]
}
```

