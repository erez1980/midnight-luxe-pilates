import React from 'react';
import { Exercise } from '../types';
import { pickPose, PoseIllustration, ApparatusKey } from '../utils/poseIllustrations';
import { getStepImage } from '../utils/stepImages';

interface StepSequenceProps {
  exercise: Exercise;
}

// Visual walkthrough built from the exercise's own written instructions, shown
// for exercises that have no dedicated video (most of the classical Cadillac,
// Chair and prop repertoire has no embeddable single-exercise tutorial).
//
// Each step shows a real illustration when one exists in stepImages, and
// otherwise a generated pose illustration derived from that step's text plus
// the exercise's apparatus.
export default function StepSequence({ exercise }: StepSequenceProps) {
  const steps = exercise.instructions.slice(0, 4);
  if (steps.length === 0) return null;

  const apparatus = (exercise.apparatus || 'mat') as ApparatusKey;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {steps.map((step, idx) => {
        const realImage = getStepImage(exercise.id, idx);
        return (
          <div
            key={idx}
            className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[400/220] bg-black/30 border-b border-white/5">
              {realImage ? (
                <img
                  src={realImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <PoseIllustration
                  pose={pickPose(step)}
                  apparatus={apparatus}
                  className="absolute inset-0 w-full h-full"
                />
              )}
              <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-secondary text-background text-xs font-bold flex items-center justify-center shadow-lg">
                {idx + 1}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed p-4">{step}</p>
          </div>
        );
      })}
    </div>
  );
}
