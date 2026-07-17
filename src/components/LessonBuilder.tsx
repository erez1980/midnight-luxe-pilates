import React, { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, ArrowUp, ArrowDown, Save, FileText, Compass, Sparkles, BookOpen, X, Wand2, Printer, MessageCircle } from 'lucide-react';
import { Exercise, Lesson, LessonExercise } from '../types';
import ExerciseLibrary from './ExerciseLibrary';
import { INITIAL_EXERCISES } from '../data';
import { getExerciseMedia } from '../utils/exerciseMedia';
import { lessonToWhatsappText, openLessonPrint } from '../utils/lessonExport';
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
  const [builderSearchQuery, setBuilderSearchQuery] = useState('');
  const [builderApparatus, setBuilderApparatus] = useState<string>('all');
  const [builderDifficulty, setBuilderDifficulty] = useState<string>('all');
  const [builderCategory, setBuilderCategory] = useState<string>('all');
  const [autoBuildDuration, setAutoBuildDuration] = useState<number>(45);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

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

  useEffect(() => {
    const draftKey = existingLessonToEdit ? `pilates_lesson_draft_${existingLessonToEdit.id}` : 'pilates_lesson_builder_draft';
    const draft = { lessonName, description, level, targetFocus, exercises, autoBuildDuration };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [lessonName, description, level, targetFocus, exercises, autoBuildDuration, existingLessonToEdit]);

  const buildCurrentLessonPayload = (): Lesson => ({
    id: existingLessonToEdit?.id || `custom_lesson_${Date.now()}`,
    name: lessonName || 'שיעור ללא שם',
    description: description || 'אין תיאור לשיעור זה.',
    level,
    levelLabel: levelLabels[level],
    targetFocus,
    exercises,
    totalDuration: exercises.reduce((acc, curr) => acc + curr.customDuration, 0),
    createdAt: new Date().toISOString().split('T')[0],
    isCustom: true
  });

  const autoBuildLesson = () => {
    const acceptedLevels = level === 'mixed' ? ['beginner', 'intermediate'] : [level];
    const preferredApparatus = builderApparatus === 'all' ? null : builderApparatus;
    const blocks = [
      ['warmup', Math.max(5, Math.round(autoBuildDuration * 0.16))],
      ['mobility', Math.max(4, Math.round(autoBuildDuration * 0.14))],
      ['core', Math.max(10, Math.round(autoBuildDuration * 0.24))],
      ['glutes', Math.max(8, Math.round(autoBuildDuration * 0.2))],
      ['balance', Math.max(6, Math.round(autoBuildDuration * 0.14))],
      ['cooldown', Math.max(4, Math.round(autoBuildDuration * 0.12))]
    ] as const;

    const used = new Set<string>();
    const generated: LessonExercise[] = [];

    blocks.forEach(([category, targetMinutes]) => {
      let remaining = targetMinutes;
      const pool = INITIAL_EXERCISES.filter((exercise) => {
        const matchesCategory = exercise.category === category;
        const matchesLevel = level === 'mixed' || acceptedLevels.includes(exercise.difficulty);
        const matchesApparatus = !preferredApparatus || exercise.apparatus === preferredApparatus;
        return matchesCategory && matchesLevel && matchesApparatus && !used.has(exercise.id);
      });

      for (const exercise of pool) {
        if (remaining <= 0) break;
        used.add(exercise.id);
        const customDuration = Math.min(Math.max(2, exercise.durationMinutes), remaining);
        generated.push({
          exercise,
          customDuration,
          notes: category === 'cooldown' ? 'לסיים עם נשימה, הארכה והורדת עומס' : ''
        });
        remaining -= customDuration;
      }
    });

    if (generated.length) {
      setExercises(generated);
      if (!lessonName.trim()) setLessonName(`שיעור אוטומטי ${autoBuildDuration} דקות`);
      if (!description.trim()) setDescription('שיעור שנבנה אוטומטית לפי זמן, רמה, מכשיר וזרימת שיעור מומלצת.');
    }
  };

  const handlePrintLesson = () => {
    if (exercises.length === 0) return;
    openLessonPrint(buildCurrentLessonPayload());
  };

  const handleCopyWhatsapp = async () => {
    if (exercises.length === 0) return;
    const text = lessonToWhatsappText(buildCurrentLessonPayload());
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2500);
    } catch {
      window.prompt('העתיקי את התוכן ל-WhatsApp:', text);
    }
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

    const savedLesson: Lesson = {
      ...buildCurrentLessonPayload(),
      name: lessonName,
    };

    onSaveLesson(savedLesson);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const totalCalculatedDuration = exercises.reduce((acc, curr) => acc + curr.customDuration, 0);
  const activeExerciseIds = exercises.map(e => e.exercise.id);

  const apparatusOptions = [
    { value: 'all', label: 'כל המכשירים' },
    { value: 'mat', label: 'מזרן' },
    { value: 'reformer', label: 'רפורמר' },
    { value: 'cadillac', label: 'קאדילק' },
    { value: 'chair', label: 'כיסא' },
    { value: 'props', label: 'עזרים' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'כל הרמות' },
    { value: 'beginner', label: 'מתחילים' },
    { value: 'intermediate', label: 'בינוני' },
    { value: 'advanced', label: 'מתקדם' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'כל הקטגוריות' },
    { value: 'warmup', label: 'חימום' },
    { value: 'core', label: 'ליבה' },
    { value: 'glutes', label: 'ישבן ורגליים' },
    { value: 'mobility', label: 'מוביליות' },
    { value: 'balance', label: 'שיווי משקל' },
    { value: 'upper-body', label: 'פלג גוף עליון' },
    { value: 'cooldown', label: 'שחרור' },
    { value: 'full-body', label: 'גוף מלא' }
  ];

  const quickFilteredExercises = useMemo(() => {
    return INITIAL_EXERCISES.filter((exercise) => {
      const matchesSearch = !builderSearchQuery ||
        exercise.name.toLowerCase().includes(builderSearchQuery.toLowerCase()) ||
        exercise.englishName.toLowerCase().includes(builderSearchQuery.toLowerCase()) ||
        exercise.targetMuscles.some((muscle) => muscle.toLowerCase().includes(builderSearchQuery.toLowerCase()));

      const matchesApparatus = builderApparatus === 'all' || exercise.apparatus === builderApparatus;
      const matchesDifficulty = builderDifficulty === 'all' || exercise.difficulty === builderDifficulty;
      const matchesCategory = builderCategory === 'all' || exercise.category === builderCategory;
      return matchesSearch && matchesApparatus && matchesDifficulty && matchesCategory;
    }).slice(0, 24);
  }, [builderSearchQuery, builderApparatus, builderDifficulty, builderCategory]);

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

          <div className="rounded-2xl border border-secondary/15 bg-secondary/5 p-4 space-y-4">
            <div className="flex items-center gap-2 text-secondary">
              <Wand2 className="w-4 h-4" />
              <div className="text-xs font-bold uppercase tracking-[0.2em]">Auto Build</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-2">משך שיעור אוטומטי</label>
                <input
                  type="range"
                  min={20}
                  max={90}
                  step={5}
                  value={autoBuildDuration}
                  onChange={(e) => setAutoBuildDuration(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-on-surface-variant mt-2">{autoBuildDuration} דקות · לפי רמה, מכשיר וזרימת שיעור חכמה</div>
              </div>
              <button
                type="button"
                onClick={autoBuildLesson}
                className="px-5 py-3 rounded-xl bg-secondary text-background font-bold hover:bg-white transition-colors inline-flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                בנה לי שיעור
              </button>
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
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-[#141414] to-[#0b0b0b] p-5 md:p-6 group hover:border-secondary/30 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.12)] transition-all"
                    >
                      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-secondary/80 via-secondary/30 to-transparent" />

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div className="flex flex-col items-center gap-2 pt-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-secondary/25 bg-secondary/10 text-secondary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex flex-col gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1">
                              <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-1.5 text-on-surface-variant hover:text-secondary rounded-lg transition-colors ${index === 0 ? 'opacity-25 cursor-not-allowed' : ''}`}
                                title="העבר למעלה"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === exercises.length - 1}
                                className={`p-1.5 text-on-surface-variant hover:text-secondary rounded-lg transition-colors ${index === exercises.length - 1 ? 'opacity-25 cursor-not-allowed' : ''}`}
                                title="העבר למטה"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-4 overflow-hidden rounded-2xl border border-white/8 bg-black/30">
                              <div className="relative aspect-[16/7]">
                                <img
                                  src={getExerciseMedia(el.exercise).coverUrl}
                                  alt={`${el.exercise.name} cover`}
                                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                                  loading="lazy"
                                />
                                <img
                                  src={getExerciseMedia(el.exercise).thumbnailUrl}
                                  alt={el.exercise.name}
                                  className="relative h-full w-full object-cover mix-blend-screen"
                                  loading="lazy"
                                />
                                <a
                                  href={getExerciseMedia(el.exercise).watchUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] text-white hover:border-secondary/50"
                                >
                                  ▶ וידאו
                                </a>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                              <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[10px] font-semibold text-secondary">
                                {el.exercise.apparatusLabel}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-on-surface-variant">
                                {el.exercise.difficultyLabel}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-on-surface-variant">
                                {el.customDuration} דק׳
                              </span>
                            </div>

                            <h4 className="text-lg md:text-xl font-bold text-white mb-1 truncate">{el.exercise.name}</h4>
                            <p className="text-[11px] md:text-xs text-on-surface-variant font-mono mb-3 truncate">{el.exercise.englishName}</p>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {el.exercise.targetMuscles.slice(0, 3).map((muscle, muscleIndex) => (
                                <span key={muscleIndex} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-on-surface-variant">
                                  {muscle}
                                </span>
                              ))}
                            </div>

                            <input
                              type="text"
                              placeholder="דגש הדרכה לשיעור הזה..."
                              value={el.notes || ''}
                              onChange={(e) => handleUpdateNotes(el.exercise.id, e.target.value)}
                              className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/25 focus:border-secondary/60 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex w-full lg:w-auto flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/8">
                          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateDuration(el.exercise.id, -1)}
                              className="h-9 w-9 rounded-lg bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors"
                            >
                              -
                            </button>
                            <div className="min-w-[56px] text-center">
                              <div className="text-base font-bold text-white font-mono leading-none">{el.customDuration}</div>
                              <div className="text-[10px] text-on-surface-variant mt-1">דקות</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateDuration(el.exercise.id, 1)}
                              className="h-9 w-9 rounded-lg bg-secondary text-background hover:bg-white transition-colors font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(el.exercise.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors"
                            title="הסר תרגיל"
                          >
                            <Trash2 className="w-4 h-4" />
                            הסרה
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-4">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrintLesson}
                disabled={exercises.length === 0}
                className="px-4 py-3 rounded-xl border border-white/10 text-white hover:border-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                ייצוא PDF / הדפסה
              </button>
              <button
                type="button"
                onClick={handleCopyWhatsapp}
                disabled={exercises.length === 0}
                className="px-4 py-3 rounded-xl border border-white/10 text-white hover:border-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {copiedWhatsapp ? 'הועתק ל-WhatsApp' : 'WhatsApp-ready'}
              </button>
            </div>
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
            לחצי על <strong>״הוסיפי לשיעור״</strong> כדי לשלב תרגיל במערך. הוספתי כאן גם חיפוש וסינון מהיר כדי שלא תלכי לאיבוד בתוך כל המאגר.
          </p>

          <div className="mb-5 space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                type="text"
                placeholder="חיפוש מהיר לפי שם תרגיל, English או קבוצת שריר..."
                value={builderSearchQuery}
                onChange={(e) => setBuilderSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-background pr-11 pl-10 py-3 text-sm text-white focus:outline-none focus:border-secondary transition-colors"
              />
              {builderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBuilderSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {apparatusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBuilderApparatus(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                    builderApparatus === opt.value
                      ? 'bg-secondary border-secondary text-background font-bold'
                      : 'border-white/10 text-on-surface hover:border-secondary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-1">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBuilderCategory(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                    builderCategory === opt.value
                      ? 'bg-secondary/15 border-secondary/50 text-secondary font-bold'
                      : 'border-white/10 text-on-surface hover:border-secondary/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBuilderDifficulty(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                      builderDifficulty === opt.value
                        ? 'bg-white/10 border-secondary/50 text-secondary font-bold'
                        : 'border-white/10 text-on-surface hover:border-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {(builderSearchQuery || builderApparatus !== 'all' || builderDifficulty !== 'all' || builderCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setBuilderSearchQuery('');
                    setBuilderApparatus('all');
                    setBuilderDifficulty('all');
                    setBuilderCategory('all');
                  }}
                  className="text-xs text-secondary hover:underline"
                >
                  איפוס סינונים
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickFilteredExercises.map((exercise) => {
                const isAdded = activeExerciseIds.includes(exercise.id);
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleAddExercise(exercise)}
                    className={`text-right rounded-2xl border p-4 transition-all ${
                      isAdded
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-white/8 bg-background hover:border-secondary/30 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="text-white font-bold text-sm md:text-base">{exercise.name}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono">{exercise.englishName}</div>
                      </div>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-on-surface-variant whitespace-nowrap">
                        {exercise.durationMinutes} דק׳
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] text-secondary">{exercise.apparatusLabel}</span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-on-surface-variant">{exercise.difficultyLabel}</span>
                      {exercise.categoryLabel && <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-on-surface-variant">{exercise.categoryLabel}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {exercise.targetMuscles.slice(0, 3).map((muscle, idx) => (
                        <span key={idx} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-on-surface-variant">{muscle}</span>
                      ))}
                    </div>
                    <div className={`text-xs font-bold ${isAdded ? 'text-emerald-300' : 'text-secondary'}`}>
                      {isAdded ? 'נוסף לשיעור' : 'הוסיפי לשיעור'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
              <div className="text-xs text-secondary font-bold mb-2">מבנה שיעור חכם</div>
              <div className="flex flex-wrap gap-2 text-[11px] text-on-surface-variant">
                <span className="rounded-full bg-white/5 px-3 py-1">חימום 5-8 דק׳</span>
                <span className="rounded-full bg-white/5 px-3 py-1">ליבה/כוח 15-20 דק׳</span>
                <span className="rounded-full bg-white/5 px-3 py-1">איזון/שליטה 8-12 דק׳</span>
                <span className="rounded-full bg-white/5 px-3 py-1">שחרור 4-6 דק׳</span>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-3">
                מוצגות 24 תוצאות ראשונות לחיפוש מהיר. מתחתיהן עדיין זמינה הספרייה המלאה.
              </div>
            </div>
          </div>

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
