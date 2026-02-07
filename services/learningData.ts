
import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  // --- BEGINNER (DASAR) - Level 1-7 ---
  {
    id: 'hijaiyah-1',
    title: 'Pilar Pertama',
    description: 'Mengenal Alif, Ba, Ta, Tsa',
    icon: '🌙',
    category: 'HIJAIYAH',
    questions: [
      {
        id: 'h1_q1',
        type: 'CHOICE',
        prompt: 'Manakah huruf Alif?',
        arabicContent: 'ا',
        options: ['Alif', 'Ba', 'Ta'],
        correctAnswer: 'Alif',
        explanation: 'Alif adalah huruf pertama, tegak lurus seperti angka satu.'
      },
      {
        id: 'h1_q2',
        type: 'CHOICE',
        prompt: 'Pilih huruf Ba',
        arabicContent: 'ب',
        options: ['Alif', 'Ba', 'Ta'],
        correctAnswer: 'Ba',
        explanation: 'Ba memiliki satu titik di bawah.'
      }
    ]
  },
  {
    id: 'hijaiyah-2',
    title: 'Lengkungan Suci',
    description: 'Jim, Ha, Kha',
    icon: '✨',
    category: 'HIJAIYAH',
    questions: [
      {
        id: 'h2_q1',
        type: 'CHOICE',
        prompt: 'Manakah huruf Jim?',
        arabicContent: 'ج',
        options: ['Jim', 'Ha', 'Kha'],
        correctAnswer: 'Jim',
        explanation: 'Jim memiliki titik di tengah perutnya.'
      }
    ]
  },
  {
    id: 'hijaiyah-3',
    title: 'Garis Perkasa',
    description: 'Dal, Dzal, Ra, Zai',
    icon: '⚡',
    category: 'HIJAIYAH',
    questions: [
      {
        id: 'h3_q1',
        type: 'CHOICE',
        prompt: 'Huruf apakah ini?',
        arabicContent: 'ر',
        options: ['Dal', 'Ra', 'Zai'],
        correctAnswer: 'Ra',
        explanation: 'Ra berbentuk melengkung ke bawah tanpa titik.'
      }
    ]
  },
  {
    id: 'hijaiyah-4',
    title: 'Suara Tajam',
    description: 'Sin, Syin, Shad, Dhad',
    icon: '🔥',
    category: 'HIJAIYAH',
    questions: [
      {
        id: 'h4_q1',
        type: 'CHOICE',
        prompt: 'Pilih huruf Shad',
        arabicContent: 'ص',
        options: ['Sin', 'Syin', 'Shad'],
        correctAnswer: 'Shad',
        explanation: 'Shad memiliki bentuk kepala yang khas dan perut melengkung.'
      }
    ]
  },
  {
    id: 'harokat-1',
    title: 'Vokal Fathah',
    description: 'Suara "A" di atas huruf',
    icon: '☀️',
    category: 'HAROKAT',
    questions: [
      {
        id: 'hr1_q1',
        type: 'CHOICE',
        prompt: 'Garis di atas (Fathah) berbunyi...',
        arabicContent: 'بَ',
        options: ['Ba', 'Bi', 'Bu'],
        correctAnswer: 'Ba',
        explanation: 'Fathah memberikan bunyi vokal A.'
      }
    ]
  },
  {
    id: 'harokat-2',
    title: 'Vokal Kasrah',
    description: 'Suara "I" di bawah huruf',
    icon: '💧',
    category: 'HAROKAT',
    questions: [
      {
        id: 'hr2_q1',
        type: 'CHOICE',
        prompt: 'Garis di bawah (Kasrah) berbunyi...',
        arabicContent: 'بِ',
        options: ['Ba', 'Bi', 'Bu'],
        correctAnswer: 'Bi',
        explanation: 'Kasrah memberikan bunyi vokal I.'
      }
    ]
  },
  {
    id: 'harokat-3',
    title: 'Vokal Dhommah',
    description: 'Suara "U" di atas huruf',
    icon: '🌀',
    category: 'HAROKAT',
    questions: [
      {
        id: 'hr3_q1',
        type: 'CHOICE',
        prompt: 'Tanda wau kecil (Dhommah) berbunyi...',
        arabicContent: 'بُ',
        options: ['Ba', 'Bi', 'Bu'],
        correctAnswer: 'Bu',
        explanation: 'Dhommah memberikan bunyi vokal U.'
      }
    ]
  },

  // --- INTERMEDIATE (MENENGAH) - Level 8-14 ---
  {
    id: 'makhraj-1',
    title: 'Tenggorokan Dasar',
    description: 'Makhraj Huruf Al-Halq',
    icon: '👄',
    category: 'MAKHRAJ',
    questions: [
      {
        id: 'm1_q1',
        type: 'CHOICE',
        prompt: 'Huruf "Ain" (ع) keluar dari bagian mana?',
        options: ['Pangkal Tenggorokan', 'Tengah Tenggorokan', 'Ujung Tenggorokan'],
        correctAnswer: 'Tengah Tenggorokan',
        explanation: 'Huruf Ain dan Ha keluar dari tenggorokan bagian tengah.'
      }
    ]
  },
  {
    id: 'tanwin-1',
    title: 'Gema Akhiran',
    description: 'An, In, Un (Tanwin)',
    icon: '🔔',
    category: 'HAROKAT',
    questions: [
      {
        id: 'tn1_q1',
        type: 'CHOICE',
        prompt: 'Manakah bunyi "Bun"?',
        arabicContent: 'بٌ',
        options: ['بً', 'بٍ', 'بٌ'],
        correctAnswer: 'بٌ',
        explanation: 'Tanwin Dhommah berbunyi UN.'
      }
    ]
  },
  {
    id: 'kosakata-1',
    title: 'Awal Kalimat',
    description: 'Pasangkan kata-kata dasar',
    icon: '📖',
    category: 'KOSAKATA',
    questions: [
      {
        id: 'ks1_q1',
        type: 'MATCHING',
        prompt: 'Pasangkan kata berikut!',
        pairs: [
          { key: 'اللّٰه', value: 'Allah' },
          { key: 'رَبّ', value: 'Tuhan' },
          { key: 'مَنْ', value: 'Siapa' },
          { key: 'فِيْ', value: 'Di dalam' }
        ],
        options: [],
        correctAnswer: 'MATCHED_ALL',
        explanation: 'Kosakata dasar ini sangat sering muncul di Al-Quran.'
      }
    ]
  },
  {
    id: 'makhraj-2',
    title: 'Lidah Perkasa',
    description: 'Huruf Al-Lisan',
    icon: '👅',
    category: 'MAKHRAJ',
    questions: [
      {
        id: 'm2_q1',
        type: 'CHOICE',
        prompt: 'Huruf "Qaf" (ق) keluar dari...',
        options: ['Ujung Lidah', 'Pangkal Lidah', 'Samping Lidah'],
        correctAnswer: 'Pangkal Lidah',
        explanation: 'Qaf keluar dari pangkal lidah yang menyentuh langit-langit lunak.'
      }
    ]
  },
  {
    id: 'tajweed-mad-1',
    title: 'Irama Panjang',
    description: 'Mad Thabi\'i',
    icon: '🌊',
    category: 'TAJWEED',
    questions: [
      {
        id: 'tm1_q1',
        type: 'CHOICE',
        prompt: 'Huruf mad ada 3, yaitu...',
        options: ['Alif, Wau, Ya', 'Alif, Lam, Mim', 'Ba, Ta, Tsa'],
        correctAnswer: 'Alif, Wau, Ya',
        explanation: 'Alif, Wau mati, dan Ya mati adalah huruf pemanjang suara.'
      }
    ]
  },
  {
    id: 'kosakata-2',
    title: 'Arah & Tempat',
    description: 'Matching Kata Populer',
    icon: '🗺️',
    category: 'KOSAKATA',
    questions: [
      {
        id: 'ks2_q1',
        type: 'MATCHING',
        prompt: 'Pasangkan artinya!',
        pairs: [
          { key: 'أَرْض', value: 'Bumi' },
          { key: 'سَمَاء', value: 'Langit' },
          { key: 'جَنَّة', value: 'Surga' },
          { key: 'نَار', value: 'Neraka' }
        ],
        options: [],
        correctAnswer: 'MATCHED_ALL',
        explanation: 'Kata-kata ini menggambarkan tempat-tempat di akhirat.'
      }
    ]
  },
  {
    id: 'sukun-1',
    title: 'Henti Sejenak',
    description: 'Huruf Mati (Sukun)',
    icon: '🛑',
    category: 'HAROKAT',
    questions: [
      {
        id: 'sk1_q1',
        type: 'CHOICE',
        prompt: 'Tanda bulat di atas huruf disebut...',
        arabicContent: 'بْ',
        options: ['Tasydid', 'Sukun', 'Tanwin'],
        correctAnswer: 'Sukun',
        explanation: 'Sukun menandakan huruf tersebut mati atau tidak berharokat.'
      }
    ]
  },

  // --- ADVANCED (MAHIR) - Level 15-21 ---
  {
    id: 'tajweed-izhhar-1',
    title: 'Kejelasan Suara',
    description: 'Hukum Izhhar Halqi',
    icon: '💎',
    category: 'TAJWEED',
    questions: [
      {
        id: 'tiz1_q1',
        type: 'CHOICE',
        prompt: 'Izhhar artinya dibaca...',
        options: ['Jelas', 'Dengung', 'Samar'],
        correctAnswer: 'Jelas',
        explanation: 'Izhhar artinya jelas, tanpa dengung.'
      }
    ]
  },
  {
    id: 'flashcard-1',
    title: 'Kamus Juz Amma',
    description: 'Hafalkan kata kunci',
    icon: '📇',
    category: 'HAFALAN',
    questions: [
      {
        id: 'fc1_q1',
        type: 'CHOICE',
        prompt: 'Apa arti kata ini?',
        arabicContent: 'النَّاس',
        options: ['Manusia', 'Jin', 'Malaikat'],
        correctAnswer: 'Manusia',
        explanation: 'An-Nas berarti Manusia.'
      }
    ]
  },
  {
    id: 'scramble-1',
    title: 'Susun Al-Ikhlas',
    description: 'Menyusun Ayat Tauhid',
    icon: '🧩',
    category: 'HAFALAN',
    questions: [
      {
        id: 's1_q1',
        type: 'WORD_SCRAMBLE',
        prompt: 'Susun ayat: "Katakanlah: Dialah Allah, Yang Maha Esa"',
        scrambledWords: ['قُلْ', 'هُوَ', 'اللّٰهُ', 'أَحَدٌ'],
        correctAnswer: 'قُلْ هُوَ اللّٰهُ أَحَدٌ',
        options: [],
        explanation: 'Ayat pertama surah Al-Ikhlas.'
      }
    ]
  },
  {
    id: 'tajweed-idgham-1',
    title: 'Peleburan',
    description: 'Idgham Bighunnah',
    icon: '🌀',
    category: 'TAJWEED',
    questions: [
      {
        id: 'tid1_q1',
        type: 'CHOICE',
        prompt: 'Huruf Idgham Bighunnah disingkat...',
        options: ['Yanmu (ي ن م و)', 'Baju Di Toko', 'Lin (ل ر)'],
        correctAnswer: 'Yanmu (ي ن م و)',
        explanation: 'Ya, Nun, Mim, Wau adalah huruf Idgham Bighunnah.'
      }
    ]
  },
  {
    id: 'tajweed-qalqalah-1',
    title: 'Pantulan',
    description: 'Qalqalah Dasar',
    icon: '🎾',
    category: 'TAJWEED',
    questions: [
      {
        id: 'tq1_q1',
        type: 'CHOICE',
        prompt: 'Manakah yang termasuk huruf Qalqalah?',
        options: ['Ba, Jim, Dal', 'Alif, Lam, Mim', 'Sin, Syin, Shad'],
        correctAnswer: 'Ba, Jim, Dal',
        explanation: 'Qalqalah terjadi pada huruf Ba, Jim, Dal, Tha, dan Qaf.'
      }
    ]
  },
  {
    id: 'flashcard-2',
    title: 'Kata Kerja Quran',
    description: 'Hafalan Lanjutan',
    icon: '⚡',
    category: 'HAFALAN',
    questions: [
      {
        id: 'fc2_q1',
        type: 'CHOICE',
        prompt: 'Apa arti kata ini?',
        arabicContent: 'يَعْلَمُوْنَ',
        options: ['Mereka Mengetahui', 'Mereka Berkata', 'Mereka Pergi'],
        correctAnswer: 'Mereka Mengetahui',
        explanation: 'Ya\'lamun artinya Mereka Mengetahui.'
      }
    ]
  },
  {
    id: 'scramble-final',
    title: 'Misi Terakhir',
    description: 'Susun Al-Kautsar',
    icon: '🏆',
    category: 'HAFALAN',
    questions: [
      {
        id: 'sf_q1',
        type: 'WORD_SCRAMBLE',
        prompt: 'Susun ayat: "Sungguh, Kami telah memberimu telaga Kautsar"',
        scrambledWords: ['إِنَّا', 'أَعْطَيْنَاكَ', 'الْكَوْثَرَ'],
        correctAnswer: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        options: [],
        explanation: 'Selamat! Kamu telah menyelesaikan jalur Madrasah AI.'
      }
    ]
  }
];
