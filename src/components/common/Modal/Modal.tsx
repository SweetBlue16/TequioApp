import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`${styles.dialog} ${className}`.trim()}
        onClick={(event) => event.stopPropagation()} 
      >
        <ColorBar height={8} />

        <div className={styles.contentArea}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {highlight && <p className={styles.highlightText}>{highlight}</p>}
          {description && <p className={styles.description}>{description}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;