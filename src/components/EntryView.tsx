'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  COMM_META,
  FACT_FIELDS,
  SELF_FIELDS,
  SELF_VERSION_FIELD,
  STATUS_META,
  STATUS_ORDER,
  THOUGHT_FIELDS,
  VERDICT_META,
  VERDICT_ORDER,
  type FieldDef,
} from '@/lib/fields';
import { firstLine, formatDate, formatDateTime, hasText } from '@/lib/format';
import { createId } from '@/lib/id';
import { goBack } from '@/lib/nav';
import { TOOLS, toolSummary, type ToolId } from '@/lib/tools';
import type { CommType, Entry, Grade, Review } from '@/lib/types';
import { isReviewDue, useEntries } from '@/store/entries';
import { useHydrated } from '@/store/useHydrated';
import { AutoTextarea } from './AutoTextarea';
import { CommBar } from './CommBar';
import { ConfidenceCard } from './ConfidenceCard';
import { IconBack, IconTrash } from './icons';
import { SummarySheet } from './SummarySheet';
import { IconButton, TopBar } from './TopBar';

/**
 * Карточка решения: вопрос → варианты и выбор → инструменты → пересмотр.
 * Внизу — «Сообщить решение» (Хо/Рен/Со) или, для записей «для себя»,
 * кнопка, которая включает этот блок.
 */
export function EntryView({ id }: { id: string | null }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const entry = useEntries((s) => s.entries.find((e) => e.id === id));
  const setStatus = useEntries((s) => s.setStatus);
  const logComm = useEntries((s) => s.logComm);
  const remove = useEntries((s) => s.remove);
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

  const onDelete = () => {
    if (window.confirm('Удалить запись? Это действие нельзя отменить.')) {
      remove(entry.id);
      router.replace('/');
    }
  };

  const title =
    firstLine(entry.question, 140) ||
    firstLine(entry.facts.what, 140) ||
    firstLine(entry.thoughts.understanding, 140) ||
    'Без названия';

  return (
    <div className="min-h-screen">
      <TopBar
        left={back}
        right={
          <IconButton label="Удалить" onClick={onDelete} className="-mr-2">
            <IconTrash />
          </IconButton>
        }
      />

      <main className="fade-up mx-auto max-w-2xl px-4 pb-[calc(9rem+var(--safe-bottom))]">
        <div className="px-1">
          <div className="eyebrow">{formatDateTime(entry.createdAt)}</div>
          <h1 className="mt-2 font-serif text-[30px] leading-tight">{title}</h1>
        </div>

        {isReviewDue(entry) && (
          <a href="#review" className="mt-5 block rounded-2xl bg-open-tint px-5 py-4 text-open-ink ring-1 ring-inset ring-current">
            <span className="block text-[15px] font-semibold">Пора пересмотреть решение</span>
            <span className="mt-0.5 block text-[13px]">Как вышло? Оцените решение и результат отдельно.</span>
          </a>
        )}

        <Picker
          options={STATUS_ORDER.map((st) => ({ id: st, ...STATUS_META[st] }))}
          value={entry.status}
          onChange={(st) => setStatus(entry.id, st)}
        />

        <DecisionSection entry={entry} />
        <ToolsSection entry={entry} />
        <FactsSection entry={entry} />
        <ReviewSection entry={entry} />

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

      {entry.mode === 'self' ? (
        <BottomAction onClick={() => toTeam(entry.id)} />
      ) : (
        <>
          <CommBar onPick={setComm} />
          <SummarySheet entry={entry} type={comm} onClose={() => setComm(null)} onSent={(t) => logComm(entry.id, t)} />
        </>
      )}
    </div>
  );
}

// ─── Варианты и выбор ──────────────────────────────────────────────────

const DAY = 864e5;
const REVIEW_PRESETS = [
  { label: 'Через неделю', days: 7 },
  { label: 'Через месяц', days: 30 },
  { label: 'Через 3 месяца', days: 91 },
];

function DecisionSection({ entry }: { entry: Entry }) {
  const patchEntry = useEntries((s) => s.patchEntry);
  const [draft, setDraft] = useState('');
  const set = (fields: Partial<Entry>) => patchEntry(entry.id, fields);

  const addOption = () => {
    if (!hasText(draft)) return;
    set({ options: [...entry.options, { id: createId(), text: draft.trim() }] });
    setDraft('');
  };

  return (
    <section className="mt-8">
      <div className="px-1">
        <div className="eyebrow">Решение</div>
        <h2 className="mt-1 font-serif text-[24px]">Варианты и выбор</h2>
      </div>

      <div className="card mt-3 divide-y divide-line" role="radiogroup" aria-label="Выбранный вариант">
        {entry.options.map((o) => {
          const active = entry.choiceId === o.id;
          return (
            <div key={o.id} className="flex items-center gap-3 px-5 py-3">
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`Выбрать: ${o.text}`}
                onClick={() => set({ choiceId: active ? null : o.id })}
                className={
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full ' +
                  (active ? 'bg-ink' : 'ring-1 ring-line')
                }
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-ivory" />}
              </button>
              <input
                value={o.text}
                onChange={(e) =>
                  set({ options: entry.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })
                }
                aria-label="Вариант"
                className={'min-w-0 flex-1 bg-transparent py-1 focus:outline-none ' + (active ? 'font-semibold' : '')}
              />
              <button
                type="button"
                aria-label="Удалить вариант"
                onClick={() =>
                  set({
                    options: entry.options.filter((x) => x.id !== o.id),
                    choiceId: active ? null : entry.choiceId,
                  })
                }
                className="pressable -mr-2 h-9 w-9 shrink-0 text-[20px] leading-none text-ink-faint"
              >
                ×
              </button>
            </div>
          );
        })}
        <div className="flex items-center gap-2 px-5 py-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOption()}
            placeholder={entry.options.length ? 'Ещё вариант…' : 'Первый вариант…'}
            enterKeyHint="done"
            className="min-w-0 flex-1 bg-transparent py-1 placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={addOption}
            disabled={!hasText(draft)}
            className="pressable rounded-full bg-mist px-4 py-2 text-[14px] font-semibold disabled:opacity-40"
          >
            Добавить
          </button>
        </div>
      </div>

      {entry.choiceId && (
        <div className="mt-4 space-y-4">
          <ConfidenceCard
            id="decision-confidence"
            title="Уверенность в выборе"
            hint="Запишите сейчас — при пересмотре станет видно, насколько вы были точны"
            value={entry.decisionConfidence}
            onChange={(v) => set({ decisionConfidence: v })}
          />
          <div className="card px-5 py-4">
            <div className="font-serif text-[21px]">Когда пересмотреть?</div>
            <span className="mt-1 block text-[13px] text-ink-faint">
              {entry.reviewAt
                ? `Напомню ${formatDate(entry.reviewAt)} — при открытии приложения`
                : 'Вернуться и сравнить ожидания с тем, как вышло'}
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {REVIEW_PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => set({ reviewAt: Date.now() + p.days * DAY })}
                  className="pressable rounded-full bg-mist px-4 py-2 text-[14px]"
                >
                  {p.label}
                </button>
              ))}
              {entry.reviewAt && (
                <button
                  type="button"
                  onClick={() => set({ reviewAt: null })}
                  className="pressable rounded-full px-4 py-2 text-[14px] text-ink-soft"
                >
                  Не нужно
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Инструменты ───────────────────────────────────────────────────────

function toolHref(id: ToolId, entryId: string) {
  return id === 'facts' ? `/new?id=${entryId}` : `/tool?id=${entryId}&t=${id}`;
}

function ToolsSection({ entry }: { entry: Entry }) {
  return (
    <section className="mt-8">
      <div className="px-1">
        <div className="eyebrow">Инструменты</div>
        <h2 className="mt-1 font-serif text-[24px]">Взвесить решение</h2>
        <p className="mt-1 text-[14px] text-ink-soft">Любые, в любом порядке — хватит и одного.</p>
      </div>
      <ul className="card mt-3 divide-y divide-line">
        {TOOLS.map((t) => {
          const summary = toolSummary(t.id, entry);
          return (
            <li key={t.id}>
              <Link href={toolHref(t.id, entry.id)} className="flex items-center gap-3 px-5 py-4">
                <span
                  aria-hidden
                  className={'h-2 w-2 shrink-0 rounded-full ' + (summary ? 'bg-ink' : 'ring-1 ring-ink-faint')}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold leading-tight">{t.name}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
                    {summary ?? t.question}
                  </span>
                </span>
                <span aria-hidden className="text-[18px] text-ink-faint">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Факт или вывод (подробно) ─────────────────────────────────────────

function FactsSection({ entry }: { entry: Entry }) {
  const setVerdict = useEntries((s) => s.setVerdict);
  const setConclusion = useEntries((s) => s.setConclusion);
  const self = entry.mode === 'self';
  const hasFacts = Object.values(entry.facts).some(hasText) || hasText(entry.thoughts.understanding);
  if (!hasFacts && !hasSelfNotes(entry)) return null;

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="eyebrow">Инструмент</div>
          <h2 className="mt-1 font-serif text-[24px]">Факт или вывод</h2>
        </div>
        <Link href={`/new?id=${entry.id}`} className="pb-1 text-[14px] font-semibold text-ink-soft">
          Изменить
        </Link>
      </div>
      <Rows kicker="Что я вижу" rows={rowsOf(FACT_FIELDS, entry.facts)} />
      {self ? (
        <>
          <Rows kicker="Что я думаю" rows={selfRows(entry)} />
          <div className="mt-4 px-1 text-[13px] text-ink-faint">Итог проверки версии</div>
          <Picker
            options={VERDICT_ORDER.map((v) => ({ id: v, ...VERDICT_META[v] }))}
            value={entry.verdict}
            onChange={(v) => setVerdict(entry.id, v)}
            compact
          />
          <div className="card mt-4 px-5 py-4">
            <label htmlFor="conclusion" className="block text-[13px] text-ink-faint">
              Вывод для себя
            </label>
            <AutoTextarea
              id="conclusion"
              value={entry.conclusion}
              onValueChange={(v) => setConclusion(entry.id, v)}
              placeholder="Что я теперь думаю? Что сделаю иначе?"
              minRows={2}
              autoCapitalize="sentences"
              className="mt-1"
            />
          </div>
        </>
      ) : (
        <>
          <Rows kicker="Что я думаю" rows={rowsOf(THOUGHT_FIELDS, entry.thoughts)} />
          {hasSelfNotes(entry) && <Rows kicker="Самопроверка" rows={selfRows(entry, true)} />}
        </>
      )}
    </section>
  );
}

// ─── Пересмотр ─────────────────────────────────────────────────────────

/** Решение и результат — разные вещи: хорошее решение может не повезти */
const OUTCOME_MATRIX: Record<`${Grade}-${Grade}`, { title: string; text: string }> = {
  'good-good': { title: 'Заслуженный успех', text: 'Решение было верным — и сработало. Что стоит повторять?' },
  'good-bad': { title: 'Невезение', text: 'Решение было разумным, результат подвёл. Не наказывайте себя за случай.' },
  'bad-good': { title: 'Повезло', text: 'Результат хороший вопреки решению. Не принимайте удачу за мастерство.' },
  'bad-bad': { title: 'Урок', text: 'Что вы бы сделали иначе с той информацией, что была тогда?' },
};

function ReviewSection({ entry }: { entry: Entry }) {
  const patchEntry = useEntries((s) => s.patchEntry);
  if (!entry.reviewAt && !entry.review && entry.status !== 'done') return null;

  const r: Review = entry.review ?? { at: Date.now(), decision: null, outcome: null, notes: '' };
  const set = (fields: Partial<Review>) => patchEntry(entry.id, { review: { ...r, ...fields, at: Date.now() } });
  const verdict = r.decision && r.outcome ? OUTCOME_MATRIX[`${r.decision}-${r.outcome}`] : null;
  const expected = entry.decisionConfidence;

  return (
    <section id="review" className="mt-8 scroll-mt-20">
      <div className="px-1">
        <div className="eyebrow">Пересмотр</div>
        <h2 className="mt-1 font-serif text-[24px]">Как вышло?</h2>
        {expected !== null && (
          <p className="mt-1 text-[14px] text-ink-soft">Тогда вы были уверены на {expected} %.</p>
        )}
      </div>
      <div className="card mt-3 px-5 py-4">
        <AutoTextarea
          value={r.notes}
          onValueChange={(v) => set({ notes: v })}
          placeholder="Что произошло на самом деле?"
          aria-label="Как вышло"
          minRows={2}
          autoCapitalize="sentences"
        />
      </div>
      <GradeRow
        label="Решение было…"
        hint="по той информации, что была тогда"
        value={r.decision}
        onChange={(g) => set({ decision: g })}
        good="Разумным"
        bad="Ошибочным"
      />
      <GradeRow
        label="Результат…"
        hint="что получилось на деле"
        value={r.outcome}
        onChange={(g) => set({ outcome: g })}
        good="Хороший"
        bad="Плохой"
      />
      {verdict && (
        <div className="mt-4 rounded-2xl bg-mist px-5 py-4">
          <div className="text-[15px] font-semibold">{verdict.title}</div>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{verdict.text}</p>
        </div>
      )}
    </section>
  );
}

function GradeRow({
  label,
  hint,
  value,
  onChange,
  good,
  bad,
}: {
  label: string;
  hint: string;
  value: Grade | null;
  onChange: (g: Grade) => void;
  good: string;
  bad: string;
}) {
  return (
    <div className="mt-4">
      <div className="px-1 text-[15px] font-semibold">
        {label} <span className="font-normal text-ink-faint">{hint}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label={label}>
        {(['good', 'bad'] as Grade[]).map((g) => {
          const active = value === g;
          return (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(g)}
              className={
                'pressable rounded-2xl px-4 py-3 text-[15px] font-semibold ' +
                (active ? 'bg-ink text-ivory' : 'bg-paper text-ink shadow-card')
              }
            >
              {g === 'good' ? good : bad}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Общие элементы ────────────────────────────────────────────────────

interface PickerOption<T extends string> {
  id: T;
  label: string;
  dot: string;
  tint: string;
  text: string;
}

/** Три состояния в ряд: статус решения или итог проверки версии */
function Picker<T extends string>({
  options,
  value,
  onChange,
  compact,
}: {
  options: PickerOption<T>[];
  value: T;
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div className={'grid grid-cols-3 gap-2 ' + (compact ? 'mt-2' : 'mt-6')}>
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
    { label: 'Уверенность', value: e.confidence === null ? '' : `${e.confidence} %` },
    verify,
    ...(asHistory
      ? [
          { label: 'Итог', value: e.verdict === 'unclear' ? '' : VERDICT_META[e.verdict].label },
          { label: 'Вывод для себя', value: e.conclusion },
        ]
      : []),
  ];
}

function Rows({ kicker, rows }: { kicker: string; rows: Row[] }) {
  const filled = rows.filter((r) => hasText(r.value));
  if (!filled.length) return null;
  return (
    <>
      <div className="mt-4 px-1 text-[13px] text-ink-faint">{kicker}</div>
      <dl className="card mt-2 divide-y divide-line">
        {filled.map((r) => (
          <div key={r.label} className="px-5 py-4">
            <dt className="text-[13px] text-ink-faint">{r.label}</dt>
            <dd className="mt-1 whitespace-pre-wrap text-[16px] leading-relaxed">{r.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/** Запись «для себя»: блок Хо/Рен/Со включается, только когда нужно сказать другим */
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
            Сообщить решение
          </button>
        </div>
      </div>
    </div>
  );
}
