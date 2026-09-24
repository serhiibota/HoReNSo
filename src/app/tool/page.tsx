'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ToolScreen } from '@/components/ToolScreen';

function Tool() {
  const params = useSearchParams();
  return <ToolScreen id={params.get('id')} tool={params.get('t')} />;
}

export default function ToolPage() {
  return (
    <Suspense fallback={null}>
      <Tool />
    </Suspense>
  );
}
