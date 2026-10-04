import React, { useState } from 'react';
import styles from './Login.module.css';

import InputField from '@/components/common/InputField';
import Button from '@/components/common/Button';
import TextLink from '@/components/common/TextLink';

import logoTequio from '@/assets/images/logoTequio.png';

export const Login: React.FC = () => {
  // todo: Implementar la funcionalidad de inicio de sesión
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
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

          <div className={styles.inputGroup}>
            <InputField
              type="text"
              placeholder="Correo electrónico o número de teléfono"
              aria-label="Correo electrónico o número de teléfono"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              maxLength={80}
            />
            <InputField
              type="password"
              placeholder="Contraseña"
              aria-label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={64}
            />
          </div>

          <div className={styles.buttonWrapper}>
            <Button
              variant="primary"
              className={styles.loginButton}
              onClick={handleNotImplemented}
            >
              Iniciar Sesión
            </Button>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default Login;
