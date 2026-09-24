'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { STATUS_META, STATUS_ORDER } from '@/lib/fields';
import { firstLine } from '@/lib/format';
import type { EntryStatus } from '@/lib/types';
import { isDraftEmpty, useEntries } from '@/store/entries';
import { useHydrated } from '@/store/useHydrated';
import { EntryCard } from './EntryCard';
import { Fab } from './Fab';
import { HelpSheet } from './HelpSheet';
import { IconQuestion, IconSettings } from './icons';
import { SettingsSheet } from './SettingsSheet';
import { IconButton } from './TopBar';

type Filter = 'all' | 'self' | EntryStatus;

export function Feed() {
  const hydrated = useHydrated();
  const entries = useEntries((s) => s.entries);
  const draft = useEntries((s) => s.draft);
  const [filter, setFilter] = useState<Filter>('all');
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const counts = useMemo(() => {
    // Статусы — только у записей Хо-Рен-Со; самопроверки считаются отдельно
    const c: Record<EntryStatus | 'self', number> = { open: 0, acting: 0, done: 0, self: 0 };
    entries.forEach((e) => (e.mode === 'self' ? c.self++ : c[e.status]++));
    return c;
  }, [entries]);

  const visible =
    filter === 'all'
      ? entries
      : filter === 'self'
        ? entries.filter((e) => e.mode === 'self')
        : entries.filter((e) => e.mode === 'team' && e.status === filter);
  const hasDraft = hydrated && draft.editingId === null && !isDraftEmpty(draft);

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-2xl px-5" style={{ paddingTop: 'calc(20px + var(--safe-top))' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="eyebrow">報 · 連 · 相</div>
            <h1 className="mt-2 font-serif text-[40px] leading-none">Хо-Рен-Со</h1>
            <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-ink-soft">
              Вижу → думаю → проверяю себя или говорю команде.
            </p>
          </div>
          <div className="-mr-2 mt-1 flex gap-2">
            <IconButton label="Оформление" onClick={() => setSettingsOpen(true)} className="bg-paper shadow-card">
              <IconSettings />
            </IconButton>
            <IconButton label="Как это работает" onClick={() => setHelpOpen(true)} className="bg-paper shadow-card">
              <IconQuestion />
            </IconButton>
          </div>
        </div>

        {hydrated && entries.length > 0 && (
          <nav className="-mx-5 mt-7 overflow-x-auto px-5" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex gap-2 pb-1">
              <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
                Все <span className="text-ink-faint">{entries.length}</span>
              </Chip>
              {counts.self > 0 && (
                <Chip active={filter === 'self'} onClick={() => setFilter('self')}>
                  Для себя <span className="text-ink-faint">{counts.self}</span>
                </Chip>
              )}
              {STATUS_ORDER.map((s) => (
                <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
                  <span className={'h-1.5 w-1.5 rounded-full ' + STATUS_META[s].dot} />
                  {STATUS_META[s].short} <span className="text-ink-faint">{counts[s]}</span>
                </Chip>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-bar pt-5">
        {hasDraft && (
          <Link
            href="/new"
            className="pressable mb-4 flex items-center justify-between gap-3 rounded-xl2 border border-dashed border-line bg-paper/60 px-5 py-4"
          >
            <span className="min-w-0">
              <span className="eyebrow block">Черновик</span>
              <span className="mt-1 block truncate text-[15px]">
                {firstLine(draft.facts.what) || firstLine(draft.thoughts.understanding) || 'Продолжить запись'}
              </span>
            </span>
            <span className="shrink-0 text-[14px] font-semibold text-ink-soft">Продолжить</span>
          </Link>
        )}

        {!hydrated ? (
          <Skeleton />
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-[15px] text-ink-faint">Здесь пока пусто.</p>
        ) : (
          <ul className="space-y-4">
            {visible.map((e, i) => (
              <EntryCard key={e.id} entry={e} index={i} />
            ))}
          </ul>
        )}
      </main>

      <Fab href="/new" />
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'pressable flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-colors duration-200 ' +
        (active ? 'bg-ink text-ivory' : 'bg-paper text-ink shadow-card')
      }
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="card fade-up mt-2 px-6 py-10 text-center">
      <div className="font-serif text-[44px] leading-none text-ink-faint">相</div>
      <h2 className="mt-4 font-serif text-[24px]">Первая запись</h2>
      <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-ink-soft">
        Опишите ситуацию: сначала факты, затем мысли. Для себя — проверьте свою версию; для команды — выберите,
        как сообщить.
      </p>
      <Link
        href="/new"
        className="pressable mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-[15px] font-semibold text-ivory"
      >
        Начать
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <ul className="space-y-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i} className="card h-36 opacity-60" />
      ))}
    </ul>
  );
}
