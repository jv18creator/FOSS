type IconProps = { className?: string };

const base = 'studio-toolbar-svg';

export function IconUndo({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 7H5v4M5 11c2.5-3 6-4.5 10-4a7 7 0 0 1 7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRedo({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 7h4v4M19 11c-2.5-3-6-4.5-10-4a7 7 0 0 0-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPosition({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconOpacity({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c4 4 6 7 6 9a6 6 0 1 1-12 0c0-2 2-5 6-9z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconDuplicate({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconDelete({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconHelp({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevronPanel({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconEyeOff({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4M6.7 6.7C4.6 8.1 3 10 2 12s4 7 10 7c1.8 0 3.5-.4 5-1.1M17.3 17.3C19.4 15.9 21 14 22 12s-4-7-10-7c-1.8 0-3.5.4-5 1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLayerBackward({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="7" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 16V9m0 0l-2.5 2.5M12 9l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLayerForward({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 13V6m0 0l-2.5 2.5M12 6l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconGrip({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="7" r="1.2" />
      <circle cx="15" cy="7" r="1.2" />
      <circle cx="9" cy="12" r="1.2" />
      <circle cx="15" cy="12" r="1.2" />
      <circle cx="9" cy="17" r="1.2" />
      <circle cx="15" cy="17" r="1.2" />
    </svg>
  );
}

export function IconSun({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMoon({ className }: IconProps) {
  return (
    <svg className={`${base} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 14.5A7.5 7.5 0 0 1 9.5 4 6.5 6.5 0 1 0 20 14.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
