import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CompanionSanctuaryPage from './pages/CompanionSanctuaryPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import ClickerGamePage from './pages/ClickerGamePage';
import MemoryGamePage from './pages/MemoryGamePage';
import QuizGamePage from './pages/QuizGamePage';
import DodgeGamePage from './pages/DodgeGamePage';

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
          
          {/* Minigame Routes */}
          <Route path="/companions/:id/play/clicker-game" element={<ClickerGamePage />} />
          <Route path="/companions/:id/play/memory-game" element={<MemoryGamePage />} />
          <Route path="/companions/:id/play/quiz-game" element={<QuizGamePage />} />
          <Route path="/companions/:id/play/dodge-game" element={<DodgeGamePage />} />
        </Route>

        {/* --- Fallback Route --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;