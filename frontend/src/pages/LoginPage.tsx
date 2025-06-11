import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import './LoginPage.css';
import { isAxiosError } from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      if (response.data && response.data.token) {
        const { token, userId, role } = response.data;
        auth.login(token, userId.toString(), role);
        navigate('/dashboard');
      }
    } catch (err) {
      // Improved error handling
      if (isAxiosError(err) && err.response) {
        // Show the specific error message from our backend
        setError(err.response.data.message || 'Invalid username or password.');
      } else {
        // Generic error if cannot connect to the server
        setError('Login failed. Could not connect to the server.');
      }
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome to Mythic Companions</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;