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

// ─── Решение ────────────────────────────────────────────────────────────

export interface DecisionOption {
  id: string;
  text: string;
}

/** Взвешенный пункт «за» или «против»: вес 1–3 */
export interface WeightedItem {
  id: string;
  text: string;
  weight: 1 | 2 | 3;
}

/** Квадрат Декарта: 1 — что получу, если сделаю; 2 — что потеряю, если сделаю;
 *  3 — что получу, если не сделаю; 4 — чего избегу, если не сделаю */
export type SquareKey = 'q1' | 'q2' | 'q3' | 'q4';

export interface ProConTool {
  view: 'list' | 'square';
  pros: WeightedItem[];
  cons: WeightedItem[];
  square: Record<SquareKey, string>;
}

export interface TenTool {
  minutes: string;
  months: string;
  years: string;
}

export interface PremortemTool {
  reasons: string;
  prevent: string;
}

export type Reversibility = 'easy' | 'costly' | 'irreversible';

export interface ReversibleTool {
  level: Reversibility | null;
  cost: string;
}

export interface Tools {
  procon?: ProConTool;
  ten?: TenTool;
  premortem?: PremortemTool;
  reversible?: ReversibleTool;
}

/** Пересмотр: качество решения и результат оцениваются отдельно */
export type Grade = 'good' | 'bad';
export interface Review {
  at: number;
  decision: Grade | null;
  outcome: Grade | null;
  notes: string;
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
  /** Решение: вопрос, варианты, выбор, уверенность, пересмотр */
  question: string;
  options: DecisionOption[];
  choiceId: string | null;
  decisionConfidence: number | null;
  reviewAt: number | null;
  review: Review | null;
  tools: Tools;
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
