import React from 'react';
import { HeartPulse, ShieldAlert } from 'lucide-react';
import {
  CONDITIONS,
  ConditionId,
  DISCLAIMER,
  SUITABILITY_LABEL,
  Suitability,
} from '../utils/conditions';

const TONE: Record<Suitability, string> = {
  suitable: 'bg-sage-soft text-sage-deep border-sage/30',
  modify: 'bg-gold-soft/70 text-gold-deep border-gold/40',
  avoid: 'bg-error-container text-error border-error/30',
};

export function SuitabilityBadge({ status, draft, className = '' }: { status: Suitability; draft?: boolean; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TONE[status]} ${className}`}>
      {SUITABILITY_LABEL[status]}
      {draft && <span className="font-normal opacity-70">· טיוטה</span>}
    </span>
  );
}

// Multi-select chips for the conditions a lesson / search is planned for,
// with the selected conditions' notes and the medical disclaimer underneath.
export function ConditionPicker({
  value,
  onChange,
  compact = false,
}: {
  value: ConditionId[];
  onChange: (next: ConditionId[]) => void;
  compact?: boolean;
}) {
  const toggle = (id: ConditionId) =>
    onChange(value.includes(id) ? value.filter((c) => c !== id) : [...value, id]);
  const selected = CONDITIONS.filter((c) => value.includes(c.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-secondary">
        <HeartPulse className="w-4 h-4" aria-hidden="true" />
        התאמה למצבים מיוחדים
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="מצבים מיוחדים">
        {CONDITIONS.map((c) => {
          const on = value.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.id)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                on ? 'bg-secondary border-secondary text-on-secondary font-bold' : 'border-outline/30 text-on-surface hover:border-secondary/50'
              }`}
            >
              {c.label}
            </button>
          );
        })}
        {value.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="px-2 text-xs text-secondary hover:underline">
            ניקוי
          </button>
        )}
      </div>
      {selected.length > 0 && !compact && (
        <ul className="space-y-1 text-xs text-on-surface-variant">
          {selected.map((c) => (
            <li key={c.id}>
              <strong className="text-on-surface">{c.label}:</strong> {c.note}
            </li>
          ))}
        </ul>
      )}
      {selected.length > 0 && <ConditionDisclaimer />}
    </div>
  );
}

export function ConditionDisclaimer() {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-outline/20 bg-surface-container px-3 py-2 text-[11px] leading-relaxed text-on-surface-variant">
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden="true" />
      <span>
        {DISCLAIMER} סימון ״טיוטה״ = המלצה כללית שעדיין לא אושרה ידנית.
      </span>
    </p>
  );
}
