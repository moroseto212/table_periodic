import { useEffect, useState } from 'react';

export interface Route {
  path: string;
  search: URLSearchParams;
}

const EVENT = 'app:navigate';
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Path aplikasi tanpa base deployment, mis. "/table_periodic/unsur/Fe" -> "/unsur/Fe". */
export function stripBase(pathname: string): string {
  const path =
    BASE && (pathname === BASE || pathname.startsWith(`${BASE}/`))
      ? pathname.slice(BASE.length)
      : pathname;
  return path.replace(/\/+$/, '') || '/';
}

/** Prefix base deployment ke path aplikasi, mis. "/lab" -> "/table_periodic/lab". */
export function withBase(path: string): string {
  if (!BASE) return path || '/';
  if (path === '' || path === '/') return `${BASE}/`;
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Path rute saat ini tanpa base deployment. */
export function currentPath(): string {
  return stripBase(window.location.pathname);
}

function currentRoute(): Route {
  return {
    path: currentPath(),
    search: new URLSearchParams(window.location.search),
  };
}

export function navigate(to: string, options: { replace?: boolean } = {}): void {
  const url = withBase(to);
  if (options.replace) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
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
