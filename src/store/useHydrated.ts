'use client';

import { useEffect, useState } from 'react';
import { useEntries } from './entries';

// На сервере localStorage нет — zustand не создаёт persist API вовсе
const hasHydrated = () => typeof window !== 'undefined' && useEntries.persist.hasHydrated();

/**
 * Статический HTML собирается без localStorage, поэтому данные подтягиваем
 * только на клиенте. Пока гидрации нет — показываем скелетон, а не «пустую ленту».
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(hasHydrated);

  useEffect(() => {
    const unsub = useEntries.persist.onFinishHydration(() => setHydrated(true));
    if (useEntries.persist.hasHydrated()) setHydrated(true);
    else void useEntries.persist.rehydrate();
    return unsub;
  }, []);

  return hydrated;
}
