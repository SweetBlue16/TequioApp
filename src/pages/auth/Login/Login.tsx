import type { LoginRequest } from '@/types/login/LoginRequest';
import { useAuthService } from '@/contexts/AuthServiceContext';
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

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notification, setNotification] = useState<{ message: string; variant: 'info' | 'error' } | null>(null);
  const authService = useAuthService();
  const navigate = useNavigate();

  /**
   * Valida los campos obligatorios en el cliente antes de llamar a la red.
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
   * Manejador de envío con compuerta de validación previa.
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Barrera de validación en cliente: Detiene el envío si hay datos vacíos o inválidos
    if (!validateLoginForm()) {
      return;
    }

    // 2. Solo si los datos son válidos, iniciamos el estado de carga y conectamos con el servidor
    setIsLoggingIn(true);

    try {
      const loginRequest: LoginRequest = {
        email: identifier.trim(),
        password: password,
      };

      await authService.login(loginRequest);
      void navigate('/perfil');
    } catch (error) {
      console.error('Error during login:', error);
      setNotification({ message: 'Error al iniciar sesión. Intenta nuevamente.', variant: 'error' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleNotImplemented = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Agrega funcionalidad aquí');
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
              type="text"
              placeholder="Correo electrónico o número de teléfono"
              aria-label="Correo electrónico o número de teléfono"
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
            <TextLink variant="terracotta" onClick={handleNotImplemented}>
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