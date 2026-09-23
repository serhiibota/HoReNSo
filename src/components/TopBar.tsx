import type { ReactNode } from 'react';

interface Props {
  left?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
}

/**
 * Липкая шапка. Фон — сплошной цвет с лёгкой прозрачностью,
 * без backdrop-filter (он роняет FPS на A10 при прокрутке).
 */
export function TopBar({ left, title, right }: Props) {
  return (
    <header
      className="sticky top-0 z-30 bg-ivory/95"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-[44px] items-center">{left}</div>
        <div className="min-w-0 flex-1 truncate text-center text-[16px] font-semibold">{title}</div>
        <div className="flex min-w-[44px] items-center justify-end">{right}</div>
      </div>
    </header>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  className = '',
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={'pressable flex h-11 w-11 items-center justify-center rounded-full text-ink-soft ' + className}
    >
      {children}
    </button>
  );
}
