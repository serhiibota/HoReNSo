'use client';

import { MODE_META } from '@/lib/fields';
import type { EntryMode } from '@/lib/types';

const ORDER: EntryMode[] = ['self', 'team'];

/** Выбор режима записи: самопроверка для себя или Хо-Рен-Со для команды */
export function ModeSwitch({ value, onChange }: { value: EntryMode; onChange: (m: EntryMode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Режим записи">
      {ORDER.map((m) => {
        const active = m === value;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m)}
            className={
              'pressable rounded-2xl px-4 py-3 text-left transition-colors duration-200 ' +
              (active ? 'bg-ink text-ivory' : 'bg-paper text-ink shadow-card')
            }
          >
            <span className="block text-[15px] font-semibold leading-tight">{MODE_META[m].label}</span>
            <span className={'mt-0.5 block text-[12px] leading-tight ' + (active ? 'text-ivory/70' : 'text-ink-faint')}>
              {MODE_META[m].title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
