import type { CommType, EntryMode, EntryStatus, FactKey, Facts, SelfKey, SelfNotes, ThoughtKey, Thoughts, Verdict } from './types';

export interface FieldDef<K extends string> {
  key: K;
  label: string;
  hint: string;
  placeholder: string;
}

export const FACT_FIELDS: FieldDef<FactKey>[] = [
  {
    key: 'what',
    label: 'Что происходит?',
    hint: 'События и ситуация — без оценок',
    placeholder: 'Поставщик сообщил, что партия придёт на 5 дней позже…',
  },
  {
    key: 'who',
    label: 'Кто вовлечён?',
    hint: 'Люди, команды, роли',
    placeholder: 'Менеджер поставщика, наш склад, клиент Х',
  },
  {
    key: 'whereWhen',
    label: 'Где / когда?',
    hint: 'Место, дата, сроки',
    placeholder: 'Сегодня, 10:30, звонок; поставка была на 14-е',
  },
  {
    key: 'evidence',
    label: 'Какие данные есть?',
    hint: 'Цифры, документы, доказательства',
    placeholder: 'Письмо от поставщика, график отгрузок',
  },
];

export const THOUGHT_FIELDS: FieldDef<ThoughtKey>[] = [
  {
    key: 'understanding',
    label: 'Как я это понимаю?',
    hint: 'Моя интерпретация и перспектива',
    placeholder: 'Похоже, у поставщика перегружено производство…',
  },
  {
    key: 'opportunities',
    label: 'Возможности',
    hint: 'Какие возможности я вижу?',
    placeholder: 'Предложить клиенту частичную поставку со склада',
  },
  {
    key: 'risks',
    label: 'Риски / угрозы',
    hint: 'Что стоит учитывать?',
    placeholder: 'Штраф по договору, потеря доверия клиента',
  },
  {
    key: 'actions',
    label: 'Действия',
    hint: 'Что нужно предпринять?',
    placeholder: 'Сегодня — предупредить клиента, завтра — найти резерв',
  },
  {
    key: 'advice',
    label: 'Совет',
    hint: 'Какой совет или мнение мне нужно?',
    placeholder: 'Стоит ли предлагать клиенту скидку?',
  },
];

/**
 * «Что я думаю» в режиме самопроверки. Первое поле — общее с Хо-Рен-Со
 * (thoughts.understanding), остальные — вопросы к собственной версии.
 * Уверенность (шкала 0–100 %) рисуется между «чувствами» и «проверкой».
 */
export const SELF_VERSION_FIELD: FieldDef<'understanding'> = {
  key: 'understanding',
  label: 'Моя версия',
  hint: 'Как я объясняю то, что увидел?',
  placeholder: 'Коллега не ответил, потому что игнорирует меня…',
};

export const SELF_FIELDS: FieldDef<SelfKey>[] = [
  {
    key: 'alternatives',
    label: 'Какие ещё объяснения возможны?',
    hint: 'Хотя бы два других',
    placeholder: 'Был на встрече; не увидел сообщение; ждёт данных от других…',
  },
  {
    key: 'feelings',
    label: 'Что я чувствую?',
    hint: 'Эмоция окрашивает то, что я «вижу»',
    placeholder: 'Раздражение, тревога',
  },
  {
    key: 'verify',
    label: 'Как проверить свою версию?',
    hint: 'Какой факт подтвердит или опровергнет её',
    placeholder: 'Спросить напрямую, когда будет ответ',
  },
];

export const emptySelf = (): SelfNotes => ({ alternatives: '', feelings: '', verify: '' });

export const MODE_META: Record<EntryMode, { label: string; title: string; note: string }> = {
  self: { label: 'Для себя', title: 'Самопроверка', note: 'Отделить увиденное от додуманного' },
  team: { label: 'Для команды', title: 'Хо-Рен-Со', note: 'Сообщить, информировать, посоветоваться' },
};

export const VERDICT_META: Record<Verdict, { label: string; dot: string; tint: string; text: string }> = {
  unclear: { label: 'Пока неясно', dot: 'bg-ink-faint', tint: 'bg-mist', text: 'text-ink-soft' },
  confirmed: { label: 'Подтвердилось', dot: 'bg-done', tint: 'bg-done-tint', text: 'text-done-ink' },
  // Цвет «Со», а не статуса: иначе в ленте совпадает с «Меры приняты»
  refuted: { label: 'Не подтвердилось', dot: 'bg-so', tint: 'bg-so-tint', text: 'text-so-ink' },
};

export const VERDICT_ORDER: Verdict[] = ['unclear', 'confirmed', 'refuted'];

export const emptyFacts = (): Facts => ({ what: '', who: '', whereWhen: '', evidence: '' });
export const emptyThoughts = (): Thoughts => ({
  understanding: '',
  opportunities: '',
  risks: '',
  actions: '',
  advice: '',
});

export const STATUS_META: Record<EntryStatus, { label: string; short: string; dot: string; tint: string; text: string }> = {
  open: { label: 'Требует мер', short: 'Нужны меры', dot: 'bg-open', tint: 'bg-open-tint', text: 'text-open-ink' },
  acting: { label: 'Меры приняты', short: 'В работе', dot: 'bg-acting', tint: 'bg-acting-tint', text: 'text-acting-ink' },
  done: { label: 'Есть результат', short: 'Результат', dot: 'bg-done', tint: 'bg-done-tint', text: 'text-done-ink' },
};

export const STATUS_ORDER: EntryStatus[] = ['open', 'acting', 'done'];

export const COMM_META: Record<
  CommType,
  { kanji: string; romaji: string; ru: string; verb: string; description: string; tint: string; text: string }
> = {
  ho: {
    kanji: '報',
    romaji: 'Хококу',
    ru: 'Хо',
    verb: 'Сообщить',
    description: 'Отчёт о прогрессе, результатах или проблемах',
    tint: 'bg-ho-tint',
    text: 'text-ho-ink',
  },
  ren: {
    kanji: '連',
    romaji: 'Ренраку',
    ru: 'Рен',
    verb: 'Информировать',
    description: 'Поделиться информацией, чтобы не было сюрпризов',
    tint: 'bg-ren-tint',
    text: 'text-ren-ink',
  },
  so: {
    kanji: '相',
    romaji: 'Содан',
    ru: 'Со',
    verb: 'Посоветоваться',
    description: 'Запросить совет, когда нет уверенности',
    tint: 'bg-so-tint',
    text: 'text-so-ink',
  },
};

export const COMM_ORDER: CommType[] = ['ho', 'ren', 'so'];
