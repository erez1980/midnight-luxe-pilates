import React from 'react';
import { pickPoseIcon, PoseIcon } from '../utils/poseIcons';

interface StepSequenceProps {
  instructions: string[];
}

// Renders the exercise's own written instructions as a numbered visual
// sequence with a generic pose icon per step. This exists specifically for
// exercises that have no matching video and, given how the classical/prop
// repertoire is sourced, likely never will (see project notes) — rather than
// leaving a "no video" message, the person gets an always-available visual
// walkthrough built from content the library already has for every exercise.
export default function StepSequence({ instructions }: StepSequenceProps) {
  const steps = instructions.slice(0, 4);
  if (steps.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex flex-col items-center text-center gap-2"
        >
          <div className="relative w-12 h-12">
            <PoseIcon pose={pickPoseIcon(step)} className="w-12 h-12" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary text-background text-[11px] font-bold flex items-center justify-center">
              {idx + 1}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">{step}</p>
        </div>
      ))}
    </div>
  );
}
