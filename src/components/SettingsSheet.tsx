'use client';

import { FONTS, THEMES } from '@/lib/appearance';
import { AUTO, COMM_ACCENTS, THEME_GROUPS, themeById, type ThemeDef } from '@/lib/themes';
import { usePrefs } from '@/store/prefs';
import { BottomSheet } from './BottomSheet';
import { IconCheck } from './icons';

/**
 * Настройки оформления. Выбор применяется сразу: и сама шторка,
 * и страница над затемнением перекрашиваются «вживую».
 */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = usePrefs((s) => s.theme);
  const font = usePrefs((s) => s.font);
  const setTheme = usePrefs((s) => s.setTheme);
  const setFont = usePrefs((s) => s.setFont);

  return (
    <BottomSheet open={open} onClose={onClose} title="Оформление">
      {THEME_GROUPS.map((g, gi) => (
        <section key={g.id} className={gi ? 'mt-7' : 'mt-1'}>
          <h3 className="eyebrow">{g.name}</h3>
          <p className="mt-1 text-[13px] text-ink-faint">{g.note}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {THEMES.filter((t) => t.group === g.id).map((t) => (
              <ThemeCard key={t.id} active={t.id === theme} onClick={() => setTheme(t.id)} name={t.name} note={t.note}>
                <Preview t={t} />
              </ThemeCard>
            ))}
            {g.id === 'ink' && (
              <ThemeCard
                active={theme === AUTO.id}
                onClick={() => setTheme(AUTO.id)}
                name="Как в системе"
                note="Днём с пометками, ночью Суми"
              >
                {/* Половина дня и половина ночи */}
                <span className="flex overflow-hidden rounded-xl">
                  <Preview t={themeById(AUTO.light)} half />
                  <Preview t={themeById(AUTO.dark)} half />
                </span>
              </ThemeCard>
            )}
          </div>
        </section>
      ))}

      <h3 className="eyebrow mt-8">Шрифты</h3>
      <div className="card mt-3 divide-y divide-line">
        {FONTS.map((f) => {
          const active = f.id === font;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFont(f.id)}
              aria-pressed={active}
              className="flex w-full items-center gap-4 px-4 py-4 text-left"
            >
              <span className="w-14 shrink-0 text-center text-[34px] leading-none" style={{ fontFamily: f.display }}>
                Аа
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[20px] leading-tight" style={{ fontFamily: f.display }}>
                  {f.name}
                </span>
                <span className="mt-1 block text-[13px] leading-snug text-ink-soft" style={{ fontFamily: f.text }}>
                  {f.note}
                </span>
              </span>
              <span
                className={
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ' +
                  (active ? 'bg-ink text-ivory' : 'ring-1 ring-line')
                }
              >
                {active && <IconCheck />}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-[13px] leading-relaxed text-ink-faint">
        Настройки хранятся на этом устройстве. «Системный» шрифт не загружается из сети — лучший выбор для
        медленного интернета.
      </p>
    </BottomSheet>
  );
}

function ThemeCard({
  active,
  onClick,
  name,
  note,
  children,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={'pressable relative rounded-2xl p-1.5 text-left ' + (active ? 'ring-2 ring-ink' : 'ring-1 ring-line')}
    >
      {children}
      <span className="block px-1.5 pb-1 pt-2">
        <span className="block text-[14px] font-semibold leading-tight">{name}</span>
        <span className="mt-0.5 block text-[12px] leading-tight text-ink-faint">{note}</span>
      </span>
      {active && <Check />}
    </button>
  );
}

/** Мини-превью из данных схемы: фон, карточка, строки текста, open и точки Хо/Рен/Со */
function Preview({ t, half }: { t: ThemeDef; half?: boolean }) {
  const { bg, paper, ink } = t.base;
  return (
    <span className={'block p-2.5 ' + (half ? 'w-1/2' : 'rounded-xl')} style={{ background: bg }}>
      <span className="block rounded-lg p-2" style={{ background: paper }}>
        <span className="block h-1.5 w-3/4 rounded-full" style={{ background: ink }} />
        <span className="mt-1.5 block h-1.5 w-1/2 rounded-full opacity-40" style={{ background: ink }} />
        <span className="mt-2 flex gap-1">
          {(['open', ...COMM_ACCENTS] as const).map((a) => (
            <span key={a} className="block h-1.5 w-1.5 rounded-full" style={{ background: t.accents[a] }} />
          ))}
        </span>
      </span>
    </span>
  );
}

function Check() {
  return (
    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-ivory shadow-card">
      <IconCheck />
    </span>
  );
}
