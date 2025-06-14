import { createContext, useState, type ReactNode, useEffect, useRef, useCallback } from 'react';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, role: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const inactivityTimer = useRef<number | null>(null);

  const isAuthenticated = !!token;

  const logout = useCallback(() => {
    if (inactivityTimer.current) {
      window.clearTimeout(inactivityTimer.current);
    }
    localStorage.clear();
    setToken(null);
    setUserId(null);
    setRole(null);
    window.location.href = '/';
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      window.clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    if (isAuthenticated) {
      const events: (keyof WindowEventMap)[] = [
        'mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'
      ];

      resetInactivityTimer();

      events.forEach(event => window.addEventListener(event, resetInactivityTimer));

      return () => {
        events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
        if (inactivityTimer.current) {
          window.clearTimeout(inactivityTimer.current);
        }
      };
    }
  }, [isAuthenticated, resetInactivityTimer]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedUserId && storedRole) {
      setToken(storedToken);
      setUserId(storedUserId);
      setRole(storedRole);
    }
  }, []);

  const login = (newToken: string, newUserId: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setUserId(newUserId);
    setRole(newRole);
  };

  return (
    <AuthContext.Provider value={{ token, userId, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};