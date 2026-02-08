import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Ayah, TAJWEED_RULES, TajweedRule } from '../types';
import { getSurahDetail } from '../services/quranService';
import { supabaseAnonKey, supabaseUrl } from '../services/supabaseClient';

interface TajweedPracticeProps {
  onComplete: (xpGained: number) => void;
  onQuit: () => void;
}

const TajweedPractice: React.FC<TajweedPracticeProps> = ({ onComplete, onQuit }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [targetRule, setTargetRule] = useState<TajweedRule | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [audioScore, setAudioScore] = useState<number | null>(null);
  const [audioFeedback, setAudioFeedback] = useState<string | null>(null);
  const [audioErrors, setAudioErrors] = useState<{ index: number; expected: string; got: string }[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const totalQuestions = 5;

  const generateQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setShowFeedback(false);
    setTranscript(null);
    setAudioScore(null);
    setAudioFeedback(null);
    setAudioErrors([]);

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
        const rulesWithPatterns = Object.values(TAJWEED_RULES).filter((r) => r.pattern);

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
              .filter((r) => r.id !== rule.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((r) => r.name);

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
      setQuestionsSolved((prev) => prev + 1);
      generateQuestion();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Browser tidak mendukung perekaman audio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      alert('Gagal mulai merekam. Pastikan izin mic sudah diberikan.');
    }
  };

  const stopRecordingAndScore = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setIsRecording(false);
    setIsScoring(true);

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recitation.webm');
    formData.append('referenceText', currentAyah?.teksArab || '');
    formData.append('language', 'ar');

    try {
      // const alignUrl = (import.meta as any).env.VITE_WHISPER_ALIGN_URL;
      const alignUrl = 'http://localhost:8081';
      const token = await getToken();
      const res = await fetch(alignUrl ? `${alignUrl}/score` : `${supabaseUrl}/functions/v1/whisper-score`, {
        method: 'POST',
        headers: alignUrl
          ? undefined
          : {
              Authorization: token ? `Bearer ${token}` : `Bearer ${supabaseAnonKey}`,
              apikey: supabaseAnonKey,
            },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to score audio');
      }

      const data = await res.json();
      setTranscript(data?.transcript || null);
      setAudioScore(typeof data?.score === 'number' ? data.score : null);
      setAudioFeedback(data?.feedback || null);
      setAudioErrors(Array.isArray(data?.errors) ? data.errors : []);
    } catch (error) {
      console.error('Audio scoring failed', error);
      alert('Gagal menilai audio. Coba lagi.');
    } finally {
      setIsScoring(false);
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-emerald-600">
            <span>Tajweed Practice</span>
            <span>
              {questionsSolved + 1} / {totalQuestions}
            </span>
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
                  {i < arr.length - 1 && <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 rounded-xl border-b-4 border-emerald-500/40 font-bold">{highlightedText}</span>}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {options.map((option) => (
            <button
              key={option}
              disabled={showFeedback}
              onClick={() => setSelectedOption(option)}
              className={`
                py-4 px-6 rounded-2xl border-2 font-bold transition-all text-sm
                ${
                  selectedOption === option
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-4 ring-emerald-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-200'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {false && (
          <div className="mt-10 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tajwid via Audio</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rekam bacaanmu untuk dinilai.</p>
              </div>
              {isRecording ? (
                <button onClick={stopRecordingAndScore} className="px-4 py-2 bg-red-500 text-white text-xs font-black rounded-xl">
                  STOP
                </button>
              ) : (
                <button onClick={startRecording} disabled={isScoring} className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl disabled:opacity-60">
                  REKAM
                </button>
              )}
            </div>

            {isScoring && <p className="text-xs text-slate-500">Menilai rekaman...</p>}

            {!isScoring && (transcript || audioScore !== null || audioFeedback) && (
              <div className="mt-3 space-y-2">
                {transcript && (
                  <p className="text-xs text-slate-500">
                    <span className="font-bold">Transkrip:</span> {transcript}
                  </p>
                )}
                {audioScore !== null && (
                  <p className="text-xs text-slate-500">
                    <span className="font-bold">Skor:</span> {audioScore}
                  </p>
                )}
                {audioFeedback && (
                  <p className="text-xs text-slate-500">
                    <span className="font-bold">Feedback:</span> {audioFeedback}
                  </p>
                )}
                {audioErrors.length > 0 && (
                  <div className="text-xs text-slate-500">
                    <span className="font-bold">Detail salah:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {audioErrors.slice(0, 12).map((err, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800">
                          {err.expected || '∅'} → {err.got || '∅'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`p-6 border-t transition-all duration-300 ${showFeedback ? (isCorrect ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200' : 'bg-red-50 dark:bg-red-950 border-red-200') : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}
      >
        <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          {showFeedback ? (
            <div className="flex-1 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}>
                {isCorrect ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <h4 className={`font-bold text-lg ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{isCorrect ? 'Masya Allah, Benar!' : 'Hampir Tepat!'}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{isCorrect ? targetRule?.description : `Itu adalah ${targetRule?.name}. ${targetRule?.description}`}</p>
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
              ${
                !selectedOption || loading
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : showFeedback
                    ? isCorrect
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            `}
          >
            {loading ? '...' : showFeedback ? (questionsSolved + 1 >= totalQuestions ? 'SELESAI' : 'LANJUT') : 'PERIKSA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TajweedPractice;
