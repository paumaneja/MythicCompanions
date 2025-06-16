import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './UserProfileDropdown.css';
import api from '../services/api';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, userId } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState<string>('User');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && userId) {
      api.get(`/api/users/me`)
        .then(response => {
          setUsername(response.data.username);
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

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button onClick={handleToggle} className="profile-button" aria-label="User menu">
        <img src="/icons/user-profile.png" alt="User Profile" />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p>Signed in as</p>
            {/* UPDATED: Display the dynamic username */}
            <strong>{username}</strong>
          </div>
          <ul>
            <li>
              <Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link>
            </li>
            <li>
              <Link to="/change-password" onClick={() => setIsOpen(false)}>Change Password</Link>
            </li>
            <li className="separator"></li>
            <li>
              <button onClick={logout} className="logout-action">
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;