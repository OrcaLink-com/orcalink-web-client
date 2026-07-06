import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, clearSession, getStoredUser, setAuthLostHandler } from '../lib/api';
import { disablePush, initPush } from '../lib/push';
import type { AuthUser, OtpChannel } from '../lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  requestOtp: (
    channel: OtpChannel,
    destination: string,
  ) => Promise<{ registered: boolean; devCode?: string }>;
  verifyOtp: (
    channel: OtpChannel,
    destination: string,
    code: string,
    name?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  // Se o refresh falhar em qualquer requisição, derruba a sessão na UI.
  useEffect(() => {
    setAuthLostHandler(() => {
      clearSession();
      setUser(null);
    });
    return () => setAuthLostHandler(null);
  }, []);

  // Push (FCM) — registra o token quando autenticado (no-op sem credenciais).
  useEffect(() => {
    if (user) void initPush();
  }, [user]);

  const requestOtp = useCallback(
    (channel: OtpChannel, destination: string) => api.requestOtp(channel, destination),
    [],
  );

  const verifyOtp = useCallback(
    async (channel: OtpChannel, destination: string, code: string, name?: string) => {
      const u = await api.verifyOtp(channel, destination, code, name);
      setUser(u);
    },
    [],
  );

  const logout = useCallback(async () => {
    await disablePush();
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), requestOtp, verifyOtp, logout }),
    [user, requestOtp, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
