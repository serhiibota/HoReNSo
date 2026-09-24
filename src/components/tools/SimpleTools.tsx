'use client';

import type { FieldDef } from '@/lib/fields';
import { REVERSIBILITY, emptyPremortem, emptyReversible, emptyTen } from '@/lib/tools';
import type { Entry, PremortemTool, Reversibility, TenTool } from '@/lib/types';
import { useEntries } from '@/store/entries';
import { AutoTextarea } from '../AutoTextarea';
import { FieldList } from '../FieldList';

const TEN_FIELDS: FieldDef<keyof TenTool>[] = [
  { key: 'minutes', label: 'Через 10 минут', hint: 'Сразу после решения', placeholder: 'Облегчение или тревога?' },
  { key: 'months', label: 'Через 10 месяцев', hint: 'Когда станут видны последствия', placeholder: 'Что изменится в жизни?' },
  { key: 'years', label: 'Через 10 лет', hint: 'Будет ли это вообще важно?', placeholder: 'Как я буду вспоминать это?' },
];

/** 10 / 10 / 10 — снимает остроту момента: эмоция живёт минуты, последствия — годы */
export function TenTool({ entry }: { entry: Entry }) {
  const setTool = useEntries((s) => s.setTool);
  const t = entry.tools.ten ?? emptyTen();
  return (
    <FieldList
      idPrefix="ten"
      fields={TEN_FIELDS}
      values={t}
      onChange={(k, v) => setTool(entry.id, 'ten', { ...t, [k]: v })}
    />
  );
}

const PREMORTEM_FIELDS: FieldDef<keyof PremortemTool>[] = [
  {
    key: 'reasons',
    label: 'Почему провалилось?',
    hint: 'Представьте, что это уже случилось. Каждая причина — с новой строки',
    placeholder: 'Не хватило денег на второй этап\nКлючевой человек ушёл',
  },
  {
    key: 'prevent',
    label: 'Что сделать заранее?',
    hint: 'Какие из причин можно предотвратить уже сейчас',
    placeholder: 'Заложить резерв 20 %',
  },
];

/** Премортем: «предположим, провалилось» — помогает увидеть риски без самоуверенности */
export function PremortemTool({ entry }: { entry: Entry }) {
  const setTool = useEntries((s) => s.setTool);
  const t = entry.tools.premortem ?? emptyPremortem();
  return (
    <FieldList
      idPrefix="pm"
      fields={PREMORTEM_FIELDS}
      values={t}
      onChange={(k, v) => setTool(entry.id, 'premortem', { ...t, [k]: v })}
    />
  );
}

const LEVELS: Reversibility[] = ['easy', 'costly', 'irreversible'];

/** Обратимость — сколько вообще стоит думать над решением */
export function ReversibleTool({ entry }: { entry: Entry }) {
  const setTool = useEntries((s) => s.setTool);
  const t = entry.tools.reversible ?? emptyReversible();
  return (
    <div className="space-y-4">
      <div className="card divide-y divide-line" role="radiogroup" aria-label="Насколько обратимо">
        {LEVELS.map((l) => {
          const active = t.level === l;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTool(entry.id, 'reversible', { ...t, level: l })}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <span
                className={
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full ' +
                  (active ? 'bg-ink' : 'ring-1 ring-line')
                }
              >
                {active && <span className="h-2 w-2 rounded-full bg-ivory" />}
              </span>
              <span className="text-[16px] font-semibold">{REVERSIBILITY[l].label}</span>
            </button>
          );
        })}
      </div>
      {t.level && (
        <p className="rounded-2xl bg-mist px-5 py-4 text-[15px] leading-relaxed">{REVERSIBILITY[t.level].advice}</p>
      )}
      <div className="card px-5 py-4">
        <label htmlFor="rev-cost" className="block font-serif text-[21px]">
          Чего стоит откат?
        </label>
        <span className="mt-1 block text-[13px] text-ink-faint">Деньги, время, отношения, репутация</span>
        <AutoTextarea
          id="rev-cost"
          value={t.cost}
          onValueChange={(v) => setTool(entry.id, 'reversible', { ...t, cost: v })}
          placeholder="Две недели и неловкий разговор"
          minRows={2}
          className="mt-2"
        />
      </div>
    </div>
  );
}
