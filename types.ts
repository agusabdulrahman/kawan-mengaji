
export interface SurahShort {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail extends SurahShort {
  ayat: Ayah[];
  audioFull: Record<string, string>;
}

export interface Bookmark {
  surahId: number;
  ayahNumber: number;
  surahName: string;
  teksArab: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type ViewState = 'LIST' | 'DETAIL' | 'LEARNING' | 'QUIZ' | 'TAJWEED_PRACTICE' | 'PROFILE' | 'ADMIN';

export interface TajweedRule {
  id: string;
  name: string;
  description: string;
  example: string;
  color: string;
  textColor: string;
  pattern?: RegExp;
}

// Learning Types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'HIJAIYAH' | 'HAROKAT' | 'TAJWEED' | 'HAFALAN' | 'KOSAKATA' | 'MAKHRAJ';
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'CHOICE' | 'AUDIO_MATCH' | 'WORD_SCRAMBLE' | 'MATCHING' | 'FLASHCARD';
  prompt: string;
  arabicContent?: string;
  audioUrl?: string;
  imageUrl?: string;
  scrambledWords?: string[]; 
  pairs?: { key: string; value: string }[];
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface UserProgress {
  completedLessons: string[];
  xp: number;
  streak: number;
}

export const TAJWEED_RULES: Record<string, TajweedRule> = {
  izhhar: {
    id: 'izhhar',
    name: "Izh-har",
    description: "Jelas tanpa dengung (Nun Sukun/Tanwin bertemu Alif, Ha, Kha, 'Ain, Ghain, Ha).",
    example: "مَنْ اٰمَنَ",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    pattern: /([\u0646\u0652\u064b\u064d\u064c]\s*[\u0627\u0623\u0625\u0622\u062d\u062e\u0639\u063a\u0647])/g
  },
  idgham: {
    id: 'idgham',
    name: "Idgham",
    description: "Memasukkan bunyi ke huruf berikutnya (Ya, Nun, Mim, Wau, Lam, Ra).",
    example: "مَنْ يَّقُوْلُ",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    pattern: /([\u0646\u0652\u064b\u064d\u064c]\s*[\u064a\u0646\u0645\u0648\u0644\u0631])/g
  },
  iqlab: {
    id: 'iqlab',
    name: "Iqlab",
    description: "Bunyi Nun/Tanwin berubah menjadi Mim (bertemu huruf Ba).",
    example: "مِنْ بَعْدِ",
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    pattern: /([\u0646\u0652\u064b\u064d\u064c]\s*[\u0628])/g
  },
  ikhfa: {
    id: 'ikhfa',
    name: "Ikhfa",
    description: "Samar-samar dengan dengung.",
    example: "مِنْ قَبْلِ",
    color: "bg-orange-500",
    textColor: "text-orange-600"
  },
  qalqalah: {
    id: 'qalqalah',
    name: "Qalqalah",
    description: "Bunyi memantul (Qaf, Tha, Ba, Jim, Dal).",
    example: "اَحَدٌ",
    color: "bg-rose-500",
    textColor: "text-rose-600",
    pattern: /([\u0642\u0637\u0628\u062c\u062f][\u0652]?)/g
  }
};
