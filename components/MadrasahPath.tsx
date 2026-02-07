
import React, { useEffect, useRef } from 'react';
import { Lesson, UserProgress } from '../types';

interface MadrasahPathProps {
  lessons: Lesson[];
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onSelectPractice: () => void;
}

const MadrasahPath: React.FC<MadrasahPathProps> = ({ lessons, progress, onSelectLesson, onSelectPractice }) => {
  const activeLessonRef = useRef<HTMLDivElement>(null);

  // Helper to determine sections based on current dynamic lessons
  const sections = [
    { title: 'Beginner (Dasar)', range: [0, 7] },
    { title: 'Intermediate (Menengah)', range: [7, 14] },
    { title: 'Advanced (Mahir)', range: [14, lessons.length] }
  ];

  useEffect(() => {
    if (activeLessonRef.current) {
      setTimeout(() => {
        activeLessonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [progress.completedLessons]);

  return (
    <div className="flex flex-col items-center py-10 space-y-12 max-w-lg mx-auto pb-48">
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold mb-3 uppercase tracking-widest shadow-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" /></svg>
          Madrasah AI
        </div>
        <h2 className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-2">Jalur Madrasah</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">Tingkatkan bacaanmu dari nol hingga mahir Tajweed.</p>
      </div>

      <div className="relative flex flex-col items-center w-full px-4">
        <div className="absolute top-0 bottom-0 w-2 bg-slate-200 dark:bg-slate-800/50 -z-10 rounded-full shadow-inner"></div>

        <div 
          className="relative flex items-center group mb-16 cursor-pointer"
          onClick={onSelectPractice}
        >
          <div className="relative w-24 h-24 rounded-[2rem] bg-orange-500 border-4 border-orange-200 flex items-center justify-center text-4xl shadow-2xl shadow-orange-500/30 transform hover:scale-110 active:scale-95 transition-all">
            <span className="animate-pulse">🔥</span>
            <div className="absolute -bottom-2 px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-[10px] font-black text-orange-600 border border-orange-100 shadow-sm uppercase tracking-tighter">
              Practice
            </div>
          </div>
          <div className="absolute left-full ml-6 w-48 hidden xs:block">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Latihan Bebas</h4>
            <p className="text-[10px] text-slate-500 leading-tight">Uji tajweed pada ayat acak.</p>
          </div>
        </div>

        {sections.map((section, sIdx) => {
          const slice = lessons.slice(section.range[0], section.range[1]);
          if (slice.length === 0) return null;

          return (
            <React.Fragment key={section.title}>
              <div className="w-full flex items-center gap-4 my-8">
                <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800">{section.title}</span>
                <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
              </div>

              {slice.map((lesson, index) => {
                const actualIndex = section.range[0] + index;
                const isCompleted = progress.completedLessons.includes(lesson.id);
                const isUnlocked = actualIndex === 0 || progress.completedLessons.includes(lessons[actualIndex - 1].id);
                
                const isNextActive = isUnlocked && !isCompleted;
                const offsetClass = actualIndex % 3 === 0 ? '' : (actualIndex % 3 === 1 ? 'translate-x-12' : '-translate-x-12');

                return (
                  <div 
                    key={lesson.id} 
                    ref={isNextActive ? activeLessonRef : null}
                    className={`relative flex items-center group mb-12 transition-all duration-500 ${offsetClass} ${isUnlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                    onClick={() => isUnlocked && onSelectLesson(lesson)}
                  >
                    <div className={`
                      relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-4 transition-all transform
                      ${isCompleted ? 'bg-emerald-500 border-emerald-200 text-white' : 
                        isUnlocked ? 'bg-white dark:bg-slate-900 border-emerald-400 text-emerald-600 animate-bounce-slow' : 
                        'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'}
                      ${isUnlocked ? 'hover:scale-110 active:scale-95 hover:rotate-3 shadow-emerald-500/20' : ''}
                    `}>
                      {isCompleted ? (
                        <svg className="w-10 h-10 sm:w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{lesson.icon}</span>
                      )}
                      
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${isCompleted ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                        {actualIndex + 1}
                      </div>
                    </div>

                    <div className={`
                      absolute top-0 whitespace-nowrap px-4 py-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all 
                      ${actualIndex % 3 === 2 ? 'left-full ml-6' : 'right-full mr-6'}
                      opacity-90 group-hover:opacity-100 group-hover:scale-105
                      hidden xs:block
                    `}>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400 mb-0.5">{lesson.category}</span>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{lesson.title}</h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default MadrasahPath;
