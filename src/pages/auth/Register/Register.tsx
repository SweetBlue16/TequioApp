import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleSelector } from './components/RoleSelector';
import { RegisterWizard, type RegistrationFormData } from './components/RegisterWizard';
import { ColorBar } from '@/components/common/ColorBar';
import registerBannerImage from '@/assets/images/fondo_register.jpg';
import styles from './Register.module.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'producer' | 'buyer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalErrorMessage, setGeneralErrorMessage] = useState<string | null>(null);

  const handleSelectRole = (role: 'producer' | 'buyer') => {
    setSelectedRole(role);
  };

  const handleReturnToRoleSelection = () => {
    setSelectedRole(null);
    setGeneralErrorMessage(null);
  };

  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    setIsSubmitting(true);
    setGeneralErrorMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      console.info('Payload de registro listo:', formData);
      navigate('/verificar', { state: { email: formData.email } });
    } catch {
      setGeneralErrorMessage('No fue posible completar tu registro. Intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormActive = selectedRole !== null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContentArea}>
        {generalErrorMessage && (
          <div role="alert" className={styles.alertBox}>
            {generalErrorMessage}
          </div>
        )}

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

      <ColorBar height={6} className={styles.bottomColorBar} />
    </div>
  );
};

export default Register;