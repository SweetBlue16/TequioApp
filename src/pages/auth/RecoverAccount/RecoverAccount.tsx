import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RecoverAccount.module.css';
import Toast from '@/components/common/Toast';
import { ColorBar } from '@/components/common/ColorBar';
import logoTequio from '@/assets/images/logoTequio.png';
import { useAuthService } from '@/contexts/AuthContext';
import { RequestCodeStep } from './components/RequestCodeStep';
import { ResetPasswordStep } from './components/ResetPasswordStep';
import { SuccessStep } from './components/SuccessStep';
import {
  executeFieldValidation,
  validateRequiredField,
  validateEmailAddress,
  validateMaximumLength,
  evaluatePasswordComplexity,
  validatePasswordConfirmationMatch,
} from '@/utils/formValidators';

type RecoveryStep = 'REQUEST_CODE' | 'RESET_PASSWORD' | 'SUCCESS';

export const RecoverAccount: React.FC = () => {
  const navigate = useNavigate();
  const authService = useAuthService();

  const [step, setStep] = useState<RecoveryStep>('REQUEST_CODE');
  const [identifier, setIdentifier] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ message: string; variant: 'info' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateRequestStep = (): boolean => {
    const error = executeFieldValidation(identifier, [
      validateRequiredField('Correo electrónico'),
      validateEmailAddress,
      validateMaximumLength('Correo electrónico', 80),
    ]);

    if (error) {
      setFieldErrors({ identifier: error });
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const validateResetStep = (): boolean => {
    const errors: Record<string, string> = {};
    const passwordStatus = evaluatePasswordComplexity(newPassword);

    const lengthError = executeFieldValidation(newPassword, [validateMaximumLength('Contraseña', 64)]);
    if (lengthError) {
      errors.newPassword = lengthError;
    } else if (!passwordStatus.isFullyValid) {
      errors.newPassword = 'La contraseña no cumple con todos los requisitos mínimos de seguridad.';
    }

    const confirmationResult = validatePasswordConfirmationMatch(newPassword, confirmPassword);
    if (!confirmationResult.isValid && confirmationResult.errorMessage) {
      errors.confirmPassword = confirmationResult.errorMessage;
    }

    if (verificationCode.length !== 6) {
      errors.code = 'Ingresa los 6 dígitos del código de verificación.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateRequestStep()) return;

    setIsLoading(true);
    try {
      await authService.requestPasswordReset({ email: identifier.trim().toLowerCase() });
      setFieldErrors({});
      setStep('RESET_PASSWORD');
    } catch {
      setNotification({
        message: 'No fue posible procesar la solicitud. Verifica los datos e inténtalo de nuevo.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authService.requestPasswordReset({ email: identifier.trim().toLowerCase() });
      setNotification({
        message: 'Hemos reenviado un nuevo código a tu correo.',
        variant: 'info',
      });
    } catch {
      setNotification({
        message: 'No fue posible reenviar el código. Intenta de nuevo más tarde.',
        variant: 'error',
      });
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateResetStep()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: identifier.trim().toLowerCase(),
        code: verificationCode,
        newPassword,
      });
      setFieldErrors({});
      setStep('SUCCESS');
    } catch {
      setNotification({
        message: 'El código es incorrecto o ha expirado.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFieldChange = (field: string, value: string) => {
    if (field === 'newPassword') setNewPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (field === 'code') setVerificationCode(value);
    clearFieldError(field);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentContainer}>
        <div className={styles.logoContainer}>
          <img src={logoTequio} alt="Tequio" className={styles.logo} />
        </div>

        {step === 'REQUEST_CODE' && (
          <RequestCodeStep
            identifier={identifier}
            fieldError={fieldErrors.identifier}
            isLoading={isLoading}
            onIdentifierChange={(val) => {
              setIdentifier(val);
              clearFieldError('identifier');
            }}
            onSubmit={handleRequestCode}
          />
        )}

        {step === 'RESET_PASSWORD' && (
          <ResetPasswordStep
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            verificationCode={verificationCode}
            fieldErrors={fieldErrors}
            isLoading={isLoading}
            onFieldChange={handleResetFieldChange}
            onSubmit={handleResetPassword}
            onResendCode={handleResendCode}
          />
        )}

        {step === 'SUCCESS' && (
          <SuccessStep onReturnToLogin={() => navigate('/login')} />
        )}
      </div>

      <div className={styles.bottomBarWrapper}>
        <ColorBar height={12} />
      </div>

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