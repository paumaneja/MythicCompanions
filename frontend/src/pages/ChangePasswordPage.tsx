// frontend/src/pages/ChangePasswordPage.tsx

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../services/api';
import './ProfilePage.css'; // We reuse the same CSS

const ChangePasswordPage = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 1. Client-side validation: Check if new passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    // 2. Call the API
    api.post('/api/users/change-password', {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    })
    .then(() => {
      setMessage('Password changed successfully!');
      // Clear the form on success
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    })
    .catch(err => {
      if (isAxiosError(err) && err.response) {
        // Display error from backend (e.g., "Incorrect current password")
        setError(err.response.data.message || 'Failed to change password.');
      } else {
        setError('An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="profile-page-container">
      <div className="profile-form-container">
        <h1>Change Password</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Display feedback messages */}
          {error && <p className="form-message error">{error}</p>}
          {message && <p className="form-message success">{message}</p>}

          <button type="submit" className="profile-button">Update Password</button>
        </form>
        <Link to="/dashboard" className="profile-button secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default ChangePasswordPage;