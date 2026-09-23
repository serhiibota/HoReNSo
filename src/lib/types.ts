export type FactKey = 'what' | 'who' | 'whereWhen' | 'evidence';
export type ThoughtKey = 'understanding' | 'opportunities' | 'risks' | 'actions' | 'advice';

export type Facts = Record<FactKey, string>;
export type Thoughts = Record<ThoughtKey, string>;

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
  facts: Facts;
  thoughts: Thoughts;
  status: EntryStatus;
  comms: CommEvent[];
}

export interface Draft {
  /** id редактируемой записи или null для новой */
  editingId: string | null;
  facts: Facts;
  thoughts: Thoughts;
}
