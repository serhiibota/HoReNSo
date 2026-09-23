'use client';

interface Option<T extends string> {
  value: T;
  label: string;
  sub?: string;
}

interface Props<T extends string> {
  options: [Option<T>, Option<T>];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Сегменты в стиле iOS. «Бегунок» двигается через translate3d —
 * анимация идёт на композиторе, без перерасчёта layout.
 */
export function SegmentedControl<T extends string>({ options, value, onChange, className = '' }: Props<T>) {
  const index = options[1].value === value ? 1 : 0;

  return (
    <div role="tablist" className={'relative grid grid-cols-2 rounded-full bg-mist p-1 ' + className}>
      <span
        aria-hidden
        className="gpu absolute bottom-1 left-1 top-1 rounded-full bg-paper shadow-card transition-transform duration-300 ease-ios"
        style={{
          width: 'calc(50% - 4px)',
          transform: `translate3d(${index * 100}%, 0, 0)`,
          WebkitTransform: `translate3d(${index * 100}%, 0, 0)`,
        }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={
              'relative z-10 flex flex-col items-center rounded-full px-3 py-2 transition-colors duration-200 ' +
              (active ? 'text-ink' : 'text-ink-soft')
            }
          >
            <span className="text-[15px] font-semibold leading-tight">{o.label}</span>
            {o.sub && <span className="mt-0.5 text-[11px] leading-none text-ink-faint">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
