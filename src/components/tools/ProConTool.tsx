'use client';

import { useState, type KeyboardEvent } from 'react';
import { hasText } from '@/lib/format';
import { createId } from '@/lib/id';
import { SQUARE, emptyProCon, weightSum } from '@/lib/tools';
import type { Entry, ProConTool as ProCon, WeightedItem } from '@/lib/types';
import { useEntries } from '@/store/entries';
import { AutoTextarea } from '../AutoTextarea';
import { SegmentedControl } from '../SegmentedControl';

type Side = 'pros' | 'cons';

/**
 * За и против: список с весами 1–3 или квадрат Декарта. Переключение не
 * теряет данных: при первом переходе в квадрат «за» попадает в клетку 1,
 * «против» — в клетку 2; оба вида хранятся рядом.
 */
export function ProConTool({ entry }: { entry: Entry }) {
  const setTool = useEntries((s) => s.setTool);
  const t = entry.tools.procon ?? emptyProCon();
  const save = (next: ProCon) => setTool(entry.id, 'procon', next);

  const switchView = (view: ProCon['view']) => {
    if (view === 'square' && !Object.values(t.square).some(hasText)) {
      const join = (items: WeightedItem[]) => items.map((i) => i.text).join('\n');
      save({ ...t, view, square: { ...t.square, q1: join(t.pros), q2: join(t.cons) } });
    } else {
      save({ ...t, view });
    }
  };

  return (
    <div>
      <SegmentedControl
        options={[
          { value: 'list', label: 'Список', sub: 'с весами' },
          { value: 'square', label: 'Квадрат Декарта', sub: 'делать или нет' },
        ]}
        value={t.view}
        onChange={switchView}
      />
      {t.view === 'list' ? <ListView t={t} save={save} /> : <SquareView t={t} save={save} />}
    </div>
  );
}

function ListView({ t, save }: { t: ProCon; save: (t: ProCon) => void }) {
  const pros = weightSum(t.pros);
  const cons = weightSum(t.cons);
  const total = pros + cons;

  const update = (side: Side, items: WeightedItem[]) => save({ ...t, [side]: items });

  return (
    <div className="mt-5 space-y-4">
      {total > 0 && (
        <div className="card px-5 py-4">
          <div className="flex justify-between text-[14px]">
            <span>
              За <b className="font-semibold">{pros}</b>
            </span>
            <span>
              Против <b className="font-semibold">{cons}</b>
            </span>
          </div>
          {/* Полоса баланса: ширины — обычные проценты, без анимации layout */}
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-mist">
            <div className="bg-done" style={{ width: `${(pros / total) * 100}%` }} />
            <div className="bg-so" style={{ width: `${(cons / total) * 100}%` }} />
          </div>
          <p className="mt-2 text-[13px] text-ink-soft">
            Счёт — подсказка, а не приговор. Если итог не совпадает с ощущением, спросите себя, что не записано.
          </p>
        </div>
      )}
      <SideList title="За" dot="bg-done" items={t.pros} onChange={(items) => update('pros', items)} />
      <SideList title="Против" dot="bg-so" items={t.cons} onChange={(items) => update('cons', items)} />
    </div>
  );
}

function SideList({
  title,
  dot,
  items,
  onChange,
}: {
  title: string;
  dot: string;
  items: WeightedItem[];
  onChange: (items: WeightedItem[]) => void;
}) {
  const [text, setText] = useState('');

  const add = () => {
    if (!hasText(text)) return;
    onChange([...items, { id: createId(), text: text.trim(), weight: 2 }]);
    setText('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  };
  const set = (id: string, fields: Partial<WeightedItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...fields } : i)));

  return (
    <section className="card">
      <h2 className="flex items-center gap-2 px-5 pt-4 font-serif text-[21px]">
        <span className={'h-2 w-2 rounded-full ' + dot} />
        {title}
        <span className="ml-auto font-sans text-[13px] text-ink-faint">вес 1–3</span>
      </h2>
      <ul className="mt-2 divide-y divide-line">
        {items.map((i) => (
          <li key={i.id} className="flex items-start gap-2 px-5 py-3">
            <AutoTextarea
              value={i.text}
              onValueChange={(v) => set(i.id, { text: v })}
              minRows={1}
              aria-label={`${title}: пункт`}
              className="min-w-0 flex-1 py-1"
            />
            <Weight value={i.weight} onChange={(w) => set(i.id, { weight: w })} />
            <button
              type="button"
              aria-label="Удалить пункт"
              onClick={() => onChange(items.filter((x) => x.id !== i.id))}
              className="pressable -mr-2 h-9 w-9 shrink-0 text-[20px] leading-none text-ink-faint"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-line px-5 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder={items.length ? 'Ещё пункт…' : 'Первый пункт…'}
          enterKeyHint="done"
          className="min-w-0 flex-1 bg-transparent py-1 placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          disabled={!hasText(text)}
          className="pressable rounded-full bg-mist px-4 py-2 text-[14px] font-semibold disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
    </section>
  );
}

/** Вес важности: три точки, тап — следующий вес по кругу */
function Weight({ value, onChange }: { value: 1 | 2 | 3; onChange: (w: 1 | 2 | 3) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === 3 ? 1 : ((value + 1) as 2 | 3))}
      aria-label={`Важность ${value} из 3, изменить`}
      className="pressable flex h-9 shrink-0 items-center gap-1 px-1"
    >
      {[1, 2, 3].map((n) => (
        <span key={n} className={'h-2 w-2 rounded-full ' + (n <= value ? 'bg-ink' : 'bg-line')} />
      ))}
    </button>
  );
}

function SquareView({ t, save }: { t: ProCon; save: (t: ProCon) => void }) {
  return (
    <div className="mt-5 space-y-4">
      <p className="px-1 text-[14px] leading-relaxed text-ink-soft">
        Список «за и против» смотрит только на «если сделаю». Квадрат честно показывает и цену бездействия.
      </p>
      {SQUARE.map((q, i) => (
        <div key={q.key} className="card px-5 py-4">
          <label htmlFor={`sq-${q.key}`} className="block">
            <span className="eyebrow">
              {i + 1} · {q.axis}
            </span>
            <span className="mt-1 block font-serif text-[21px] leading-snug">{q.title}</span>
          </label>
          <AutoTextarea
            id={`sq-${q.key}`}
            value={t.square[q.key]}
            onValueChange={(v) => save({ ...t, square: { ...t.square, [q.key]: v } })}
            placeholder="Каждый пункт — с новой строки"
            minRows={2}
            className="mt-2"
          />
        </div>
      ))}
    </div>
  );
}
