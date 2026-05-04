import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse, CurrentUser, getCurrentUser, googleLogin, login, register, verifyEmail } from '../../api';

type Credentials = {
  email: string;
  password: string;
};

type RegisterPayload = Credentials & {
  name: string;
};

type GooglePayload = {
  credential: string;
};

type AuthContextValue = {
  token: string;
  user: CurrentUser | null;
  initializing: boolean;
  signIn: (payload: Credentials) => Promise<AuthResponse>;
  signUp: (payload: RegisterPayload) => Promise<AuthResponse>;
  signInWithGoogle: (payload: GooglePayload) => Promise<AuthResponse>;
  confirmEmail: (token: string) => Promise<AuthResponse>;
  logout: () => void;
};

const tokenStorageKey = 'ezber.jwt';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) ?? '');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }

    setInitializing(true);
    getCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(tokenStorageKey);
        setToken('');
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, [token]);

  async function persistSession(response: AuthResponse) {
    if (!response.token) {
      return response;
    }

    localStorage.setItem(tokenStorageKey, response.token);
    setToken(response.token);
    setUser(await getCurrentUser(response.token));
    return response;
  }

  async function signIn(payload: Credentials) {
    return persistSession(await login(payload));
  }

  async function signUp(payload: RegisterPayload) {
    return persistSession(await register(payload));
  }

  async function signInWithGoogle(payload: GooglePayload) {
    return persistSession(await googleLogin(payload));
  }

  async function confirmEmail(emailToken: string) {
    return persistSession(await verifyEmail({ token: emailToken }));
  }

  function logout() {
    localStorage.removeItem(tokenStorageKey);
    setToken('');
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, initializing, signIn, signUp, signInWithGoogle, confirmEmail, logout }),
    [token, user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
