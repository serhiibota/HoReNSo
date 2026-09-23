'use client';

import { useEffect, useRef, useState, type FocusEvent, type TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import { goBack } from '@/lib/nav';
import { FACT_FIELDS, THOUGHT_FIELDS } from '@/lib/fields';
import { hasText } from '@/lib/format';
import { isDraftEmpty, useEntries } from '@/store/entries';
import { FieldList } from './FieldList';
import { HelpSheet } from './HelpSheet';
import { IconBack, IconQuestion } from './icons';
import { SegmentedControl } from './SegmentedControl';
import { IconButton, TopBar } from './TopBar';

type Tab = 'see' | 'think';

const SWITCH_MS = 380;

export function EntryForm({ editId }: { editId: string | null }) {
  const router = useRouter();
  const draft = useEntries((s) => s.draft);
  const setFact = useEntries((s) => s.setFact);
  const setThought = useEntries((s) => s.setThought);
  const saveDraft = useEntries((s) => s.saveDraft);
  const discardDraft = useEntries((s) => s.discardDraft);

  const [tab, setTab] = useState<Tab>('see');
  // Пока идёт переход, обе панели видимы; после — неактивная сворачивается в 0,
  // чтобы высота страницы соответствовала текущей панели
  const [animating, setAnimating] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const store = useEntries.getState();
    if (editId) store.startEdit(editId);
    else store.startNew();
  }, [editId]);

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), SWITCH_MS + 60);
    return () => clearTimeout(t);
  }, [animating]);

  const switchTo = (next: Tab) => {
    if (next === tab) return;
    setAnimating(true);
    setTab(next);
    // Возвращаемся к началу формы, если пользователь пролистал вниз
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollTo(0, window.scrollY + top - 8);
  };

  // Лёгкий свайп между «Вижу» и «Думаю»: без следования за пальцем — только жест
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!swipe.current) return;
    const dx = e.changedTouches[0].clientX - swipe.current.x;
    const dy = e.changedTouches[0].clientY - swipe.current.y;
    swipe.current = null;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2) return;
    switchTo(dx < 0 ? 'think' : 'see');
  };

  // Переход фокуса между полями даёт blur→focus подряд — гасим мигание панели
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onFieldFocus = (e: FocusEvent) => {
    if (e.target.tagName !== 'TEXTAREA') return;
    clearTimeout(blurTimer.current);
    setTyping(true);
  };
  const onFieldBlur = () => {
    clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => setTyping(false), 120);
  };
  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const factsFilled = FACT_FIELDS.filter((f) => hasText(draft.facts[f.key])).length;
  const thoughtsFilled = THOUGHT_FIELDS.filter((f) => hasText(draft.thoughts[f.key])).length;
  const empty = isDraftEmpty(draft);

  const save = () => {
    const id = saveDraft();
    if (id) router.replace(`/entry?id=${id}`);
  };

  const cancel = () => {
    // Черновик новой записи остаётся в хранилище, правки существующей — сбрасываем
    if (editId) discardDraft();
    goBack(router);
  };

  const paneClass = (pane: Tab) =>
    'w-full shrink-0 lg:w-auto lg:visible lg:h-auto lg:overflow-visible ' +
    (pane !== tab && !animating ? 'invisible h-0 overflow-hidden' : '');

  return (
    <div className="min-h-screen">
      <TopBar
        left={
          <IconButton label="Назад" onClick={cancel} className="-ml-2">
            <IconBack />
          </IconButton>
        }
        title={editId ? 'Редактирование' : 'Новая запись'}
        right={
          <IconButton label="Как это работает" onClick={() => setHelpOpen(true)} className="-mr-2">
            <IconQuestion />
          </IconButton>
        }
      />

      <main
        className="mx-auto max-w-5xl px-4 pb-bar pt-2"
        onFocus={onFieldFocus}
        onBlur={onFieldBlur}
      >
        <div ref={topRef} className="lg:hidden">
          <SegmentedControl
            options={[
              { value: 'see', label: 'Что я вижу', sub: `факты · ${factsFilled}/${FACT_FIELDS.length}` },
              { value: 'think', label: 'Что я думаю', sub: `анализ · ${thoughtsFilled}/${THOUGHT_FIELDS.length}` },
            ]}
            value={tab}
            onChange={switchTo}
          />
        </div>

        <div className="mt-5 overflow-hidden lg:overflow-visible" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div
            className="gpu flex items-start transition-transform ease-ios lg:grid lg:grid-cols-2 lg:gap-8 lg:!transform-none"
            style={{
              transitionDuration: `${SWITCH_MS}ms`,
              transform: `translate3d(${tab === 'see' ? 0 : -100}%, 0, 0)`,
              WebkitTransform: `translate3d(${tab === 'see' ? 0 : -100}%, 0, 0)`,
            }}
          >
            <section className={paneClass('see')}>
              <PaneHeader
                kicker="Блок 1"
                title="Что я вижу"
                text="Зафиксируйте факты как они есть — без оценок и выводов."
              />
              <FieldList idPrefix="fact" fields={FACT_FIELDS} values={draft.facts} onChange={setFact} />
            </section>

            <section className={paneClass('think')}>
              <PaneHeader
                kicker="Блок 2"
                title="Что я думаю"
                text="Теперь — интерпретация: смысл, возможности, риски и следующий шаг."
              />
              <FieldList idPrefix="thought" fields={THOUGHT_FIELDS} values={draft.thoughts} onChange={setThought} />
            </section>
          </div>
        </div>
      </main>

      {/* Нижняя панель прячется, пока открыта клавиатура: в iOS 15 fixed-элементы
          при открытой клавиатуре «прыгают» и перекрывают поле ввода */}
      <div
        className="gpu fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-ios"
        style={{
          transform: typing ? 'translate3d(0, 120%, 0)' : 'translate3d(0, 0, 0)',
          WebkitTransform: typing ? 'translate3d(0, 120%, 0)' : 'translate3d(0, 0, 0)',
        }}
      >
        <div className="bg-gradient-to-t from-ivory via-ivory to-ivory/0 pt-6">
          <div
            className="mx-auto flex max-w-5xl gap-3 px-4"
            style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}
          >
            {tab === 'see' ? (
              <button
                type="button"
                onClick={() => switchTo('think')}
                className="pressable h-14 flex-1 rounded-full bg-ink text-[16px] font-semibold text-ivory lg:hidden"
              >
                Далее: что я думаю
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchTo('see')}
                className="pressable h-14 rounded-full bg-paper px-6 text-[16px] font-semibold text-ink shadow-card lg:hidden"
              >
                Факты
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={empty}
              className={
                'pressable h-14 flex-1 rounded-full text-[16px] font-semibold transition-opacity ' +
                (tab === 'see' ? 'hidden lg:block ' : '') +
                'bg-ink text-ivory disabled:opacity-30'
              }
            >
              {editId ? 'Сохранить изменения' : 'Сохранить запись'}
            </button>
          </div>
        </div>
      </div>

      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function PaneHeader({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="mb-4 px-1">
      <div className="eyebrow">{kicker}</div>
      <h1 className="mt-1 font-serif text-[30px] leading-tight">{title}</h1>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}
