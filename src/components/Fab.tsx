import Link from 'next/link';
import { IconPlus } from './icons';

/** Круглая кнопка «+» над нижней панелью Safari с учётом safe area */
export function Fab({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Новая запись"
      className="pressable gpu fixed right-5 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-ivory shadow-lift"
      style={{ bottom: 'calc(24px + var(--safe-bottom))' }}
    >
      <IconPlus />
    </Link>
  );
}
