import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './UserProfileDropdown.css';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Effect to close dropdown if clicked outside
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
            <strong>{/* We'll put the username here later */}User Name</strong>
          </div>
          <ul>
            <li>
              <Link to="/profile">My Profile</Link>
            </li>
            <li>
              <Link to="/change-password">Change Password</Link>
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