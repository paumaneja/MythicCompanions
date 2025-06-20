import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './UserProfileDropdown.css';
import api from '../services/api';

interface UserProfile {
    username: string;
    profileImagePath: string | null;
}

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, userId } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({ username: 'User', profileImagePath: null });

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Carregar dades de l'usuari quan s'obre el menú
  useEffect(() => {
    if (isOpen && userId) {
      api.get<UserProfile>(`/api/users/me`)
        .then(response => {
          setUserProfile(response.data);
        })
        .catch(error => {
          console.error("Failed to fetch user profile", error);
        });
    }
  }, [isOpen, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const profileImageUrl = userProfile.profileImagePath
    ? `http://localhost:8080/user-content/${userProfile.profileImagePath}`
    : null;

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button onClick={handleToggle} className="profile-button" aria-label="User menu">
        {/* RENDERITZACIÓ CONDICIONAL: Imatge de l'usuari o icona per defecte */}
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="User Profile" className="profile-avatar" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="profile-icon">
            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p>Signed in as</p>
            <strong>{userProfile.username}</strong>
          </div>
          <ul>
            <li><Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link></li>
            <li><Link to="/change-password" onClick={() => setIsOpen(false)}>Change Password</Link></li>
            <li className="separator"></li>
            <li><button onClick={logout} className="logout-action">Logout</button></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;