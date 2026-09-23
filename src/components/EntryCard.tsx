import Link from 'next/link';
import { COMM_META, STATUS_META } from '@/lib/fields';
import { firstLine, formatDate, hasText } from '@/lib/format';
import type { Entry } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

/**
 * Карточка ленты. Цвет статуса — тонкая полоса слева и бейдж.
 * Тень статичная; при нажатии анимируется только transform.
 */
export function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const title = firstLine(entry.facts.what) || firstLine(entry.thoughts.understanding) || 'Без названия';
  const next = firstLine(entry.thoughts.actions, 120);
  const lastComm = entry.comms[entry.comms.length - 1];
  const factsCount = Object.values(entry.facts).filter(hasText).length;
  const thoughtsCount = Object.values(entry.thoughts).filter(hasText).length;

  return (
    <li className="fade-up" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <Link href={`/entry?id=${entry.id}`} className="card pressable relative block overflow-hidden p-5 pl-6">
        <span aria-hidden className={'absolute bottom-0 left-0 top-0 w-1 ' + STATUS_META[entry.status].dot} />

        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={entry.status} />
          <time className="shrink-0 text-[12px] text-ink-faint">{formatDate(entry.createdAt)}</time>
        </div>

        <h2 className="mt-3 font-serif text-[21px] leading-snug">{title}</h2>

        {next && (
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">Шаг: </span>
            {next}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-[12px] text-ink-faint">
          <span>
            Факты {factsCount}/4 · Анализ {thoughtsCount}/5
          </span>
          {lastComm && (
            <span className={'rounded-full px-2 py-0.5 ' + COMM_META[lastComm.type].tint + ' ' + COMM_META[lastComm.type].text}>
              {COMM_META[lastComm.type].kanji} {COMM_META[lastComm.type].verb.toLowerCase()}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
