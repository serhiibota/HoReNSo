'use client';

import type { ReactNode } from 'react';
import type { FieldDef } from '@/lib/fields';
import { AutoTextarea } from './AutoTextarea';

interface Props<K extends string> {
  idPrefix: string;
  fields: FieldDef<K>[];
  values: Record<K, string>;
  onChange: (key: K, value: string) => void;
  /** Номер первого поля — когда вопросы разбиты на несколько карточек */
  startIndex?: number;
  /** Что показать под полем (например, подсказки самопроверки) */
  renderAfter?: (key: K, value: string) => ReactNode;
}

/** Блок полей «страница блокнота»: одна белая карточка, поля разделены линиями */
export function FieldList<K extends string>({
  idPrefix,
  fields,
  values,
  onChange,
  startIndex = 0,
  renderAfter,
}: Props<K>) {
  return (
    <div className="card divide-y divide-line">
      {fields.map((f, i) => {
        const id = `${idPrefix}-${f.key}`;
        return (
          <div key={f.key} className="px-5 py-5">
            <label htmlFor={id} className="block">
              <span className="flex items-baseline gap-3">
                <span className="font-serif text-[15px] text-ink-faint">{String(startIndex + i + 1).padStart(2, '0')}</span>
                <span className="font-serif text-[21px] leading-snug">{f.label}</span>
              </span>
              <span className="mt-1 block pl-8 text-[13px] text-ink-faint">{f.hint}</span>
            </label>
            <div className="mt-3 pl-8">
              <AutoTextarea
                id={id}
                value={values[f.key]}
                onValueChange={(v) => onChange(f.key, v)}
                placeholder={f.placeholder}
                minRows={2}
                enterKeyHint="enter"
                autoCapitalize="sentences"
              />
              {renderAfter?.(f.key, values[f.key])}
            </div>
          </div>
        );
      })}
    </div>
  );
}
