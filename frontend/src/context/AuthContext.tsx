import { createContext, useState, type ReactNode, useEffect } from 'react';

// Define the shape of the context data
interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, role: string) => void;
  logout: () => void;
}

// Create and EXPORT the context so other files (like our hook) can use it.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The provider component that will wrap our application.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // On initial load, try to get data from localStorage.
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

  const isAuthenticated = !!token;

  const login = (newToken: string, newUserId: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setUserId(newUserId);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUserId(null);
    setRole(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ token, userId, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};