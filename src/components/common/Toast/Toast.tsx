import React, { useEffect } from 'react';
import styles from './Toast.module.css';

/**
 * Variantes visuales para el componente Toast.
 */
export type ToastVariant = 'info' | 'error';

/**
 * Propiedades del componente Toast.
 */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Mensaje principal a mostrar en la notificación.
   */
  message: React.ReactNode;
  /**
   * Tipo de variante que determina el esquema de color e intención.
   * @default 'info'
   */
  variant?: ToastVariant;
  /**
   * Tiempo en milisegundos para auto-cerrar la notificación.
   * Si no se define o es 0, no se cerrará automáticamente.
   */
  duration?: number;
  /**
   * Callback invocado al cerrarse el Toast (por timeout o clic de cierre).
   */
  onClose?: () => void;
  /**
   * Si es true, muestra un botón para descartar manualmente el Toast.
   * @default true
   */
  dismissible?: boolean;
  /**
   * Clase CSS opcional para personalizaciones o posicionamiento externo.
   */
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration,
  onClose,
  dismissible = true,
  className = '',
  ...props
}) => {
  useEffect(() => {
    if (!duration || duration <= 0 || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const resolvedClassName = [
    styles.toast,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={resolvedClassName}
      {...props}
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {variant === 'error' ? '⚠️' : 'ℹ️'}
        </span>
        <div className={styles.message}>{message}</div>
      </div>

      {dismissible && onClose && (
        <button
          type="button"
          aria-label="Cerrar notificación"
          className={styles.closeButton}
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
