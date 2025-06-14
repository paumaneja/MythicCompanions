import { Outlet } from 'react-router-dom';
import UserProfileDropdown from './UserProfileDropdown';
import './ProtectedLayout.css';

const ProtectedLayout = () => {
  return (
    <div className="protected-layout">
      <div className="global-user-menu">
        <UserProfileDropdown />
      </div>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;