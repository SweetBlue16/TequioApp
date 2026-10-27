import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthService } from '@/contexts/AuthContext';
import { RoleSelector } from './components/RoleSelector';
import { RegisterWizard, type RegistrationFormData } from './components/RegisterWizard';
import { ColorBar } from '@/components/common/ColorBar';
import Toast from '@/components/common/Toast';
import type { RegistrationRequest } from '@/types/registration/RegistrationRequest';
import registerBannerImage from '@/assets/images/fondo_register.jpg';
import styles from './Register.module.css';

/**
 * Normalizes an input date string (YYYY-MM-DD) into an ISO UTC representation.
 *
 * @param dateString - The raw calendar date string.
 * @returns The ISO-8601 UTC date string, or null if empty or invalid.
 */
function formatToUtcIsoDate(dateString: string): string | null {
  if (!dateString) {
    return null;
  }

  const parsedDate = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

/**
 * Resolves caught exceptions into safe, user-facing error messages.
 * Prevents technical data leakage (stack traces, SQL errors) and ensures cyclomatic complexity <= 3.
 *
 * @param error - The raw error caught from the request.
 * @returns A sanitized, user-friendly error message string.
 */
const resolveSafeErrorMessage = (error: unknown): string => {
  const genericErrorMessage = 'Hubo un error con el sistema. Intenta más tarde.';

  if (!axios.isAxiosError(error) || !error.response) {
    return 'No fue posible conectar con el servidor. Verifica tu conexión a internet.';
  }

  const { status, data } = error.response;

  if (status >= 500) {
    return genericErrorMessage;
  }

  if (status === 409) {
    return 'El correo electrónico ya se encuentra registrado. Intenta iniciar sesión.';
  }

  if (status === 429) {
    return 'Demasiados intentos. Por favor espera unos momentos antes de reintentar.';
  }

  if ((status === 400 || status === 422) && data && typeof data === 'object') {
    const payload = data as Record<string, unknown>;
    const customMessage = payload.mensaje || payload.message;

    if (typeof customMessage === 'string' && customMessage.trim().length > 0 && customMessage.length < 150) {
      return customMessage;
    }

    return 'Los datos ingresados no son válidos. Por favor revisa el formulario.';
  }

  return genericErrorMessage;
};

/**
 * Builds the normalized registration payload contract expected by the API service.
 *
 * @param formData - The multi-step form data collected from the wizard.
 * @returns A sanitized and typed RegistrationRequest object.
 */
const buildRegistrationPayload = (formData: RegistrationFormData): RegistrationRequest => ({
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
  firstName: formData.firstName.trim(),
  paternalLastName: formData.firstLastName.trim(),
  maternalLastName: formData.secondLastName.trim() || undefined,
  birthDate: formatToUtcIsoDate(formData.birthDate) || '',
  phoneNumber: formData.phone.trim() || undefined,
  roleId: formData.roleId,
});

/**
 * Orchestrator component managing the user registration flow, role selection, and wizard steps.
 */
export const Register: React.FC = () => {
  const authService = useAuthService();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<'producer' | 'buyer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalErrorMessage, setGeneralErrorMessage] = useState<string | null>(null);

  /**
   * Sets the active role selection and initiates the wizard flow.
   */
  const handleSelectRole = (role: 'producer' | 'buyer') => {
    setSelectedRole(role);
  };

  /**
   * Resets role selection to take the user back to the initial step.
   */
  const handleReturnToRoleSelection = () => {
    setSelectedRole(null);
    setGeneralErrorMessage(null);
  };

  /**
   * Dispatches the normalized registration payload to the backend service.
   */
  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    setIsSubmitting(true);
    setGeneralErrorMessage(null);

    try {
      const payload = buildRegistrationPayload(formData);
      await authService.register(payload);

      console.info('Registro exitoso para:', payload.email);
      void navigate('/verificar', { state: { email: payload.email } });
    } catch (error: unknown) {
      const safeMessage = resolveSafeErrorMessage(error);
      setGeneralErrorMessage(safeMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormActive = selectedRole !== null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContentArea}>
        {!isFormActive ? (
          <div className={styles.centeredContainer}>
            <RoleSelector onSelectRole={handleSelectRole} />
          </div>
        ) : (
          <div className={styles.wizardLayoutContainer}>
            <div className={styles.wizardCardWrapper}>
              <RegisterWizard
                role={selectedRole}
                onReturnToRoleSelection={handleReturnToRoleSelection}
                onSubmitRegistration={handleRegistrationSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            <aside className={styles.sideDecorationPanel} aria-hidden="true">
              <img
                src={registerBannerImage}
                alt=""
                className={styles.sideDecorationImage}
              />
            </aside>
          </div>
        )}
      </div>

      {generalErrorMessage && (
        <div className={styles.toastViewport}>
          <Toast
            message={generalErrorMessage}
            variant="error"
            duration={6000}
            onClose={() => setGeneralErrorMessage(null)}
          />
        </div>
      )}

      <ColorBar height={6} className={styles.bottomColorBar} />
    </div>
  );
};

export default Register;
