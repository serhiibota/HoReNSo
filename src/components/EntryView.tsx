'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COMM_META, FACT_FIELDS, STATUS_META, STATUS_ORDER, THOUGHT_FIELDS, type FieldDef } from '@/lib/fields';
import { firstLine, formatDateTime, hasText } from '@/lib/format';
import { goBack } from '@/lib/nav';
import type { CommType, Entry } from '@/lib/types';
import { useEntries } from '@/store/entries';
import { useHydrated } from '@/store/useHydrated';
import { CommBar } from './CommBar';
import { IconBack, IconEdit, IconTrash } from './icons';
import { SummarySheet } from './SummarySheet';
import { IconButton, TopBar } from './TopBar';

export function EntryView({ id }: { id: string | null }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const entry = useEntries((s) => s.entries.find((e) => e.id === id));
  const setStatus = useEntries((s) => s.setStatus);
  const logComm = useEntries((s) => s.logComm);
  const remove = useEntries((s) => s.remove);
  const [comm, setComm] = useState<CommType | null>(null);

  const back = (
    <IconButton label="Назад" onClick={() => goBack(router)} className="-ml-2">
      <IconBack />
    </IconButton>
  );

  if (!hydrated) return <TopBar left={back} />;

  if (!entry) {
    return (
      <div className="min-h-screen">
        <TopBar left={back} />
        <p className="px-6 py-20 text-center text-[15px] text-ink-faint">Запись не найдена.</p>
      </div>
    );
  }

  const onDelete = () => {
    if (window.confirm('Удалить запись? Это действие нельзя отменить.')) {
      remove(entry.id);
      router.replace('/');
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar
        left={back}
        right={
          <div className="-mr-2 flex">
            <IconButton label="Удалить" onClick={onDelete}>
              <IconTrash />
            </IconButton>
            <IconButton label="Редактировать" onClick={() => router.push(`/new?id=${entry.id}`)}>
              <IconEdit />
            </IconButton>
          </div>
        }
      />

      <main className="fade-up mx-auto max-w-2xl px-4 pb-[calc(9rem+var(--safe-bottom))]">
        <div className="px-1">
          <div className="eyebrow">{formatDateTime(entry.createdAt)}</div>
          <h1 className="mt-2 font-serif text-[30px] leading-tight">
            {firstLine(entry.facts.what, 140) || firstLine(entry.thoughts.understanding, 140) || 'Без названия'}
          </h1>
        </div>

        <StatusPicker entry={entry} onChange={(s) => setStatus(entry.id, s)} />

        <Block kicker="Блок 1" title="Что я вижу" fields={FACT_FIELDS} values={entry.facts} />
        <Block kicker="Блок 2" title="Что я думаю" fields={THOUGHT_FIELDS} values={entry.thoughts} />

        {entry.comms.length > 0 && (
          <section className="mt-8 px-1">
            <h2 className="eyebrow">История коммуникации</h2>
            <ul className="mt-3 space-y-2">
              {entry.comms
                .slice()
                .reverse()
                .map((c, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-ink-soft">
                    <span className={'font-serif text-[18px] ' + COMM_META[c.type].text}>{COMM_META[c.type].kanji}</span>
                    <span>{COMM_META[c.type].verb}</span>
                    <span className="ml-auto text-[12px] text-ink-faint">{formatDateTime(c.at)}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </main>

      <CommBar onPick={setComm} />
      <SummarySheet entry={entry} type={comm} onClose={() => setComm(null)} onSent={(t) => logComm(entry.id, t)} />
    </div>
  );
}

function StatusPicker({ entry, onChange }: { entry: Entry; onChange: (s: Entry['status']) => void }) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {STATUS_ORDER.map((s) => {
        const m = STATUS_META[s];
        const active = entry.status === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            aria-pressed={active}
            className={
              'pressable flex flex-col items-start rounded-2xl px-3 py-3 text-left transition-colors duration-200 ' +
              (active
                ? // Тонкая рамка цветом статуса: видна и там, где подложки нет (киноварь в «Туши»)
                  m.tint + ' ' + m.text + ' shadow-card ring-1 ring-inset ring-current'
                : 'bg-paper text-ink-soft shadow-card')
            }
          >
            <span className={'h-2 w-2 rounded-full ' + (active ? m.dot : 'bg-line')} />
            <span className="mt-2 text-[13px] font-semibold leading-tight">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Block<K extends string>({
  kicker,
  title,
  fields,
  values,
}: {
  kicker: string;
  title: string;
  fields: FieldDef<K>[];
  values: Record<K, string>;
}) {
  const filled = fields.filter((f) => hasText(values[f.key]));
  return (
    <section className="mt-8">
      <div className="px-1">
        <div className="eyebrow">{kicker}</div>
        <h2 className="mt-1 font-serif text-[24px]">{title}</h2>
      </div>
      {filled.length === 0 ? (
        <p className="mt-3 px-1 text-[14px] text-ink-faint">Не заполнено.</p>
      ) : (
        <dl className="card mt-3 divide-y divide-line">
          {filled.map((f) => (
            <div key={f.key} className="px-5 py-4">
              <dt className="text-[13px] text-ink-faint">{f.label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-[16px] leading-relaxed">{values[f.key]}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
