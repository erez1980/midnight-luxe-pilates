import React, { useState } from 'react';
import { Search, Info, Dumbbell, Activity, Check, Plus, Filter, X, ChevronLeft } from 'lucide-react';
import { Exercise } from '../types';
import { INITIAL_EXERCISES } from '../data';
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
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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

  const filteredExercises = INITIAL_EXERCISES.filter(ex => {
    const matchesSearch = 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesApparatus = selectedApparatus === 'all' || ex.apparatus === selectedApparatus;
    const matchesDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;

    return matchesSearch && matchesApparatus && matchesDifficulty;
  });

  return (
    <div className="w-full">
      {/* Intro text if not in selector mode */}
      {!isSelectorMode && (
        <div className="mb-12">
          <div className="inline-block mb-3 px-4 py-1 border-l border-r border-secondary/40">
            <span className="uppercase tracking-[0.2em] text-secondary text-xs font-semibold">MIDNIGHT LUXE WORKSPACE</span>
          </div>
          <h2 className="serif-text text-3xl md:text-5xl font-bold text-white mb-4">מאגר תרגילים מקצועי</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            ספרייה מקיפה של תרגילי פילאטיס יוקרתיים. סנני לפי מכשיר, דרגת קושי או קבוצות שרירים, וצפי בהנחיות נשימה וביצוע מפורטות.
          </p>
        </div>
      )}

      {/* Controls Container */}
      <div className="bg-surface-container-high border border-white/5 p-6 mb-8 rounded-lg">
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
              className="w-full bg-background border border-white/10 pr-12 pl-4 py-3 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
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
                    : 'border-white/10 text-on-surface hover:border-secondary/50'
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
                    ? 'bg-white/10 border-secondary/50 text-secondary font-bold'
                    : 'border-white/10 text-on-surface hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center text-sm text-on-surface-variant">
        <span>נמצאו {filteredExercises.length} תרגילים בספרייה</span>
        {searchQuery || selectedApparatus !== 'all' || selectedDifficulty !== 'all' ? (
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedApparatus('all');
              setSelectedDifficulty('all');
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
                className="group border border-white/5 bg-surface-container hover:border-secondary/30 transition-all duration-300 p-6 flex flex-col justify-between relative"
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-2 py-1">
                      {exercise.apparatusLabel}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      exercise.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                      exercise.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {exercise.difficultyLabel}
                    </span>
                  </div>

                  {/* Names */}
                  <h3 className="serif-text text-xl font-bold text-white group-hover:text-secondary transition-colors mb-1">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mb-4">{exercise.englishName}</p>

                  {/* Muscle Targets */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {exercise.targetMuscles.map((muscle, idx) => (
                      <span key={idx} className="text-[11px] bg-white/5 text-on-surface-variant px-2 py-0.5 rounded-sm">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row Controls */}
                <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                  <button
                    onClick={() => setSelectedExercise(exercise)}
                    className="text-on-surface-variant hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Info className="w-4 h-4 text-secondary/70" />
                    הנחיות ביצוע
                  </button>

                  {isSelectorMode && onAddToLesson && (
                    <button
                      onClick={() => onAddToLesson(exercise)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-secondary text-background hover:bg-white'
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
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-lg">
            <Activity className="w-10 h-10 text-secondary/30 mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-1">לא נמצאו תרגילים תואמים</p>
            <p className="text-on-surface-variant text-sm">נסי לשנות את מילות החיפוש או להסיר פילטרים</p>
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
              className="relative w-full max-w-2xl bg-surface border border-secondary/30 shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedExercise(null)}
                className="absolute top-6 left-6 text-on-surface-variant hover:text-white border border-white/10 hover:border-white/30 p-2 transition-colors rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tag & Level */}
              <div className="flex gap-2 items-center mb-3">
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-3 py-1">
                  {selectedExercise.apparatusLabel}
                </span>
                <span className="text-xs text-on-surface-variant bg-white/5 px-2.5 py-1 rounded-sm">
                  {selectedExercise.difficultyLabel}
                </span>
                <span className="text-xs text-on-surface-variant bg-white/5 px-2.5 py-1 rounded-sm">
                  {selectedExercise.durationMinutes} דקות
                </span>
              </div>

              {/* Title */}
              <h2 className="serif-text text-2xl md:text-4xl font-bold text-white mb-1">
                {selectedExercise.name}
              </h2>
              <p className="text-sm font-mono text-secondary mb-6">{selectedExercise.englishName}</p>

              {/* Main Info Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Targeted Muscles */}
                <div className="bg-surface-container p-4 border border-white/5 rounded-sm">
                  <h4 className="text-xs font-bold tracking-wider text-secondary uppercase mb-2 flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    שרירי מטרה
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {selectedExercise.targetMuscles.join(', ')}
                  </p>
                </div>

                {/* Focus & Breathing */}
                <div className="bg-surface-container p-4 border border-white/5 rounded-sm">
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
                <h3 className="serif-text text-xl font-bold text-white mb-4 flex items-center gap-2">
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
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-xs font-bold tracking-wider text-secondary uppercase mb-2">יתרונות מרכזיים</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {selectedExercise.benefits}
                </p>
              </div>

              {/* Custom Selector mode extra action */}
              {isSelectorMode && onAddToLesson && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      onAddToLesson(selectedExercise);
                      setSelectedExercise(null);
                    }}
                    className={`px-6 py-3 font-bold transition-all flex items-center gap-2 ${
                      addedExerciseIds.includes(selectedExercise.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-secondary text-background hover:bg-white'
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
