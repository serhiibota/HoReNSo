import { COMM_META, FACT_FIELDS, STATUS_META, THOUGHT_FIELDS, type FieldDef } from './fields';
import { formatDateTime, hasText } from './format';
import { REVERSIBILITY, SQUARE, weightSum } from './tools';
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

const list = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('; ');

/** Содержание инструментов — то, что поймёт получатель, а не счётчики */
function toolLines(e: Entry): string[] {
  const out: string[] = [];
  const pc = e.tools.procon;
  if (pc?.view === 'square') {
    SQUARE.forEach((q) => hasText(pc.square[q.key]) && out.push(`• ${q.title.replace(/\?$/, '')}: ${list(pc.square[q.key])}`));
  } else if (pc && (pc.pros.length || pc.cons.length)) {
    const items = (xs: typeof pc.pros) => xs.map((i) => `${i.text}${i.weight > 1 ? ` (×${i.weight})` : ''}`).join('; ');
    if (pc.pros.length) out.push(`• За (${weightSum(pc.pros)}): ${items(pc.pros)}`);
    if (pc.cons.length) out.push(`• Против (${weightSum(pc.cons)}): ${items(pc.cons)}`);
  }
  const ten = e.tools.ten;
  if (ten) {
    const parts = [
      ['через 10 минут', ten.minutes],
      ['через 10 месяцев', ten.months],
      ['через 10 лет', ten.years],
    ].filter(([, v]) => hasText(v));
    if (parts.length) out.push(`• 10/10/10: ${parts.map(([k, v]) => `${k} — ${v.trim()}`).join('; ')}`);
  }
  const pm = e.tools.premortem;
  if (pm && hasText(pm.reasons)) out.push(`• Риски (премортем): ${list(pm.reasons)}`);
  if (pm && hasText(pm.prevent)) out.push(`• Что сделать заранее: ${list(pm.prevent)}`);
  const rev = e.tools.reversible;
  if (rev?.level) out.push(`• Обратимость: ${REVERSIBILITY[rev.level].label.toLowerCase()}${hasText(rev.cost) ? ` — ${rev.cost.trim()}` : ''}`);
  return out;
}

/** Блок решения: вопрос, варианты с отметкой выбора, содержание инструментов */
function decisionBlock(entry: Entry): string {
  if (!hasText(entry.question) && !entry.options.length) return '';
  const lines: string[] = [];
  if (hasText(entry.question)) lines.push(`• Вопрос: ${entry.question.trim()}`);
  entry.options.forEach((o) => {
    const chosen = o.id === entry.choiceId;
    const conf = chosen && entry.decisionConfidence !== null ? ` (уверенность ${entry.decisionConfidence}\u00a0%)` : '';
    lines.push(`${chosen ? '✓' : '○'} ${o.text}${conf}`);
  });
  const tools = toolLines(entry);
  return section('РЕШЕНИЕ', [...lines, ...tools]);
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
    decisionBlock(entry),
    section('ФАКТЫ — что я вижу', facts),
    section(type === 'so' ? 'ВОПРОС И КОНТЕКСТ' : 'АНАЛИЗ — что я думаю', thoughts),
    `Статус: ${STATUS_META[entry.status].label} · ${formatDateTime(entry.updatedAt)}`,
  ];

  return blocks.filter(Boolean).join('\n\n');
}
