import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CompanionSanctuaryPage from './pages/CompanionSanctuaryPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
  return (
    <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companions/:id" element={<CompanionSanctuaryPage />} />
            {/* If you add more protected pages, add them here */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;