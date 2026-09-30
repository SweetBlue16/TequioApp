import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './InputField.module.css';

/**
 * Properties for the InputField component.
 */
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Accessible label displayed above the input element.
   */
  label?: string;
  /**
   * Explanatory error message displayed beneath the input when invalid.
   */
  errorMessage?: string;
  /**
   * Optional helper text displayed beneath the input when there is no error.
   */
  helperText?: string;
  /**
   * Enables the interactive password visibility toggle if type is 'password'.
   * @default true
   */
  enablePasswordToggle?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  errorMessage,
  helperText,
  enablePasswordToggle = true,
  type = 'text',
  id,
  className = '',
  disabled = false,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const isPasswordField = type === 'password';
  const computedInputType = isPasswordField && isPasswordVisible ? 'text' : type;

  const handleTogglePassword = (): void => {
    setIsPasswordVisible((previousState) => !previousState);
  };

  const inputClasses = [
    styles.input,
    errorMessage ? styles.inputError : '',
    isPasswordField && enablePasswordToggle ? styles.hasRightAction : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          type={computedInputType}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={
            errorMessage ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        {isPasswordField && enablePasswordToggle && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={handleTogglePassword}
            disabled={disabled}
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
            title={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {errorMessage ? (
        <span id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </span>
      ) : helperText ? (
        <span id={helperId} className={styles.errorMessage}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default InputField;