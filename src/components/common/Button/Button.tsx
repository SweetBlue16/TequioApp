import React from 'react';
import styles from './Button.module.css';

/**
 * Visual variant options for the button component.
 */
export type ButtonVariant = 'primary' | 'terracotta' | 'outline';

/**
 * Properties for the Button component.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Internal content or node to render inside the button.
   */
  children: React.ReactNode;
  /**
   * Theme variant for background and border styling.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * If true, stretches the button width to occupy 100% of its parent container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Displays a loading spinner and disables interactive clicks to prevent double submissions.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Optional custom CSS class name for localized style adjustments.
   */
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const isButtonDisabled = disabled || isLoading;

  const resolvedClassName = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      className={resolvedClassName}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;