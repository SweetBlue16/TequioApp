import { useSession } from '@/contexts/AuthContext';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ROUTES } from '@/constants/routes';
import styles from './Admin.module.css';

/**
 * Main layout orchestrator for the Tequio administrator panel.
 * Renders the navigation sidebar and delegates the active view to Outlet.
 * Ready to bind real user session data once backend endpoints are connected.
 */
export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { profile, logout } = useSession();
  const handleLogout = (): void => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className={styles.layout}>
      <AdminSidebar userName={profile?.firstName || 'Mi cuenta'} avatarUrl={profile?.profilePictureUrl || undefined} onLogout={handleLogout} />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;