import { createContext, useState, type ReactNode, useEffect, useRef, useCallback } from 'react';
import api from '../services/api'; // Necessitem api per a les crides

interface UserProfile {
  username: string;
  email: string;
  profileImagePath: string | null;
}

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: (token: string, userId: string, role: string) => void;
  logout: () => void;
  updateUserProfile: (profile: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const inactivityTimer = useRef<number | null>(null);
  const isAuthenticated = !!token;

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const logout = useCallback(() => {
    if (inactivityTimer.current) {
      window.clearTimeout(inactivityTimer.current);
    }
    localStorage.clear();
    setToken(null);
    setUserId(null);
    setRole(null);
    setUserProfile(null);
    window.location.href = '/';
  }, []);
  
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/users/me');
      updateUserProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout();
    }
  }, [logout]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      window.clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    if (isAuthenticated) {
      const events: (keyof WindowEventMap)[] = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
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
      fetchUserProfile(); 
    }
  }, [fetchUserProfile]);

  const login = (newToken: string, newUserId: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setUserId(newUserId);
    setRole(newRole);
    fetchUserProfile();
  };

  return (
    <AuthContext.Provider value={{ token, userId, role, isAuthenticated, userProfile, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};