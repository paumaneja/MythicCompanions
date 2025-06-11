import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';


function App() {
  return (
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/*<Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/pets/:id" element={<PetRoom />} /> */}
    </Routes>
  );
}

export default App;
