import { useId } from 'react';

/**
 * Mark PeriodikLab: dua kartu unsur bertumpuk — satu terangkat dengan pita aksen
 * dan huruf P. Mengikuti token tema supaya tajam di mode gelap maupun terang.
 * Geometri sama dengan public/favicon.svg dan scripts/generate-icons.mjs.
 */
export function BrandMark() {
  const clipId = useId();

  return (
    <svg className="brand__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}>
          <rect x="23" y="19" width="31" height="34" rx="9" />
        </clipPath>
      </defs>
      <rect
        x="17.5"
        y="13"
        width="26"
        height="30"
        rx="8"
        transform="rotate(-8 30.5 28)"
        fill="var(--cat-noble)"
        fillOpacity="0.12"
        stroke="var(--cat-noble)"
        strokeOpacity="0.9"
        strokeWidth="2"
      />
      <rect
        x="23"
        y="19"
        width="31"
        height="34"
        rx="9"
        fill="var(--surface-solid)"
        stroke="var(--cat-transition)"
        strokeWidth="2"
      />
      <g clipPath={`url(#${clipId})`}>
        <rect x="23" y="19" width="31" height="4.6" fill="var(--cat-transition)" />
      </g>
      <rect x="34.6" y="28" width="4.2" height="19.5" rx="2.1" fill="var(--text)" />
      <path
        d="M36.7 30 A5.6 5.6 0 0 1 36.7 41.2"
        fill="none"
        stroke="var(--text)"
        strokeWidth="4.2"
      />
    </svg>
  );
}
