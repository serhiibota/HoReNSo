/**
 * Единственный источник цветов HoReNSo.
 *
 * Здесь вручную задаются только базовые цвета схемы (HEX). Подложки и текст
 * на подложках (`*-tint`, `*-ink`, `*-on`) выводятся формулами, CSS
 * генерируется `buildThemeCss()` и вставляется в <style> в layout.tsx.
 * Превью в настройках, theme-color и scripts/check-colors.mjs читают те же данные.
 *
 * Файл без импортов и только со «стираемым» TypeScript — его напрямую
 * запускает Node в scripts/check-colors.mjs.
 */

export type Hex = string;

/** Цвета состояний решения и типов коммуникации — у каждого своя подложка */
export const ACCENTS = ['open', 'acting', 'done', 'ho', 'ren', 'so'] as const;
export type Accent = (typeof ACCENTS)[number];

export const STATUS_ACCENTS: Accent[] = ['open', 'acting', 'done'];
export const COMM_ACCENTS: Accent[] = ['ho', 'ren', 'so'];

/** Токены, которые обязан задать каждый поставщик цвета */
const BASE_TOKENS = ['bg', 'paper', 'ink', 'ink-soft', 'ink-faint', 'line', 'mist', 'shadow', 'selection'] as const;
type BaseToken = (typeof BASE_TOKENS)[number];

/**
 * Необязательные токены. Схема без них явно сбрасывает их в `initial`,
 * а в стилях они читаются как `var(--c-x, запасной)` — иначе значение
 * из `:root` «протекло» бы в схему, которая его не задаёт.
 * Сейчас все схемы задают полный набор, список пуст; новый токен,
 * нужный не всем схемам, добавляется сюда.
 */
export const OPTIONAL_TOKENS: readonly string[] = [];
type OptionalToken = string;

export type ThemeId = 'tushe' | 'tushe-marks' | 'sumi' | 'ivory' | 'mist' | 'ai' | 'matcha';

/** «Как в системе»: днём одна схема, ночью другая — через prefers-color-scheme, без JS */
export const AUTO = { id: 'auto', light: 'tushe-marks', dark: 'sumi' } as const;
export type ThemeChoice = ThemeId | typeof AUTO.id;

/** Переименованные и удалённые схемы → их замена (для сохранённых настроек) */
export const THEME_ALIASES: Record<string, ThemeChoice> = { sakura: 'ai' };

export type ThemeGroup = 'ink' | 'color';
export const THEME_GROUPS: { id: ThemeGroup; name: string; note: string }[] = [
  { id: 'ink', name: 'Тушь', note: 'Монохром, киноварь — только «Требует мер»' },
  { id: 'color', name: 'Цветные', note: 'Минеральные и земляные акценты' },
];

export interface ThemeDef {
  id: ThemeId;
  name: string;
  note: string;
  group: ThemeGroup;
  dark: boolean;
  base: Record<BaseToken, Hex>;
  accents: Record<Accent, Hex>;
  /**
   * Акценты без подложки: `*-tint` = paper, цвет живёт только в точке,
   * полоске и тексте. Так в «Туши» киноварь не превращается в розовое пятно.
   */
  untinted?: Accent[];
  optional?: Partial<Record<OptionalToken, Hex>>;
  /** Ручная правка вычисленного токена — только если формула не справилась */
  overrides?: Partial<Record<string, Hex>>;
}

export const THEMES: ThemeDef[] = [
  // ─── Группа «Тушь»: единственный яркий цвет — киноварь, только для open ───
  {
    id: 'tushe',
    name: 'Тушь',
    note: 'Бумага и тушь',
    group: 'ink',
    dark: false,
    base: {
      bg: '#F4F3EF',
      paper: '#FBFAF7',
      ink: '#1A1A19',
      'ink-soft': '#4D4C49',
      'ink-faint': '#7C7B76',
      line: '#DCDAD3',
      mist: '#EBE9E3',
      shadow: '#1A1A19',
      selection: '#DDDAD2',
    },
    // Статусы и Хо/Рен/Со — оттенки туши
    accents: {
      open: '#C8432B',
      acting: '#4A4A47',
      done: '#8E8D88',
      ho: '#2E2E2C',
      ren: '#62615D',
      so: '#96958F',
    },
    untinted: ['open'],
  },
  {
    id: 'tushe-marks',
    name: 'Тушь с пометками',
    note: 'Тёмные приглушённые пометки',
    group: 'ink',
    dark: false,
    base: {
      bg: '#F4F3EF',
      paper: '#FBFAF7',
      ink: '#1A1A19',
      'ink-soft': '#4D4C49',
      'ink-faint': '#7C7B76',
      line: '#DCDAD3',
      mist: '#EBE9E3',
      shadow: '#1A1A19',
      selection: '#DDDAD2',
    },
    // Пометки: умбра, хвоя, индиго, олива, кирпич
    accents: {
      open: '#C8432B',
      acting: '#8A6428',
      done: '#3B6B5F',
      ho: '#34507C',
      ren: '#66703A',
      so: '#9A4536',
    },
    untinted: ['open'],
  },
  {
    // id прежней «Сумиэ» — у выбравших её схема сменится сама
    id: 'sumi',
    name: 'Суми',
    note: 'Уголь, тёмная',
    group: 'ink',
    dark: true,
    base: {
      bg: '#161615',
      paper: '#201F1D',
      ink: '#E8E6E1',
      'ink-soft': '#ABA8A1',
      'ink-faint': '#85827C',
      line: '#3A3936',
      mist: '#2A2927',
      shadow: '#000000',
      selection: '#45433F',
    },
    // Светлые серые заливки → тёмные иконки (*-on выбирается автоматически)
    accents: {
      open: '#E0583D',
      acting: '#B9B6AF',
      done: '#7F7C76',
      ho: '#D6D3CC',
      ren: '#A19E97',
      so: '#6E6B66',
    },
  },

  // ─── Цветные ───
  {
    id: 'ivory',
    group: 'color',
    name: 'Слоновая кость',
    note: 'Тёплая, по умолчанию',
    dark: false,
    base: {
      bg: '#F7F5F0',
      paper: '#FFFFFF',
      ink: '#2B2A28',
      'ink-soft': '#65625C',
      'ink-faint': '#8C887F',
      line: '#E9E5DD',
      mist: '#F0EDE6',
      shadow: '#2B2A28',
      selection: '#E8DFCF',
    },
    // Охра, сталь, шалфей; для Хо/Рен/Со — синий, зелёный и умбра вместо пудровой глины
    accents: {
      open: '#C29A52',
      acting: '#7389A6',
      done: '#739582',
      ho: '#667F9E',
      ren: '#6F9280',
      so: '#A0735E',
    },
  },
  {
    id: 'mist',
    group: 'color',
    name: 'Туман',
    note: 'Светло-серая, холодная',
    dark: false,
    base: {
      bg: '#F2F3F5',
      paper: '#FFFFFF',
      ink: '#22252A',
      'ink-soft': '#5C616A',
      'ink-faint': '#80858E',
      line: '#E2E5EA',
      mist: '#E8EAEE',
      shadow: '#1E2430',
      selection: '#D6DEEA',
    },
    // Сталь, эвкалипт, сланец; статусы — приглушённая охра, сталь, эвкалипт
    accents: {
      open: '#AE8A4E',
      acting: '#5F7C99',
      done: '#5E8A74',
      ho: '#56789A',
      ren: '#5B8C80',
      so: '#6E6A80',
    },
  },
  {
    id: 'ai',
    name: 'Аи',
    note: 'Индиго и хвоя',
    group: 'color',
    dark: false,
    base: {
      bg: '#F1F2EF',
      paper: '#FFFFFF',
      ink: '#1F2530',
      'ink-soft': '#525A66',
      'ink-faint': '#767D87',
      line: '#DFE2E1',
      mist: '#E7E9E7',
      shadow: '#1F2530',
      selection: '#D3DAE6',
    },
    // 藍 — индиго. Хвоя, умбра, охра; ничего пудрового
    accents: {
      open: '#AC873E',
      acting: '#4F6A8E',
      done: '#437260',
      ho: '#3E5A86',
      ren: '#3F6A5A',
      so: '#8A5A3C',
    },
  },
  {
    id: 'matcha',
    group: 'color',
    name: 'Маття',
    note: 'Травяная',
    dark: false,
    base: {
      bg: '#F3F5EE',
      paper: '#FFFFFD',
      ink: '#262C24',
      'ink-soft': '#5E685B',
      'ink-faint': '#7F887B',
      line: '#E1E7DB',
      mist: '#E9EEE3',
      shadow: '#243020',
      selection: '#D8E4CC',
    },
    // Хвоя, ходзича, селадон; статусы — охра, сланцево-бирюзовый, хвоя
    accents: {
      open: '#AF8B3E',
      acting: '#5A7D86',
      done: '#4E7A57',
      ho: '#3F6B55',
      ren: '#8A6746',
      so: '#6F9C88',
    },
  },
];

export const DEFAULT_THEME: ThemeId = 'ivory';

// ─── Цветовая арифметика ────────────────────────────────────────────────

type RGB = [number, number, number];

export function hexToRgb(hex: Hex): RGB {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

export function rgbToHex([r, g, b]: RGB): Hex {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Линейная смесь в sRGB: `share` — доля первого цвета (как color-mix(in srgb, a share, b)) */
export function mix(a: Hex, b: Hex, share: number): Hex {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => x[i] * share + y[i] * (1 - share)) as RGB);
}

function luminance(hex: Hex): number {
  const lin = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** Контраст по WCAG 2.x */
export function contrast(a: Hex, b: Hex): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbDistance(a: Hex, b: Hex): number {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return Math.sqrt((x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2);
}

// ─── Формулы производных токенов ────────────────────────────────────────

export const FORMULA = {
  /** Подложка: доля цвета. Светлые смешиваются с paper (не с bg — иначе синий сереет на тёплом фоне) */
  tintLight: 0.2,
  tintDark: 0.22,
  /** Текст на подложке: доля исходного цвета, остальное — ink (светлые) или белый (тёмные) */
  inkLight: 0.62,
  inkDark: 0.7,
  /**
   * Доводка: если по формуле текст на подложке < 4,5:1, доля исходного цвета
   * уменьшается шагами по 2 %, пока контраст не станет достаточным.
   * 4,5:1 — прежний уровень статусов, ниже которого опускаться нельзя.
   */
  inkTarget: 4.5,
  inkStep: 0.02,
} as const;

/** Текст/иконка на подложке: формула + доводка до FORMULA.inkTarget */
function inkOnTint(color: Hex, towards: Hex, share: number, tint: Hex): Hex {
  let s = share;
  let ink = mix(color, towards, s);
  while (contrast(ink, tint) < FORMULA.inkTarget && s > 0) {
    s = Math.max(0, s - FORMULA.inkStep);
    ink = mix(color, towards, s);
  }
  return ink;
}

export type ResolvedTheme = Record<string, Hex>;

/** Все токены схемы в HEX: базовые + вычисленные + ручные правки */
export function resolveTheme(t: ThemeDef): ResolvedTheme {
  const out: ResolvedTheme = { ...t.base };
  for (const a of ACCENTS) {
    const c = t.accents[a];
    out[a] = c;
    const tint = t.untinted?.includes(a)
      ? t.base.paper
      : t.dark
        ? mix(c, t.base.bg, FORMULA.tintDark)
        : mix(c, t.base.paper, FORMULA.tintLight);
    out[`${a}-tint`] = tint;
    out[`${a}-ink`] = t.dark
      ? inkOnTint(c, '#FFFFFF', FORMULA.inkDark, tint)
      : inkOnTint(c, t.base.ink, FORMULA.inkLight, tint);
    // Иконка/текст на сплошной заливке цветом: белый, если читается, иначе тёмный
    const dark = t.dark ? t.base.bg : t.base.ink;
    out[`${a}-on`] = contrast('#FFFFFF', c) >= 3 ? '#FFFFFF' : dark;
  }
  for (const k of OPTIONAL_TOKENS) {
    const v = t.optional?.[k];
    if (v) out[k] = v;
  }
  return { ...out, ...(t.overrides ?? {}) } as ResolvedTheme;
}

const triplet = (hex: Hex) => hexToRgb(hex).join(' ');

/**
 * CSS для всех схем: `:root[data-theme=…]{--c-x: r g b}`.
 */
function declarations(t: ThemeDef): string {
  const tokens = resolveTheme(t);
  const decl = Object.entries(tokens).map(([k, v]) => `--c-${k}:${triplet(v)}`);
  for (const k of OPTIONAL_TOKENS) if (!(k in tokens)) decl.push(`--c-${k}:initial`);
  decl.push(`color-scheme:${t.dark ? 'dark' : 'light'}`);
  return decl.join(';');
}

export const themeById = (id: ThemeId): ThemeDef => THEMES.find((t) => t.id === id)!;

export function buildThemeCss(themes: ThemeDef[] = THEMES): string {
  // :root — схема по умолчанию (страница верна и без атрибута). Схемы идут
  // с селектором :root[data-theme] — он специфичнее :root, поэтому порядок
  // блоков не важен и :root никогда не перебьёт выбранную схему.
  const blocks = [`:root{${declarations(themeById(DEFAULT_THEME))}}`];
  for (const t of themes) blocks.push(`:root[data-theme="${t.id}"]{${declarations(t)}}`);
  // «Как в системе» — чистый CSS, переключается вместе с ОС без JS
  blocks.push(`:root[data-theme="${AUTO.id}"]{${declarations(themeById(AUTO.light))}}`);
  blocks.push(`@media (prefers-color-scheme: dark){:root[data-theme="${AUTO.id}"]{${declarations(themeById(AUTO.dark))}}}`);
  return blocks.join('\n');
}
