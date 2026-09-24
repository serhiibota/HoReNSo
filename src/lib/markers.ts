/**
 * Подсказки самопроверки: слова, которые выдают вывод или оценку
 * там, где должно быть наблюдение.
 *
 * Без регулярок с lookbehind (их нет в Safari до 16.4): текст режется
 * на слова, каждое сравнивается с основами.
 */

export type MarkerKind = 'general' | 'judgement' | 'mind';

export const MARKER_META: Record<MarkerKind, { label: string; hint: string }> = {
  general: { label: 'Обобщение', hint: 'Сколько раз на самом деле? Когда именно?' },
  judgement: { label: 'Оценка', hint: 'Что именно произошло, без ярлыка?' },
  mind: { label: 'Домысел', hint: 'Откуда я это знаю? Это видно или додумано?' },
};

// Точные слова — короткие и частые, по основе дали бы ложные совпадения
const EXACT: Record<string, MarkerKind> = {
  всегда: 'general',
  никогда: 'general',
  опять: 'general',
  снова: 'general',
  вечно: 'general',
  все: 'general',
  всё: 'general',
  никто: 'general',
  ничего: 'general',
  явно: 'mind',
  точно: 'mind',
  конечно: 'mind',
  наверняка: 'mind',
  назло: 'mind',
};

// Основы — ловят словоформы: «специально», «специальный», «ленивый», «ленится»…
const STEMS: [string, MarkerKind][] = [
  ['постоянн', 'general'],
  ['каждый', 'general'],
  ['ужасн', 'judgement'],
  ['плох', 'judgement'],
  ['отвратит', 'judgement'],
  ['глуп', 'judgement'],
  ['безответствен', 'judgement'],
  ['ленив', 'judgement'],
  ['лени', 'judgement'],
  ['некомпетент', 'judgement'],
  ['неадекват', 'judgement'],
  ['хамск', 'judgement'],
  ['хамит', 'judgement'],
  ['груб', 'judgement'],
  ['бесполезн', 'judgement'],
  ['очевидн', 'mind'],
  ['специальн', 'mind'],
  ['нарочн', 'mind'],
  ['игнорир', 'mind'],
  ['хочет', 'mind'],
  ['хотел', 'mind'],
  ['пытает', 'mind'],
  ['пыталс', 'mind'],
  ['думает', 'mind'],
  ['считает', 'mind'],
  ['наверн', 'mind'],
];

export interface Marker {
  kind: MarkerKind;
  word: string;
}

/** Найденные маркеры без повторов, в порядке появления (не больше `limit`) */
export function findMarkers(text: string, limit = 6): Marker[] {
  const seen = new Set<string>();
  const out: Marker[] = [];
  for (const raw of text.toLowerCase().split(/[^a-zа-яё]+/)) {
    if (!raw || seen.has(raw)) continue;
    const kind = EXACT[raw] ?? STEMS.find(([stem]) => raw.startsWith(stem))?.[1];
    if (!kind) continue;
    seen.add(raw);
    out.push({ kind, word: raw });
    if (out.length >= limit) break;
  }
  return out;
}
