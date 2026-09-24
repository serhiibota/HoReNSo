import { AUTO, THEMES, THEME_ALIASES, themeById, type ThemeChoice, type ThemeDef } from './themes';

export { DEFAULT_THEME, THEMES, type ThemeChoice, type ThemeDef, type ThemeId } from './themes';

export type FontId = 'classic' | 'modern' | 'book' | 'system';

export const PREFS_KEY = 'horenso:prefs';

/** Цвет панели Safari (meta theme-color) — фон схемы */
export const themeMeta = (t: ThemeDef) => t.base.bg;

/**
 * theme-color для светлой и тёмной системной темы: в layout два <meta> с media.
 * У обычной схемы оба одинаковые, у «Как в системе» — свои для дня и ночи.
 */
export const THEME_COLORS = {
  ...Object.fromEntries(THEMES.map((t) => [t.id, [themeMeta(t), themeMeta(t)]])),
  [AUTO.id]: [themeMeta(themeById(AUTO.light)), themeMeta(themeById(AUTO.dark))],
} as Record<ThemeChoice, [string, string]>;

/** Сохранённый выбор → актуальная схема (переименованные подменяются, неизвестные — null) */
export function normalizeTheme(v: unknown): ThemeChoice | null {
  const id = typeof v === 'string' ? (THEME_ALIASES[v] ?? v) : '';
  return id in THEME_COLORS ? (id as ThemeChoice) : null;
}

export function applyThemeColor(choice: ThemeChoice) {
  const [light, dark] = THEME_COLORS[choice];
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', (m.getAttribute('media') || '').includes('dark') ? dark : light);
  });
}

export interface FontDef {
  id: FontId;
  name: string;
  note: string;
  /** CSS-переменные пары — для превью в настройках независимо от текущего выбора */
  display: string;
  text: string;
}

export const FONTS: FontDef[] = [
  {
    id: 'classic',
    name: 'Классика',
    note: 'Cormorant Garamond и Manrope',
    display: 'var(--font-cormorant), Georgia, serif',
    text: 'var(--font-manrope), -apple-system, sans-serif',
  },
  {
    id: 'modern',
    name: 'Современный',
    note: 'Только Manrope, строгий гротеск',
    display: 'var(--font-manrope), -apple-system, sans-serif',
    text: 'var(--font-manrope), -apple-system, sans-serif',
  },
  {
    id: 'book',
    name: 'Книжный',
    note: 'PT Serif и PT Sans',
    display: 'var(--font-pt-serif), Georgia, serif',
    text: 'var(--font-pt-sans), -apple-system, sans-serif',
  },
  {
    id: 'system',
    name: 'Системный',
    note: 'Шрифты iPhone, без загрузки',
    display: "ui-serif, 'New York', Georgia, serif",
    text: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
];

export const DEFAULT_FONT: FontId = 'classic';

/**
 * Скрипт в <head>: ставит data-theme/data-font до первой отрисовки,
 * иначе при загрузке мелькнёт тема по умолчанию. Читает то же хранилище,
 * что и zustand persist (формат { state: {...}, version }).
 */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('${PREFS_KEY}')||'{}').state||{};var d=document.documentElement;var m=${JSON.stringify(
  THEME_COLORS,
)};var a=${JSON.stringify(THEME_ALIASES)};var t=a[s.theme]||s.theme;if(m[t]){d.setAttribute('data-theme',t);var e=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<e.length;i++){e[i].setAttribute('content',m[t][(e[i].getAttribute('media')||'').indexOf('dark')>-1?1:0]);}}if(s.font)d.setAttribute('data-font',s.font);}catch(e){}})();`;
