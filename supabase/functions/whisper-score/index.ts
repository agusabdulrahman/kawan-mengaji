import { corsHeaders } from '../_shared/cors.ts';

function normalizeArabic(input: string): string {
  return input
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove diacritics
    .replace(/[^\u0600-\u06FF\s]/g, '') // keep arabic letters/spaces
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const referenceText = (formData.get('referenceText') as string | null) || '';
    const language = (formData.get('language') as string | null) || 'ar';

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'Missing audio file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiForm = new FormData();
    openaiForm.append('file', audioFile);
    openaiForm.append('model', 'whisper-1');
    openaiForm.append('language', language);

    const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiForm,
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      return new Response(JSON.stringify({ error: 'OpenAI transcription failed', details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await openaiRes.json();
    const transcript = (data?.text as string | undefined) || '';

    const normRef = normalizeArabic(referenceText);
    const normTrans = normalizeArabic(transcript);
    const maxLen = Math.max(normRef.length, normTrans.length, 1);
    const distance = levenshtein(normRef, normTrans);
    const score = Math.max(0, Math.round(100 - (distance / maxLen) * 100));

    let feedback = 'Pelafalan sudah baik, lanjutkan.';
    if (score < 90 && score >= 70) {
      feedback = 'Masih ada beberapa bagian yang kurang jelas. Ulangi perlahan dan perhatikan panjang pendek.';
    } else if (score < 70) {
      feedback = 'Perlu perbaikan. Fokus pada kejelasan huruf dan makhraj.';
    }

    return new Response(
      JSON.stringify({
        transcript,
        score,
        feedback,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal error', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
