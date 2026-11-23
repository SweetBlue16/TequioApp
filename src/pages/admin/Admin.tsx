import { useSession } from '@/contexts/AuthContext';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ROUTES } from '@/constants/routes';
import styles from './Admin.module.css';

interface AdminProps {
  /** Reports a navigation error after the protected admin page unmounts. */
  onLogoutNavigationError: () => void;
}

/**
 * Main layout orchestrator for the Tequio administrator panel.
 * Renders the navigation sidebar and delegates the active view to Outlet.
 */
export const Admin: React.FC<AdminProps> = ({ onLogoutNavigationError }) => {
  const navigate = useNavigate();
  const { profile, logout } = useSession();

  const handleLogout = async (): Promise<void> => {
    logout();
    try {
      await navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (error) {
      console.error('Could not open login after signing out.', error);
      onLogoutNavigationError();
    }
  };

  return (
    <div className={styles.layout}>
      <AdminSidebar
        userName={profile?.firstName || 'Mi cuenta'}
        avatarUrl={profile?.profilePictureUrl || undefined}
        onLogout={handleLogout}
      />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
