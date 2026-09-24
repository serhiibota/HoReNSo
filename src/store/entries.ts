'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { emptyFacts, emptySelf, emptyThoughts } from '@/lib/fields';
import { hasText } from '@/lib/format';
import { createId } from '@/lib/id';
import type {
  CommType,
  Draft,
  Entry,
  EntryMode,
  EntryStatus,
  FactKey,
  SelfKey,
  ThoughtKey,
  Tools,
  Verdict,
} from '@/lib/types';

interface EntriesState {
  entries: Entry[];
  /** Черновик переживает перезагрузку вкладки — Safari на iOS любит выгружать фоновые вкладки */
  draft: Draft;
  /** Режим последней сохранённой записи — с него начинается новая */
  lastMode: EntryMode;

  startNew: () => void;
  startEdit: (id: string) => void;
  setFact: (key: FactKey, value: string) => void;
  setThought: (key: ThoughtKey, value: string) => void;
  setDraftMode: (mode: EntryMode) => void;
  setSelf: (key: SelfKey, value: string) => void;
  setConfidence: (value: number | null) => void;
  /** Сохраняет черновик и возвращает id записи (или null, если черновик пуст) */
  saveDraft: () => string | null;
  discardDraft: () => void;

  setStatus: (id: string, status: EntryStatus) => void;
  logComm: (id: string, type: CommType) => void;
  setVerdict: (id: string, verdict: Verdict) => void;
  setConclusion: (id: string, text: string) => void;
  /** Мостик: самопроверка → Хо-Рен-Со, с сохранением фактов и мыслей */
  toTeam: (id: string) => void;

  /** Новое решение: вопрос и варианты; инструменты заполняются потом */
  createDecision: (question: string, options: string[]) => string;
  /** Точечное обновление записи (решение, пересмотр) */
  patchEntry: (id: string, fields: Partial<Entry>) => void;
  setTool: <K extends keyof Tools>(id: string, key: K, value: Tools[K]) => void;
  remove: (id: string) => void;
}

const emptyDraft = (mode: EntryMode = 'team'): Draft => ({
  editingId: null,
  mode,
  facts: emptyFacts(),
  thoughts: emptyThoughts(),
  self: emptySelf(),
  confidence: null,
});

export const isDraftEmpty = (d: Draft) =>
  !Object.values(d.facts).some(hasText) &&
  !Object.values(d.thoughts).some(hasText) &&
  !Object.values(d.self).some(hasText);

/** Поля решения по умолчанию — для новых записей и миграции старых */
export const decisionDefaults = (): Pick<
  Entry,
  'question' | 'options' | 'choiceId' | 'decisionConfidence' | 'reviewAt' | 'review' | 'tools'
> => ({
  question: '',
  options: [],
  choiceId: null,
  decisionConfidence: null,
  reviewAt: null,
  review: null,
  tools: {},
});

/** Пора пересмотреть: дата наступила, а пересмотра ещё не было */
export const isReviewDue = (e: Entry, now = Date.now()) => e.reviewAt !== null && e.reviewAt <= now && !e.review;

const patch = (entries: Entry[], id: string, fn: (e: Entry) => Partial<Entry>) =>
  entries.map((e) => (e.id === id ? { ...e, ...fn(e), updatedAt: Date.now() } : e));

export const useEntries = create<EntriesState>()(
  persist(
    (set, get) => ({
      entries: [],
      draft: emptyDraft(),
      lastMode: 'team',

      startNew: () => {
        // Не затираем начатый черновик новой записи
        if (get().draft.editingId !== null) set({ draft: emptyDraft(get().lastMode) });
        else if (isDraftEmpty(get().draft)) set((s) => ({ draft: { ...s.draft, mode: s.lastMode } }));
      },

      startEdit: (id) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;
        if (get().draft.editingId === id) return;
        set({
          draft: {
            editingId: id,
            mode: entry.mode,
            facts: { ...entry.facts },
            thoughts: { ...entry.thoughts },
            self: { ...entry.self },
            confidence: entry.confidence,
          },
        });
      },

      setFact: (key, value) =>
        set((s) => ({ draft: { ...s.draft, facts: { ...s.draft.facts, [key]: value } } })),

      setThought: (key, value) =>
        set((s) => ({ draft: { ...s.draft, thoughts: { ...s.draft.thoughts, [key]: value } } })),

      setDraftMode: (mode) => set((s) => ({ draft: { ...s.draft, mode } })),

      setSelf: (key, value) => set((s) => ({ draft: { ...s.draft, self: { ...s.draft.self, [key]: value } } })),

      setConfidence: (value) => set((s) => ({ draft: { ...s.draft, confidence: value } })),

      saveDraft: () => {
        const { draft, entries } = get();
        if (isDraftEmpty(draft)) return null;
        const now = Date.now();

        if (draft.editingId) {
          const id = draft.editingId;
          set({
            entries: patch(entries, id, () => ({
              mode: draft.mode,
              facts: draft.facts,
              thoughts: draft.thoughts,
              self: draft.self,
              confidence: draft.confidence,
            })),
            draft: emptyDraft(draft.mode),
            lastMode: draft.mode,
          });
          return id;
        }

        const entry: Entry = {
          id: createId(),
          createdAt: now,
          updatedAt: now,
          mode: draft.mode,
          facts: draft.facts,
          thoughts: draft.thoughts,
          status: 'open',
          comms: [],
          self: draft.self,
          confidence: draft.confidence,
          conclusion: '',
          verdict: 'unclear',
          ...decisionDefaults(),
        };
        set({ entries: [entry, ...entries], draft: emptyDraft(draft.mode), lastMode: draft.mode });
        return entry.id;
      },

      discardDraft: () => set((s) => ({ draft: emptyDraft(s.lastMode) })),

      setStatus: (id, status) => set((s) => ({ entries: patch(s.entries, id, () => ({ status })) })),

      setVerdict: (id, verdict) => set((s) => ({ entries: patch(s.entries, id, () => ({ verdict })) })),

      setConclusion: (id, conclusion) => set((s) => ({ entries: patch(s.entries, id, () => ({ conclusion })) })),

      createDecision: (question, options) => {
        const now = Date.now();
        const entry: Entry = {
          id: createId(),
          createdAt: now,
          updatedAt: now,
          mode: get().lastMode,
          facts: emptyFacts(),
          thoughts: emptyThoughts(),
          status: 'open',
          comms: [],
          self: emptySelf(),
          confidence: null,
          conclusion: '',
          verdict: 'unclear',
          ...decisionDefaults(),
          question: question.trim(),
          options: options.map((text) => text.trim()).filter(Boolean).map((text) => ({ id: createId(), text })),
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
        return entry.id;
      },

      patchEntry: (id, fields) => set((s) => ({ entries: patch(s.entries, id, () => fields) })),

      setTool: (id, key, value) =>
        set((s) => ({ entries: patch(s.entries, id, (e) => ({ tools: { ...e.tools, [key]: value } })) })),

      toTeam: (id) => set((s) => ({ entries: patch(s.entries, id, () => ({ mode: 'team', status: 'open' })) })),

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
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ entries: s.entries, draft: s.draft, lastMode: s.lastMode }),
      // v2: режим самопроверки (старые записи — «для команды»).
      // v3: решения и инструменты — у старых записей поля решения пустые.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as { entries?: Partial<Entry>[]; draft?: Partial<Draft>; lastMode?: EntryMode };
        const entries = (p.entries ?? []).map(
          (e) =>
            ({
              mode: 'team',
              self: emptySelf(),
              confidence: null,
              conclusion: '',
              verdict: 'unclear',
              ...decisionDefaults(),
              ...e,
            }) as Entry,
        );
        const draft = { ...emptyDraft(), ...(p.draft ?? {}) } as Draft;
        return { entries, draft, lastMode: p.lastMode ?? 'team' } as unknown as EntriesState;
      },
      // Гидрация вручную после монтирования — иначе расхождение SSR/клиент
      skipHydration: true,
    },
  ),
);
