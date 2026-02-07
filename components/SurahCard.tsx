
import React from 'react';
import { SurahShort } from '../types';

interface SurahCardProps {
  surah: SurahShort;
  onClick: (id: number) => void;
}

const SurahCard: React.FC<SurahCardProps> = ({ surah, onClick }) => {
  return (
    <div 
      onClick={() => onClick(surah.nomor)}
      className="group bg-white dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all cursor-pointer flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 flex items-center justify-center rounded-xl font-bold text-emerald-600 dark:text-emerald-500 shrink-0">
          {surah.nomor}
        </div>
        
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
            {surah.namaLatin}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {surah.tempatTurun} • {surah.jumlahAyat} ayat
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="arabic-font text-xl text-emerald-900 dark:text-slate-200">
          {surah.nama}
        </span>
        <svg className="w-4 h-4 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default SurahCard;
