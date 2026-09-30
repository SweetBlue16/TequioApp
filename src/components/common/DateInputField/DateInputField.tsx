import React, { useId } from 'react';
import { Calendar } from 'lucide-react';
import styles from './DateInputField.module.css';

/**
 * Properties for the DateInputField component.
 */
export interface DateInputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Accessible label displayed above the date picker input.
   */
  label?: string;
  /**
   * Explanatory validation error message displayed beneath the element.
   */
  errorMessage?: string;
  /**
   * Optional helper text displayed beneath the input when valid.
   */
  helperText?: string;
}

/**
 * Accessible date input component adhering to WCAG 2.5.5 minimum touch size (48px)
 * and native browser/mobile wheel picker integration.
 */
export const DateInputField: React.FC<DateInputFieldProps> = ({
  label,
  errorMessage,
  helperText,
  id,
  className = '',
  disabled = false,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const inputClasses = [
    styles.dateInput,
    errorMessage ? styles.inputError : '',
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
          type="date"
          disabled={disabled}
          className={inputClasses}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={
            errorMessage ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        <span className={styles.calendarIcon} aria-hidden="true">
          <Calendar size={18} />
        </span>
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

export default DateInputField;