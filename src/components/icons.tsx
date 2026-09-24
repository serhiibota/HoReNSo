// Тонкие линейные иконки — inline SVG, без иконочных шрифтов и лишних запросов
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconPlus = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={1.8}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconBack = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...base}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconQuestion = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...base}>
    <path d="M9.2 9.2a2.9 2.9 0 015.6 1c0 1.9-2.8 2.5-2.8 4.3" />
    <circle cx="12" cy="18" r="0.6" fill="currentColor" />
  </svg>
);

export const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...base}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
  </svg>
);

export const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...base}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
  </svg>
);

export const IconCopy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...base}>
    <rect x="8" y="8" width="11" height="11" rx="2" />
    <path d="M5 15V6a1 1 0 011-1h9" />
  </svg>
);

export const IconShare = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...base}>
    <path d="M12 15V4M8 8l4-4 4 4M6 12v7a1 1 0 001 1h10a1 1 0 001-1v-7" />
  </svg>
);

export const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={2}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...base}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
);
