import Link from 'next/link';
import { COMM_META, SELF_FIELDS, STATUS_META, VERDICT_META } from '@/lib/fields';
import { firstLine, formatDate, hasText } from '@/lib/format';
import type { Entry } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

/**
 * Карточка ленты. Цвет статуса — тонкая полоса слева и бейдж.
 * Тень статичная; при нажатии анимируется только transform.
 */
export function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const title = firstLine(entry.facts.what) || firstLine(entry.thoughts.understanding) || 'Без названия';
  const self = entry.mode === 'self';
  // Для самопроверки под заголовком — вывод (или версия), для команды — следующий шаг
  const next = self
    ? firstLine(entry.conclusion, 120) || firstLine(entry.thoughts.understanding, 120)
    : firstLine(entry.thoughts.actions, 120);
  const nextLabel = self ? (hasText(entry.conclusion) ? 'Вывод: ' : 'Версия: ') : 'Шаг: ';
  const lastComm = self ? undefined : entry.comms[entry.comms.length - 1];
  const state = self ? VERDICT_META[entry.verdict] : STATUS_META[entry.status];
  const factsCount = Object.values(entry.facts).filter(hasText).length;
  const thoughtsCount = self
    ? Number(hasText(entry.thoughts.understanding)) +
      SELF_FIELDS.filter((f) => hasText(entry.self[f.key])).length +
      Number(entry.confidence !== null)
    : Object.values(entry.thoughts).filter(hasText).length;

  return (
    <li className="fade-up" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <Link href={`/entry?id=${entry.id}`} className="card pressable relative block overflow-hidden p-5 pl-6">
        <span aria-hidden className={'absolute bottom-0 left-0 top-0 w-1 ' + state.dot} />

        <div className="flex items-center justify-between gap-3">
          {self ? (
            <span className={'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ' + state.tint + ' ' + state.text}>
              <span className={'h-1.5 w-1.5 rounded-full ' + state.dot} />
              {state.label}
            </span>
          ) : (
            <StatusBadge status={entry.status} />
          )}
          <time className="shrink-0 text-[12px] text-ink-faint">{formatDate(entry.createdAt)}</time>
        </div>

        <h2 className="mt-3 font-serif text-[21px] leading-snug">{title}</h2>

        {next && (
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">{nextLabel}</span>
            {next}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-[12px] text-ink-faint">
          <span>
            {self
              ? `Самопроверка · ${thoughtsCount}/5` + (entry.confidence !== null ? ` · уверенность ${entry.confidence} %` : '')
              : `Факты ${factsCount}/4 · Анализ ${thoughtsCount}/5`}
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
