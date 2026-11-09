import { useEffect, useState } from 'react';

export interface Route {
  path: string;
  search: URLSearchParams;
}

const EVENT = 'app:navigate';

function currentRoute(): Route {
  return {
    path: window.location.pathname.replace(/\/+$/, '') || '/',
    search: new URLSearchParams(window.location.search),
  };
}

export function navigate(to: string, options: { replace?: boolean } = {}): void {
  if (options.replace) window.history.replaceState({}, '', to);
  else window.history.pushState({}, '', to);
  window.dispatchEvent(new Event(EVENT));
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? { path: '/', search: new URLSearchParams() } : currentRoute(),
  );

  useEffect(() => {
    const sync = () => setRoute(currentRoute());
    window.addEventListener('popstate', sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  return route;
}

/** Segmen pertama path, mis. "/unsur/Fe" -> ["unsur", "Fe"] */
export function segments(path: string): string[] {
  return path.split('/').filter(Boolean);
}
