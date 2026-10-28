import React from 'react';
import { useSession } from '@/contexts/AuthContext';
import styles from './ProducerWelcome.module.css';

/**
 * Properties contract for the ProducerWelcome component.
 */
export interface ProducerWelcomeProps {
  userName?: string;
}

/**
 * Initial empty state view rendered when the seller opens the producer module
 * before choosing an option from the sidebar.
 */
export const ProducerWelcome: React.FC<ProducerWelcomeProps> = ({ userName }) => {
  const { profile } = useSession();

  const displayName = userName || profile?.firstName || 'Productor';

  return (
    <div className={styles.welcomeContainer}>
      <h1 className={styles.welcomeTitle}>
        Bienvenido a tu panel de vendedor, {displayName}.
      </h1>
      <p className={styles.welcomeSubtitle}>
        Selecciona la opción que desees realizar.
      </p>
    </div>
  );
};

export default ProducerWelcome;