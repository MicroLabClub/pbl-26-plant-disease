import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { authApi } from '@/services/auth';
import { tokenStore, isAccessTokenExpired } from '@/services/api';
import type { AuthResult } from '@/types';

interface AuthContextValue {
  isAuthenticated: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !isAccessTokenExpired()
  );
  const [initializing, setInitializing] = useState(
    () => isAccessTokenExpired() && !!tokenStore.getRefresh()
  );

  useEffect(() => {
    const onLogout = () => setIsAuthenticated(false);
    window.addEventListener('agricure:logout', onLogout);
    return () => window.removeEventListener('agricure:logout', onLogout);
  }, []);

  // On mount: if access token is expired but we still have a refresh token,
  // try to get a new token pair silently before rendering protected routes.
  useEffect(() => {
    if (!initializing) return;
    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      setInitializing(false);
      return;
    }
    authApi.refresh(refresh)
      .then((result) => {
        tokenStore.set(result.accessToken, result.refreshToken);
        setIsAuthenticated(true);
      })
      .catch(() => {
        tokenStore.clear();
        setIsAuthenticated(false);
      })
      .finally(() => setInitializing(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback((result: AuthResult) => {
    tokenStore.set(result.accessToken, result.refreshToken);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      persist(await authApi.login({ email, password }));
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      persist(await authApi.register({ email, password }));
    },
    [persist]
  );

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    if (refresh) await authApi.logout(refresh).catch(() => {});
    tokenStore.clear();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}