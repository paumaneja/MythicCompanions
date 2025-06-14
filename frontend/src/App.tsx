import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CompanionSanctuaryPage from './pages/CompanionSanctuaryPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import our new component

function App() {
  return (
    <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/companions/:id" element={<CompanionSanctuaryPage />} />
        </Route>

        {/* A catch-all route to redirect any unknown URL to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
