# kawanmengaji

Modern Vite + React app for Qur'an learning features (tajweed practice, surah views, quizzes) with Gemini, Supabase, and Clerk integrations.

## Requirements

- Node.js (LTS recommended)

## Quick Start

1. Install dependencies:
   `npm install`
2. Create `.env.local` with the required keys (see below).
3. Start the dev server:
   `npm run dev`

## Environment Variables

Create `.env.local` with these keys:

- `GEMINI_API_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WHISPER_ALIGN_URL` (optional if you are not running the align service)
- `VITE_OPENAI_API_KEY` (optional if you are not using Whisper)
- `WHISPER_MODEL` (optional; defaults to `whisper-1`)

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` builds for production.
- `npm run preview` previews the production build locally.

## Project Structure

```
components/
  AdminView.tsx
  MadrasahPath.tsx
  MadrasahQuiz.tsx
  Navbar.tsx
  ProfileView.tsx
  SurahCard.tsx
  SurahDetailView.tsx
  TajweedGuide.tsx
  TajweedPractice.tsx
  TajweedText.tsx
services/
  geminiService.ts
  learningData.ts
  quranService.ts
supabase/
  functions/
    whisper-score/
```
