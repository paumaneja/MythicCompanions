import { useState, useEffect, type FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../services/api';
import './ProfilePage.css';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  username: string;
  email: string;
  profileImagePath: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setEmail(userProfile.email);
      setLoading(false);
    }
  }, [userProfile]);

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

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profileImage', selectedFile);
    
    setMessage('Uploading image...');
    try {
      const response = await api.post<UserProfile>('/api/users/me/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // AQUEST ÉS EL CANVI CLAU:
      updateUserProfile(response.data); // Actualitzem l'estat global!
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

    api.put('/api/users/me', { email: email })
      .then((response) => {
        // També actualitzem el context si l'email canvia
        updateUserProfile(response.data);
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

const handleImageDelete = async () => {
    setMessage('Deleting image...');
    try {
        const response = await api.delete<UserProfile>('/api/users/me/profile-picture');
        updateUserProfile(response.data);
        setMessage('Image deleted successfully!');
    } catch (error) { // La variable 'error' ara sí que s'utilitza
        if (isAxiosError(error) && error.response) {
            setMessage(error.response.data.message || 'Failed to delete image.');
        } else {
            setMessage('An unexpected error occurred while deleting the image.');
        }
    }
};

  if (loading || !userProfile) {
    return (
      <div className="profile-page-container">
        <div className="profile-form-container">
          <h1>Loading Profile...</h1>
        </div>
      </div>
    );
  }

  const profileImageUrl = userProfile.profileImagePath
    ? `http://localhost:8080/user-content/${userProfile.profileImagePath}`
    : '/icons/user-profile-default.png';

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
            {userProfile.profileImagePath && !selectedFile && (
              <button type="button" className="profile-button danger" onClick={handleImageDelete}>
                Delete Image
              </button>
            )}
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
            <input type="text" id="username" name="username" value={userProfile.username} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </form>

        {message && <p className="form-message">{message}</p>}

        <div className="profile-actions">
          <button type="submit" form="profile-form" className="profile-button">
            Save Changes
          </button>
          <button type="button" className="profile-button secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;