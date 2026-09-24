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
 */
export const OPTIONAL_TOKENS = ['hot'] as const;
type OptionalToken = (typeof OPTIONAL_TOKENS)[number];

export type ThemeId = 'ivory' | 'mist' | 'sakura' | 'matcha' | 'sumi';

export interface ThemeDef {
  id: ThemeId;
  name: string;
  note: string;
  dark: boolean;
  base: Record<BaseToken, Hex>;
  accents: Record<Accent, Hex>;
  optional?: Partial<Record<OptionalToken, Hex>>;
  /** Ручная правка вычисленного токена — только если формула не справилась */
  overrides?: Partial<Record<string, Hex>>;
}

export const THEMES: ThemeDef[] = [
  {
    id: 'ivory',
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
    id: 'sakura',
    name: 'Сакура',
    note: 'Пудровая',
    dark: false,
    base: {
      bg: '#FAF4F3',
      paper: '#FFFFFF',
      ink: '#34282A',
      'ink-soft': '#725E61',
      'ink-faint': '#978185',
      line: '#F0E3E2',
      mist: '#F5E9E8',
      shadow: '#46282C',
      selection: '#F2D6D6',
    },
    // Ждёт решения: удалить или переделать в земляную схему
    accents: {
      open: '#CEA060',
      acting: '#8A88B0',
      done: '#809E86',
      ho: '#8682AC',
      ren: '#80A088',
      so: '#BE7A80',
    },
  },
  {
    id: 'matcha',
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
  {
    id: 'sumi',
    name: 'Сумиэ',
    note: 'Тёмная',
    dark: true,
    base: {
      bg: '#181716',
      paper: '#232220',
      ink: '#ECE8E1',
      'ink-soft': '#B2ADA4',
      'ink-faint': '#8A857D',
      line: '#363431',
      mist: '#2D2B29',
      shadow: '#000000',
      selection: '#50483C',
    },
    accents: {
      open: '#CEA865',
      acting: '#8CA0BC',
      done: '#88AA94',
      ho: '#98ACC6',
      ren: '#96BAA0',
      so: '#D0A694',
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
    const tint = t.dark ? mix(c, t.base.bg, FORMULA.tintDark) : mix(c, t.base.paper, FORMULA.tintLight);
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
 * CSS для всех схем: `[data-theme=…]{--c-x: r g b}`. Схема по умолчанию
 * дополнительно висит на :root — страница выглядит правильно и без атрибута.
 */
export function buildThemeCss(themes: ThemeDef[] = THEMES): string {
  return themes
    .map((t) => {
      const tokens = resolveTheme(t);
      const decl = Object.entries(tokens).map(([k, v]) => `--c-${k}:${triplet(v)}`);
      for (const k of OPTIONAL_TOKENS) if (!(k in tokens)) decl.push(`--c-${k}:initial`);
      if (t.dark) decl.push('color-scheme:dark');
      const sel = t.id === DEFAULT_THEME ? `:root,[data-theme="${t.id}"]` : `[data-theme="${t.id}"]`;
      return `${sel}{${decl.join(';')}}`;
    })
    .join('\n');
}
