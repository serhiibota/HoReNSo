'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { emptyFacts, emptyThoughts } from '@/lib/fields';
import { hasText } from '@/lib/format';
import { createId } from '@/lib/id';
import type { CommType, Draft, Entry, EntryStatus, FactKey, ThoughtKey } from '@/lib/types';

interface EntriesState {
  entries: Entry[];
  /** Черновик переживает перезагрузку вкладки — Safari на iOS любит выгружать фоновые вкладки */
  draft: Draft;

  startNew: () => void;
  startEdit: (id: string) => void;
  setFact: (key: FactKey, value: string) => void;
  setThought: (key: ThoughtKey, value: string) => void;
  /** Сохраняет черновик и возвращает id записи (или null, если черновик пуст) */
  saveDraft: () => string | null;
  discardDraft: () => void;

  setStatus: (id: string, status: EntryStatus) => void;
  logComm: (id: string, type: CommType) => void;
  remove: (id: string) => void;
}

const emptyDraft = (): Draft => ({ editingId: null, facts: emptyFacts(), thoughts: emptyThoughts() });

export const isDraftEmpty = (d: Draft) =>
  !Object.values(d.facts).some(hasText) && !Object.values(d.thoughts).some(hasText);

export const useEntries = create<EntriesState>()(
  persist(
    (set, get) => ({
      entries: [],
      draft: emptyDraft(),

      startNew: () => {
        // Не затираем начатый черновик новой записи
        if (get().draft.editingId !== null) set({ draft: emptyDraft() });
      },

      startEdit: (id) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;
        if (get().draft.editingId === id) return;
        set({ draft: { editingId: id, facts: { ...entry.facts }, thoughts: { ...entry.thoughts } } });
      },

      setFact: (key, value) =>
        set((s) => ({ draft: { ...s.draft, facts: { ...s.draft.facts, [key]: value } } })),

      setThought: (key, value) =>
        set((s) => ({ draft: { ...s.draft, thoughts: { ...s.draft.thoughts, [key]: value } } })),

      saveDraft: () => {
        const { draft, entries } = get();
        if (isDraftEmpty(draft)) return null;
        const now = Date.now();

        if (draft.editingId) {
          const id = draft.editingId;
          set({
            entries: entries.map((e) =>
              e.id === id ? { ...e, facts: draft.facts, thoughts: draft.thoughts, updatedAt: now } : e,
            ),
            draft: emptyDraft(),
          });
          return id;
        }

        const entry: Entry = {
          id: createId(),
          createdAt: now,
          updatedAt: now,
          facts: draft.facts,
          thoughts: draft.thoughts,
          status: 'open',
          comms: [],
        };
        set({ entries: [entry, ...entries], draft: emptyDraft() });
        return entry.id;
      },

      discardDraft: () => set({ draft: emptyDraft() }),

      setStatus: (id, status) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, status, updatedAt: Date.now() } : e)),
        })),

      logComm: (id, type) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, comms: [...e.comms, { type, at: Date.now() }] } : e,
          ),
        })),

      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    {
      name: 'horenso:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ entries: s.entries, draft: s.draft }),
      // Гидрация вручную после монтирования — иначе расхождение SSR/клиент
      skipHydration: true,
    },
  ),
);
