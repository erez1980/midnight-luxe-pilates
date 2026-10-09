import React from 'react';

/** Shared studio pill buttons, with accessible touch targets and focus. */

type Variant = 'primary' | 'outline' | 'ghost' | 'surface' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  latin?: boolean;
  fullWidth?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-full cursor-pointer ' +
  'transition-all duration-500 ease-soft select-none disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
  icon: 'h-11 w-11 p-0',
  'icon-sm': 'h-11 w-11 p-0',
};

const variants: Record<Variant, string> = {
  // Match the main site’s sage contact button.
  primary: 'bg-sage text-white shadow-[0_10px_30px_-12px_rgba(76,92,66,0.55)] hover:bg-sage-deep active:brightness-95',
  // Match the main site’s outline actions.
  outline:
    'border border-secondary/60 text-secondary hover:bg-secondary/10 hover:border-secondary active:bg-secondary/15',
  // Quiet, for tertiary actions.
  ghost: 'text-on-surface hover:text-secondary hover:bg-surface-container-high',
  // Neutral bordered surface — for icon controls (play/nav/close, etc.).
  surface:
    'bg-surface-container border border-line text-on-surface hover:bg-surface-container-high hover:border-sage',
  danger:
    'border border-error/30 text-error hover:bg-error-container hover:border-error',
};

export default function Button({
  type = 'button',
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
    <button type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${latinClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
