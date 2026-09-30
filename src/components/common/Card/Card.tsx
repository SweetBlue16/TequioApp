import React from 'react';
import styles from './Card.module.css';

/**
 * Padding size variations available for the Card container.
 */
export type CardPadding = 'sm' | 'md' | 'lg';

/**
 * Properties for the Card container component.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Internal content, form elements or layout nodes.
   */
  children: React.ReactNode;
  /**
   * Maximum width constraint (e.g. '440px', '600px', '100%').
   * Allows fluid responsive shrinkage on smaller viewports.
   */
  maxWidth?: string | number;
  /**
   * Internal spacing level for the container.
   * @default 'md'
   */
  padding?: CardPadding;
  /**
   * If true, centers the card horizontally using auto margins.
   * @default false
   */
  centered?: boolean;
  /**
   * If true, adds a subtle light border for extra boundary definition.
   * @default false
   */
  bordered?: boolean;
  /**
   * Optional custom CSS class name for localized adjustments.
   */
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  maxWidth,
  padding = 'md',
  centered = false,
  bordered = false,
  className = '',
  style,
  ...props
}) => {
  const resolvedPaddingClass =
    padding === 'sm'
      ? styles.paddingSm
      : padding === 'lg'
      ? styles.paddingLg
      : styles.paddingMd;

  const resolvedClasses = [
    styles.card,
    resolvedPaddingClass,
    centered ? styles.centered : '',
    bordered ? styles.bordered : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const computedStyle: React.CSSProperties = {
    ...style,
    ...(maxWidth !== undefined
      ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }
      : {}),
  };

  return (
    <div className={resolvedClasses} style={computedStyle} {...props}>
      {children}
    </div>
  );
};

export default Card;