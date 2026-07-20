import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle, Volume2, VolumeX, X, HelpCircle, Activity, Award, Clock3, Layers3, Sparkles, ArrowRight } from 'lucide-react';
import { Lesson, LessonExercise } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Button from './ui/Button';

interface CoachingSessionProps {
  lesson: Lesson;
  onFinishSession: () => void;
}

export default function CoachingSession({ lesson, onFinishSession }: CoachingSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number | null>(null);
  
  const currentLessonExercise = lesson.exercises[currentIndex];
  const nextLessonExercise = currentIndex < lesson.exercises.length - 1 ? lesson.exercises[currentIndex + 1] : null;

  // Reset the clock for the current exercise. Deliberately does NOT touch
  // isPlaying: a running session flows straight into the next exercise, and a
  // paused one stays paused.
  useEffect(() => {
    if (currentLessonExercise) {
      setTimeLeft(currentLessonExercise.customDuration * 60);
    }
  }, [currentIndex, currentLessonExercise]);

  // Main countdown logic.
  // Anchored to an absolute deadline rather than chaining setTimeout(1000):
  // chained timeouts accumulate drift and are throttled hard when the tab is
  // backgrounded, so a 5-minute exercise could run noticeably long.
  useEffect(() => {
    if (!isPlaying) {
      deadlineRef.current = null;
      return;
    }

    const secondsRemaining = timeLeft > 0 ? timeLeft : (currentLessonExercise?.customDuration ?? 0) * 60;
    deadlineRef.current = Date.now() + secondsRemaining * 1000;

    const tick = () => {
      if (deadlineRef.current === null) return;
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        playBeep();
        if (currentIndex < lesson.exercises.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setShowSummary(true);
        }
      }
    };

    timerRef.current = setInterval(tick, 250);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // timeLeft is read to seed the deadline, but must not re-trigger the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex]);

  // Play browser beep using Web Audio API
  const playBeep = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 300);
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (currentLessonExercise) {
      setTimeLeft(currentLessonExercise.customDuration * 60);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < lesson.exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setShowSummary(true);
    }
  };

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Manual "next" press on the final exercise ends the whole session, so ask
  // first — an accidental tap otherwise drops the instructor into the summary
  // mid-class with no way back.
  const handleNextPressed = () => {
    const isLast = currentIndex === lesson.exercises.length - 1;
    if (isLast) {
      setShowFinishConfirm(true);
      return;
    }
    handleNext();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Convert seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Progress calculations
  const totalDurationSeconds = lesson.exercises.reduce((acc, curr) => acc + curr.customDuration * 60, 0);
  const currentProgressPercent = ((currentIndex) / lesson.exercises.length) * 100;
  const currentTimeProgressPercent = currentLessonExercise 
    ? ((currentLessonExercise.customDuration * 60 - timeLeft) / (currentLessonExercise.customDuration * 60)) * 100
    : 0;

  if (showSummary) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface-container-high border border-secondary/30 p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="w-20 h-20 bg-secondary/10 border border-secondary/50 rounded-full flex items-center justify-center mx-auto text-secondary">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs tracking-wider font-semibold">
              שיעור הושלם
            </div>
            <h2 className="serif-text text-3xl font-bold text-on-surface">השיעור הושלם!</h2>
            <p className="text-on-surface-variant text-sm">
              כל הכבוד! העברת בהצלחה את השיעור <strong>{lesson.name}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-outline/20 py-6">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">סך הכל זמן</p>
              <p className="text-2xl font-mono text-on-surface font-bold">{lesson.totalDuration} דק׳</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">תרגילים שבוצעו</p>
              <p className="text-2xl font-mono text-on-surface font-bold">{lesson.exercises.length}</p>
            </div>
          </div>

          <Button onClick={onFinishSession} variant="primary" size="lg" fullWidth>
            חזרה לרשימת השיעורים
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Top Session Header */}
      <div className="mb-8 rounded-3xl border border-outline/30 bg-surface-container p-5 md:p-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-outline/20">
        <div className="flex items-center gap-3">
          <div>
            <button
              onClick={onFinishSession}
              className="mb-2 inline-flex items-center gap-1.5 text-xs text-secondary hover:text-on-surface transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              חזרה לשיעורים
            </button>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">מצב אימון פעיל</span>
            <h3 className="serif-text font-bold text-on-surface text-base leading-tight">{lesson.name}</h3>
          </div>
        </div>

        {/* Audio control */}
        <Button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          variant="surface"
          size="icon-sm"
          title={isSoundEnabled ? "השתק צליל מעבר" : "אפשר צליל מעבר"}
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 mb-5">
          <div className="rounded-2xl border border-outline/30 bg-surface-container-high p-4 text-center">
            <Clock3 className="w-4 h-4 text-secondary mx-auto mb-2" />
            <div className="text-on-surface text-xl font-black">{formatTime(timeLeft)}</div>
            <div className="text-[11px] text-on-surface-variant">לתרגיל הנוכחי</div>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-container-high p-4 text-center">
            <Layers3 className="w-4 h-4 text-secondary mx-auto mb-2" />
            <div className="text-on-surface text-xl font-black">{currentIndex + 1}/{lesson.exercises.length}</div>
            <div className="text-[11px] text-on-surface-variant">התקדמות בשיעור</div>
          </div>
          <div className="rounded-2xl border border-outline/30 bg-surface-container-high p-4 text-center">
            <Sparkles className="w-4 h-4 text-secondary mx-auto mb-2" />
            <div className="text-on-surface text-xl font-black">{lesson.totalDuration} דק׳</div>
            <div className="text-[11px] text-on-surface-variant">אורך מתוכנן</div>
          </div>
        </div>

        {/* Global Lesson Progress Bar */}
        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-secondary h-full transition-all duration-500 ease-out" 
            style={{ width: `${currentProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: left interactive timer, right instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-5 bg-surface-container-high border border-outline/20 p-8 text-center flex flex-col items-center relative overflow-hidden">
          {/* Subtle spinning background layout */}
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/20 to-secondary/0"></div>
          
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-3 py-1 mb-6 rounded-sm">
            {currentLessonExercise.exercise.apparatusLabel}
          </span>

          <h2 className="serif-text text-2xl md:text-3xl font-black text-on-surface mb-2">
            {currentLessonExercise.exercise.name}
          </h2>
          <p className="text-xs font-mono text-on-surface-variant mb-8">{currentLessonExercise.exercise.englishName}</p>

          {/* Interactive Circle Timer */}
          <div className="w-48 h-48 rounded-full border-2 border-outline/20 flex flex-col items-center justify-center relative mb-8">
            {/* SVG Progress Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="92"
                stroke="rgba(233, 195, 73, 0.2)"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="92"
                stroke="#e9c349"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="578"
                strokeDashoffset={578 - (578 * (100 - currentTimeProgressPercent)) / 100}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            <span className="text-4xl font-mono font-bold text-on-surface mb-1">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">דגש: {currentLessonExercise.exercise.durationMinutes} דק׳ סה"כ</span>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-6 mb-8">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="surface"
              size="icon"
              title="לתרגיל הקודם"
              aria-label="לתרגיל הקודם"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleTogglePlay}
              variant="primary"
              className="w-16 h-16 rounded-full p-0 shadow-lg group"
              aria-label={isPlaying ? 'השהה' : 'נגן'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-background" />
              ) : (
                <Play className="w-6 h-6 fill-background translate-x-[-1px]" />
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="surface"
              size="icon"
              title="איפוס זמן תרגיל"
              aria-label="איפוס זמן תרגיל"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleNextPressed}
              variant="surface"
              size="icon"
              title="לתרגיל הבא"
              aria-label="לתרגיל הבא"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress numeric marker */}
          <div className="text-xs text-on-surface-variant">
            תרגיל <span className="text-on-surface font-bold">{currentIndex + 1}</span> מתוך <span className="text-on-surface">{lesson.exercises.length}</span>
          </div>
        </div>

        {/* Right Instructions Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Custom lesson note if any */}
          {currentLessonExercise.notes && (
            <div className="bg-secondary/10 border-r-2 border-secondary p-4">
              <span className="text-[10px] font-bold text-secondary uppercase block mb-1">דגש מיוחד שבחרת לשיעור זה:</span>
              <p className="text-sm text-on-surface italic">"{currentLessonExercise.notes}"</p>
            </div>
          )}

          {/* Execution steps */}
          <div className="bg-surface-container-high border border-outline/20 p-6 rounded-lg">
            <h3 className="serif-text text-xl font-bold text-on-surface mb-4 border-b border-outline/20 pb-3">
              הנחיות קוליות ושלבי ביצוע
            </h3>
            
            <ol className="space-y-4 mb-6">
              {currentLessonExercise.exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-on-surface-variant leading-relaxed">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-secondary/30 text-secondary text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline/20">
              <div>
                <span className="text-xs text-secondary font-bold uppercase block mb-1">נשימה וקצב:</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">{currentLessonExercise.exercise.breathing}</p>
              </div>
              <div>
                <span className="text-xs text-secondary font-bold uppercase block mb-1">שרירי מטרה:</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">{currentLessonExercise.exercise.targetMuscles.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Up next preview */}
          {nextLessonExercise && (
            <div className="bg-background border border-outline/20 p-4 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono uppercase text-secondary/70 tracking-widest block">התרגיל הבא</span>
                <span className="text-sm text-on-surface font-bold">{nextLessonExercise.exercise.name}</span>
              </div>
              <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1">
                {nextLessonExercise.customDuration} דקות
              </span>
            </div>
          )}
        </div>

      </div>

      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl border border-secondary/20 bg-surface-container-high p-6 shadow-2xl">
            <div className="text-xs tracking-[0.2em] text-secondary font-bold mb-3">סיום שיעור</div>
            <h3 className="serif-text text-2xl text-on-surface font-bold mb-3">לסיים את השיעור ולעבור לסיכום?</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              זהו התרגיל האחרון. אם תמשיכי עכשיו, תעברי למסך הסיכום של השיעור.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="surface" size="md" onClick={() => setShowFinishConfirm(false)}>
                חזרה לשיעור
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setShowFinishConfirm(false);
                  handleNext();
                }}
              >
                סיום שיעור
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
