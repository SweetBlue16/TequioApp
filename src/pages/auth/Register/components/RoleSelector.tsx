import React from 'react';
import { Card } from '@/components/common/Card';
import producerIconImage from '@/assets/icons/register/icon_vendedor.png';
import buyerIconImage from '@/assets/icons/register/icon_comprador.png';
import styles from '../Register.module.css';

/**
 * Properties contract for the RoleSelector subview component.
 */
export interface RoleSelectorProps {
  onSelectRole: (selectedRole: 'producer' | 'buyer') => void;
}

/**
 * Interactive subview allowing the user to choose between Producer and Buyer accounts.
 */
export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <Card maxWidth="520px" centered padding="lg">
      <h2 className={styles.title}>
        ¿Qué tipo de usuario de Tequio quieres ser?
      </h2>

      <div className={styles.rolesGrid}>
        <button
          type="button"
          className={styles.roleOptionButton}
          onClick={() => onSelectRole('producer')}
          aria-label="Registrarme como Productor"
        >
          <div className={styles.roleIconWrapper}>
            <img
              src={producerIconImage}
              alt=""
              aria-hidden="true"
              className={styles.roleIcon}
            />
          </div>
          <span className={styles.roleLabel}>Productor</span>
        </button>

        <button
          type="button"
          className={styles.roleOptionButton}
          onClick={() => onSelectRole('buyer')}
          aria-label="Registrarme como Comprador"
        >
          <div className={styles.roleIconWrapper}>
            <img
              src={buyerIconImage}
              alt=""
              aria-hidden="true"
              className={styles.roleIcon}
            />
          </div>
          <span className={styles.roleLabel}>Comprador</span>
        </button>
      </div>
    </Card>
  );
};

export default RoleSelector;