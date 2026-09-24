'use client';

import { COMM_META, COMM_ORDER } from '@/lib/fields';
import { BottomSheet } from './BottomSheet';

const HABITS = [
  'Сначала факты, потом мысли. Отделяйте то, что видите, от того, что думаете.',
  'Сообщайте рано — плохие новости особенно. Маленькая проблема сегодня дешевле большой завтра.',
  'Коротко и по делу: одна запись — одна ситуация.',
  'Приходите за советом с вариантами, а не только с вопросом.',
  'Закрывайте цикл: отметьте, когда меры приняты и появился результат.',
];

const WHY = [
  { title: 'Ясность', text: 'Факты и интерпретации не смешиваются — меньше недопонимания.' },
  { title: 'Согласованность', text: 'Все участники знают одно и то же в одно и то же время.' },
  { title: 'Лучшие решения', text: 'Риски и возможности видны до того, как станет поздно.' },
  { title: 'Доверие', text: 'Предсказуемая коммуникация — основа надёжной команды.' },
  { title: 'Результат', text: 'Проблемы решаются быстрее, когда о них знают вовремя.' },
];

export function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Хо-Рен-Со">
      <p className="text-[15px] leading-relaxed text-ink-soft">
        Японский принцип осознанной коммуникации: вовремя сообщать, информировать и советоваться.
      </p>

      <div className="mt-6 space-y-3">
        {COMM_ORDER.map((t) => {
          const m = COMM_META[t];
          return (
            <div key={t} className={'flex items-start gap-4 rounded-2xl p-4 ' + m.tint}>
              <span className={'font-serif text-[30px] leading-none ' + m.text}>{m.kanji}</span>
              <div>
                <div className="text-[15px] font-semibold">
                  {m.ru} · {m.romaji} — {m.verb}
                </div>
                <div className="mt-1 text-[14px] leading-snug text-ink-soft">{m.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="eyebrow mt-8">Самопроверка — для себя</h3>
      <p className="mt-3 text-[15px] leading-relaxed">
        Хо-Рен-Со — правило рабочей коммуникации. Но прежде чем говорить, полезно проверить себя: что я
        действительно видел, а что додумал.
      </p>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-soft">
        <li>— В фактах подсвечиваются слова-выводы: «всегда», «специально», «очевидно».</li>
        <li>— Моя версия — одна из возможных: назовите хотя бы две другие.</li>
        <li>— Эмоция окрашивает восприятие — назовите её.</li>
        <li>— Оцените уверенность и решите, как проверить версию.</li>
        <li>— Отметьте итог: подтвердилось, не подтвердилось или пока неясно.</li>
      </ul>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Если после проверки понятно, что нужно кому-то сказать, — «Сказать команде» переведёт запись в Хо-Рен-Со.
      </p>

      <h3 className="eyebrow mt-8">Сделай это привычкой</h3>
      <ol className="mt-3 space-y-3">
        {HABITS.map((h, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
            <span className="font-serif text-[18px] leading-6 text-ink-faint">{i + 1}</span>
            <span>{h}</span>
          </li>
        ))}
      </ol>

      <h3 className="eyebrow mt-8">Почему это работает</h3>
      <dl className="mt-3 divide-y divide-line">
        {WHY.map((w) => (
          <div key={w.title} className="py-3">
            <dt className="font-serif text-[19px]">{w.title}</dt>
            <dd className="mt-0.5 text-[14px] leading-snug text-ink-soft">{w.text}</dd>
          </div>
        ))}
      </dl>
    </BottomSheet>
  );
}
