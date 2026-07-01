import { useEffect, useState } from 'react';

/** useState synchronizowany z localStorage pod danym kluczem. */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* quota / prywatny tryb przeglądarki — pomijamy */
    }
  }, [key, state]);

  return [state, setState] as const;
}
