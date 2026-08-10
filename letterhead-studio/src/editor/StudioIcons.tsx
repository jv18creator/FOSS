type IconProps = { className?: string };

export function IconTemplates({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconText({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 5h12M12 5v14M8 19h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconElements({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4l8 14H4L12 4z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconDraw({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20l4-1 9-9-3-3-9 9-1 4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 5l3 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V6m0 0l-4 4m4-4l4 4M5 18h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBackground({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconLayers({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 14l9 5 9-5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconResize({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3H3v5M16 3h5v5M16 21h5v-5M8 21H3v-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const TOOL_ICONS = {
  templates: IconTemplates,
  text: IconText,
  elements: IconElements,
  draw: IconDraw,
  upload: IconUpload,
  background: IconBackground,
  layers: IconLayers,
  resize: IconResize,
} as const;
