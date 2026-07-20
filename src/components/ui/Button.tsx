import React from 'react';

/**
 * Midnight Luxe — single source of truth for buttons.
 *
 * Fixes the inconsistencies found in the UX audit:
 *  - One size scale (sm / md / lg) instead of arbitrary h-14 / h-16 / px-12.
 *  - One corner radius (rounded-lg) instead of 6 competing radii.
 *  - Subtle gold hover instead of the jarring hover:bg-white flash.
 *  - A real focus-visible ring for keyboard accessibility.
 *  - No forced uppercase / tracking-widest (kills Hebrew legibility).
 *    Latin-only labels can opt back in with the `latin` prop.
 */

type Variant = 'primary' | 'outline' | 'ghost' | 'surface' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  /** Latin-only label: re-enables uppercase + wide tracking. Never use for Hebrew. */
  latin?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
}

const base =
  'inline-flex items-center justify-center gap-2 font-bold rounded-lg cursor-pointer ' +
  'transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
  icon: 'h-11 w-11 p-0',
  'icon-sm': 'h-9 w-9 p-0',
};

const variants: Record<Variant, string> = {
  // Gold fill → lighter gold on hover (keeps the midnight mood, no white flash).
  primary: 'bg-secondary text-background shadow-lg hover:bg-secondary-fixed active:brightness-95',
  // Gold outline → soft gold wash on hover.
  outline:
    'border border-secondary/60 text-secondary hover:bg-secondary/10 hover:border-secondary active:bg-secondary/15',
  // Quiet, for tertiary actions.
  ghost: 'text-on-surface hover:text-secondary hover:bg-surface-container-high',
  // Neutral bordered surface — for icon controls (play/nav/close, etc.).
  surface:
    'bg-surface-container border border-outline/40 text-on-surface hover:bg-surface-container-high hover:border-outline',
  danger:
    'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  latin = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const latinClass = latin ? 'uppercase tracking-widest' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${latinClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
