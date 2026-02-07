
import React from 'react';
import { UserProgress, Bookmark } from '../types';

interface ProfileViewProps {
  progress: UserProgress;
  bookmarks: Bookmark[];
  onSelectBookmark: (surahId: number, ayahNumber: number) => void;
  onResetData: () => void;
  onGoToAdmin: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ progress, bookmarks, onSelectBookmark, onResetData, onGoToAdmin }) => {
  const level = Math.floor(progress.xp / 100) + 1;
  const nextLevelXp = level * 100;
  const currentLevelXp = progress.xp % 100;
  const levelProgress = (currentLevelXp / 100) * 100;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Profile */}
      <div className="flex flex-col items-center pt-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10 border-4 border-white dark:border-slate-800 transition-transform group-hover:scale-110">
            🌙
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white text-[10px] font-black">
            Lvl {level}
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-800 dark:text-white tracking-tight">Kawan Mengaji</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm">Pencinta Al-Quran</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <span className="text-xl mb-1">🔥</span>
          <span className="text-lg font-black text-slate-800 dark:text-white">{progress.streak}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streak</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <span className="text-xl mb-1">💎</span>
          <span className="text-lg font-black text-slate-800 dark:text-white">{progress.xp}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <span className="text-xl mb-1">🔖</span>
          <span className="text-lg font-black text-slate-800 dark:text-white">{bookmarks.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bookmarks</span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-emerald-900 dark:bg-emerald-950 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-900/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-1">Level Progress</p>
            <h3 className="font-black text-xl">Level {level}</h3>
          </div>
          <span className="text-xs font-bold bg-emerald-800/50 px-3 py-1 rounded-full">{progress.xp} / {nextLevelXp} XP</span>
        </div>
        <div className="h-4 bg-emerald-800/40 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-emerald-400 rounded-full transition-all duration-1000" 
            style={{ width: `${levelProgress}%` }}
          ></div>
        </div>
        <p className="text-emerald-200 text-[10px] text-center">{nextLevelXp - (progress.xp % 100)} XP lagi untuk Level {level + 1}</p>
      </div>

      {/* Bookmarks Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Ayat yang Disimpan</h3>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">LIHAT SEMUA</span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-3xl p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <span className="text-4xl mb-4 opacity-20">📖</span>
            <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">Belum ada ayat yang disimpan.<br/>Cari inspirasi di Al-Quran.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookmarks.slice(-5).reverse().map((b, idx) => (
              <div 
                key={`${b.surahId}-${b.ayahNumber}`}
                onClick={() => onSelectBookmark(b.surahId, b.ayahNumber)}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 cursor-pointer group active:scale-95 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-black text-xs">{b.surahName}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-slate-400 font-bold text-xs">Ayat {b.ayahNumber}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </div>
                <p className="arabic-font text-right text-xl text-slate-800 dark:text-white line-clamp-1">{b.teksArab}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings & Admin Section */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <button 
          onClick={onGoToAdmin}
          className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          Dapur Admin
        </button>
        <button 
          onClick={() => {
            if(confirm('Yakin ingin mereset semua progres belajar dan bookmark?')) {
              onResetData();
            }
          }}
          className="w-full py-4 text-red-500 dark:text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
        >
          Reset Data Aplikasi
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
