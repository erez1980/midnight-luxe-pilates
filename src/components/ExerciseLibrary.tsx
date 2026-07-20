import React, { useEffect, useRef, useState } from 'react';
import { Search, Info, Dumbbell, Activity, Check, Plus, X, PlayCircle } from 'lucide-react';
import { Exercise } from '../types';
import { INITIAL_EXERCISES } from '../data';
import { getExerciseMedia } from '../utils/exerciseMedia';
import StepSequence from './StepSequence';
import { motion, AnimatePresence } from 'motion/react';

interface ExerciseLibraryProps {
  onAddToLesson?: (exercise: Exercise) => void;
  addedExerciseIds?: string[];
  isSelectorMode?: boolean;
}

export default function ExerciseLibrary({ 
  onAddToLesson, 
  addedExerciseIds = [], 
  isSelectorMode = false 
}: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApparatus, setSelectedApparatus] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Modal accessibility: Escape closes, background scroll is locked while open,
  // focus moves into the dialog and returns to the trigger on close, and Tab is
  // trapped inside the dialog.
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedExercise) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setSelectedExercise(null);
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus();
    };
  }, [selectedExercise]);

  // Filters
  const apparatusOptions = [
    { value: 'all', label: 'כל המכשירים' },
    { value: 'mat', label: 'מזרן (Mat)' },
    { value: 'reformer', label: 'רפורמר' },
    { value: 'cadillac', label: 'קאדילק' },
    { value: 'chair', label: 'כיסא (Chair)' },
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

  const filteredExercises = INITIAL_EXERCISES.filter(ex => {
    const matchesSearch = 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesApparatus = selectedApparatus === 'all' || ex.apparatus === selectedApparatus;
    const matchesDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;

    return matchesSearch && matchesApparatus && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="w-full">
      {/* Intro text if not in selector mode */}
      {!isSelectorMode && (
        <div className="mb-12 space-y-5">
          <div className="inline-block px-4 py-1 border-l border-r border-secondary/40">
            <span className="uppercase tracking-[0.2em] text-secondary text-xs font-semibold">פילאטיס ותנועה</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h2 className="serif-text text-3xl md:text-5xl font-bold text-on-surface mb-4">מאגר תרגילים מקצועי</h2>
              <p className="text-on-surface-variant text-lg max-w-3xl leading-relaxed">
                ספריית עבודה למאמנות פילאטיס: חפשי לפי ציוד, רמה, מטרה וקטגוריה, וצאי מכל חיפוש עם תרגילים שבאמת מתאימים לשיעור הבא שלך.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <div className="rounded-2xl border border-outline/30 bg-surface-container p-4">
                <div className="text-2xl font-black text-on-surface mb-1">{INITIAL_EXERCISES.length}</div>
                <div className="text-xs text-on-surface-variant">תרגילים בספרייה</div>
              </div>
              <div className="rounded-2xl border border-outline/30 bg-surface-container p-4">
                <div className="text-2xl font-black text-on-surface mb-1">{apparatusOptions.length - 1}</div>
                <div className="text-xs text-on-surface-variant">סוגי ציוד</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Container */}
      <div className="bg-surface-container-high border border-outline/20 p-6 mb-8 rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              id="exercise-search"
              type="text"
              placeholder="חפשי לפי שם תרגיל או קבוצת שרירים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-outline/40 pr-12 pl-4 py-3 text-on-surface text-sm rounded-2xl focus:outline-none focus:border-secondary transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Apparatus filter */}
          <div className="lg:col-span-5 flex flex-wrap gap-2">
            {apparatusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedApparatus(opt.value)}
                className={`px-3 py-2 text-xs font-medium border transition-all ${
                  selectedApparatus === opt.value
                    ? 'bg-secondary border-secondary text-background font-bold'
                    : 'border-outline/30 text-on-surface hover:border-secondary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="lg:col-span-3 flex flex-wrap gap-2 justify-end">
            {difficultyOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`px-3 py-2 text-xs font-medium border transition-all ${
                  selectedDifficulty === opt.value
                    ? 'bg-secondary/12 border-secondary/50 text-secondary font-bold'
                    : 'border-outline/30 text-on-surface hover:border-outline'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categoryOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className={`px-3 py-2 text-xs font-medium border rounded-full transition-all ${
                selectedCategory === opt.value
                  ? 'bg-secondary/15 border-secondary/50 text-secondary font-bold'
                  : 'border-outline/30 text-on-surface hover:border-secondary/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-sm text-on-surface-variant">
        <span>נמצאו {filteredExercises.length} תרגילים בספרייה{filteredExercises.length > 0 ? ' — אפשר לפתוח פרטים או להוסיף ישירות לשיעור' : ''}</span>
        {searchQuery || selectedApparatus !== 'all' || selectedDifficulty !== 'all' || selectedCategory !== 'all' ? (
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedApparatus('all');
              setSelectedDifficulty('all');
              setSelectedCategory('all');
            }}
            className="text-secondary hover:underline flex items-center gap-1 text-xs"
          >
            איפוס סינונים
          </button>
        ) : null}
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredExercises.map((exercise) => {
            const isAdded = addedExerciseIds.includes(exercise.id);
            return (
              <motion.div
                key={exercise.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group border border-outline/20 bg-surface-container hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setSelectedExercise(exercise)}
                  className="relative block w-full aspect-video overflow-hidden"
                >
                  <img
                    src={getExerciseMedia(exercise).coverUrl}
                    alt={exercise.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-surface-container p-3 text-on-surface border border-outline/20">
                      <PlayCircle className="w-8 h-8" />
                    </div>
                  </div>
                </button>

                <div className="p-6">
                  {/* Category & Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-2 py-1">
                        {exercise.apparatusLabel}
                      </span>
                      {exercise.categoryLabel && (
                        <span className="text-[10px] tracking-wider text-on-surface font-semibold bg-surface-container-high px-2 py-1">
                          {exercise.categoryLabel}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      exercise.difficulty === 'beginner' ? 'bg-emerald-500/20 text-emerald-300' :
                      exercise.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {exercise.difficultyLabel}
                    </span>
                  </div>

                  {/* Names */}
                  <h3 className="serif-text text-xl font-bold text-on-surface group-hover:text-secondary transition-colors mb-1">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mb-4">{exercise.englishName}</p>
                  <div className="inline-flex items-center gap-1.5 text-xs text-secondary mb-4">
                    {getExerciseMedia(exercise).isDedicatedVideo ? <PlayCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                    {getExerciseMedia(exercise).mediaLabel}
                  </div>

                  {/* Muscle Targets */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {exercise.targetMuscles.map((muscle, idx) => (
                      <span key={idx} className="text-[11px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-sm">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row Controls */}
                <div className="pt-4 border-t border-outline/20 flex justify-between items-center mt-auto">
                  <button
                    onClick={() => setSelectedExercise(exercise)}
                    className="text-on-surface-variant hover:text-on-surface text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Info className="w-4 h-4 text-secondary/70" />
                    הנחיות ביצוע
                  </button>

                  {isSelectorMode && onAddToLesson && (
                    <button
                      onClick={() => onAddToLesson(exercise)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-secondary text-background hover:bg-secondary-fixed'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          נוסף לשיעור
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          הוסיפי לשיעור
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredExercises.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-outline/30 rounded-3xl bg-surface-container">
            <Activity className="w-10 h-10 text-secondary/30 mx-auto mb-4" />
            <p className="text-on-surface text-lg font-medium mb-1">לא נמצאו תרגילים תואמים</p>
            <p className="text-on-surface-variant text-sm mb-5">נסי לפתוח את החיפוש, להסיר פילטר אחד, או לעבור לקטגוריה אחרת כדי למצוא flow מתאים.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedApparatus('all');
                setSelectedDifficulty('all');
                setSelectedCategory('all');
              }}
              className="text-secondary hover:text-on-surface transition-colors text-sm"
            >
              איפוס כל הסינונים
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal Dialog */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={`פרטי תרגיל: ${selectedExercise.name}`}
              className="relative w-full max-w-4xl bg-surface border border-secondary/30 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={() => setSelectedExercise(null)}
                aria-label="סגירת חלון פרטי התרגיל"
                className="absolute top-6 left-6 text-on-surface-variant hover:text-on-surface border border-outline/20 hover:border-outline p-2 transition-colors rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-video bg-surface-container-high border-b border-outline/20 overflow-hidden">
                {getExerciseMedia(selectedExercise).hasInlineVideo && getExerciseMedia(selectedExercise).embedUrl ? (
                  <iframe
                    key={getExerciseMedia(selectedExercise).embedUrl}
                    src={getExerciseMedia(selectedExercise).embedUrl}
                    title={`${selectedExercise.name} — video`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={getExerciseMedia(selectedExercise).coverUrl}
                      alt={`${selectedExercise.name} cover`}
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-5 right-5 rounded-2xl border border-outline/20 bg-surface-container px-4 py-3 text-sm text-on-surface backdrop-blur-sm">
                      לתרגיל הזה עדיין אין וידאו מוטמע מאומת. רצף השלבים המלא מוצג למטה.
                    </div>
                  </>
                )}
              </div>

              {!getExerciseMedia(selectedExercise).isDedicatedVideo && (
                <div className="px-6 md:px-8 pt-6">
                  <StepSequence exercise={selectedExercise} />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Tag & Level */}
                <div className="flex gap-2 items-center mb-3 flex-wrap">
                  <span className="text-xs uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-3 py-1">
                    {selectedExercise.apparatusLabel}
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-sm">
                    {selectedExercise.difficultyLabel}
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-sm">
                    {selectedExercise.durationMinutes} דקות
                  </span>
                  {selectedExercise.categoryLabel && (
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-sm">
                      {selectedExercise.categoryLabel}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="serif-text text-2xl md:text-4xl font-bold text-on-surface mb-1">
                  {selectedExercise.name}
                </h2>
                <p className="text-sm font-mono text-secondary mb-6">{selectedExercise.englishName}</p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="rounded-xl border border-outline/20 bg-surface-container px-4 py-2 text-sm text-on-surface-variant">
                    {getExerciseMedia(selectedExercise).isDedicatedVideo
                      ? 'וידאו מוטמע ומאומת לתרגיל הזה בדיוק'
                      : 'וידאו קטגוריה כללי (לתרגיל הספציפי הזה עדיין אין וידאו ייעודי)'}
                  </div>
                </div>

                {/* Main Info Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Targeted Muscles */}
                <div className="bg-surface-container p-4 border border-outline/20 rounded-sm">
                  <h4 className="text-xs font-bold tracking-wider text-secondary uppercase mb-2 flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    שרירי מטרה
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {selectedExercise.targetMuscles.join(', ')}
                  </p>
                </div>

                {/* Focus & Breathing */}
                <div className="bg-surface-container p-4 border border-outline/20 rounded-sm">
                  <h4 className="text-xs font-bold tracking-wider text-secondary uppercase mb-2 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    קצב ונשימה
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {selectedExercise.breathing}
                  </p>
                </div>
                </div>

                {/* Instructions */}
                <div className="mb-8">
                <h3 className="serif-text text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                  שלבי הביצוע (Instructions)
                </h3>
                <ol className="space-y-3.5">
                  {selectedExercise.instructions.map((inst, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-on-surface-variant leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border border-secondary/30 text-secondary text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ol>
                </div>

                {/* Benefits */}
                <div className="border-t border-outline/20 pt-6">
                <h4 className="text-xs font-bold tracking-wider text-secondary uppercase mb-2">יתרונות מרכזיים</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {selectedExercise.benefits}
                </p>
                </div>

                {/* Custom Selector mode extra action */}
                {isSelectorMode && onAddToLesson && (
                  <div className="mt-8 pt-6 border-t border-outline/20 flex justify-end">
                    <button
                      onClick={() => {
                        onAddToLesson(selectedExercise);
                        setSelectedExercise(null);
                      }}
                      className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                        addedExerciseIds.includes(selectedExercise.id)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-secondary text-background hover:bg-secondary-fixed'
                      }`}
                    >
                      {addedExerciseIds.includes(selectedExercise.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          כבר נוסף לשיעור
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          הוסיפי לשיעור עכשיו
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
