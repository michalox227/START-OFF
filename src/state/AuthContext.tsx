import { createContext, useContext, useState, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Prosty system logowania (brama dostępu do platformy).
//
// UWAGA: to jest lekka brama dostępu po stronie przeglądarki, przeznaczona do
// prezentacji i pracy właściciela — nie jest to zabezpieczenie kryptograficzne.
// Po zalogowaniu użytkownik ma pełny dostęp do platformy i może edytować oraz
// zapisywać zmiany (dane i tak zapisują się w localStorage tej przeglądarki).
// ---------------------------------------------------------------------------

const ACCESS_CODE = '2891';
const STORAGE_KEY = 'grantland-auth';

interface AuthValue {
  isAuthenticated: boolean;
  login: (code: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ok';
    } catch {
      return false;
    }
  });

  function login(code: string): boolean {
    if (code.trim() === ACCESS_CODE) {
      setAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'ok');
      } catch {
        /* prywatny tryb przeglądarki — pomijamy */
      }
      return true;
    }
    return false;
  }

  function logout() {
    setAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* pomijamy */
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musi być użyty wewnątrz AuthProvider');
  return ctx;
}
