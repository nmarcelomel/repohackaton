import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthUser { id: string; email: string; name: string; role: string; team_id: string | null; }
interface AuthContextType { user: AuthUser | null; token: string | null; login: (email: string, password: string) => Promise<void>; logout: () => void; hasRole: (role: string) => boolean; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(setUser)
        .catch(() => { setToken(null); setUser(null); localStorage.removeItem('auth_token'); });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error('Credenciales inválidas');
    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    setToken(data.access_token);
  };

  const logout = () => { localStorage.removeItem('auth_token'); setToken(null); setUser(null); };
  const hasRole = (role: string) => user?.role === role || user?.role === 'admin';

  return <AuthContext.Provider value={{ user, token, login, logout, hasRole }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be inside AuthProvider'); return ctx; }
