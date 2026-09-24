#!/usr/bin/env node
/**
 * Проверка цветовых схем. Запуск перед коммитом: `npm run check:colors`.
 *
 * Для каждой схемы:
 *  - различимость: мин. RGB-расстояние внутри open/acting/done и внутри ho/ren/so ≥ 30;
 *  - контраст `*-ink` к `*-tint` ≥ 3,5:1 (текст и иконки на подложках),
 *    у статусов ≥ 4,5:1 — прежний уровень, ниже которого не опускаемся;
 *  - контраст `ink-faint` к `bg` ≥ 3:1;
 *  - тёмные схемы: контраст `*-on` к сплошной заливке `*` ≥ 3:1.
 * Печатает таблицу и завершается с кодом 1 при любом нарушении.
 *
 * Данные — src/lib/themes.ts (Node ≥ 22.18 запускает .ts без сборки).
 */
import { ACCENTS, COMM_ACCENTS, STATUS_ACCENTS, THEMES, contrast, resolveTheme, rgbDistance } from '../src/lib/themes.ts';

export const LIMITS = { distance: 30, inkOnTint: 3.5, statusInkOnTint: 4.5, faint: 3, onFill: 3 };

function minDistance(t, keys) {
  let min = Infinity;
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++) min = Math.min(min, rgbDistance(t[keys[i]], t[keys[j]]));
  return min;
}

function minBy(keys, fn) {
  return keys.map((k) => [k, fn(k)]).reduce((a, b) => (b[1] < a[1] ? b : a));
}

/** @param {{id: string, dark: boolean, tokens: Record<string,string>}[]} schemes */
export function check(schemes) {
  const rows = [];
  const errors = [];
  for (const { id, dark, tokens: t } of schemes) {
    const dStatus = minDistance(t, STATUS_ACCENTS);
    const dComm = minDistance(t, COMM_ACCENTS);
    const [statusKey, statusInk] = minBy(STATUS_ACCENTS, (k) => contrast(t[`${k}-ink`], t[`${k}-tint`]));
    const [commKey, commInk] = minBy(COMM_ACCENTS, (k) => contrast(t[`${k}-ink`], t[`${k}-tint`]));
    const faint = contrast(t['ink-faint'], t.bg);
    const [fillKey, onFill] = dark ? minBy(ACCENTS, (k) => contrast(t[`${k}-on`], t[k])) : ['', NaN];

    const fail = (cond, msg) => cond || errors.push(`${id}: ${msg}`);
    fail(dStatus >= LIMITS.distance, `статусы слишком похожи (${dStatus.toFixed(0)} < ${LIMITS.distance})`);
    fail(dComm >= LIMITS.distance, `Хо/Рен/Со слишком похожи (${dComm.toFixed(0)} < ${LIMITS.distance})`);
    fail(statusInk >= LIMITS.statusInkOnTint, `${statusKey}-ink на ${statusKey}-tint ${statusInk.toFixed(2)} < ${LIMITS.statusInkOnTint}`);
    fail(commInk >= LIMITS.inkOnTint, `${commKey}-ink на ${commKey}-tint ${commInk.toFixed(2)} < ${LIMITS.inkOnTint}`);
    fail(faint >= LIMITS.faint, `ink-faint на bg ${faint.toFixed(2)} < ${LIMITS.faint}`);
    if (dark) fail(onFill >= LIMITS.onFill, `${fillKey}-on на ${fillKey} ${onFill.toFixed(2)} < ${LIMITS.onFill}`);

    rows.push({
      схема: id,
      'Δ статусы': dStatus.toFixed(0),
      'Δ Хо/Рен/Со': dComm.toFixed(0),
      'статус ink/tint': `${statusInk.toFixed(2)} (${statusKey})`,
      'Хо/Рен/Со ink/tint': `${commInk.toFixed(2)} (${commKey})`,
      'faint/bg': faint.toFixed(2),
      'иконка/заливка': dark ? `${onFill.toFixed(2)} (${fillKey})` : '—',
    });
  }
  return { rows, errors };
}

export function printTable(rows) {
  const cols = Object.keys(rows[0]);
  const width = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)));
  const line = (cells) => '│ ' + cells.map((v, i) => String(v).padEnd(width[i])).join(' │ ') + ' │';
  console.log(line(cols));
  console.log('├─' + width.map((w) => '─'.repeat(w)).join('─┼─') + '─┤');
  rows.forEach((r) => console.log(line(cols.map((c) => r[c]))));
  console.log(
    `Пороги: Δ ≥ ${LIMITS.distance}, ink/tint ≥ ${LIMITS.inkOnTint} (статусы ≥ ${LIMITS.statusInkOnTint}), faint/bg ≥ ${LIMITS.faint}, иконка на заливке (тёмные) ≥ ${LIMITS.onFill}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { rows, errors } = check(THEMES.map((t) => ({ id: t.id, dark: t.dark, tokens: resolveTheme(t) })));
  printTable(rows);
  if (errors.length) {
    console.error('\n✗ Нарушения:\n  ' + errors.join('\n  '));
    process.exit(1);
  }
  console.log('\n✓ Все схемы проходят проверку');
}
