'use client';

import { useEffect } from 'react';
import { applyAppearance, usePrefs } from '@/store/prefs';

/** Следит за настройками и обновляет атрибуты <html>. Ничего не рендерит. */
export function AppearanceSync() {
  const theme = usePrefs((s) => s.theme);
  const font = usePrefs((s) => s.font);

  useEffect(() => {
    applyAppearance(theme, font);
  }, [theme, font]);

  return null;
}
