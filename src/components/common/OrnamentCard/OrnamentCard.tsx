import React from 'react';
import styles from './OrnamentCard.module.css';

/**
 * Controls which vertical section of the ornamental artwork is displayed.
 */
export type OrnamentRibbonPosition = 'top' | 'center' | 'bottom';

/**
 * Properties contract for the OrnamentCard component.
 */
export interface OrnamentCardProps {
  /** Card body content */
  children: React.ReactNode;
  /** Vertical focal point of barraAdorno.png ('top' for create, 'bottom' for edit, 'center' for detail) */
  ribbonPosition?: OrnamentRibbonPosition;
  /** Optional custom CSS class name */
  className?: string;
}

const POSITION_CLASS_MAP: Record<OrnamentRibbonPosition, string> = {
  top: styles.ribbonTop,
  center: styles.ribbonCenter,
  bottom: styles.ribbonBottom,
};

/**
 * Reusable white card with Tequio's left decorative cultural ribbon.
 * Shifts artwork framing depending on workflow context (create, edit, or view).
 */
export const OrnamentCard: React.FC<OrnamentCardProps> = ({
  children,
  ribbonPosition = 'center',
  className = '',
}) => {
  const positionClass = POSITION_CLASS_MAP[ribbonPosition];

  return (
    <section className={`${styles.card} ${className}`.trim()}>
      <div
        className={`${styles.ribbon} ${positionClass}`}
        role="presentation"
        aria-hidden="true"
      />
      <div className={styles.content}>{children}</div>
    </section>
  );
};

export default OrnamentCard;