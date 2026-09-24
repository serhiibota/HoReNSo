'use client';

import { useRouter } from 'next/navigation';
import { goBack } from '@/lib/nav';
import { TOOLS, type ToolId } from '@/lib/tools';
import { useEntries } from '@/store/entries';
import { useHydrated } from '@/store/useHydrated';
import { IconBack } from './icons';
import { ProConTool } from './tools/ProConTool';
import { PremortemTool, ReversibleTool, TenTool } from './tools/SimpleTools';
import { IconButton, TopBar } from './TopBar';

const SCREENS = { procon: ProConTool, ten: TenTool, premortem: PremortemTool, reversible: ReversibleTool };

/** Экран одного инструмента. Всё сохраняется сразу — кнопки «Сохранить» нет */
export function ToolScreen({ id, tool }: { id: string | null; tool: string | null }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const entry = useEntries((s) => s.entries.find((e) => e.id === id));
  const meta = TOOLS.find((t) => t.id === tool && t.id !== 'facts');
  const back = (
    <IconButton label="Назад" onClick={() => goBack(router)} className="-ml-2">
      <IconBack />
    </IconButton>
  );

  if (!hydrated) return <TopBar left={back} />;
  if (!entry || !meta) {
    return (
      <div className="min-h-screen">
        <TopBar left={back} />
        <p className="px-6 py-20 text-center text-[15px] text-ink-faint">Инструмент не найден.</p>
      </div>
    );
  }

  const Screen = SCREENS[meta.id as Exclude<ToolId, 'facts'>];
  const question = entry.question.trim() || entry.facts.what.trim();

  return (
    <div className="min-h-screen">
      <TopBar left={back} title={meta.name} />
      <main className="fade-up mx-auto max-w-2xl px-4 pb-[calc(8rem+var(--safe-bottom))] pt-2">
        <div className="mb-5 px-1">
          {question && <div className="eyebrow truncate">{question}</div>}
          <h1 className="mt-2 font-serif text-[28px] leading-tight">{meta.question}</h1>
          <p className="mt-1 text-[14px] text-ink-soft">{meta.when}</p>
        </div>
        <Screen entry={entry} />
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-gradient-to-t from-ivory via-ivory to-ivory/0 pt-6">
          <div className="mx-auto max-w-2xl px-4" style={{ paddingBottom: 'calc(14px + var(--safe-bottom))' }}>
            <button
              type="button"
              onClick={() => goBack(router)}
              className="pressable h-14 w-full rounded-full bg-ink text-[16px] font-semibold text-ivory"
            >
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
