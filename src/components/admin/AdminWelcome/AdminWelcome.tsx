import React from 'react';
import styles from './AdminWelcome.module.css';

/**
 * Properties contract for the AdminWelcome component.
 */
export interface AdminWelcomeProps {
  userName?: string;
}

/**
 * Initial empty state view rendered when the administrator opens the panel
 * before selecting an option from the sidebar.
 */
export const AdminWelcome: React.FC<AdminWelcomeProps> = ({
  userName = 'Daniel',
}) => {
  return (
    <div className={styles.welcomeContainer}>
      <h1 className={styles.welcomeTitle}>
        Bienvenido a tu panel de administrador, {userName}.
      </h1>
      <p className={styles.welcomeSubtitle}>
        Selecciona en la barra lateral la opción que desees realizar.
      </p>
    </div>
  );
};

export default AdminWelcome;