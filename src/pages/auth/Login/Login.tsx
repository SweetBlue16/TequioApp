import type { LoginRequest } from '@/types/login/LoginRequest';
// import { useAuthService } from '@/contexts/AuthServiceContext';
import React, { useState } from 'react';
import styles from './Login.module.css';
import InputField from '@/components/common/InputField';
import Button from '@/components/common/Button';
import TextLink from '@/components/common/TextLink';
import Toast from '@/components/common/Toast';
import logoTequio from '@/assets/images/logoTequio.png';
import { useNavigate } from 'react-router-dom';
import {
  executeFieldValidation,
  validateRequiredField,
  validateEmailAddress,
  validateMaximumLength,
} from '@/utils/formValidators';

/**
 * Login view component with secure client-side validations and backend integration.
 */
export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notification, setNotification] = useState<{ message: string; variant: 'info' | 'error' } | null>(null);
  const authService = useAuthService();
  const navigate = useNavigate();

  /**
   * Validates form inputs before dispatching the request to the network.
   */
  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};

    const identifierError = executeFieldValidation(identifier, [
      validateRequiredField('Correo electrónico'),
      validateEmailAddress,
      validateMaximumLength('Correo electrónico', 80),
    ]);

    const passwordError = executeFieldValidation(password, [
      validateRequiredField('Contraseña'),
      validateMaximumLength('Contraseña', 64),
    ]);

    if (identifierError) errors.identifier = identifierError;
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles user login submission with guard clauses against invalid input.
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const loginRequest: LoginRequest = {
        email: identifier.trim().toLowerCase(),
        password: password,
      };

      await authService.login(loginRequest);
      void navigate('/perfil');
    } catch (error) {
      console.error('Error during login:', error);
      setNotification({
        message: 'Credenciales incorrectas. Verifica tus datos e inténtalo de nuevo.',
        variant: 'error',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.leftDivision}>
        <div className={styles.logoContainer}>
          <img src={logoTequio} alt="Tequio Logo" className={styles.logo} />
        </div>

        <div className={styles.greetingContainer}>
          <span className={styles.greetingMedium}>Hola</span>
          <span className={styles.greetingLarge}>Tequio!</span>
          <span className={styles.greetingItalic}>
            El lugar donde apoyas el comercio local
          </span>
        </div>

        <div className={styles.footerText}>
          @2026 Tequio. All rights reserved.
        </div>
      </div>

      <div className={styles.rightDivision}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>¡Bienvenid@ de vuelta!</h1>

          <form onSubmit={handleLoginSubmit} noValidate className={styles.inputGroup}>
            <InputField
              type="email"
              placeholder="Correo electrónico"
              aria-label="Correo electrónico"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (fieldErrors.identifier) {
                  setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                }
              }}
              errorMessage={fieldErrors.identifier}
              maxLength={80}
            />

            <InputField
              type="password"
              placeholder="Contraseña"
              aria-label="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              errorMessage={fieldErrors.password}
              maxLength={64}
            />

            <div className={styles.buttonWrapper}>
              <Button
                type="submit"
                variant="primary"
                className={styles.loginButton}
                isLoading={isLoggingIn}
              >
                Iniciar Sesión
              </Button>
            </div>
          </form>

          <div className={styles.forgotPasswordWrapper}>
            <TextLink variant="terracotta" to="/recuperar">
              Olvidé mi contraseña
            </TextLink>
          </div>

          <div className={styles.registerSection}>
            <span className={styles.registerText}>¿No tienes cuenta?</span>
            <div className={styles.registerLinkWrapper}>
              <TextLink to="/registro" variant="terracotta">
                Regístrate aquí
              </TextLink>
            </div>
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
      </div>
    </div>
  );
};

export default Login;