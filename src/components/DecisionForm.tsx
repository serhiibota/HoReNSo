'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasText } from '@/lib/format';
import { goBack } from '@/lib/nav';
import { useEntries } from '@/store/entries';
import { AutoTextarea } from './AutoTextarea';
import { IconBack } from './icons';
import { IconButton, TopBar } from './TopBar';

/**
 * Новое решение: только вопрос и варианты. Всё остальное — инструменты
 * на карточке решения, их проходят по желанию.
 */
export function DecisionForm() {
  const router = useRouter();
  const createDecision = useEntries((s) => s.createDecision);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const setOption = (i: number, v: string) => setOptions(options.map((o, j) => (j === i ? v : o)));
  const create = () => {
    const id = createDecision(question, options);
    router.replace(`/entry?id=${id}`);
  };

  return (
    <div className="min-h-screen">
      <TopBar
        left={
          <IconButton label="Назад" onClick={() => goBack(router)} className="-ml-2">
            <IconBack />
          </IconButton>
        }
        title="Новое решение"
      />
      <main className="mx-auto max-w-2xl px-4 pb-[calc(8rem+var(--safe-bottom))] pt-2">
        <div className="card px-5 py-5">
          <label htmlFor="question" className="block font-serif text-[24px] leading-snug">
            Что нужно решить?
          </label>
          <span className="mt-1 block text-[13px] text-ink-faint">Сформулируйте вопросом</span>
          <AutoTextarea
            id="question"
            value={question}
            onValueChange={setQuestion}
            placeholder="Переходить ли на новую работу?"
            minRows={2}
            autoCapitalize="sentences"
            className="mt-3 text-[18px]"
          />
        </div>

        <section className="card mt-4 px-5 py-5">
          <h2 className="font-serif text-[21px]">Варианты</h2>
          <span className="mt-1 block text-[13px] text-ink-faint">
            Хотя бы два. «Ничего не менять» — тоже вариант
          </span>
          <ul className="mt-3 space-y-2">
            {options.map((o, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-mist px-4 py-2">
                <span className="font-serif text-[15px] text-ink-faint">{i + 1}</span>
                <input
                  value={o}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={i === 0 ? 'Перейти' : i === 1 ? 'Остаться' : 'Ещё вариант'}
                  aria-label={`Вариант ${i + 1}`}
                  className="min-w-0 flex-1 bg-transparent py-1 placeholder:text-ink-faint focus:outline-none"
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOptions([...options, ''])}
            className="pressable mt-3 text-[14px] font-semibold text-ink-soft"
          >
            + Ещё вариант
          </button>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-gradient-to-t from-ivory via-ivory to-ivory/0 pt-6">
          <div className="mx-auto max-w-2xl px-4" style={{ paddingBottom: 'calc(14px + var(--safe-bottom))' }}>
            <button
              type="button"
              onClick={create}
              disabled={!hasText(question)}
              className="pressable h-14 w-full rounded-full bg-ink text-[16px] font-semibold text-ivory disabled:opacity-30"
            >
              Дальше: инструменты
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
