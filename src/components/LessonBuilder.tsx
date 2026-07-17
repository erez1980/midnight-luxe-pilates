import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, FileText, ChevronRight, Compass, Sparkles, BookOpen } from 'lucide-react';
import { Exercise, Lesson, LessonExercise } from '../types';
import ExerciseLibrary from './ExerciseLibrary';
import { motion, AnimatePresence } from 'motion/react';

interface LessonBuilderProps {
  onSaveLesson: (lesson: Lesson) => void;
  existingLessonToEdit?: Lesson | null;
}

export default function LessonBuilder({ onSaveLesson, existingLessonToEdit = null }: LessonBuilderProps) {
  // Lesson metadata state
  const [lessonName, setLessonName] = useState(existingLessonToEdit?.name || '');
  const [description, setDescription] = useState(existingLessonToEdit?.description || '');
  const [level, setLevel] = useState<Lesson['level']>(existingLessonToEdit?.level || 'intermediate');
  const [targetFocus, setTargetFocus] = useState(existingLessonToEdit?.targetFocus || 'חיזוק כללי ויציבה');
  const [exercises, setExercises] = useState<LessonExercise[]>(existingLessonToEdit?.exercises || []);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const levelLabels = {
    beginner: 'מתחילים',
    intermediate: 'בינוני',
    advanced: 'מתקדם',
    mixed: 'רמות מעורבות'
  };

  // Add exercise to active flow
  const handleAddExercise = (exercise: Exercise) => {
    // Check if already in the list
    if (exercises.some(e => e.exercise.id === exercise.id)) {
      // Remove it if clicked again (toggle behavior in search selector)
      handleRemoveExercise(exercise.id);
      return;
    }

    const newLessonExercise: LessonExercise = {
      exercise,
      customDuration: exercise.durationMinutes,
      notes: ''
    };

    setExercises([...exercises, newLessonExercise]);
  };

  // Remove exercise
  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(e => e.exercise.id !== id));
  };

  // Adjust duration
  const handleUpdateDuration = (id: string, amount: number) => {
    setExercises(exercises.map(e => {
      if (e.exercise.id === id) {
        const newDuration = Math.max(1, e.customDuration + amount);
        return { ...e, customDuration: newDuration };
      }
      return e;
    }));
  };

  // Update custom notes
  const handleUpdateNotes = (id: string, notes: string) => {
    setExercises(exercises.map(e => {
      if (e.exercise.id === id) {
        return { ...e, notes };
      }
      return e;
    }));
  };

  // Move exercise up in flow
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index - 1];
    newExercises[index - 1] = temp;
    setExercises(newExercises);
  };

  // Move exercise down in flow
  const handleMoveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index + 1];
    newExercises[index + 1] = temp;
    setExercises(newExercises);
  };

  // Save full lesson
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors: string[] = [];

    if (!lessonName.trim()) {
      currentErrors.push('אנא הזיני שם לשיעור');
    }
    if (exercises.length === 0) {
      currentErrors.push('אנא הוסיפי לפחות תרגיל אחד לשיעור');
    }

    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors([]);

    const totalDuration = exercises.reduce((acc, curr) => acc + curr.customDuration, 0);

    const savedLesson: Lesson = {
      id: existingLessonToEdit?.id || `custom_lesson_${Date.now()}`,
      name: lessonName,
      description: description || 'אין תיאור לשיעור זה.',
      level,
      levelLabel: levelLabels[level],
      targetFocus,
      exercises,
      totalDuration,
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };

    onSaveLesson(savedLesson);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const totalCalculatedDuration = exercises.reduce((acc, curr) => acc + curr.customDuration, 0);
  const activeExerciseIds = exercises.map(e => e.exercise.id);

  return (
    <div className="w-full">
      {/* Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold px-6 py-3 shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            השיעור נשמר בהצלחה בספרייה שלך!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-12">
        <div className="inline-block mb-3 px-4 py-1 border-l border-r border-secondary/40">
          <span className="uppercase tracking-[0.2em] text-secondary text-xs font-semibold">BOUTIQUE WORKOUT PLANNER</span>
        </div>
        <h2 className="serif-text text-3xl md:text-5xl font-bold text-white mb-4">
          {existingLessonToEdit ? 'עריכת מערך שיעור' : 'בניית מערך שיעור'}
        </h2>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          תכנני את זרימת התנועה המושלמת בממשק אינטראקטיבי. הוסיפי תרגילים, קבעי זמני ביצוע לכל תנועה, ורשמי דגשים ייחודיים לשיעור.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Metadata & Flow Creator */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Metadata Section */}
          <div className="bg-surface-container-high border border-white/5 p-6 rounded-lg space-y-4">
            <h3 className="serif-text text-xl font-bold text-white border-b border-white/5 pb-3">
              פרטי השיעור הכלליים
            </h3>

            {errors.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 text-xs space-y-1 rounded-sm">
                {errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2">שם השיעור *</label>
                <input
                  id="lesson-name"
                  type="text"
                  placeholder="לדוגמה: זרימת בוקר דינמית, פוקוס אגן וליבה..."
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  className="w-full bg-background border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2">מיקוד השיעור (Target Focus)</label>
                <input
                  id="lesson-focus"
                  type="text"
                  placeholder="לדוגמה: יציבה, גמישות, חיזוק השרשרת האחורית"
                  value={targetFocus}
                  onChange={(e) => setTargetFocus(e.target.value)}
                  className="w-full bg-background border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2">דרגת קושי מומלצת</label>
                <select
                  id="lesson-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Lesson['level'])}
                  className="w-full bg-background border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                >
                  <option value="beginner">מתחילים</option>
                  <option value="intermediate">בינוני</option>
                  <option value="advanced">מתקדם</option>
                  <option value="mixed">רמות מעורבות (Mixed Levels)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2">תיאור קצר</label>
                <input
                  id="lesson-desc"
                  type="text"
                  placeholder="איזה סוג חוויה השיעור הזה מציע למתאמנים שלך?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Active Flow (Selected Exercises) */}
          <div className="bg-surface-container-high border border-white/5 p-6 rounded-lg">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h3 className="serif-text text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                רצף תנועת השיעור ({exercises.length} תרגילים)
              </h3>
              <div className="text-left font-mono">
                <span className="text-secondary font-bold text-lg">{totalCalculatedDuration}</span>
                <span className="text-xs text-on-surface-variant mr-1">דקות סה"כ</span>
              </div>
            </div>

            {exercises.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/10 rounded-lg flex flex-col items-center">
                <Compass className="w-10 h-10 text-secondary/30 mb-3" />
                <p className="text-white font-medium mb-1">מערך השיעור ריק</p>
                <p className="text-on-surface-variant text-xs max-w-xs">
                  בחרי תרגילים מספריית התרגילים בצד שמאל (או למטה) כדי לבנות את זרימת השיעור שלך.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {exercises.map((el, index) => (
                    <motion.div
                      key={el.exercise.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="border border-white/5 bg-background p-4 relative group hover:border-secondary/20 transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                    >
                      {/* Left: Reorder controls + details */}
                      <div className="flex items-start gap-3 w-full md:w-auto">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`p-1 border border-white/5 text-on-surface-variant hover:text-secondary rounded-sm transition-colors ${index === 0 ? 'opacity-25 cursor-not-allowed' : ''}`}
                            title="העבר למעלה"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === exercises.length - 1}
                            className={`p-1 border border-white/5 text-on-surface-variant hover:text-secondary rounded-sm transition-colors ${index === exercises.length - 1 ? 'opacity-25 cursor-not-allowed' : ''}`}
                            title="העבר למטה"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex gap-2 items-center mb-1">
                            <span className="text-[10px] font-mono uppercase bg-secondary/10 text-secondary px-1.5 py-0.5 font-bold">
                              {el.exercise.apparatusLabel}
                            </span>
                            <span className="text-[10px] bg-white/5 text-on-surface-variant px-1.5 py-0.5 rounded-sm">
                              {el.exercise.difficultyLabel}
                            </span>
                          </div>
                          <h4 className="font-bold text-white">{el.exercise.name}</h4>
                          <input
                            type="text"
                            placeholder="הוסיפי דגש הדרכה מיוחד לשיעור זה (לדוגמה: לשים לב לגב תחתון)..."
                            value={el.notes || ''}
                            onChange={(e) => handleUpdateNotes(el.exercise.id, e.target.value)}
                            className="text-xs text-secondary w-full max-w-[280px] md:max-w-[400px] mt-2 bg-transparent border-b border-white/5 focus:border-secondary focus:outline-none transition-colors py-1 placeholder-white/20"
                          />
                        </div>
                      </div>

                      {/* Right: duration adjustment & delete */}
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                        {/* Time controls */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant">זמן:</span>
                          <div className="flex items-center border border-white/10 rounded-sm">
                            <button
                              type="button"
                              onClick={() => handleUpdateDuration(el.exercise.id, -1)}
                              className="px-2 py-1 text-on-surface-variant hover:text-white transition-colors bg-white/5"
                            >
                              -
                            </button>
                            <span className="px-3 text-sm text-white font-mono font-bold">
                              {el.customDuration}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateDuration(el.exercise.id, 1)}
                              className="px-2 py-1 text-on-surface-variant hover:text-white transition-colors bg-white/5"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-on-surface-variant">דק׳</span>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(el.exercise.id)}
                          className="p-2 text-rose-500/70 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 transition-colors bg-white/5"
                          title="הסר תרגיל"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="submit"
              className="px-8 py-4 bg-secondary text-background font-bold tracking-widest uppercase hover:bg-white transition-all flex items-center gap-2 shadow-2xl"
            >
              <Save className="w-5 h-5" />
              שמרי מערך שיעור זה
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Selective compact Exercise Library */}
        <div className="xl:col-span-5 bg-surface-container-high border border-white/5 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <BookOpen className="w-5 h-5 text-secondary" />
            <h3 className="serif-text text-xl font-bold text-white">
              בחירת תרגילים לשיעור
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            לחצי על <strong>״הוסיפי לשיעור״</strong> בתרגילי פילאטיס הבאים כדי לשלב אותם במערך השיעור הנוכחי. תוכלי לחפש ולסנן את התרגילים בקלות.
          </p>

          <div className="max-h-[85vh] overflow-y-auto pr-1">
            <ExerciseLibrary 
              isSelectorMode={true} 
              onAddToLesson={handleAddExercise}
              addedExerciseIds={activeExerciseIds}
            />
          </div>
        </div>

      </form>
    </div>
  );
}
