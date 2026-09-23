'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntryForm } from '@/components/EntryForm';
import { useHydrated } from '@/store/useHydrated';

function NewEntry() {
  const id = useSearchParams().get('id');
  const hydrated = useHydrated();
  // Форма монтируется после гидрации, чтобы черновик из localStorage был на месте
  if (!hydrated) return null;
  return <EntryForm editId={id} />;
}

// useSearchParams в статическом экспорте требует границы Suspense
export default function NewEntryPage() {
  return (
    <Suspense fallback={null}>
      <NewEntry />
    </Suspense>
  );
}
