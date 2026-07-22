import React from 'react';

// Brand mark: a circular emblem with a flowing dancer figure, rendered as a
// single continuous stroke from teal to gold — matching the studio's actual
// logo artwork. Recreated as inline SVG (not a traced copy of the source
// file) so it stays crisp at every size and tints correctly in both themes.
export function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-ring" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2d6470" />
          <stop offset="55%" stopColor="#c9a13f" />
          <stop offset="100%" stopColor="#e9c349" />
        </linearGradient>
        <linearGradient id="logo-figure" x1="60" y1="40" x2="160" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2d6470" />
          <stop offset="45%" stopColor="#6b7a5e" />
          <stop offset="100%" stopColor="#e9c349" />
        </linearGradient>
      </defs>

      {/* ring, left mostly open where the ribbon flows through */}
      <path
        d="M100 22a78 78 0 1 1 -55.2 133.2"
        stroke="url(#logo-ring)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* head */}
      <circle cx="97" cy="62" r="11" stroke="url(#logo-figure)" strokeWidth="4.5" />

      {/* neck + arching back (the dancer's body) */}
      <path
        d="M97 74c-2 10 -1 19 6 26c10 10 26 12 40 8"
        stroke="url(#logo-figure)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* extended arm / trailing line sweeping past the ring */}
      <path
        d="M143 108c14 -2 27 -8 38 -18"
        stroke="url(#logo-figure)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M139 116c16 1 31 -4 44 -14"
        stroke="url(#logo-figure)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* torso curving down into the seated leg line */}
      <path
        d="M103 100c-6 12 -8 24 -4 36c5 15 18 25 34 27"
        stroke="url(#logo-figure)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* flowing ribbon / skirt sweeping out to the left, breaking the ring */}
      <path
        d="M99 136c-18 6 -34 5 -49 -4c-10 -6 -16 -6 -22 0"
        stroke="url(#logo-figure)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M104 144c-20 9 -39 10 -57 3"
        stroke="url(#logo-figure)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

// Full lockup: mark + Hebrew wordmark, matching the source artwork's layout
// (icon above, name below) when stacked, or side-by-side inline in the header.
export function LogoLockup({
  layout = 'inline',
  markClassName = 'w-9 h-9',
  textClassName = 'text-lg'
}: {
  layout?: 'inline' | 'stacked';
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={layout === 'stacked' ? 'flex flex-col items-center gap-2' : 'flex items-center gap-3'}>
      <LogoMark className={markClassName} />
      {/* Flat gold, not the sage brand-gradient utility — matches the actual
          logo artwork, where the wordmark is solid gold under the gradient ring. */}
      <span className={`serif-text font-bold tracking-wide text-[#c9a227] select-none ${textClassName}`}>
        פילאטיס ותנועה
      </span>
    </div>
  );
}
