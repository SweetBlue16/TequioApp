import React from 'react';
import InputField from '@/components/common/InputField';
import Button from '@/components/common/Button';
import styles from '../RecoverAccount.module.css';

export interface RequestCodeStepProps {
  identifier: string;
  fieldError?: string;
  isLoading: boolean;
  onIdentifierChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Step 1 component: Form to request a verification code via email.
 */
export const RequestCodeStep: React.FC<RequestCodeStepProps> = ({
  identifier,
  fieldError,
  isLoading,
  onIdentifierChange,
  onSubmit,
}) => {
  return (
    <>
      <h1 className={styles.title}>Recuperación de cuenta</h1>
      <form onSubmit={onSubmit} noValidate className={styles.formContent}>
        <div className={styles.inputWrapper}>
          <InputField
            label="Ingresa el correo de la cuenta a recuperar"
            placeholder="ejemplo@correo.com"
            type="email"
            value={identifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
            errorMessage={fieldError}
            maxLength={80}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className={styles.actionButton}
          isLoading={isLoading}
        >
          Recuperar cuenta
        </Button>
      </form>
    </>
  );
};