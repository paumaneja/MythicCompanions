// frontend/src/pages/ProfilePage.tsx

import { useState, useEffect, type FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../services/api';
import './ProfilePage.css';

interface UserProfile {
  username: string;
  email: string;
  profileImagePath: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({ username: '', email: '', profileImagePath: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

// Carregar el perfil inicial
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

  // Crear una previsualització quan se selecciona un arxiu
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };
  
  // Funció per pujar la imatge
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profileImage', selectedFile);
    
    setMessage('Uploading image...');
    try {
      const response = await api.post<UserProfile>('/api/users/me/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(response.data);
      setSelectedFile(null);
      setMessage('Image updated successfully!');
    } catch (error) {
       if (isAxiosError(error) && error.response) {
          setMessage(error.response.data.message || 'Failed to upload image.');
        } else {
          setMessage('An unexpected error occurred.');
        }
    }
  };

  const handleEmailSubmit = (e: FormEvent) => {
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

  const profileImageUrl = profile.profileImagePath
    ? `http://localhost:8080/user-content/${profile.profileImagePath}`
    : '/icons/user-profile-default.png'; // Un avatar per defecte

  return (
    <div className="profile-page-container">
      <div className="profile-form-container">
        <h1>My Profile</h1>

        <div className="profile-picture-section">
          <img src={preview || profileImageUrl} alt="Profile" className="profile-picture" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <div className="profile-picture-actions">
            <button type="button" className="profile-button secondary" onClick={() => fileInputRef.current?.click()}>
              Choose Image
            </button>
            {selectedFile && (
              <button type="button" className="profile-button" onClick={handleImageUpload}>
                Save Image
              </button>
            )}
          </div>
        </div>

        <form id="profile-form" onSubmit={handleEmailSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" value={profile.username} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={profile.email} onChange={handleEmailChange} required />
          </div>
        </form>

        {message && <p className="form-message">{message}</p>}

        <div className="profile-actions">
            <button type="submit" form="profile-form" className="profile-button">
              Save Changes
            </button>
            {/* CANVI 3: El Link ara és un botó que navega a la pàgina anterior */}
            <button type="button" className="profile-button secondary" onClick={() => navigate(-1)}>
                Back
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;