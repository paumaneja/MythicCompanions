import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CompanionSanctuaryPage from './pages/CompanionSanctuaryPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import ClickerGamePage from './pages/ClickerGamePage';

function App() {
  return (
    <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          {/* Routes with the global user menu */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companions/:id" element={<CompanionSanctuaryPage />} />
          </Route>
          
          {/* Minigame Route. It's inside ProtectedRoute but outside ProtectedLayout 
          so the game can have its own full-screen layout without the user menu visible. */}
          <Route path="/companions/:id/play/clicker-game" element={<ClickerGamePage />} />

        </Route>

        {/* --- Fallback Route --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;