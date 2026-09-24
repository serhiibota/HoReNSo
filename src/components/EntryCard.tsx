import Link from 'next/link';
import { COMM_META, STATUS_META } from '@/lib/fields';
import { firstLine, formatDate, hasText } from '@/lib/format';
import { TOOLS, toolSummary } from '@/lib/tools';
import type { Entry } from '@/lib/types';
import { isReviewDue } from '@/store/entries';
import { StatusBadge } from './StatusBadge';

/**
 * Карточка решения в ленте. Цвет статуса — тонкая полоса слева и бейдж.
 * Тень статичная; при нажатии анимируется только transform.
 */
export function EntryCard({ entry, index }: { entry: Entry; index: number }) {
  const title =
    firstLine(entry.question) || firstLine(entry.facts.what) || firstLine(entry.thoughts.understanding) || 'Без названия';
  const choice = entry.options.find((o) => o.id === entry.choiceId);

  // Под заголовком — главное: выбор, вывод самопроверки или следующий шаг
  const [nextLabel, next] = choice
    ? ['Решение: ', choice.text]
    : entry.mode === 'self' && hasText(entry.conclusion)
      ? ['Вывод: ', firstLine(entry.conclusion, 120)]
      : ['Шаг: ', firstLine(entry.thoughts.actions, 120)];

  const toolsDone = TOOLS.filter((t) => toolSummary(t.id, entry)).length;
  const due = isReviewDue(entry);
  const lastComm = entry.comms[entry.comms.length - 1];

  return (
    <li className="fade-up" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <Link href={`/entry?id=${entry.id}`} className="card pressable relative block overflow-hidden p-5 pl-6">
        <span aria-hidden className={'absolute bottom-0 left-0 top-0 w-1 ' + STATUS_META[entry.status].dot} />

        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={entry.status} />
          {due ? (
            <span className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold text-open-ink ring-1 ring-inset ring-current">
              Пора пересмотреть
            </span>
          ) : (
            <time className="shrink-0 text-[12px] text-ink-faint">{formatDate(entry.createdAt)}</time>
          )}
        </div>

        <h2 className="mt-3 font-serif text-[21px] leading-snug">{title}</h2>

        {next && (
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">{nextLabel}</span>
            {next}
            {choice && entry.decisionConfidence !== null && (
              <span className="text-ink-faint"> · {entry.decisionConfidence} %</span>
            )}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-ink-faint">
          <span>
            Инструменты {toolsDone}/{TOOLS.length}
            {entry.review && ' · пересмотрено'}
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
