import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

// Шрифты самохостятся next/font: без запросов к Google в рантайме,
// только нужные начертания и кириллица
const serif = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

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
    <html lang="ru" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
