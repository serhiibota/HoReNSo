import { hasText } from './format';
import type { Entry, PremortemTool, ProConTool, Reversibility, ReversibleTool, TenTool } from './types';

/**
 * Инструменты оценки решения. Каждый — короткая форма на 2–5 минут;
 * их можно проходить в любом порядке и сочетании.
 */
export type ToolId = 'facts' | 'procon' | 'ten' | 'premortem' | 'reversible';

export interface ToolMeta {
  id: ToolId;
  name: string;
  question: string;
  when: string;
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'facts',
    name: 'Факт или вывод',
    question: 'Что я видел, а что додумал?',
    when: 'Решение опирается на чьё-то поведение или слухи',
  },
  {
    id: 'procon',
    name: 'За и против',
    question: 'Что за, что против — и насколько это важно?',
    when: 'Нужно разложить всё по полочкам. Есть вид «квадрат Декарта»',
  },
  {
    id: 'ten',
    name: '10 / 10 / 10',
    question: 'Что я подумаю через 10 минут, 10 месяцев, 10 лет?',
    when: 'Сильная эмоция прямо сейчас',
  },
  {
    id: 'premortem',
    name: 'Премортем',
    question: 'Прошло полгода, решение провалилось. Почему?',
    when: 'Кажется, что всё очевидно и отлично',
  },
  {
    id: 'reversible',
    name: 'Обратимость',
    question: 'Можно ли откатить и чего это стоит?',
    when: 'Понять, сколько вообще думать: обратимое решают быстро',
  },
];

export const toolMeta = (id: ToolId) => TOOLS.find((t) => t.id === id)!;

// ─── Пустые значения ───────────────────────────────────────────────────

export const emptyProCon = (): ProConTool => ({
  view: 'list',
  pros: [],
  cons: [],
  square: { q1: '', q2: '', q3: '', q4: '' },
});
export const emptyTen = (): TenTool => ({ minutes: '', months: '', years: '' });
export const emptyPremortem = (): PremortemTool => ({ reasons: '', prevent: '' });
export const emptyReversible = (): ReversibleTool => ({ level: null, cost: '' });

// ─── Квадрат Декарта ──────────────────────────────────────────────────

export const SQUARE = [
  { key: 'q1', title: 'Что получу, если сделаю?', axis: 'Сделаю · будет' },
  { key: 'q2', title: 'Что потеряю, если сделаю?', axis: 'Сделаю · не будет' },
  { key: 'q3', title: 'Что получу, если не сделаю?', axis: 'Не сделаю · будет' },
  { key: 'q4', title: 'Чего избегу, если не сделаю?', axis: 'Не сделаю · не будет' },
] as const;

export const REVERSIBILITY: Record<Reversibility, { label: string; advice: string }> = {
  easy: { label: 'Легко откатить', advice: 'Решайте быстро: ошибку дёшево исправить.' },
  costly: { label: 'Откатить можно, но дорого', advice: 'Стоит подумать, но без паралича: назовите цену отката.' },
  irreversible: { label: 'Необратимо', advice: 'Не торопитесь: пройдите премортем и спросите совета.' },
};

export const weightSum = (items: { weight: number }[]) => items.reduce((s, i) => s + i.weight, 0);

const lines = (text: string) => text.split('\n').filter(hasText).length;

// ─── Краткий итог для карточки решения ─────────────────────────────────

/** Строка-итог инструмента или null, если он не заполнен */
export function toolSummary(id: ToolId, e: Entry): string | null {
  switch (id) {
    case 'facts': {
      const facts = Object.values(e.facts).filter(hasText).length;
      if (!facts && !hasText(e.thoughts.understanding)) return null;
      const verdict =
        e.mode === 'self' && e.verdict !== 'unclear'
          ? e.verdict === 'confirmed'
            ? ' · версия подтвердилась'
            : ' · версия не подтвердилась'
          : '';
      return `Фактов: ${facts}/4${verdict}`;
    }
    case 'procon': {
      const t = e.tools.procon;
      if (!t) return null;
      if (t.view === 'square') {
        const filled = Object.values(t.square).filter(hasText).length;
        return filled ? `Квадрат Декарта · ${filled}/4` : null;
      }
      if (!t.pros.length && !t.cons.length) return null;
      return `За ${weightSum(t.pros)} · против ${weightSum(t.cons)}`;
    }
    case 'ten': {
      const t = e.tools.ten;
      const filled = t ? [t.minutes, t.months, t.years].filter(hasText).length : 0;
      return filled ? `Заполнено ${filled}/3` : null;
    }
    case 'premortem': {
      const t = e.tools.premortem;
      const n = t ? lines(t.reasons) : 0;
      return n ? `Причин провала: ${n}` : null;
    }
    case 'reversible': {
      const t = e.tools.reversible;
      return t?.level ? REVERSIBILITY[t.level].label : null;
    }
  }
}
