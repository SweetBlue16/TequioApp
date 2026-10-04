import { useAuthService } from '@/contexts/AuthServiceContext';
import type { VerificationRequest } from '@/types/registration/VerificationRequest';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { InputField } from '@/components/common/InputField';
import { CodeInput } from '@/components/common/CodeInput';
import { Button } from '@/components/common/Button';
import { TextLink } from '@/components/common/TextLink';
import { ColorBar } from '@/components/common/ColorBar';
import { validateEmailAddress } from '@/utils/formValidators';
import styles from './VerifyAccount.module.css';

interface NavigationLocationState {
  email?: string;
}

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
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerifiedSuccessfully, setIsVerifiedSuccessfully] = useState<boolean>(false);

  useEffect(() => {
    if (isVerifiedSuccessfully) {
      const redirectTimer = setTimeout(() => {
        void navigate('/login');
      }, 2500);

      return () => clearTimeout(redirectTimer);
    }
  }, [isVerifiedSuccessfully, navigate]);

  const handleVerificationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailValidationResult = validateEmailAddress(email);
    if (!emailValidationResult.isValid && emailValidationResult.errorMessage) {
      setEmailErrorMessage(emailValidationResult.errorMessage);
      return;
    }

    if (verificationCode.length !== 6) {
      setCodeErrorMessage('Ingresa los 6 dígitos del código de verificación.');
      return;
    }

    setEmailErrorMessage(null);
    setCodeErrorMessage(null);
    setGeneralErrorMessage(null);
    setIsVerifying(true);

    try {
      const payload: VerificationRequest = {
        email: email.trim().toLowerCase(),
        verificationCode: verificationCode,
      };

      await authService.verify(payload);
      console.info('Verificación exitosa para:', email);

      setIsVerifiedSuccessfully(true);
    } catch {
      setCodeErrorMessage('El código es incorrecto o ha expirado.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestNewCode = () => {
    const emailValidationResult = validateEmailAddress(email);
    if (!emailValidationResult.isValid) {
      setEmailErrorMessage('Ingresa tu correo para solicitar un nuevo código.');
      return;
    }

    setEmailErrorMessage(null);
    console.info('Reenvío de código solicitado para:', email);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContentArea}>
        <Card maxWidth="460px" centered padding="lg">
          {isVerifiedSuccessfully ? (
            <div className={styles.successContainer}>
              <h1 className={styles.title}>Verificación</h1>
              <p className={styles.successMessage}>
                ¡Tu cuenta ha sido creada con éxito, bienvenido a Tequio!
              </p>
              <div className={styles.spinner} role="status" aria-label="Cargando" />
              <p className={styles.instructionText}>Llevándote a la página de ingreso...</p>
            </div>
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
                >
                  <TextLink to="#" variant="terracotta">
                    Solicita un nuevo código aquí
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