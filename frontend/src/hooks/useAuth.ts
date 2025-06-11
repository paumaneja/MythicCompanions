import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Importarem el context des de l'altre fitxer

/**
 * Custom hook for easy access to the authentication context data.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};