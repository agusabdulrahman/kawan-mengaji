
import React, { useState, useEffect } from 'react';
import { Ayah, TAJWEED_RULES, TajweedRule } from '../types';
import { getSurahDetail } from '../services/quranService';

interface TajweedPracticeProps {
  onComplete: (xpGained: number) => void;
  onQuit: () => void;
}

const TajweedPractice: React.FC<TajweedPracticeProps> = ({ onComplete, onQuit }) => {
  const [loading, setLoading] = useState(true);
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [targetRule, setTargetRule] = useState<TajweedRule | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const totalQuestions = 5;

  const generateQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setShowFeedback(false);
    
    try {
      // Pick a common surah for practice
      const surahsForPractice = [1, 18, 36, 55, 67, 78, 91, 93, 101, 110];
      const randomSurahId = surahsForPractice[Math.floor(Math.random() * surahsForPractice.length)];
      const surah = await getSurahDetail(randomSurahId);
      
      // Find an ayah that has at least one tajweed rule match
      let found = false;
      let attempts = 0;
      while (!found && attempts < 20) {
        const ayah = surah.ayat[Math.floor(Math.random() * surah.ayat.length)];
        const rulesWithPatterns = Object.values(TAJWEED_RULES).filter(r => r.pattern);
        
        // Shuffle rules to test different ones
        const shuffledRules = [...rulesWithPatterns].sort(() => Math.random() - 0.5);
        
        for (const rule of shuffledRules) {
          const match = ayah.teksArab.match(rule.pattern!);
          if (match && match[0].length > 1) {
            setCurrentAyah(ayah);
            setTargetRule(rule);
            setHighlightedText(match[0]);
            
            // Generate options
            const otherRules = Object.values(TAJWEED_RULES)
              .filter(r => r.id !== rule.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map(r => r.name);
            
            setOptions([rule.name, ...otherRules].sort(() => Math.random() - 0.5));
            found = true;
            break;
          }
        }
        attempts++;
      }
      
      if (!found) {
        // Fallback if no tajweed found in random attempts
        generateQuestion();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleCheck = () => {
    if (!selectedOption || !targetRule) return;
    const correct = selectedOption === targetRule.name;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (questionsSolved + 1 >= totalQuestions) {
      onComplete(questionsSolved * 20);
    } else {
      setQuestionsSolved(prev => prev + 1);
      generateQuestion();
    }
  };

  if (loading && questionsSolved === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-emerald-800 dark:text-emerald-400 font-medium">Mencari tantangan Tajweed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-300">
      <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onQuit} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-emerald-600">
            <span>Tajweed Practice</span>
            <span>{questionsSolved + 1} / {totalQuestions}</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${((questionsSolved + 1) / totalQuestions) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center">
        <div className="mb-8 space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hukum tajweed apa yang berlaku pada potongan ayat ini?</h2>
          <p className="text-sm text-slate-500">Perhatikan bagian yang disorot di bawah.</p>
        </div>

        {currentAyah && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 mb-10 border border-slate-100 dark:border-slate-800 shadow-inner w-full">
            <p className="arabic-font text-4xl sm:text-5xl leading-[2] text-slate-800 dark:text-slate-100">
              {currentAyah.teksArab.split(highlightedText).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 rounded-xl border-b-4 border-emerald-500/40 font-bold">
                      {highlightedText}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {options.map(option => (
            <button
              key={option}
              disabled={showFeedback}
              onClick={() => setSelectedOption(option)}
              className={`
                py-4 px-6 rounded-2xl border-2 font-bold transition-all text-sm
                ${selectedOption === option ? 
                  'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-4 ring-emerald-500/10' : 
                  'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-200'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className={`p-6 border-t transition-all duration-300 ${showFeedback ? (isCorrect ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200' : 'bg-red-50 dark:bg-red-950 border-red-200') : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
        <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          {showFeedback ? (
            <div className="flex-1 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}>
                {isCorrect ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <div className="text-left">
                <h4 className={`font-bold text-lg ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {isCorrect ? 'Masya Allah, Benar!' : 'Hampir Tepat!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isCorrect ? targetRule?.description : `Itu adalah ${targetRule?.name}. ${targetRule?.description}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden sm:block"></div>
          )}

          <button
            onClick={showFeedback ? handleNext : handleCheck}
            disabled={!selectedOption || loading}
            className={`
              w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl
              ${!selectedOption || loading ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 
                showFeedback ? (isCorrect ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white') : 
                'bg-emerald-600 hover:bg-emerald-700 text-white'}
            `}
          >
            {loading ? '...' : (showFeedback ? (questionsSolved + 1 >= totalQuestions ? 'SELESAI' : 'LANJUT') : 'PERIKSA')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TajweedPractice;
