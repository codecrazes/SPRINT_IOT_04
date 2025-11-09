import { createContext, useEffect, useState, PropsWithChildren } from 'react';

import { getItem, setItem, removeItem } from '@utils/storage';

export type AuthState = {
  token: string | null;
  email: string | null;
  abrirSessao: (token: string, email: string) => void;
  fecharSessao: () => void;
  carregandoSessao: boolean;
};

export const AuthContext = createContext<AuthState>({
  token: null,
  email: null,
  abrirSessao: () => {},
  fecharSessao: () => {},
  carregandoSessao: true,
});

const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'auth_email';

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await getItem<string>(TOKEN_KEY);
        const e = await getItem<string>(EMAIL_KEY);
        if (typeof t === 'string' && t.length > 20 && typeof e === 'string' && e.includes('@')) {
          setToken(t);
          setEmail(e);
        } else {
          await removeItem(TOKEN_KEY);
          await removeItem(EMAIL_KEY);
          setToken(null);
          setEmail(null);
        }
      } finally {
        setCarregandoSessao(false);
      }
    })();
  }, []);

  const abrirSessao = async (t: string, e: string) => {
    setToken(t);
    setEmail(e);
    await setItem(TOKEN_KEY, t);
    await setItem(EMAIL_KEY, e);
  };

  const fecharSessao = async () => {
    setToken(null);
    setEmail(null);
    await removeItem(TOKEN_KEY);
    await removeItem(EMAIL_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, email, abrirSessao, fecharSessao, carregandoSessao }}>
      {children}
    </AuthContext.Provider>
  );
}
