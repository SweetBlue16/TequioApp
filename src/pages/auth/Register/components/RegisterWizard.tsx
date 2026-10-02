import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Stepper, type StepDefinition } from '@/components/common/Stepper';
import { InputField } from '@/components/common/InputField';
import { DateInputField } from '@/components/common/DateInputField';
import { Button } from '@/components/common/Button';
import { TextLink } from '@/components/common/TextLink';
import {
  executeFieldValidation,
  validateRequiredField,
  validateAlphabeticTextOnly,
  validateEmailAddress,
  validateTelephoneNumber,
  validateLegalAdultAge,
  evaluatePasswordComplexity,
  validatePasswordConfirmationMatch,
} from '@/utils/formValidators';
import styles from '../Register.module.css';

const REGISTRATION_STEPS: StepDefinition[] = [
  { stepNumber: 1, label: 'Identidad' },
  { stepNumber: 2, label: 'Contacto' },
  { stepNumber: 3, label: 'Seguridad' },
];

export interface RegistrationFormData {
  roleId: number;
  firstName: string;
  firstLastName: string;
  secondLastName: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
}

export interface RegisterWizardProps {
  role: 'producer' | 'buyer';
  onReturnToRoleSelection: () => void;
  onSubmitRegistration: (formData: RegistrationFormData) => void;
  isSubmitting?: boolean;
}

export const RegisterWizard: React.FC<RegisterWizardProps> = ({
  role,
  onReturnToRoleSelection,
  onSubmitRegistration,
  isSubmitting = false,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });

  const passwordRequirementsStatus = evaluatePasswordComplexity(formData.password);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((previousState) => ({ ...previousState, [fieldName]: value }));

    if (fieldErrors[fieldName]) {
      setFieldErrors((previousErrors) => {
        const updatedErrors = { ...previousErrors };
        delete updatedErrors[fieldName];
        return updatedErrors;
      });
    }
  };

  const validatePersonalIdentityStep = (): boolean => {
    const errors: Record<string, string> = {};

    const firstNameError = executeFieldValidation(formData.firstName, [
      validateRequiredField('Nombre'),
      validateAlphabeticTextOnly('Nombre'),
    ]);
    const firstLastNameError = executeFieldValidation(formData.firstLastName, [
      validateRequiredField('Apellido paterno'),
      validateAlphabeticTextOnly('Apellido paterno'),
    ]);

    if (firstNameError) errors.firstName = firstNameError;
    if (firstLastNameError) errors.firstLastName = firstLastNameError;

    if (formData.secondLastName.trim().length > 0) {
      const secondLastNameError = executeFieldValidation(formData.secondLastName, [
        validateAlphabeticTextOnly('Apellido materno'),
      ]);
      if (secondLastNameError) errors.secondLastName = secondLastNameError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateContactAndAgeStep = (): boolean => {
    const errors: Record<string, string> = {};

    const emailError = executeFieldValidation(formData.email, [validateEmailAddress]);
    const phoneError = executeFieldValidation(formData.phone, [validateTelephoneNumber]);
    const ageError = executeFieldValidation(formData.birthDate, [validateLegalAdultAge]);

    if (emailError) errors.email = emailError;
    if (phoneError) errors.phone = phoneError;
    if (ageError) errors.birthDate = ageError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAccountSecurityStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordRequirementsStatus.isFullyValid) {
      errors.password = 'La contraseña no cumple con todos los requisitos mínimos de seguridad.';
    }

    const confirmationResult = validatePasswordConfirmationMatch(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmationResult.isValid && confirmationResult.errorMessage) {
      errors.confirmPassword = confirmationResult.errorMessage;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStepSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep === 1 && validatePersonalIdentityStep()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateContactAndAgeStep()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateAccountSecurityStep()) {
      onSubmitRegistration({
        roleId: role === 'producer' ? 2 : 1,
        firstName: formData.firstName.trim(),
        firstLastName: formData.firstLastName.trim(),
        secondLastName: formData.secondLastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        password: formData.password,
      });
    }
  };

  const handlePreviousStep = () => {
    setFieldErrors({});
    if (currentStep === 1) {
      onReturnToRoleSelection();
    } else {
      setCurrentStep((previousStep) => Math.max(previousStep - 1, 1));
    }
  };

  return (
    <Card maxWidth="520px" centered padding="lg">
      <h1 className={styles.title}>Crea tu cuenta</h1>

      <Stepper
        steps={REGISTRATION_STEPS}
        currentStep={currentStep}
        onStepClick={(targetStepNumber) => {
          if (targetStepNumber < currentStep) {
            setCurrentStep(targetStepNumber);
          }
        }}
      />

      <form onSubmit={handleNextStepSubmit} noValidate className={styles.formContent}>
        {currentStep === 1 && (
          <>
            <InputField
              label="Nombre*"
              placeholder="Ingresa tu nombre"
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              errorMessage={fieldErrors.firstName}
              required
            />

            <InputField
              label="Apellido paterno*"
              placeholder="Ingresa tu apellido paterno"
              value={formData.firstLastName}
              onChange={(e) => handleFieldChange('firstLastName', e.target.value)}
              errorMessage={fieldErrors.firstLastName}
              required
            />

            <InputField
              label="Apellido materno"
              placeholder="Ingresa tu apellido materno"
              value={formData.secondLastName}
              onChange={(e) => handleFieldChange('secondLastName', e.target.value)}
              errorMessage={fieldErrors.secondLastName}
            />

            <div className={styles.buttonRow}>
              <Button type="button" variant="outline" onClick={handlePreviousStep}>
                Atrás
              </Button>
              <Button type="submit" fullWidth>
                Continuar
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <InputField
              label="Correo electrónico*"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              errorMessage={fieldErrors.email}
              required
            />

            <InputField
              label="Número de teléfono*"
              type="tel"
              placeholder="10 dígitos numéricos"
              maxLength={10}
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
              errorMessage={fieldErrors.phone}
              required
            />

            <DateInputField
              label="Fecha de nacimiento*"
              value={formData.birthDate}
              onChange={(e) => handleFieldChange('birthDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              errorMessage={fieldErrors.birthDate}
              required
            />

            <div className={styles.buttonRow}>
              <Button type="button" variant="outline" onClick={handlePreviousStep}>
                Atrás
              </Button>
              <Button type="submit" fullWidth>
                Continuar
              </Button>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <InputField
              label="Contraseña*"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              errorMessage={fieldErrors.password}
              required
            />

            <div className={styles.requirementsBox}>
              <div className={styles.requirementsTitle}>Requisitos de contraseña:</div>
              <ul className={styles.requirementsList}>
                <li
                  className={`${styles.requirementItem} ${
                    passwordRequirementsStatus.hasMinimumLength ? styles.requirementMet : ''
                  }`}
                >
                  {passwordRequirementsStatus.hasMinimumLength ? '✓' : '○'} Mínimo 8 caracteres
                </li>
                <li
                  className={`${styles.requirementItem} ${
                    passwordRequirementsStatus.hasUppercaseLetter ? styles.requirementMet : ''
                  }`}
                >
                  {passwordRequirementsStatus.hasUppercaseLetter ? '✓' : '○'} Al menos una mayúscula
                </li>
                <li
                  className={`${styles.requirementItem} ${
                    passwordRequirementsStatus.hasNumericDigit ? styles.requirementMet : ''
                  }`}
                >
                  {passwordRequirementsStatus.hasNumericDigit ? '✓' : '○'} Al menos un número
                </li>
                <li
                  className={`${styles.requirementItem} ${
                    passwordRequirementsStatus.hasSpecialCharacter ? styles.requirementMet : ''
                  }`}
                >
                  {passwordRequirementsStatus.hasSpecialCharacter ? '✓' : '○'} Al menos un carácter especial (!@#$...)
                </li>
              </ul>
            </div>

            <InputField
              label="Confirmación de contraseña*"
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              errorMessage={fieldErrors.confirmPassword}
              required
            />

            <div className={styles.buttonRow}>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isSubmitting}
              >
                Atrás
              </Button>
              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Registrarme
              </Button>
            </div>
          </>
        )}
      </form>

      <div className={styles.footerText}>
        ¿Ya te has registrado y tienes un código de verificación?{' '}
        <TextLink to="/verificar" variant="terracotta">
          Verifica tu cuenta aquí
        </TextLink>
      </div>
    </Card>
  );
};

export default RegisterWizard;