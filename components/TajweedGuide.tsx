
import React from 'react';
import { TAJWEED_RULES } from '../types';

interface TajweedGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const TajweedGuide: React.FC<TajweedGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Panduan Tajweed</h2>
            <p className="text-emerald-700 dark:text-emerald-400 text-sm">Hukum bacaan dasar untuk tartil yang benar.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div className="grid gap-6">
            {Object.values(TAJWEED_RULES).map((rule) => (
              <div key={rule.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                <div className={`w-3 shrink-0 rounded-full ${rule.color}`}></div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{rule.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">{rule.description}</p>
                  <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700 inline-block">
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mr-2">Contoh:</span>
                    <span className="arabic-font text-lg text-emerald-900 dark:text-emerald-100">{rule.example}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-emerald-900 dark:bg-emerald-950 p-6 rounded-2xl text-white">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tips Reciting
            </h4>
            <p className="text-emerald-100 dark:text-emerald-300 text-sm leading-relaxed">
              Bacalah dengan tenang (tartil) dan jangan terburu-buru. Fokus pada setiap makhraj huruf dan pastikan panjang pendek (mad) sesuai dengan hukumnya. Warna di teks menunjukkan posisi hukum tajweed yang berlaku.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40"
          >
            Mengerti, Lanjutkan Membaca
          </button>
        </div>
      </div>
    </div>
  );
};

export default TajweedGuide;
