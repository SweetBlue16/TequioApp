import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './ComboBox.module.css';

/**
 * Option entry descriptor for the ComboBox dropdown.
 */
export interface ComboBoxOption {
  /** Visible label displayed inside the dropdown list */
  label: string;
  /** Actual value sent to handlers or form state */
  value: string | number;
}

/**
 * Properties for the ComboBox component.
 */
export interface ComboBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Accessible text label displayed above the dropdown.
   */
  label?: string;
  /**
   * List of selectable option items.
   */
  options: ComboBoxOption[];
  /**
   * Optional placeholder option displayed when no value is selected.
   */
  placeholderOption?: string;
  /**
   * Error message displayed beneath the element when invalid.
   */
  errorMessage?: string;
}

/**
 * Accessible dropdown ComboBox adhering to WCAG touch targets (min 48px)
 * and custom Tequio styling.
 */
export const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  options,
  placeholderOption,
  errorMessage,
  id,
  className = '',
  disabled = false,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;

  const selectClasses = [
    styles.select,
    errorMessage ? styles.selectError : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          disabled={disabled}
          className={selectClasses}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          {...props}
        >
          {placeholderOption && (
            <option value="" disabled>
              {placeholderOption}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className={styles.arrowIcon} aria-hidden="true">
          <ChevronDown size={18} />
        </span>
      </div>

      {errorMessage && (
        <span id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default ComboBox;