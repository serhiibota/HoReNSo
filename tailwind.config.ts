import type { Config } from 'tailwindcss';

// Tailwind v3 (не v4): v4 опирается на oklch, @property и color-mix,
// которых нет в Safari 15. v3 генерирует rgb() — работает на iOS 15.
const c = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Все цвета — CSS-переменные (rgb-триплеты), значения генерируются
      // из src/lib/themes.ts (buildThemeCss). Формат `rgb(var(--x) / a)` понимает Safari 12.1+,
      // поэтому модификаторы прозрачности (bg-ink/30) продолжают работать.
      colors: {
        ivory: c('bg'),
        paper: c('paper'),
        ink: { DEFAULT: c('ink'), soft: c('ink-soft'), faint: c('ink-faint') },
        line: c('line'),
        mist: c('mist'),
        // Статусы решения
        open: { DEFAULT: c('open'), tint: c('open-tint'), ink: c('open-ink'), on: c('open-on') },
        acting: { DEFAULT: c('acting'), tint: c('acting-tint'), ink: c('acting-ink'), on: c('acting-on') },
        done: { DEFAULT: c('done'), tint: c('done-tint'), ink: c('done-ink'), on: c('done-on') },
        // Типы коммуникации Хо-Рен-Со. На подложке *-tint текст/иконки — только *-ink
        ho: { DEFAULT: c('ho'), tint: c('ho-tint'), ink: c('ho-ink'), on: c('ho-on') },
        ren: { DEFAULT: c('ren'), tint: c('ren-tint'), ink: c('ren-ink'), on: c('ren-on') },
        so: { DEFAULT: c('so'), tint: c('so-tint'), ink: c('so-ink'), on: c('so-on') },
      },
      fontFamily: {
        // Пара шрифтов выбирается в настройках (data-font на <html>)
        sans: ['var(--font-text)'],
        serif: ['var(--font-display)'],
      },
      boxShadow: {
        // Мягкие статичные тени — их не анимируем (перерисовка тени дорога на A10)
        card: '0 1px 2px rgb(var(--c-shadow) / 0.04), 0 8px 24px -12px rgb(var(--c-shadow) / 0.12)',
        lift: '0 2px 4px rgb(var(--c-shadow) / 0.06), 0 16px 32px -12px rgb(var(--c-shadow) / 0.22)',
        sheet: '0 -8px 32px -8px rgb(var(--c-shadow) / 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      transitionTimingFunction: {
        // «iOS-подобная» кривая
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  // Жёсткий запрет: backdrop-filter роняет FPS на A10 — утилиты просто не генерируются
  corePlugins: { backdropBlur: false, backdropFilter: false },
  plugins: [],
};

export default config;
