
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { SurahShort, ViewState, Bookmark, UserProgress, Lesson } from './types';
import { getSurahList } from './services/quranService';
import { LESSONS as DEFAULT_LESSONS } from './services/learningData';
import { createSupabaseClient } from './services/supabaseClient';
import { fetchUserState, saveUserState } from './services/userState';
import Navbar from './components/Navbar';
import SurahCard from './components/SurahCard';
import SurahDetailView from './components/SurahDetailView';
import MadrasahPath from './components/MadrasahPath';
import MadrasahQuiz from './components/MadrasahQuiz';
import TajweedPractice from './components/TajweedPractice';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [surahs, setSurahs] = useState<SurahShort[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { openSignIn, signOut } = useClerk();
  const authLoading = !isLoaded;
  const clerkUser = isSignedIn ? user : null;
  const [viewState, setViewState] = useState<ViewState>('LIST');
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginHint, setLoginHint] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('customLessons');
    return saved ? JSON.parse(saved) : DEFAULT_LESSONS;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('userProgress');
    return saved ? JSON.parse(saved) : { completedLessons: [], xp: 0, streak: 0 };
  });

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await getSurahList();
        setSurahs(data);
      } catch (err) {
        console.error("Failed to load surahs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  const supabase = useMemo(
    () =>
      createSupabaseClient(async () => {
        const token = await getToken();
        return token ?? null;
      }),
    [getToken]
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (!clerkUser) {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, clerkUser]);

  useEffect(() => {
    if (!clerkUser) {
      localStorage.setItem('userProgress', JSON.stringify(progress));
    }
  }, [progress, clerkUser]);

  useEffect(() => {
    if (!clerkUser) {
      localStorage.setItem('customLessons', JSON.stringify(lessons));
    }
  }, [lessons, clerkUser]);

  useEffect(() => {
    if (!clerkUser) return;

    const loadUserState = async () => {
      const state = await fetchUserState(supabase, clerkUser.id);
      if (!state) return;
      setProgress(state.progress);
      setBookmarks(state.bookmarks);
      setLessons(state.lessons);
    };

    loadUserState();
  }, [clerkUser, supabase]);

  useEffect(() => {
    if (!clerkUser) return;
    saveUserState(supabase, clerkUser.id, { progress, bookmarks, lessons });
  }, [clerkUser, supabase, progress, bookmarks, lessons]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor.toString() === searchTerm
    );
  }, [surahs, searchTerm]);

  const lastRead = useMemo(() => {
    if (bookmarks.length > 0) return bookmarks[bookmarks.length - 1];
    return { surahId: 2, ayahNumber: 23, surahName: 'Al-Baqarah' };
  }, [bookmarks]);

  const handleSurahClick = (id: number, scrollToAyah?: number) => {
    setSelectedSurahId(id);
    setViewState('DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (scrollToAyah) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${scrollToAyah}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  };

  const handleBackToList = () => {
    setViewState('LIST');
    setSelectedSurahId(null);
  };

  const requireLogin = (message: string) => {
    if (!clerkUser) {
      setLoginHint(message);
      setTimeout(() => setLoginHint(null), 2500);
      openSignIn({});
      return true;
    }
    return false;
  };

  const handleGoToLearn = () => {
    if (requireLogin('Login dulu untuk akses fitur belajar.')) return;
    setViewState('LEARNING');
    setSelectedSurahId(null);
  };

  const handleGoToProfile = () => {
    setViewState('PROFILE');
    setSelectedSurahId(null);
  };

  const handleGoToAdmin = () => {
    setViewState('ADMIN');
  };

  const handleAddLesson = (newLesson: Lesson) => {
    setLessons(prev => [...prev, newLesson]);
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (requireLogin('Login dulu untuk mulai belajar.')) return;
    setSelectedLesson(lesson);
    setViewState('QUIZ');
  };

  const handleStartPractice = () => {
    if (requireLogin('Login dulu untuk mulai latihan.')) return;
    setViewState('TAJWEED_PRACTICE');
  };

  const handleCompleteLesson = () => {
    if (selectedLesson) {
      setProgress(prev => {
        const alreadyDone = prev.completedLessons.includes(selectedLesson.id);
        return {
          ...prev,
          completedLessons: alreadyDone ? prev.completedLessons : [...prev.completedLessons, selectedLesson.id],
          xp: prev.xp + 50,
          streak: prev.streak === 0 ? 1 : prev.streak
        };
      });
    }
    setViewState('LEARNING');
    setSelectedLesson(null);
  };

  const handleCompletePractice = (xpGained: number) => {
    setProgress(prev => ({
      ...prev,
      xp: prev.xp + xpGained,
    }));
    setViewState('LEARNING');
  };

  const handleResetData = () => {
    localStorage.removeItem('bookmarks');
    localStorage.removeItem('userProgress');
    localStorage.removeItem('customLessons');
    setBookmarks([]);
    setLessons(DEFAULT_LESSONS);
    setProgress({ completedLessons: [], xp: 0, streak: 0 });
    setViewState('LIST');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const toggleBookmark = (bookmark: Bookmark) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.surahId === bookmark.surahId && b.ayahNumber === bookmark.ayahNumber);
      if (exists) {
        return prev.filter(b => !(b.surahId === bookmark.surahId && b.ayahNumber === bookmark.ayahNumber));
      }
      return [...prev, bookmark];
    });
  };

  const handleLogin = () => {
    openSignIn({});
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed', error);
      alert('Logout gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col items-center">
      <div className="w-full max-w-xl flex flex-col min-h-screen relative">
        {loginHint && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full shadow-lg">
            {loginHint}
          </div>
        )}
        
        {viewState !== 'QUIZ' && viewState !== 'TAJWEED_PRACTICE' && viewState !== 'ADMIN' && (
          <Navbar 
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onHomeClick={handleBackToList}
          />
        )}

        <main className="flex-1 px-6 pt-2 pb-32 w-full overflow-x-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm animate-pulse">Memuat...</p>
            </div>
          ) : (
            <>
              {viewState === 'LIST' && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <header className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assalamu'alaikum</h2>
                    <p className="text-slate-500 dark:text-slate-400">Ayo lanjutkan tilawah hari ini</p>
                  </header>

                  {/* Continue Reading Card */}
                  <div className="bg-slate-100 dark:bg-slate-900/60 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">Lanjutkan Bacaan</p>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                      {lastRead.surahName} · Ayat {lastRead.ayahNumber}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs mb-6">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Terakhir dibaca: Baru saja</span>
                    </div>
                    <button 
                      onClick={() => handleSurahClick(lastRead.surahId, lastRead.ayahNumber)}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      Lanjutkan
                    </button>
                  </div>

                  {/* Optimized Search Bar */}
                  <div className="relative group mx-1">
                    <input
                      type="text"
                      placeholder="Cari surah..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-200/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-600"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Surah List */}
                  <div className="flex flex-col gap-3">
                    {filteredSurahs.map(surah => (
                      <SurahCard 
                        key={surah.nomor} 
                        surah={surah} 
                        onClick={handleSurahClick} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {viewState === 'DETAIL' && selectedSurahId && (
                <SurahDetailView 
                  surahId={selectedSurahId} 
                  onBack={handleBackToList}
                  bookmarks={bookmarks}
                  onToggleBookmark={toggleBookmark}
                  isAuthenticated={!!clerkUser}
                  onRequireLogin={() => requireLogin('Login dulu untuk akses fitur AI.')}
                />
              )}

              {viewState === 'LEARNING' && (
                <MadrasahPath 
                  lessons={lessons}
                  progress={progress} 
                  onSelectLesson={handleStartLesson} 
                  onSelectPractice={handleStartPractice}
                />
              )}

              {viewState === 'PROFILE' && (
                <ProfileView 
                  progress={progress}
                  bookmarks={bookmarks}
                  user={clerkUser}
                  authLoading={authLoading}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  onSelectBookmark={handleSurahClick}
                  onResetData={handleResetData}
                  onGoToAdmin={handleGoToAdmin}
                />
              )}

              {viewState === 'ADMIN' && (
                <AdminView 
                  lessons={lessons}
                  onAddLesson={handleAddLesson}
                  onBack={() => setViewState('PROFILE')}
                />
              )}

              {viewState === 'QUIZ' && selectedLesson && (
                <MadrasahQuiz 
                  lesson={selectedLesson}
                  onComplete={handleCompleteLesson}
                  onQuit={() => setViewState('LEARNING')}
                />
              )}

              {viewState === 'TAJWEED_PRACTICE' && (
                <TajweedPractice 
                  onComplete={handleCompletePractice}
                  onQuit={() => setViewState('LEARNING')}
                />
              )}
            </>
          )}
        </main>

        {/* Improved Bottom Navigation */}
        {viewState !== 'QUIZ' && viewState !== 'TAJWEED_PRACTICE' && viewState !== 'ADMIN' && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/80 px-8 pt-4 pb-6 flex items-center justify-between z-[100] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-none">
            <button 
              onClick={handleBackToList}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${viewState === 'LIST' || viewState === 'DETAIL' ? 'text-emerald-500 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[10px] font-bold tracking-tight">Baca</span>
            </button>
            <button 
              onClick={handleGoToLearn}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${viewState === 'LEARNING' ? 'text-emerald-500 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span className="text-[10px] font-bold tracking-tight">Belajar</span>
            </button>
            <button 
              onClick={handleGoToProfile}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${viewState === 'PROFILE' ? 'text-emerald-500 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-bold tracking-tight">Profil</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
