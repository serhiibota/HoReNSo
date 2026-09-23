'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  value: string;
  onValueChange: (value: string) => void;
  minRows?: number;
};

// useLayoutEffect ругается при SSR — на сервере подменяем на useEffect
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Поле, растущее по мере ввода. `field-sizing: content` в Safari 15 нет,
 * поэтому считаем высоту по scrollHeight. Сброс в 'auto' и чтение
 * scrollHeight — один синхронный reflow на ввод, это дёшево для одного поля.
 */
export function AutoTextarea({ value, onValueChange, minRows = 2, className = '', ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useIsoLayoutEffect(resize, [value, resize]);

  // Ширина меняется при повороте iPhone — высоту нужно пересчитать
  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={
        'block w-full resize-none overflow-hidden bg-transparent leading-relaxed text-ink ' +
        'placeholder:text-ink-faint/80 focus:outline-none ' +
        className
      }
      {...rest}
    />
  );
}
