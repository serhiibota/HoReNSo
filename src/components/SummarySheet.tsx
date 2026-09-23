'use client';

import { useEffect, useState } from 'react';
import { COMM_META } from '@/lib/fields';
import { canShare, copyText, shareText } from '@/lib/share';
import { buildSummary } from '@/lib/summary';
import type { CommType, Entry } from '@/lib/types';
import { BottomSheet } from './BottomSheet';
import { IconCheck, IconCopy, IconShare } from './icons';

interface Props {
  entry: Entry;
  type: CommType | null;
  onClose: () => void;
  onSent: (type: CommType) => void;
}

export function SummarySheet({ entry, type, onClose, onSent }: Props) {
  // Держим последний тип, чтобы контент не пропадал во время анимации закрытия
  const [shownType, setShownType] = useState<CommType>(type ?? 'ho');
  const [copied, setCopied] = useState(false);
  const [shareable, setShareable] = useState(false);

  useEffect(() => {
    if (type) {
      setShownType(type);
      setCopied(false);
    }
  }, [type]);

  useEffect(() => setShareable(canShare()), []);

  const meta = COMM_META[shownType];
  const text = buildSummary(entry, shownType);

  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true);
      onSent(shownType);
    }
  };

  const share = async () => {
    if (await shareText(`${meta.ru} · ${meta.verb}`, text)) onSent(shownType);
  };

  return (
    <BottomSheet
      open={type !== null}
      onClose={onClose}
      title={`${meta.kanji}  ${meta.verb}`}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copy}
            className={
              'pressable flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-200 ' +
              (shareable ? 'bg-mist text-ink' : 'bg-ink text-ivory')
            }
          >
            {copied ? <IconCheck /> : <IconCopy />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
          {shareable && (
            <button
              type="button"
              onClick={share}
              className="pressable flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-ivory"
            >
              <IconShare />
              Поделиться
            </button>
          )}
        </div>
      }
    >
      <p className="text-[14px] text-ink-soft">{meta.description}</p>
      <pre
        className={
          'mt-4 whitespace-pre-wrap break-words rounded-2xl p-5 font-sans text-[15px] leading-relaxed text-ink ' + meta.tint
        }
      >
        {text}
      </pre>
    </BottomSheet>
  );
}
