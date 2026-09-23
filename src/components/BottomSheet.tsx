'use client';

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const DURATION = 380;

/**
 * Нижняя шторка без backdrop-filter: затемнение — обычный полупрозрачный
 * слой, сама шторка едет через translate3d. Закрывается свайпом вниз
 * за «ручку», тапом по фону или Esc.
 */
export function BottomSheet({ open, onClose, title, children, footer }: Props) {
  // mounted — в DOM; shown — в конечном положении (для анимации входа/выхода)
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Двойной rAF: браузер должен отрисовать стартовое положение до перехода
      let r2 = 0;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(r1);
        cancelAnimationFrame(r2);
      };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), DURATION);
    return () => clearTimeout(t);
  }, [open]);

  useBodyScrollLock(mounted);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const setY = (y: number, animate: boolean) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = animate ? '' : 'none';
    el.style.transform = y ? `translate3d(0, ${y}px, 0)` : '';
    el.style.webkitTransform = el.style.transform;
  };

  const onTouchStart = (e: TouchEvent) => {
    drag.current = { startY: e.touches[0].clientY, dy: 0 };
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!drag.current) return;
    const dy = Math.max(0, e.touches[0].clientY - drag.current.startY);
    drag.current.dy = dy;
    setY(dy, false);
  };
  const onTouchEnd = () => {
    const dy = drag.current?.dy ?? 0;
    drag.current = null;
    setY(0, true);
    if (dy > 90) onClose();
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 transition-opacity ease-ios"
        style={{ opacity: shown ? 1 : 0, transitionDuration: `${DURATION}ms` }}
      />
      <div
        ref={sheetRef}
        className="gpu absolute bottom-0 left-0 right-0 mx-auto flex max-h-[88vh] max-w-xl flex-col rounded-t-[28px] bg-paper shadow-sheet transition-transform ease-ios"
        style={{
          transform: shown ? undefined : 'translate3d(0, 100%, 0)',
          WebkitTransform: shown ? undefined : 'translate3d(0, 100%, 0)',
          transitionDuration: `${DURATION}ms`,
        }}
      >
        <div
          className="shrink-0 cursor-grab touch-none px-6 pb-2 pt-3"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-line" />
          {title && (
            <div className="mt-4 flex items-center justify-between">
              <h2 className="font-serif text-[26px] leading-tight">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="pressable -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-line px-6 pt-3" style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}>
            {footer}
          </div>
        )}
        {!footer && <div className="pb-safe" />}
      </div>
    </div>,
    document.body,
  );
}

/**
 * overflow:hidden на body в iOS Safari не блокирует прокрутку фона.
 * Надёжный способ — зафиксировать body и вернуть позицию после закрытия.
 */
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const y = window.scrollY;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, width: style.width };
    style.position = 'fixed';
    style.top = `-${y}px`;
    style.width = '100%';
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      window.scrollTo(0, y);
    };
  }, [locked]);
}
