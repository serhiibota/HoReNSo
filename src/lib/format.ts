const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const dateTimeFmt = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (ts: number) => dateFmt.format(new Date(ts));
export const formatDateTime = (ts: number) => dateTimeFmt.format(new Date(ts));

/** Первая непустая строка — заголовок карточки */
export function firstLine(text: string, max = 90): string {
  const line = text.trim().split('\n')[0] || '';
  return line.length > max ? line.slice(0, max - 1).trimEnd() + '…' : line;
}

export const hasText = (v: string) => v.trim().length > 0;
