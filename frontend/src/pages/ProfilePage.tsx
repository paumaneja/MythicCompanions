// frontend/src/pages/ProfilePage.tsx

import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../services/api';
import './ProfilePage.css';

interface UserProfile {
  username: string;
  email: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile>({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch user profile on component mount
  useEffect(() => {
    api.get<UserProfile>('/api/users/me')
      .then(response => {
        setProfile(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch profile", error);
        setMessage('Could not load your profile.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    api.put('/api/users/me', { email: profile.email })
      .then(() => {
        setMessage('Profile updated successfully!');
      })
      .catch(error => {
        if (isAxiosError(error) && error.response) {
          setMessage(error.response.data.message || 'Failed to update profile.');
        } else {
          setMessage('An unexpected error occurred.');
        }
      });
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-form-container">
          <h1>Loading Profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-form-container">
        <h1>My Profile</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profile.username}
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>
          {message && <p className="form-message">{message}</p>}
          <button type="submit" className="profile-button">Save Changes</button>
        </form>
        <Link to="/dashboard" className="profile-button secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default ProfilePage;