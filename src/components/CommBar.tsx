'use client';

import { COMM_META, COMM_ORDER } from '@/lib/fields';
import type { CommType } from '@/lib/types';

/** Нижняя панель действий Хо-Рен-Со. Отступ снизу — под панель Safari и safe area */
export function CommBar({ onPick }: { onPick: (type: CommType) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-gradient-to-t from-ivory via-ivory to-ivory/0 pt-6">
        <div className="mx-auto max-w-2xl px-4" style={{ paddingBottom: 'calc(14px + var(--safe-bottom))' }}>
          <div className="card grid grid-cols-3 gap-1 p-1.5 shadow-lift">
            {COMM_ORDER.map((t) => {
              const m = COMM_META[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onPick(t)}
                  className={'pressable flex flex-col items-center rounded-2xl py-2.5 ' + m.tint}
                >
                  <span className={'font-serif text-[24px] leading-none ' + m.text}>{m.kanji}</span>
                  <span className="mt-1.5 text-[13px] font-semibold leading-none">{m.ru}</span>
                  <span className="mt-1 text-[11px] leading-none text-ink-soft">{m.verb}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
