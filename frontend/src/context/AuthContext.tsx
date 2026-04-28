import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { authApi } from '@/services/auth';
import { tokenStore } from '@/services/api';
import type { AuthResult } from '@/types';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!tokenStore.getAccess()
  );

  useEffect(() => {
    const onLogout = () => setIsAuthenticated(false);
    window.addEventListener('agricure:logout', onLogout);
    return () => window.removeEventListener('agricure:logout', onLogout);
  }, []);

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
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}