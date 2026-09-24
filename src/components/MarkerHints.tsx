import { MARKER_META, findMarkers, type MarkerKind } from '@/lib/markers';

/**
 * Подсказки под полем факта в режиме самопроверки: слова, похожие на вывод
 * или оценку. Не подчёркивание внутри textarea (на iOS это оверлей и лаги),
 * а спокойная строка под полем.
 */
export function MarkerHints({ text }: { text: string }) {
  const markers = findMarkers(text);
  if (!markers.length) return null;

  const byKind = new Map<MarkerKind, string[]>();
  markers.forEach((m) => byKind.set(m.kind, [...(byKind.get(m.kind) ?? []), m.word]));

  return (
    <div className="mt-3 space-y-2" aria-live="polite">
      {[...byKind].map(([kind, words]) => (
        <div key={kind} className="rounded-xl bg-mist px-3 py-2 text-[13px] leading-snug">
          <span className="font-semibold text-ink">{MARKER_META[kind].label}: </span>
          <span className="text-ink">{words.map((w) => `«${w}»`).join(', ')}</span>
          <span className="block text-ink-soft">{MARKER_META[kind].hint}</span>
        </div>
      ))}
    </div>
  );
}
