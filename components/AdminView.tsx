
import React, { useState } from 'react';
import { Lesson, Question } from '../types';

interface AdminViewProps {
  lessons: Lesson[];
  onAddLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ lessons, onAddLesson, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    id: `lesson-${Date.now()}`,
    title: '',
    description: '',
    icon: '📖',
    category: 'TAJWEED',
    questions: []
  });

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    prompt: '',
    arabicContent: '',
    options: [''],
    correctAnswer: '',
    explanation: '',
    type: 'CHOICE',
    audioUrl: '',
    imageUrl: '',
    scrambledWords: [],
    pairs: []
  });

  const handleSaveLesson = () => {
    if (newLesson.title && newLesson.questions?.length) {
      onAddLesson(newLesson as Lesson);
      setIsAdding(false);
      setNewLesson({ id: `lesson-${Date.now()}`, questions: [], icon: '📖', category: 'TAJWEED' });
    } else {
      alert("Harap isi judul dan minimal 1 pertanyaan.");
    }
  };

  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: (prev.options || []).map((opt, i) => (i === index ? value : opt))
    }));
  };

  const removeOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
  };

  const updatePair = (index: number, field: 'key' | 'value', value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      pairs: (prev.pairs || []).map((pair, i) => (i === index ? { ...pair, [field]: value } : pair))
    }));
  };

  const addPair = () => {
    setNewQuestion(prev => ({
      ...prev,
      pairs: [...(prev.pairs || []), { key: '', value: '' }]
    }));
  };

  const removePair = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      pairs: (prev.pairs || []).filter((_, i) => i !== index)
    }));
  };

  const addQuestionToLesson = () => {
    if (newQuestion.prompt && newQuestion.correctAnswer) {
      setNewLesson(prev => ({
        ...prev,
        questions: [...(prev.questions || []), { ...newQuestion, id: `q-${Date.now()}` } as Question]
      }));
      setNewQuestion({
        prompt: '',
        arabicContent: '',
        options: [''],
        correctAnswer: '',
        explanation: '',
        type: 'CHOICE',
        audioUrl: '',
        imageUrl: '',
        scrambledWords: [],
        pairs: []
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Dapur Admin</h2>
          <p className="text-slate-500 text-sm italic">Pantau & Kelola Konten</p>
        </div>
        <button onClick={onBack} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Pengguna</p>
          <h3 className="text-3xl font-black">1.240</h3>
          <div className="mt-2 flex items-center gap-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full w-fit">
            <span>↑ 12% minggu ini</span>
          </div>
        </div>
        <div className="bg-slate-800 dark:bg-slate-900 p-6 rounded-[2rem] text-white">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">XP Terdistribusi</p>
          <h3 className="text-3xl font-black">45.8K</h3>
        </div>
      </div>

      {/* Lesson List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Daftar Materi Belajar</h3>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-emerald-500/20"
          >
            TAMBAH MATERI
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {lessons.map(lesson => (
            <div key={lesson.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lesson.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">{lesson.title}</h4>
                  <p className="text-[10px] text-slate-400">{lesson.category} • {lesson.questions.length} Soal</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Lesson Modal Simulation */}
      {isAdding && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Materi Baru</h3>
            
            <div className="space-y-4 mb-8">
              <input 
                placeholder="Judul Materi"
                value={newLesson.title}
                onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none"
              />
              <select 
                value={newLesson.category}
                onChange={e => setNewLesson({...newLesson, category: e.target.value as any})}
                className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none"
              >
                <option value="TAJWEED">TAJWEED</option>
                <option value="HIJAIYAH">HIJAIYAH</option>
                <option value="HAFALAN">HAFALAN</option>
              </select>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Tambah Soal</h4>
              <input 
                placeholder="Pertanyaan (Prompt)"
                value={newQuestion.prompt}
                onChange={e => setNewQuestion({...newQuestion, prompt: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm"
              />
              <select
                value={newQuestion.type}
                onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value as Question['type'] })}
                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm"
              >
                <option value="CHOICE">CHOICE</option>
                <option value="AUDIO_MATCH">AUDIO_MATCH</option>
                <option value="WORD_SCRAMBLE">WORD_SCRAMBLE</option>
                <option value="MATCHING">MATCHING</option>
                <option value="FLASHCARD">FLASHCARD</option>
              </select>
              <input 
                placeholder="Konten Arab (Opsional)"
                value={newQuestion.arabicContent}
                onChange={e => setNewQuestion({...newQuestion, arabicContent: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm arabic-font text-right"
              />
              <input 
                placeholder="Audio URL (Opsional)"
                value={newQuestion.audioUrl || ''}
                onChange={e => setNewQuestion({...newQuestion, audioUrl: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm"
              />
              <input 
                placeholder="Image URL (Opsional)"
                value={newQuestion.imageUrl || ''}
                onChange={e => setNewQuestion({...newQuestion, imageUrl: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm"
              />

              {newQuestion.type === 'CHOICE' && (
                <div className="mb-3 space-y-2">
                  {(newQuestion.options || []).map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder={`Opsi ${i + 1}`}
                        value={opt}
                        onChange={e => updateOption(i, e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-sm"
                      />
                      {(newQuestion.options || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-black"
                        >
                          HAPUS
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-xs font-black rounded-xl"
                  >
                    TAMBAH OPSI
                  </button>
                </div>
              )}

              {newQuestion.type === 'WORD_SCRAMBLE' && (
                <input
                  placeholder="Scrambled words (pisahkan dengan koma)"
                  value={(newQuestion.scrambledWords || []).join(', ')}
                  onChange={e => setNewQuestion({ ...newQuestion, scrambledWords: e.target.value.split(',').map(w => w.trim()).filter(Boolean) })}
                  className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm"
                />
              )}

              {newQuestion.type === 'MATCHING' && (
                <div className="mb-3 space-y-2">
                  {(newQuestion.pairs || []).map((pair, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder="Kunci"
                        value={pair.key}
                        onChange={e => updatePair(i, 'key', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-sm"
                      />
                      <input
                        placeholder="Nilai"
                        value={pair.value}
                        onChange={e => updatePair(i, 'value', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removePair(i)}
                        className="px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-black"
                      >
                        HAPUS
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPair}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-xs font-black rounded-xl"
                  >
                    TAMBAH PASANGAN
                  </button>
                </div>
              )}

              <input 
                placeholder="Jawaban Benar"
                value={newQuestion.correctAnswer}
                onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm border-2 border-emerald-500/20"
              />
              <textarea
                placeholder="Penjelasan (opsional)"
                value={newQuestion.explanation}
                onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 text-sm min-h-[90px]"
              />
              <button 
                onClick={addQuestionToLesson}
                className="w-full py-3 bg-indigo-600 text-white font-black text-[10px] rounded-xl"
              >
                TAMBAH KE MATERI ({newLesson.questions?.length || 0})
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-400 font-bold">Batal</button>
              <button onClick={handleSaveLesson} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20">Simpan Materi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
