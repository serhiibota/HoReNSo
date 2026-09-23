/**
 * Копирование в буфер обмена с запасным путём для старого Safari:
 * navigator.clipboard может быть недоступен вне HTTPS или отклонён,
 * тогда используем скрытую textarea + execCommand('copy').
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* переходим к запасному варианту */
  }

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  // font-size 16px — иначе iOS зумит страницу при фокусе
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
  document.body.appendChild(ta);
  ta.focus();
  // На iOS select() не работает для readonly — нужен setSelectionRange
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

/** Возвращает false, если пользователь закрыл меню «Поделиться» */
export async function shareText(title: string, text: string): Promise<boolean> {
  if (!canShare()) return false;
  try {
    await navigator.share({ title, text });
    return true;
  } catch {
    return false;
  }
}
