import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    __ENV__?: {
      VITE_CLERK_PUBLISHABLE_KEY?: string;
      GEMINI_API_KEY?: string;
    };
  }
}

export const askGemini = async (prompt: string, context?: string) => {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    (typeof window !== 'undefined' ? window.__ENV__?.GEMINI_API_KEY : '') ||
    '';

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    Anda adalah "KawanMengaji AI", asisten spiritual yang ahli dalam Al-Quran dan Tafsir.
    Gunakan bahasa Indonesia yang santun, informatif, dan menyejukkan.
    Jika diberikan konteks ayat, jelaskan makna, asbabun nuzul (jika ada), dan hikmah yang bisa diambil oleh pembaca di era modern.
    Selalu gunakan referensi yang sahih.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context ? `Konteks Ayat: ${context}\n\nPertanyaan: ${prompt}` : prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, sepertinya asisten AI sedang beristirahat. Silakan coba lagi nanti.";
  }
};
