'use client';

import { DecisionForm } from '@/components/DecisionForm';
import { useHydrated } from '@/store/useHydrated';

export default function DecidePage() {
  // Решение создаётся в хранилище — дожидаемся чтения localStorage
  return useHydrated() ? <DecisionForm /> : null;
}
