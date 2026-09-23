import { COMM_META, FACT_FIELDS, STATUS_META, THOUGHT_FIELDS, type FieldDef } from './fields';
import { formatDateTime, hasText } from './format';
import type { CommType, Entry, ThoughtKey } from './types';

type ThoughtField = FieldDef<ThoughtKey>;

/** Порядок и акценты блоков зависят от типа коммуникации */
const INTRO: Record<CommType, string> = {
  ho: 'Сообщаю о ситуации и текущем прогрессе.',
  ren: 'Делюсь информацией, чтобы все были в курсе.',
  so: 'Хочу посоветоваться — нужен ваш взгляд.',
};

const THOUGHT_ORDER: Record<CommType, ThoughtField[]> = {
  // Отчёт: понимание → действия → риски → возможности
  ho: pick(['understanding', 'actions', 'risks', 'opportunities']),
  // Информирование: факты важнее, из мыслей — только понимание и риски
  ren: pick(['understanding', 'risks']),
  // Совет: сначала вопрос, потом контекст
  so: pick(['advice', 'understanding', 'opportunities', 'risks', 'actions']),
};

function pick(keys: ThoughtKey[]): ThoughtField[] {
  return keys.map((k) => THOUGHT_FIELDS.find((f) => f.key === k)!);
}

function section(title: string, lines: string[]): string {
  if (!lines.length) return '';
  return `${title}\n${lines.join('\n')}`;
}

function bullet(label: string, value: string): string {
  const text = value.trim().replace(/\n+/g, '\n   ');
  return `• ${label.replace(/\?$/, '')}: ${text}`;
}

export function buildSummary(entry: Entry, type: CommType): string {
  const meta = COMM_META[type];
  const header = `${meta.kanji} ${meta.ru} · ${meta.verb}`;

  const facts = FACT_FIELDS.filter((f) => hasText(entry.facts[f.key])).map((f) =>
    bullet(f.label, entry.facts[f.key]),
  );
  const thoughts = THOUGHT_ORDER[type]
    .filter((f) => hasText(entry.thoughts[f.key]))
    .map((f) => bullet(f.label, entry.thoughts[f.key]));

  const blocks = [
    header,
    INTRO[type],
    section('ФАКТЫ — что я вижу', facts),
    section(type === 'so' ? 'ВОПРОС И КОНТЕКСТ' : 'АНАЛИЗ — что я думаю', thoughts),
    `Статус: ${STATUS_META[entry.status].label} · ${formatDateTime(entry.updatedAt)}`,
  ];

  return blocks.filter(Boolean).join('\n\n');
}
