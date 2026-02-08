
import React, { useEffect, useState, useRef } from 'react';
import { SurahDetail, Ayah, TAJWEED_RULES, Bookmark } from '../types';
import { getSurahDetail } from '../services/quranService';
import { askGemini } from '../services/geminiService';
import TajweedGuide from './TajweedGuide';
import TajweedText from './TajweedText';

interface SurahDetailViewProps {
  surahId: number;
  onBack: () => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
}

const SurahDetailView: React.FC<SurahDetailViewProps> = ({
  surahId,
  onBack,
  bookmarks,
  onToggleBookmark,
  isAuthenticated,
  onRequireLogin,
}) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [isTajweedOpen, setIsTajweedOpen] = useState(false);
  const [isTajweedMode, setIsTajweedMode] = useState(false);
  const [isHafalanMode, setIsHafalanMode] = useState(false);
  const [hiddenTextType, setHiddenTextType] = useState<'ARAB' | 'INDO' | 'BOTH' | 'NONE'>('NONE');
  const [revealedAyahs, setRevealedAyahs] = useState<number[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'TAFSIR' | 'TAJWEED'>('TAFSIR');
  const [jumpAyah, setJumpAyah] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Font size states
  const [fontSizeArabic, setFontSizeArabic] = useState(window.innerWidth < 640 ? 32 : 40);
  const [fontSizeLatin, setFontSizeLatin] = useState(14);
  const [fontSizeIndo, setFontSizeIndo] = useState(16);

  // Audio states
  const [playingAyahId, setPlayingAyahId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getSurahDetail(surahId);
        setSurah(data);
      } catch (error) {
        console.error("Failed to fetch surah detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [surahId]);

  const toggleAyahReveal = (num: number) => {
    if (!isHafalanMode) return;
    setRevealedAyahs(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleJumpToAyah = (e?: React.FormEvent) => {
    e?.preventDefault();
    const num = parseInt(jumpAyah);
    if (num > 0 && surah && num <= surah.jumlahAyat) {
      const el = document.getElementById(`ayah-${num}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setJumpAyah('');
        setIsSearchOpen(false);
      }
    }
  };

  const handleAskAI = async (ayah?: Ayah, mode: 'TAFSIR' | 'TAJWEED' = 'TAFSIR') => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    setAiLoading(true);
    setAiResponse(null);
    setSelectedAyah(ayah || null);
    setActiveTab(mode);
    const context = ayah ? `Surah ${surah?.namaLatin}, Ayat ${ayah.nomorAyat}: "${ayah.teksArab}"` : `Surah ${surah?.namaLatin}`;
    const prompt = mode === 'TAJWEED' ? "Berikan analisis Tajweed lengkap." : "Jelaskan tafsir singkat dan hikmah.";
    const response = await askGemini(prompt, context);
    setAiResponse(response || "Gagal mendapatkan respon.");
    setAiLoading(false);
  };

  const renderCleanText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine === '---') return <div key={index} className="h-px w-full bg-slate-100 dark:bg-slate-800 my-8" />;
      if (trimmedLine.startsWith('###')) {
        const content = trimmedLine.replace(/^###\s*/, '').trim();
        return (
          <div key={index} className="mt-8 mb-4 first:mt-0">
            <h5 className={`text-sm font-black uppercase tracking-[0.15em] mb-2 ${activeTab === 'TAJWEED' ? 'text-orange-500' : 'text-emerald-600'}`}>
              {content}
            </h5>
            <div className={`h-1 w-12 rounded-full ${activeTab === 'TAJWEED' ? 'bg-orange-500/30' : 'bg-emerald-500/30'}`}></div>
          </div>
        );
      }
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2).trim();
        return (
          <div key={index} className="flex items-start gap-4 mb-3 pl-1">
            <div className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${activeTab === 'TAJWEED' ? 'bg-orange-400' : 'bg-emerald-400'}`}></div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-[15px]">{content.replace(/\*\*/g, '')}</p>
          </div>
        );
      }
      if (trimmedLine.length > 0) {
        return <p key={index} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-[15px]">{trimmedLine.replace(/\*\*/g, '')}</p>;
      }
      return <div key={index} className="h-1"></div>;
    });
  };

  const toggleTajweedMode = () => {
    const newMode = !isTajweedMode;
    setIsTajweedMode(newMode);
    setIsTajweedOpen(newMode);
    if (newMode) setIsHafalanMode(false);
  };

  const toggleHafalanMode = () => {
    const newMode = !isHafalanMode;
    setIsHafalanMode(newMode);
    if (newMode) {
      setIsTajweedMode(false);
      setHiddenTextType('BOTH');
      setRevealedAyahs([]);
    } else {
      setHiddenTextType('NONE');
    }
  };

  const handlePlayAudio = (ayah: Ayah) => {
    if (playingAyahId === ayah.nomorAyat) {
      audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause();
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audioUrl = ayah.audio['05'] || ayah.audio['01'];
    const newAudio = new Audio(audioUrl);
    newAudio.addEventListener('ended', () => { setPlayingAyahId(null); });
    newAudio.play();
    audioRef.current = newAudio;
    setPlayingAyahId(ayah.nomorAyat);
  };

  const isBookmarked = (ayahNumber: number) => bookmarks.some(b => b.surahId === surahId && b.ayahNumber === ayahNumber);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      <p className="text-emerald-800 dark:text-emerald-400 animate-pulse font-bold">Memuat Kalam Ilahi...</p>
    </div>
  );
  if (!surah) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <TajweedGuide isOpen={isTajweedOpen} onClose={() => setIsTajweedOpen(false)} />

      {/* Floating Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[170] flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Lompat ke Ayat</h3>
              <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400">✕</button>
            </div>
            <form onSubmit={handleJumpToAyah} className="relative">
              <input 
                autoFocus
                type="number" 
                placeholder={`Masukkan nomor ayat (1 - ${surah.jumlahAyat})`} 
                value={jumpAyah}
                onChange={(e) => setJumpAyah(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white outline-none ring-2 ring-emerald-500/20 focus:ring-emerald-500 transition-all text-lg"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {[1, 5, 10, 20, 50].filter(n => n <= surah.jumlahAyat).map(n => (
                <button key={n} onClick={() => { setJumpAyah(n.toString()); handleJumpToAyah(); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">Ayat {n}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg dark:text-white">Pengaturan Teks</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2">✕</button>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-slate-500">Ukuran Arab</label>
                  <span className="text-xs font-black text-emerald-600">{fontSizeArabic}px</span>
                </div>
                <input type="range" min="24" max="72" value={fontSizeArabic} onChange={e => setFontSizeArabic(parseInt(e.target.value))} className="w-full accent-emerald-600" />
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {(aiLoading || aiResponse) && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setAiResponse(null)}></div>
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className={`p-5 border-b flex justify-between items-center ${activeTab === 'TAJWEED' ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${activeTab === 'TAJWEED' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                <h4 className="font-bold dark:text-white">{activeTab === 'TAJWEED' ? 'Analisis Tajweed' : 'Tafsir & Hikmah'}</h4>
              </div>
              <button onClick={() => setAiResponse(null)} className="p-2 bg-white/50 dark:bg-slate-800 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
              {aiLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                </div>
              ) : renderCleanText(aiResponse || "")}
            </div>
          </div>
        </div>
      )}

      {/* Header Surah */}
      <div className="bg-emerald-900 dark:bg-emerald-950 text-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={onBack} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 shrink-0 backdrop-blur-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 shrink-0 backdrop-blur-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            </button>
          </div>
        </div>

        <div className="text-center relative z-10">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60 mb-2 block">{surah.tempatTurun} • {surah.jumlahAyat} AYAT</span>
          <h1 className="text-4xl sm:text-6xl font-black mb-2 tracking-tight">{surah.namaLatin}</h1>
          <p className="text-emerald-200 text-sm sm:text-xl italic mb-10 font-medium">"{surah.arti}"</p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <button onClick={toggleTajweedMode} className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest border transition-all ${isTajweedMode ? 'bg-orange-500 border-orange-400' : 'bg-white/10 border-white/20'}`}>
              {isTajweedMode ? 'TAJWEED ON' : 'TAJWEED'}
            </button>
            <button onClick={toggleHafalanMode} className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest border transition-all ${isHafalanMode ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10 border-white/20'}`}>
              {isHafalanMode ? 'HAFALAN ON' : 'HAFALAN'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => handleAskAI(undefined, 'TAFSIR')} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-950/20 transition-all active:scale-95 text-sm">Tafsir Surah</button>
            <button onClick={() => handleAskAI(undefined, 'TAJWEED')} className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-black border border-white/20 transition-all active:scale-95 text-sm backdrop-blur-md">Tajweed Surah</button>
          </div>
        </div>
      </div>

      {/* Hafalan Mode Controls */}
      {isHafalanMode && (
        <div className="max-w-xl mx-auto mb-10 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center gap-5 animate-in zoom-in duration-300">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <p className="text-[10px] font-black tracking-widest uppercase">Mode Hafalan Aktif</p>
          </div>
          <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm">
            <button onClick={() => { setHiddenTextType('ARAB'); setRevealedAyahs([]); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${hiddenTextType === 'ARAB' ? 'bg-indigo-600 text-white' : 'text-indigo-400'}`}>TEKS ARAB</button>
            <button onClick={() => { setHiddenTextType('INDO'); setRevealedAyahs([]); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${hiddenTextType === 'INDO' ? 'bg-indigo-600 text-white' : 'text-indigo-400'}`}>TERJEMAHAN</button>
            <button onClick={() => { setHiddenTextType('BOTH'); setRevealedAyahs([]); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${hiddenTextType === 'BOTH' ? 'bg-indigo-600 text-white' : 'text-indigo-400'}`}>KEDUANYA</button>
          </div>
          <p className="text-[10px] text-indigo-400 dark:text-indigo-500 italic text-center">Ketuk teks mana saja untuk menampilkan/menyembunyikan ayat tersebut.</p>
        </div>
      )}

      {/* Ayah List */}
      <div className="space-y-16 px-1">
        {surah.nomor !== 1 && surah.nomor !== 9 && (
          <div className="text-center py-10">
            <p className="arabic-font text-5xl sm:text-6xl text-slate-800 dark:text-white opacity-90 tracking-widest">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          </div>
        )}

        {surah.ayat.map((ayah) => {
          const isRevealed = revealedAyahs.includes(ayah.nomorAyat);
          const hideArab = isHafalanMode && (hiddenTextType === 'ARAB' || hiddenTextType === 'BOTH') && !isRevealed;
          const hideIndo = isHafalanMode && (hiddenTextType === 'INDO' || hiddenTextType === 'BOTH') && !isRevealed;

          return (
            <div key={ayah.nomorAyat} className="group relative scroll-mt-28" id={`ayah-${ayah.nomorAyat}`}>
              <div className={`flex flex-col gap-8 p-6 sm:p-10 rounded-[2.5rem] transition-all duration-500 border-2 ${selectedAyah?.nomorAyat === ayah.nomorAyat ? 'bg-white dark:bg-slate-900 border-emerald-500/30 shadow-2xl scale-[1.02]' : 'bg-transparent border-transparent'}`}>
                
                {/* Ayah Header & Arabic */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-sm font-black shadow-inner border border-emerald-100 dark:border-emerald-900/50">{ayah.nomorAyat}</div>
                    <div className="flex flex-row sm:flex-col gap-2 flex-1 sm:flex-none">
                      <button onClick={() => handlePlayAudio(ayah)} className={`flex-1 sm:flex-none p-3 rounded-2xl border transition-all ${playingAyahId === ayah.nomorAyat ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-400'}`}>
                        {playingAyahId === ayah.nomorAyat ? (
                          <svg className="w-5 h-5 mx-auto animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                          <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                      </button>
                      <button 
                        onClick={() => isTajweedMode ? handleAskAI(ayah, 'TAJWEED') : handleAskAI(ayah, 'TAFSIR')}
                        className="flex-1 sm:flex-none p-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                      <button onClick={() => onToggleBookmark({ surahId, ayahNumber: ayah.nomorAyat, surahName: surah.namaLatin, teksArab: ayah.teksArab })} className={`flex-1 sm:flex-none p-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 transition-all ${isBookmarked(ayah.nomorAyat) ? 'text-emerald-600 border-emerald-100' : 'text-slate-400'}`}>
                        <svg className="w-5 h-5 mx-auto" fill={isBookmarked(ayah.nomorAyat) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text Area */}
                  <div 
                    className={`flex-1 text-right cursor-pointer group/arab relative ${hideArab ? 'py-12' : 'py-2'}`}
                    onClick={() => isHafalanMode && toggleAyahReveal(ayah.nomorAyat)}
                  >
                    <p 
                      className={`arabic-font leading-[2.6] transition-all duration-500 text-slate-900 dark:text-white ${hideArab ? 'blur-2xl opacity-10 select-none scale-95' : ''}`} 
                      style={{ fontSize: `${fontSizeArabic}px` }}
                    >
                      <TajweedText text={ayah.teksArab} isActive={isTajweedMode} />
                    </p>
                    {hideArab && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-indigo-600/20 border-2 border-indigo-400/50 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          TAP TO REVEAL
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Translation Area */}
                <div 
                  className={`pl-4 sm:pl-16 relative cursor-pointer group/trans transition-all duration-500 ${hideIndo ? 'py-6 opacity-10 blur-md select-none' : ''}`}
                  onClick={() => isHafalanMode && toggleAyahReveal(ayah.nomorAyat)}
                >
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-3 text-xs sm:text-sm tracking-wide" style={{ fontSize: `${fontSizeLatin}px` }}>{ayah.teksLatin}</p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm sm:text-base" style={{ fontSize: `${fontSizeIndo}px` }}>{ayah.teksIndonesia}</p>
                  
                  {hideIndo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 dark:bg-indigo-950/50 px-3 py-1 rounded-lg">Translation hidden</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SurahDetailView;
