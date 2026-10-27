import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/common/Card';
import { InputField } from '@/components/common/InputField';
import { CodeInput } from '@/components/common/CodeInput';
import { Button } from '@/components/common/Button';
import { TextLink } from '@/components/common/TextLink';
import { ColorBar } from '@/components/common/ColorBar';
import { useAuthService } from '@/contexts/AuthContext';
import type { VerificationRequest } from '@/types/registration/VerificationRequest';
import { validateEmailAddress } from '@/utils/formValidators';
import styles from './VerifyAccount.module.css';

/**
 * Navigation state contract carrying optional email passed from the registration wizard.
 */
interface NavigationLocationState {
  email?: string;
}

/**
 * Extracts human-readable error messages from an unknown error or Axios response.
 * Keeps cyclomatic complexity <= 3.
 */
const resolveErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const errorPayload = error.response.data as Record<string, unknown>;
    const extractedMessage = errorPayload.mensaje || errorPayload.message || errorPayload.error;

    if (typeof extractedMessage === 'string' && extractedMessage.trim().length > 0) {
      return extractedMessage;
    }
  }

  return fallbackMessage;
};

/**
 * Visual view rendered when the verification succeeds before redirecting to login.
 */
const VerificationSuccessView: React.FC = () => (
  <div className={styles.successContainer}>
    <h1 className={styles.title}>Verificación</h1>
    <p className={styles.successMessage}>
      ¡Tu cuenta ha sido creada con éxito, bienvenido a Tequio!
    </p>
    <div className={styles.spinner} role="status" aria-label="Cargando" />
    <p className={styles.instructionText}>Llevándote a la página de ingreso...</p>
  </div>
);

/**
 * Account verification page supporting initial registration OTP confirmation and posterior manual verification.
 */
export const VerifyAccount: React.FC = () => {
  const authService = useAuthService();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as NavigationLocationState | null;

  const [email, setEmail] = useState<string>(navigationState?.email || '');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [codeErrorMessage, setCodeErrorMessage] = useState<string | null>(null);
  const [generalErrorMessage, setGeneralErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isVerifiedSuccessfully, setIsVerifiedSuccessfully] = useState<boolean>(false);

  useEffect(() => {
    if (!isVerifiedSuccessfully) {
      return;
    }

    const redirectTimer = setTimeout(() => {
      void navigate('/login');
    }, 2500);

    return () => clearTimeout(redirectTimer);
  }, [isVerifiedSuccessfully, navigate]);

  /**
   * Validates form inputs before dispatching the verification request.
   * Keeps cyclomatic complexity <= 4.
   */
  const validateFormInputs = (): boolean => {
    const emailResult = validateEmailAddress(email);
    if (!emailResult.isValid && emailResult.errorMessage) {
      setEmailErrorMessage(emailResult.errorMessage);
      return false;
    }

    if (verificationCode.length !== 6) {
      setCodeErrorMessage('Ingresa los 6 dígitos del código de verificación.');
      return false;
    }

    return true;
  };

  /**
   * Handles account verification form submission.
   */
  const handleVerificationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateFormInputs()) {
      return;
    }

    setEmailErrorMessage(null);
    setCodeErrorMessage(null);
    setGeneralErrorMessage(null);
    setInfoMessage(null);
    setIsVerifying(true);

    try {
      const payload: VerificationRequest = {
        email: email.trim().toLowerCase(),
        verificationCode: verificationCode.trim(),
      };

      await authService.verify(payload);
      setIsVerifiedSuccessfully(true);
    } catch (error: unknown) {
      const resolvedMessage = resolveErrorMessage(
        error,
        'El código es incorrecto o ha expirado.'
      );
      setCodeErrorMessage(resolvedMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Handles requesting a new verification code.
   */
  const handleRequestNewCode = async () => {
    const emailResult = validateEmailAddress(email);
    if (!emailResult.isValid) {
      setEmailErrorMessage('Ingresa un correo válido para solicitar un nuevo código.');
      return;
    }

    setEmailErrorMessage(null);
    setCodeErrorMessage(null);
    setGeneralErrorMessage(null);
    setInfoMessage(null);
    setIsResending(true);

    try {
      const candidateService = authService as unknown as {
        resendVerificationCode?: (emailAddress: string) => Promise<void>;
      };

      if (typeof candidateService.resendVerificationCode === 'function') {
        await candidateService.resendVerificationCode(email.trim().toLowerCase());
      }

      setInfoMessage('Si tu cuenta existe y tiene verificación pendiente, enviamos un nuevo código.');
    } catch (error: unknown) {
      const resolvedMessage = resolveErrorMessage(
        error,
        'No fue posible reenviar el código. Intenta más tarde.'
      );
      setGeneralErrorMessage(resolvedMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContentArea}>
        <Card maxWidth="460px" centered padding="lg">
          {isVerifiedSuccessfully ? (
            <VerificationSuccessView />
          ) : (
            <>
              <h1 className={styles.title}>Verificación de cuenta</h1>
              <p className={styles.instructionText}>
                Hemos enviado un código a tu correo electrónico. Revisa tu bandeja de entrada o la carpeta de correo no deseado.
              </p>

              {generalErrorMessage && (
                <div role="alert" className={styles.alertBox}>
                  {generalErrorMessage}
                </div>
              )}

              {infoMessage && (
                <div role="status" className={styles.alertBox} style={{ backgroundColor: '#e8f5e9', color: '#1b5e20' }}>
                  {infoMessage}
                </div>
              )}

              <form onSubmit={handleVerificationSubmit} noValidate className={styles.formContent}>
                <InputField
                  label="Correo electrónico con verificación pendiente*"
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailErrorMessage) setEmailErrorMessage(null);
                  }}
                  errorMessage={emailErrorMessage || undefined}
                  maxLength={150}
                  required
                />

                <div className={styles.codeBlock}>
                  <label className={styles.codeLabel}>Código de verificación*</label>
                  <CodeInput
                    length={6}
                    value={verificationCode}
                    onChange={(updatedCode) => {
                      setVerificationCode(updatedCode);
                      if (codeErrorMessage) setCodeErrorMessage(null);
                    }}
                    errorMessage={codeErrorMessage || undefined}
                  />
                </div>

                <Button type="submit" fullWidth isLoading={isVerifying}>
                  Verificar cuenta
                </Button>
              </form>

              <div className={styles.footerContainer}>
                <span className={styles.footerNote}>
                  ¿Te has quedado sin intentos o el código ha expirado?
                </span>
                <button
                  type="button"
                  onClick={handleRequestNewCode}
                  className={styles.linkButton}
                  disabled={isResending}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: isResending ? 'not-allowed' : 'pointer' }}
                >
                  <TextLink to="#" variant="terracotta">
                    {isResending ? 'Enviando código...' : 'Solicita un nuevo código aquí'}
                  </TextLink>
                </button>
              </div>
            </>
          )}
        </Card>
      </div>

      {!isVerifiedSuccessfully && (
        <ColorBar height={6} className={styles.bottomColorBar} />
      )}
    </div>
  );
};

export default VerifyAccount;