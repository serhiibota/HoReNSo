'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntryView } from '@/components/EntryView';

// Запись открывается по ?id=…, а не /entry/[id]: при статическом экспорте
// динамические сегменты нужно знать на этапе сборки, а записи живут в localStorage
function Entry() {
  return <EntryView id={useSearchParams().get('id')} />;
}

export default function EntryPage() {
  return (
    <Suspense fallback={null}>
      <Entry />
    </Suspense>
  );
}
