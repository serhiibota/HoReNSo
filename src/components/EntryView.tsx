'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  COMM_META,
  FACT_FIELDS,
  MODE_META,
  SELF_FIELDS,
  SELF_VERSION_FIELD,
  STATUS_META,
  STATUS_ORDER,
  THOUGHT_FIELDS,
  VERDICT_META,
  VERDICT_ORDER,
  type FieldDef,
} from '@/lib/fields';
import { firstLine, formatDateTime, hasText } from '@/lib/format';
import { goBack } from '@/lib/nav';
import type { CommType, Entry } from '@/lib/types';
import { AutoTextarea } from './AutoTextarea';
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
  const setVerdict = useEntries((s) => s.setVerdict);
  const setConclusion = useEntries((s) => s.setConclusion);
  const toTeam = useEntries((s) => s.toTeam);
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

  const self = entry.mode === 'self';

  // Мостик: из самопроверки — в Хо-Рен-Со; факты и версия переходят как есть
  const shareWithTeam = () => {
    toTeam(entry.id);
    router.push(`/new?id=${entry.id}`);
  };

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
          <div className="eyebrow">
            {MODE_META[entry.mode].title} · {formatDateTime(entry.createdAt)}
          </div>
          <h1 className="mt-2 font-serif text-[30px] leading-tight">
            {firstLine(entry.facts.what, 140) || firstLine(entry.thoughts.understanding, 140) || 'Без названия'}
          </h1>
        </div>

        {self ? (
          <Picker
            options={VERDICT_ORDER.map((v) => ({ id: v, ...VERDICT_META[v] }))}
            value={entry.verdict}
            onChange={(v) => setVerdict(entry.id, v)}
          />
        ) : (
          <Picker
            options={STATUS_ORDER.map((st) => ({ id: st, ...STATUS_META[st] }))}
            value={entry.status}
            onChange={(st) => setStatus(entry.id, st)}
          />
        )}

        <Block kicker="Блок 1" title="Что я вижу" rows={rowsOf(FACT_FIELDS, entry.facts)} />
        {self ? (
          <>
            <Block kicker="Блок 2" title="Что я думаю" rows={selfRows(entry)} />
            <section className="mt-8">
              <div className="px-1">
                <div className="eyebrow">Итог</div>
                <label htmlFor="conclusion" className="mt-1 block font-serif text-[24px]">
                  Вывод для себя
                </label>
              </div>
              <div className="card mt-3 px-5 py-4">
                <AutoTextarea
                  id="conclusion"
                  value={entry.conclusion}
                  onValueChange={(v) => setConclusion(entry.id, v)}
                  placeholder="Что я теперь думаю? Что сделаю иначе?"
                  minRows={2}
                  autoCapitalize="sentences"
                />
              </div>
            </section>
          </>
        ) : (
          <>
            <Block kicker="Блок 2" title="Что я думаю" rows={rowsOf(THOUGHT_FIELDS, entry.thoughts)} />
            {/* Запись пришла из самопроверки — её вопросы остаются рядом */}
            {hasSelfNotes(entry) && <Block kicker="До этого" title="Самопроверка" rows={selfRows(entry, true)} />}
          </>
        )}

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

      {self ? (
        <BottomAction onClick={shareWithTeam} />
      ) : (
        <>
          <CommBar onPick={setComm} />
          <SummarySheet entry={entry} type={comm} onClose={() => setComm(null)} onSent={(t) => logComm(entry.id, t)} />
        </>
      )}
    </div>
  );
}

interface PickerOption<T extends string> {
  id: T;
  label: string;
  dot: string;
  tint: string;
  text: string;
}

/** Три состояния в ряд: статус решения (Хо-Рен-Со) или итог самопроверки */
function Picker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: PickerOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {options.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            aria-pressed={active}
            className={
              'pressable flex flex-col items-start rounded-2xl px-3 py-3 text-left transition-colors duration-200 ' +
              (active
                ? // Тонкая рамка цветом состояния: видна и там, где подложки нет (киноварь в «Туши»)
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

interface Row {
  label: string;
  value: string;
}

const rowsOf = <K extends string>(fields: FieldDef<K>[], values: Record<K, string>): Row[] =>
  fields.map((f) => ({ label: f.label, value: values[f.key] }));

const hasSelfNotes = (e: Entry) =>
  Object.values(e.self).some(hasText) || e.confidence !== null || hasText(e.conclusion);

/**
 * Вопросы самопроверки по порядку формы. В записи, перешедшей в Хо-Рен-Со
 * (`asHistory`), версия уже в «Что я думаю», а вывод и итог показываем тут.
 */
function selfRows(e: Entry, asHistory = false): Row[] {
  const [alternatives, feelings, verify] = SELF_FIELDS.map((f) => ({ label: f.label, value: e.self[f.key] }));
  return [
    ...(asHistory ? [] : [{ label: SELF_VERSION_FIELD.label, value: e.thoughts.understanding }]),
    alternatives,
    feelings,
    { label: 'Уверенность', value: e.confidence === null ? '' : `${e.confidence} %` },
    verify,
    ...(asHistory
      ? [
          { label: 'Итог', value: e.verdict === 'unclear' ? '' : VERDICT_META[e.verdict].label },
          { label: 'Вывод для себя', value: e.conclusion },
        ]
      : []),
  ];
}

function Block({ kicker, title, rows }: { kicker: string; title: string; rows: Row[] }) {
  const filled = rows.filter((r) => hasText(r.value));
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
          {filled.map((r) => (
            <div key={r.label} className="px-5 py-4">
              <dt className="text-[13px] text-ink-faint">{r.label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-[16px] leading-relaxed">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** Нижняя кнопка самопроверки: если нужно кому-то сказать — перейти в Хо-Рен-Со */
function BottomAction({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-gradient-to-t from-ivory via-ivory to-ivory/0 pt-6">
        <div className="mx-auto max-w-2xl px-4" style={{ paddingBottom: 'calc(14px + var(--safe-bottom))' }}>
          <button
            type="button"
            onClick={onClick}
            className="pressable flex h-14 w-full items-center justify-center gap-2 rounded-full bg-paper text-[16px] font-semibold text-ink shadow-lift"
          >
            <span className="font-serif text-[20px] leading-none text-ink-soft">報</span>
            Сказать команде
          </button>
        </div>
      </div>
    </div>
  );
}
