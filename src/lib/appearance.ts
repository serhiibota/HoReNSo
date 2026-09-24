export type ThemeId = 'ivory' | 'mist' | 'sakura' | 'matcha' | 'sumi';
export type FontId = 'classic' | 'modern' | 'book' | 'system';

export const PREFS_KEY = 'horenso:prefs';

export interface ThemeDef {
  id: ThemeId;
  name: string;
  note: string;
  /** Цвет панели Safari (meta theme-color) */
  meta: string;
  /** Цвета для превью в настройках: фон, карточка, текст, акцент */
  swatch: [string, string, string, string];
}

export const THEMES: ThemeDef[] = [
  { id: 'ivory', name: 'Слоновая кость', note: 'Тёплая, по умолчанию', meta: '#F7F5F0', swatch: ['#F7F5F0', '#FFFFFF', '#2B2A28', '#C9A15B'] },
  { id: 'mist', name: 'Туман', note: 'Светло-серая', meta: '#F2F3F5', swatch: ['#F2F3F5', '#FFFFFF', '#22252A', '#7F93AD'] },
  { id: 'sakura', name: 'Сакура', note: 'Пудровая', meta: '#FAF4F3', swatch: ['#FAF4F3', '#FFFFFF', '#34282A', '#B08676'] },
  { id: 'matcha', name: 'Маття', note: 'Мягкая зелёная', meta: '#F3F5EE', swatch: ['#F3F5EE', '#FFFFFD', '#262C24', '#7E9C88'] },
  { id: 'sumi', name: 'Сумиэ', note: 'Тёмная', meta: '#181716', swatch: ['#181716', '#232220', '#ECE8E1', '#CEA865'] },
];

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

export const DEFAULT_THEME: ThemeId = 'ivory';
export const DEFAULT_FONT: FontId = 'classic';

/**
 * Скрипт в <head>: ставит data-theme/data-font до первой отрисовки,
 * иначе при загрузке мелькнёт тема по умолчанию. Читает то же хранилище,
 * что и zustand persist (формат { state: {...}, version }).
 */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('${PREFS_KEY}')||'{}').state||{};var d=document.documentElement;var m=${JSON.stringify(
  Object.fromEntries(THEMES.map((t) => [t.id, t.meta])),
)};if(m[s.theme]){d.setAttribute('data-theme',s.theme);var e=document.querySelector('meta[name="theme-color"]');if(e)e.setAttribute('content',m[s.theme]);}if(s.font)d.setAttribute('data-font',s.font);}catch(e){}})();`;
