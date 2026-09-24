import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope, PT_Sans, PT_Serif } from 'next/font/google';
import { AppearanceSync } from '@/components/AppearanceSync';
import { APPEARANCE_BOOT_SCRIPT } from '@/lib/appearance';
import './globals.css';

// Шрифты самохостятся next/font: без запросов к Google в рантайме,
// только нужные начертания и кириллица. Какая пара активна — решает
// data-font на <html> (см. globals.css); браузер качает только используемые.
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

// Не пара по умолчанию — без preload, чтобы не тратить трафик зря
const ptSerif = PT_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
  display: 'swap',
  preload: false,
});

const ptSans = PT_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
  preload: false,
});

const fontVars = [cormorant, manrope, ptSerif, ptSans].map((f) => f.variable).join(' ');

export const metadata: Metadata = {
  title: 'Хо-Рен-Со — осознанная коммуникация',
  description: 'Блокнот для фиксации фактов, анализа и решений по принципу Хо-Рен-Со.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Хо-Рен-Со', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // viewport-fit=cover включает env(safe-area-inset-*)
  viewportFit: 'cover',
  themeColor: '#F7F5F0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme/data-font ставит скрипт до гидрации — React об этом предупреждён
    <html lang="ru" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT_SCRIPT }} />
      </head>
      <body>
        <AppearanceSync />
        {children}
      </body>
    </html>
  );
}
