type Router = { back: () => void; replace: (href: string) => void };

/** Если страницу открыли напрямую (истории нет) — возвращаемся в ленту */
export function goBack(router: Router) {
  if (typeof window !== 'undefined' && window.history.length > 1) router.back();
  else router.replace('/');
}
