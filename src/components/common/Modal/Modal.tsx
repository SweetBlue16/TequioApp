import React, { useEffect, useId, useRef } from 'react';
import { ColorBar } from '@/components/common/ColorBar';
import styles from './Modal.module.css';

/**
 * Properties contract for the generic Modal dialog.
 */
export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  highlight?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Accessible modal dialog featuring blurred backdrop, institutional color bar,
 * and keyboard dismissal support.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  highlight,
  description,
  children,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) {
      return;
    }

    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
    >
      <div className={`${styles.dialog} ${className}`.trim()}>
        <ColorBar height={8} />

        <div className={styles.contentArea}>
          {title && (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          )}
          {highlight && <p className={styles.highlightText}>{highlight}</p>}
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          className={styles.backdropButton}
          tabIndex={-1}
          aria-label="Cerrar diálogo"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClose}
        />
      )}
    </dialog>
  );
};

export default Modal;
