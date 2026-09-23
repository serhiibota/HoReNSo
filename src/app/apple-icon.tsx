import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

// iOS не понимает SVG-иконки для «На экран Домой» — генерируем PNG при сборке
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F7F5F0',
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            border: '6px solid #2B2A28',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 8, background: '#2B2A28' }} />
        </div>
      </div>
    ),
    size,
  );
}
