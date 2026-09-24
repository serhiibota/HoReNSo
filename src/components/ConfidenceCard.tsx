'use client';

interface Props {
  id?: string;
  /** Номер вопроса в форме; без него — без номера */
  index?: number;
  title?: string;
  hint?: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

const STEPS = [0, 25, 50, 75, 100];

/**
 * «Насколько я уверен?» — шкала 0–100 %. Нативный range: на iOS 15 он
 * плавный и доступный; шаг 5 %, под шкалой — быстрые отметки.
 */
export function ConfidenceCard({
  id = 'self-confidence',
  index,
  title = 'Насколько я уверен?',
  hint = 'В своей версии, от 0 до 100 %',
  value,
  onChange,
}: Props) {
  return (
    <div className="card px-5 py-5">
      <label htmlFor={id} className="block">
        <span className="flex items-baseline gap-3">
          {index !== undefined && (
            <span className="font-serif text-[15px] text-ink-faint">{String(index).padStart(2, '0')}</span>
          )}
          <span className="font-serif text-[21px] leading-snug">{title}</span>
          <span className="ml-auto font-serif text-[22px] tabular-nums">{value === null ? '—' : `${value} %`}</span>
        </span>
        <span className={'mt-1 block text-[13px] text-ink-faint ' + (index !== undefined ? 'pl-8' : '')}>{hint}</span>
      </label>
      <div className={'mt-4 ' + (index !== undefined ? 'pl-8' : '')}>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={5}
          value={value ?? 50}
          onChange={(e) => onChange(Number(e.target.value))}
          className={'h-8 w-full accent-ink ' + (value === null ? 'opacity-40' : '')}
        />
        <div className="mt-1 flex justify-between">
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={'pressable -mx-1 px-1 py-1 text-[12px] ' + (value === s ? 'font-semibold text-ink' : 'text-ink-faint')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
