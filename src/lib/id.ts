/**
 * crypto.randomUUID появился только в Safari 15.4 — на iOS 15.0–15.3 его нет.
 * Для локальных записей достаточно времени + случайного хвоста.
 */
export function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
