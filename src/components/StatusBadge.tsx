import { STATUS_META } from '@/lib/fields';
import type { EntryStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: EntryStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ' + m.tint + ' ' + m.text}>
      <span className={'h-1.5 w-1.5 rounded-full ' + m.dot} />
      {m.label}
    </span>
  );
}
