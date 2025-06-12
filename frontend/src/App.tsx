import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CompanionSanctuaryPage from './pages/CompanionSanctuaryPage';


function App() {
  return (
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companions/:id" element={<CompanionSanctuaryPage />} />
    </Routes>
  );
}

export default App;
