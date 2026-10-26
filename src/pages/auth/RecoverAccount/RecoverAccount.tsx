import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RecoverAccount.module.css';
import InputField from '@/components/common/InputField';
import Button from '@/components/common/Button';
import CodeInput from '@/components/common/CodeInput';
import Toast from '@/components/common/Toast';
import { ColorBar } from '@/components/common/ColorBar';
import logoTequio from '@/assets/images/logoTequio.png';
import { useAuthService } from '@/contexts/AuthService';
import {
  executeFieldValidation,
  validateRequiredField,
  validateEmailAddress,
  validateMaximumLength,
  evaluatePasswordComplexity,
  validatePasswordConfirmationMatch,
} from '@/utils/formValidators';

/**
 * Step layout stages for the account recovery flow.
 */
type RecoveryStep = 'REQUEST_CODE' | 'RESET_PASSWORD' | 'SUCCESS';

/**
 * Account recovery multi-step page aligned with Tequio's design system.
 */
export const RecoverAccount: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoveryStep>('REQUEST_CODE');

  // Step 1: Identifier state
  const [identifier, setIdentifier] = useState<string>('');

  // Step 2: Passwords and 4-digit verification code states
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

  // Local field validation errors (rendered below each input)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Global toast notification for backend or network errors
  const [notification, setNotification] = useState<{
    message: string;
    variant: 'info' | 'error';
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Live checklist evaluation for password security
  const passwordStatus = evaluatePasswordComplexity(newPassword);

  /**
   * Validates Step 1: Request recovery code.
   */
  const validateRequestStep = (): boolean => {
    const errors: Record<string, string> = {};

    const identifierError = executeFieldValidation(identifier, [
      validateRequiredField('Correo electrónico'),
      validateEmailAddress,
      validateMaximumLength('Correo electrónico', 80),
    ]);

    if (identifierError) errors.identifier = identifierError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Validates Step 2: Passwords and 4-digit code.
   */
  const validateResetStep = (): boolean => {
    const errors: Record<string, string> = {};

    const passwordLengthError = executeFieldValidation(newPassword, [
      validateMaximumLength('Contraseña', 64),
    ]);

    if (passwordLengthError) {
      errors.newPassword = passwordLengthError;
    } else if (!passwordStatus.isFullyValid) {
      errors.newPassword = 'La contraseña no cumple con todos los requisitos mínimos de seguridad.';
    }

    const confirmationResult = validatePasswordConfirmationMatch(newPassword, confirmPassword);
    if (!confirmationResult.isValid && confirmationResult.errorMessage) {
      errors.confirmPassword = confirmationResult.errorMessage;
    }

    if (verificationCode.length !== 4) {
      errors.code = 'Ingresa los 4 dígitos del código de verificación.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Submits Step 1: Sends recovery email/code.
   */
  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateRequestStep()) return;

    setIsLoading(true);
    try {
      // todo: Connect with password recovery request endpoint
      await new Promise((resolve) => setTimeout(resolve, 800));
      setFieldErrors({});
      setStep('RESET_PASSWORD');
    } catch (error) {
      console.error('Error requesting recovery code:', error);
      setNotification({
        message: 'No fue posible procesar la solicitud. Verifica los datos e inténtalo de nuevo.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Submits Step 2: Validates code and updates password.
   */
  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateResetStep()) return;

    setIsLoading(true);
    try {
      // todo: Connect with password reset endpoint
      await new Promise((resolve) => setTimeout(resolve, 800));
      setFieldErrors({});
      setStep('SUCCESS');
    } catch (error) {
      console.error('Error resetting password:', error);
      setNotification({
        message: 'El código es incorrecto o ha expirado.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentContainer}>
        {/* Brand header */}
        <div className={styles.logoContainer}>
          <img src={logoTequio} alt="Tequio" className={styles.logo} />
        </div>

        {/* Step 1: Identifier input (/recuperar) */}
        {step === 'REQUEST_CODE' && (
          <>
            <h1 className={styles.title}>Recuperación de cuenta</h1>
            <form onSubmit={handleRequestCode} noValidate className={styles.formContent}>
              <div className={styles.inputWrapper}>
                <InputField
                  label="Ingresa el correo de la cuenta a recuperar"
                  placeholder="ejemplo@correo.com"
                  type="email"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) {
                      setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                    }
                  }}
                  errorMessage={fieldErrors.identifier}
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
        )}

        {/* Step 2: New password and 4-digit CodeInput (/codigo) */}
        {step === 'RESET_PASSWORD' && (
          <>
            <h1 className={styles.title}>Recuperación de cuenta</h1>
            <p className={styles.description}>
              Si esta cuenta está registrada, enviaremos un código para reestablecer la
              contraseña al correo. Revisa tu bandeja de entrada o la bandeja de spam.
            </p>

            <form onSubmit={handleResetPassword} noValidate className={styles.formContent}>
              <div className={styles.inputWrapper}>
                <InputField
                  label="Contraseña"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) {
                      setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                  }}
                  errorMessage={fieldErrors.newPassword}
                  maxLength={64}
                  required
                />
              </div>

              <div className={styles.requirementsBox}>
                <div className={styles.requirementsTitle}>Requisitos de contraseña:</div>
                <ul className={styles.requirementsList}>
                  <li
                    className={`${styles.requirementItem} ${
                      passwordStatus.hasMinimumLength ? styles.requirementMet : ''
                    }`}
                  >
                    {passwordStatus.hasMinimumLength ? '✓' : '○'} Mínimo 8 caracteres
                  </li>
                  <li
                    className={`${styles.requirementItem} ${
                      passwordStatus.hasUppercaseLetter ? styles.requirementMet : ''
                    }`}
                  >
                    {passwordStatus.hasUppercaseLetter ? '✓' : '○'} Al menos una mayúscula
                  </li>
                  <li
                    className={`${styles.requirementItem} ${
                      passwordStatus.hasNumericDigit ? styles.requirementMet : ''
                    }`}
                  >
                    {passwordStatus.hasNumericDigit ? '✓' : '○'} Al menos un número
                  </li>
                  <li
                    className={`${styles.requirementItem} ${
                      passwordStatus.hasSpecialCharacter ? styles.requirementMet : ''
                    }`}
                  >
                    {passwordStatus.hasSpecialCharacter ? '✓' : '○'} Al menos un carácter especial (!@#$...)
                  </li>
                </ul>
              </div>

              <div className={styles.inputWrapper}>
                <InputField
                  label="Confirmación de contraseña"
                  type="password"
                  placeholder="Ingresa de nuevo tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  errorMessage={fieldErrors.confirmPassword}
                  maxLength={64}
                  required
                />
              </div>

              <div className={styles.codeSection}>
                <span className={styles.codeLabel}>Código de verificación</span>
                <CodeInput
                  length={4}
                  value={verificationCode}
                  onChange={(code) => {
                    setVerificationCode(code);
                    if (fieldErrors.code) {
                      setFieldErrors((prev) => ({ ...prev, code: '' }));
                    }
                  }}
                  errorMessage={fieldErrors.code}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className={styles.actionButton}
                isLoading={isLoading}
              >
                Reestablecer contraseña
              </Button>
            </form>
          </>
        )}

        {/* Step 3: Success feedback (/contrasenacambiada) */}
        {step === 'SUCCESS' && (
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
              onClick={() => navigate('/login')}
            >
              Volver a Login
            </Button>
          </div>
        )}
      </div>

      {/* Characteristic 6-color ribbon */}
      <div className={styles.bottomBarWrapper}>
        <ColorBar height={12} />
      </div>

      {/* Floating notification for backend errors */}
      {notification && (
        <Toast
          message={notification.message}
          variant={notification.variant}
          duration={5000}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default RecoverAccount;