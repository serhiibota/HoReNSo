import { THEMES, type ThemeDef } from './themes';

export { DEFAULT_THEME, THEMES, type ThemeDef, type ThemeId } from './themes';

export type FontId = 'classic' | 'modern' | 'book' | 'system';

export const PREFS_KEY = 'horenso:prefs';

/** Цвет панели Safari (meta theme-color) — фон схемы */
export const themeMeta = (t: ThemeDef) => t.base.bg;

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
  Object.fromEntries(THEMES.map((t) => [t.id, themeMeta(t)])),
)};if(m[s.theme]){d.setAttribute('data-theme',s.theme);var e=document.querySelector('meta[name="theme-color"]');if(e)e.setAttribute('content',m[s.theme]);}if(s.font)d.setAttribute('data-font',s.font);}catch(e){}})();`;
