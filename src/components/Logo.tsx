import React from 'react';

// The studio's actual brand mark (provided source artwork, cropped to the
// emblem only — see public/brand/source/ for the original full lockups).
// Two renders exist because the gold/teal line art needs a light vs. dark
// backdrop to stay legible; swap by the app's current theme, not CSS media
// queries, since theme here is a user toggle independent of OS preference.
const ICON_BY_THEME = {
  light: `${import.meta.env.BASE_URL}brand/logo-icon-light.png`,
  dark: `${import.meta.env.BASE_URL}brand/logo-icon-dark.png`,
};

export function LogoMark({
  theme,
  className = 'w-9 h-9'
}: {
  theme: 'light' | 'dark';
  className?: string;
}) {
  return (
    <img
      src={ICON_BY_THEME[theme]}
      alt="פילאטיס ותנועה"
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  );
}

export function LogoLockup({
  theme,
  layout = 'inline',
  markClassName = 'w-9 h-9',
  textClassName = 'text-lg'
}: {
  theme: 'light' | 'dark';
  layout?: 'inline' | 'stacked';
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={layout === 'stacked' ? 'flex flex-col items-center gap-2' : 'flex items-center gap-3'}>
      <LogoMark theme={theme} className={markClassName} />
      {/* Flat gold, matching the wordmark color in the source artwork. */}
      <span className={`serif-text font-bold tracking-wide text-[#c9a227] select-none ${textClassName}`}>
        פילאטיס ותנועה
      </span>
    </div>
  );
}
