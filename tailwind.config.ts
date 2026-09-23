import type { Config } from 'tailwindcss';

// Tailwind v3 (не v4): v4 опирается на oklch, @property и color-mix,
// которых нет в Safari 15. v3 генерирует rgb() — работает на iOS 15.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F5F0',
        paper: '#FFFFFF',
        ink: {
          DEFAULT: '#2B2A28',
          soft: '#65625C',
          faint: '#A39F97',
        },
        line: '#E9E5DD',
        mist: '#F0EDE6',
        // Статусы решения
        open: { DEFAULT: '#C9A15B', tint: '#F6EFDF' },
        acting: { DEFAULT: '#7F93AD', tint: '#E8EDF3' },
        done: { DEFAULT: '#7E9C88', tint: '#E7EFE9' },
        // Типы коммуникации Хо-Рен-Со
        ho: { DEFAULT: '#6F86A3', tint: '#EAEFF5' },
        ren: { DEFAULT: '#7E9C88', tint: '#ECF2EE' },
        so: { DEFAULT: '#B08676', tint: '#F5ECE8' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        // Мягкие статичные тени — их не анимируем (перерисовка тени дорога на A10)
        card: '0 1px 2px rgba(43,42,40,0.04), 0 8px 24px -12px rgba(43,42,40,0.12)',
        lift: '0 2px 4px rgba(43,42,40,0.06), 0 16px 32px -12px rgba(43,42,40,0.22)',
        sheet: '0 -8px 32px -8px rgba(43,42,40,0.18)',
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
