import React, { useState } from 'react';
import InputField from '@/components/common/InputField';
import Button from '@/components/common/Button';
import CodeInput from '@/components/common/CodeInput';
import { evaluatePasswordComplexity } from '@/utils/formValidators';
import styles from '../RecoverAccount.module.css';

export interface ResetPasswordStepProps {
  newPassword: string;
  confirmPassword: string;
  verificationCode: string;
  fieldErrors: Record<string, string>;
  isLoading: boolean;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResendCode?: () => Promise<void>;
}

/**
 * Step 2 component: Password resetting with inputs on the left, requirements on the right,
 * code resend option, and separated action button.
 */
export const ResetPasswordStep: React.FC<ResetPasswordStepProps> = ({
  newPassword,
  confirmPassword,
  verificationCode,
  fieldErrors,
  isLoading,
  onFieldChange,
  onSubmit,
  onResendCode,
}) => {
  const [isResending, setIsResending] = useState(false);
  const passwordStatus = evaluatePasswordComplexity(newPassword);

  const handleResendClick = async () => {
    if (!onResendCode || isResending) return;
    setIsResending(true);
    try {
      await onResendCode();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <h1 className={styles.title}>Recuperación de cuenta</h1>
      <p className={styles.description}>
        Si esta cuenta está registrada, enviaremos un código para reestablecer la
        contraseña al correo. Revisa tu bandeja de entrada o la bandeja de spam.
      </p>

      <form onSubmit={onSubmit} noValidate className={styles.formContent}>
        <div className={styles.twoColumnGrid}>
          {/* Lado izquierdo: Contraseñas + Código + Reenvío */}
          <div className={styles.leftColumn}>
            <div className={styles.inputWrapper}>
              <InputField
                label="Contraseña"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={newPassword}
                onChange={(e) => onFieldChange('newPassword', e.target.value)}
                errorMessage={fieldErrors.newPassword}
                maxLength={64}
                required
              />
            </div>

            <div className={styles.inputWrapper}>
              <InputField
                label="Confirmación de contraseña"
                type="password"
                placeholder="Ingresa de nuevo tu contraseña"
                value={confirmPassword}
                onChange={(e) => onFieldChange('confirmPassword', e.target.value)}
                errorMessage={fieldErrors.confirmPassword}
                maxLength={64}
                required
              />
            </div>

            <div className={styles.codeSection}>
              <span className={styles.codeLabel}>Código de verificación</span>
              <CodeInput
                length={6}
                value={verificationCode}
                onChange={(code) => onFieldChange('code', code)}
                errorMessage={fieldErrors.code}
              />

              {onResendCode && (
                <div className={styles.resendWrapper}>
                  <span className={styles.resendText}>¿No recibiste el código? </span>
                  <button
                    type="button"
                    onClick={handleResendClick}
                    disabled={isResending}
                    className={styles.resendButton}
                  >
                    {isResending ? 'Enviando...' : 'Reenviar código'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lado derecho: Requisitos de contraseña */}
          <div className={styles.rightColumn}>
            <div className={styles.requirementsBox}>
              <div className={styles.requirementsTitle}>Requisitos de contraseña:</div>
              <ul className={styles.requirementsList}>
                <li className={`${styles.requirementItem} ${passwordStatus.hasMinimumLength ? styles.requirementMet : ''}`}>
                  {passwordStatus.hasMinimumLength ? '✓' : '○'} Mínimo 8 caracteres
                </li>
                <li className={`${styles.requirementItem} ${passwordStatus.hasUppercaseLetter ? styles.requirementMet : ''}`}>
                  {passwordStatus.hasUppercaseLetter ? '✓' : '○'} Al menos una mayúscula
                </li>
                <li className={`${styles.requirementItem} ${passwordStatus.hasNumericDigit ? styles.requirementMet : ''}`}>
                  {passwordStatus.hasNumericDigit ? '✓' : '○'} Al menos un número
                </li>
                <li className={`${styles.requirementItem} ${passwordStatus.hasSpecialCharacter ? styles.requirementMet : ''}`}>
                  {passwordStatus.hasSpecialCharacter ? '✓' : '○'} Al menos un carácter especial (!@#$...)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Zona inferior: Botón centrado con margen amplio para no tocar la ColorBar */}
        <div className={styles.buttonWrapper}>
          <Button
            type="submit"
            variant="primary"
            className={styles.actionButton}
            isLoading={isLoading}
          >
            Reestablecer contraseña
          </Button>
        </div>
      </form>
    </>
  );
};