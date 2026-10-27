import React from 'react';
import Button from '@/components/common/Button';
import styles from '../RecoverAccount.module.css';

export interface SuccessStepProps {
  onReturnToLogin: () => void;
}

/**
 * Step 3 component: Confirmation state after password has been reset.
 */
export const SuccessStep: React.FC<SuccessStepProps> = ({ onReturnToLogin }) => {
  return (
    <div className={styles.formContent}>
      <p className={styles.successMessage}>
        Se ha reestablecido tu contraseña.
        <br />
        Puedes volver a iniciar sesión
      </p>

      <Button
        type="button"
        variant="primary"
        className={styles.actionButton}
        onClick={onReturnToLogin}
      >
        Volver a Login
      </Button>
    </div>
  );
};