import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle, Volume2, VolumeX, X, HelpCircle, Activity, Award } from 'lucide-react';
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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentLessonExercise = lesson.exercises[currentIndex];
  const nextLessonExercise = currentIndex < lesson.exercises.length - 1 ? lesson.exercises[currentIndex + 1] : null;

  // Initialize timer for current exercise
  useEffect(() => {
    if (currentLessonExercise) {
      setTimeLeft(currentLessonExercise.customDuration * 60);
      setIsPlaying(false);
    }
  }, [currentIndex, currentLessonExercise]);

  // Main countdown logic
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      playBeep();
      handleNext();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

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
            <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs uppercase tracking-wider font-semibold">
              COMPLETE SESSION
            </div>
            <h2 className="serif-text text-3xl font-bold text-white">השיעור הושלם!</h2>
            <p className="text-on-surface-variant text-sm">
              כל הכבוד! העברת בהצלחה את השיעור <strong>{lesson.name}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-6">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">סך הכל זמן</p>
              <p className="text-2xl font-mono text-white font-bold">{lesson.totalDuration} דק׳</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">תרגילים שבוצעו</p>
              <p className="text-2xl font-mono text-white font-bold">{lesson.exercises.length}</p>
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
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Top Session Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Button
            onClick={onFinishSession}
            variant="surface"
            size="icon-sm"
            title="עזבי שיעור"
          >
            <X className="w-4 h-4" />
          </Button>
          <div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">מצב אימון פעיל</span>
            <h3 className="serif-text font-bold text-white text-base leading-tight">{lesson.name}</h3>
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

      {/* Global Lesson Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 mb-8 rounded-full overflow-hidden">
        <div 
          className="bg-secondary h-full transition-all duration-500 ease-out" 
          style={{ width: `${currentProgressPercent}%` }}
        />
      </div>

      {/* Main Grid: left interactive timer, right instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-5 bg-surface-container-high border border-white/5 p-8 text-center flex flex-col items-center relative overflow-hidden">
          {/* Subtle spinning background layout */}
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-secondary/0 via-secondary/20 to-secondary/0"></div>
          
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold bg-secondary/10 px-3 py-1 mb-6 rounded-sm">
            {currentLessonExercise.exercise.apparatusLabel}
          </span>

          <h2 className="serif-text text-2xl md:text-3xl font-black text-white mb-2">
            {currentLessonExercise.exercise.name}
          </h2>
          <p className="text-xs font-mono text-on-surface-variant mb-8">{currentLessonExercise.exercise.englishName}</p>

          {/* Interactive Circle Timer */}
          <div className="w-48 h-48 rounded-full border-2 border-white/5 flex flex-col items-center justify-center relative mb-8">
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

            <span className="text-4xl font-mono font-bold text-white mb-1">
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
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleNext}
              variant="surface"
              size="icon"
              title="לתרגיל הבא"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress numeric marker */}
          <div className="text-xs text-on-surface-variant">
            תרגיל <span className="text-white font-bold">{currentIndex + 1}</span> מתוך <span className="text-white">{lesson.exercises.length}</span>
          </div>
        </div>

        {/* Right Instructions Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Custom lesson note if any */}
          {currentLessonExercise.notes && (
            <div className="bg-secondary/10 border-r-2 border-secondary p-4">
              <span className="text-[10px] font-bold text-secondary uppercase block mb-1">דגש מיוחד שבחרת לשיעור זה:</span>
              <p className="text-sm text-white italic">"{currentLessonExercise.notes}"</p>
            </div>
          )}

          {/* Execution steps */}
          <div className="bg-surface-container-high border border-white/5 p-6 rounded-lg">
            <h3 className="serif-text text-xl font-bold text-white mb-4 border-b border-white/5 pb-3">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
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
            <div className="bg-background border border-white/5 p-4 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono uppercase text-secondary/70 tracking-widest block">התרגיל הבא</span>
                <span className="text-sm text-white font-bold">{nextLessonExercise.exercise.name}</span>
              </div>
              <span className="text-xs text-on-surface-variant bg-white/5 px-2.5 py-1">
                {nextLessonExercise.customDuration} דקות
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
