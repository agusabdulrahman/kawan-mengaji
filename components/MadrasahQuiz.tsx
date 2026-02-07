
import React, { useState, useRef, useEffect } from 'react';
import { Lesson, Question } from '../types';

interface MadrasahQuizProps {
  lesson: Lesson;
  onComplete: () => void;
  onQuit: () => void;
}

const MadrasahQuiz: React.FC<MadrasahQuizProps> = ({ lesson, onComplete, onQuit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambleResult, setScrambleResult] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Matching States
  const [matchingSelections, setMatchingSelections] = useState<{key?: string, value?: string}>({});
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  
  // Flashcard States
  const [isFlipped, setIsFlipped] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const question = lesson.questions[currentIdx];
  const progress = ((currentIdx + (showFeedback ? 1 : 0)) / lesson.questions.length) * 100;

  const handlePlayAudio = () => {
    if (!question.audioUrl) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(question.audioUrl);
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
    audioRef.current = audio;
  };

  const handleWordClick = (word: string) => {
    if (showFeedback) return;
    setScrambleResult(prev => [...prev, word]);
  };

  const removeWord = (index: number) => {
    if (showFeedback) return;
    setScrambleResult(prev => prev.filter((_, i) => i !== index));
  };

  // Matching Logic
  const handleMatchClick = (type: 'key' | 'value', item: string) => {
    if (showFeedback || matchedPairs.includes(item)) return;
    
    const newSelections = { ...matchingSelections, [type]: item };
    setMatchingSelections(newSelections);

    if (newSelections.key && newSelections.value) {
      const correctPair = question.pairs?.find(p => p.key === newSelections.key && p.value === newSelections.value);
      if (correctPair) {
        setMatchedPairs(prev => [...prev, newSelections.key!, newSelections.value!]);
        setMatchingSelections({});
        // Check if all matched
        if (matchedPairs.length + 2 === (question.pairs?.length || 0) * 2) {
          setIsCorrect(true);
          setShowFeedback(true);
        }
      } else {
        // Shake feedback
        setTimeout(() => setMatchingSelections({}), 500);
      }
    }
  };

  const handleCheck = () => {
    let correct = false;
    if (question.type === 'WORD_SCRAMBLE') {
      correct = scrambleResult.join(' ') === question.correctAnswer;
    } else if (question.type === 'MATCHING') {
      correct = matchedPairs.length === (question.pairs?.length || 0) * 2;
    } else {
      correct = selectedOption === question.correctAnswer;
    }
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 < lesson.questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setScrambleResult([]);
      setMatchedPairs([]);
      setMatchingSelections({});
      setIsFlipped(false);
      setIsCorrect(null);
      setShowFeedback(false);
      setIsPlaying(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-3 h-3 rounded-full animate-ping opacity-60 bg-emerald-500" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 3}s` }}></div>
          ))}
        </div>
        <div className="relative z-10 space-y-8 max-w-sm w-full">
          <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-[3rem] flex items-center justify-center mx-auto animate-bounce mb-4">
            <span className="text-6xl">🏆</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Misi Selesai!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium px-4">Kamu telah menaklukkan <span className="text-emerald-600 dark:text-emerald-400 font-bold">{lesson.title}</span>.</p>
          </div>
          <button onClick={onComplete} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 text-lg">LANJUTKAN JALUR</button>
        </div>
      </div>
    );
  }

  const isCheckDisabled = question.type === 'WORD_SCRAMBLE' ? scrambleResult.length === 0 : (question.type === 'MATCHING' ? false : !selectedOption);

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onQuit} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="text-xs font-bold text-slate-400">{currentIdx + 1}/{lesson.questions.length}</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-2xl mx-auto w-full flex flex-col text-center">
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            {lesson.category}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">{question.prompt}</h2>
        
        <div className="flex flex-col items-center gap-6 mb-10">
          {/* FLASHCARD */}
          {question.type === 'FLASHCARD' && (
            <div className="w-full max-w-sm perspective-1000">
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full aspect-[4/3] transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              >
                <div className="absolute inset-0 backface-hidden bg-emerald-500 rounded-[3rem] flex items-center justify-center shadow-2xl p-8 border-4 border-emerald-300">
                  <span className="arabic-font text-8xl text-white">{question.arabicContent}</span>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center shadow-2xl p-8 border-4 border-emerald-500">
                  <p className="text-3xl font-black text-emerald-600 mb-4">{question.correctAnswer}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">Klik untuk membalik</p>
                </div>
              </div>
            </div>
          )}

          {/* MATCHING */}
          {question.type === 'MATCHING' && (
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="space-y-3">
                {question.pairs?.map((pair, i) => (
                  <button
                    key={`key-${i}`}
                    onClick={() => handleMatchClick('key', pair.key)}
                    disabled={matchedPairs.includes(pair.key)}
                    className={`w-full py-4 rounded-2xl border-2 font-bold arabic-font text-2xl transition-all ${matchedPairs.includes(pair.key) ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 opacity-50' : matchingSelections.key === pair.key ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                  >
                    {pair.key}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {question.pairs?.slice().sort((a,b) => a.value.localeCompare(b.value)).map((pair, i) => (
                  <button
                    key={`val-${i}`}
                    onClick={() => handleMatchClick('value', pair.value)}
                    disabled={matchedPairs.includes(pair.value)}
                    className={`w-full py-4 rounded-2xl border-2 font-bold text-sm transition-all ${matchedPairs.includes(pair.value) ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 opacity-50' : matchingSelections.value === pair.value ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                  >
                    {pair.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WORD SCRAMBLE */}
          {question.type === 'WORD_SCRAMBLE' && (
            <div className="w-full space-y-8">
              <div className="min-h-[100px] bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-wrap items-center justify-center gap-2">
                {scrambleResult.map((word, i) => (
                  <button key={i} onClick={() => removeWord(i)} className="arabic-font text-xl px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-100">{word}</button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {question.scrambledWords?.filter(w => !scrambleResult.includes(w) || question.scrambledWords!.filter(x => x === w).length > scrambleResult.filter(x => x === w).length).map((word, i) => (
                  <button key={i} onClick={() => handleWordClick(word)} className="arabic-font text-xl px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-400">{word}</button>
                ))}
              </div>
            </div>
          )}

          {/* CHOICE / AUDIO MATCH */}
          {(question.type === 'CHOICE' || question.type === 'AUDIO_MATCH') && (
            <div className="w-full space-y-6">
              {question.type === 'AUDIO_MATCH' && (
                <button onClick={handlePlayAudio} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl mx-auto ${isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-500'}`}>
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
              )}
              {question.arabicContent && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-[3rem] p-10 border border-emerald-100/50">
                  <span className="arabic-font text-7xl text-emerald-900 dark:text-emerald-100">{question.arabicContent}</span>
                </div>
              )}
              {question.imageUrl && (
                <img src={question.imageUrl} alt="Ilustrasi" className="w-full max-w-[200px] rounded-2xl mx-auto mb-4 border dark:border-slate-800" />
              )}
              <div className="grid grid-cols-1 gap-3">
                {question.options.map(opt => (
                  <button key={opt} onClick={() => setSelectedOption(opt)} className={`py-4 px-6 rounded-2xl border-2 font-bold transition-all ${selectedOption === opt ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>{opt}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Feedback */}
      <div className={`p-6 border-t ${showFeedback ? (isCorrect ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200' : 'bg-red-50 dark:bg-red-950 border-red-200') : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
        <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          {showFeedback && (
            <div className="flex-1 text-left">
              <h4 className={`font-bold text-lg ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{isCorrect ? 'Alhamdulillah, Benar!' : 'Hampir Tepat!'}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{question.explanation}</p>
            </div>
          )}
          <button onClick={showFeedback ? handleNext : handleCheck} disabled={isCheckDisabled} className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-bold transition-all ${isCheckDisabled ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white shadow-xl active:scale-95'}`}>
            {showFeedback ? 'LANJUT' : 'PERIKSA'}
          </button>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default MadrasahQuiz;
