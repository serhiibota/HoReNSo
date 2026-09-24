'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DEFAULT_FONT,
  DEFAULT_THEME,
  PREFS_KEY,
  applyThemeColor,
  normalizeTheme,
  type FontId,
  type ThemeChoice,
} from '@/lib/appearance';

interface PrefsState {
  theme: ThemeChoice;
  font: FontId;
  setTheme: (theme: ThemeChoice) => void;
  setFont: (font: FontId) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      font: DEFAULT_FONT,
      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
    }),
    {
      name: PREFS_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, font: s.font }),
      // v2: «Сакура» стала «Аи», «Сумиэ» — «Суми» (тот же id)
      migrate: (persisted) => {
        const p = (persisted ?? {}) as { theme?: unknown; font?: FontId };
        return { theme: normalizeTheme(p.theme) ?? DEFAULT_THEME, font: p.font ?? DEFAULT_FONT } as PrefsState;
      },
    },
  ),
);

/** Переносит выбор на <html>; первичную установку делает скрипт в <head> */
export function applyAppearance(theme: ThemeChoice, font: FontId) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-font', font);
  applyThemeColor(theme);
}
