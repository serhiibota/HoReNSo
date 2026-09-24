export type FactKey = 'what' | 'who' | 'whereWhen' | 'evidence';
export type ThoughtKey = 'understanding' | 'opportunities' | 'risks' | 'actions' | 'advice';

export type Facts = Record<FactKey, string>;
export type Thoughts = Record<ThoughtKey, string>;

/** «Для себя» — самопроверка восприятия; «Для команды» — Хо-Рен-Со */
export type EntryMode = 'self' | 'team';

/** Вопросы самопроверки. «Моя версия» — общее поле thoughts.understanding */
export type SelfKey = 'alternatives' | 'feelings' | 'verify';
export type SelfNotes = Record<SelfKey, string>;

/** Итог самопроверки */
export type Verdict = 'unclear' | 'confirmed' | 'refuted';

/** Состояние решения: нужны меры → меры приняты → есть результат */
export type EntryStatus = 'open' | 'acting' | 'done';

/** Хо — сообщить, Рен — информировать, Со — посоветоваться */
export type CommType = 'ho' | 'ren' | 'so';

export interface CommEvent {
  type: CommType;
  at: number;
}

export interface Entry {
  id: string;
  createdAt: number;
  updatedAt: number;
  mode: EntryMode;
  facts: Facts;
  thoughts: Thoughts;
  /** Хо-Рен-Со: состояние решения */
  status: EntryStatus;
  comms: CommEvent[];
  /** Самопроверка: вопросы, уверенность 0–100, вывод и итог */
  self: SelfNotes;
  confidence: number | null;
  conclusion: string;
  verdict: Verdict;
}

export interface Draft {
  /** id редактируемой записи или null для новой */
  editingId: string | null;
  mode: EntryMode;
  facts: Facts;
  thoughts: Thoughts;
  self: SelfNotes;
  confidence: number | null;
}
