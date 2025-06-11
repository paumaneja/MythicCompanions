import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LoginPage.css';
import { isAxiosError } from 'axios';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Use our centralized api service and the new DTO shape
      await api.post('/auth/register', {
        username,
        password,
        email,
      });

      setSuccess('Registration successful! Redirecting to login...');
      // After a short delay, redirect the user to the login page
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;