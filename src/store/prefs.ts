'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_FONT, DEFAULT_THEME, PREFS_KEY, THEMES, type FontId, type ThemeId } from '@/lib/appearance';

interface PrefsState {
  theme: ThemeId;
  font: FontId;
  setTheme: (theme: ThemeId) => void;
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, font: s.font }),
    },
  ),
);

/** Переносит выбор на <html>; первичную установку делает скрипт в <head> */
export function applyAppearance(theme: ThemeId, font: FontId) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-font', font);
  const meta = THEMES.find((t) => t.id === theme)?.meta;
  const tag = document.querySelector('meta[name="theme-color"]');
  if (meta && tag) tag.setAttribute('content', meta);
}
