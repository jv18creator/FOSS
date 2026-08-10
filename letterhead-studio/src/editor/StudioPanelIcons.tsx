type IconProps = { className?: string };

export function IconEmptyLayers({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 8l14 8-14 8-14-8 14-8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 26l14 8 14-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M10 34l14 8 14-8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function IconEmptyUpload({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="8" y="12" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M24 30V18m0 0l-5 5m5-5l5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 38h20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function IconEmptySelection({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="12"
        y="12"
        width="24"
        height="24"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeDasharray="4 3"
      />
      <path d="M20 24h8M24 20v8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconEmptySearch({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M30 30l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M16 22h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
