import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TextLink.module.css';

/**
 * Visual color variant options for the TextLink component.
 */
export type TextLinkVariant = 'terracotta' | 'espresso' | 'muted';

/**
 * Properties for the TextLink component.
 */
export interface TextLinkProps {
  /**
   * Visible text content or nodes rendered inside the interactive link.
   */
  children: React.ReactNode;
  /**
   * Internal application route to navigate with React Router.
   * If omitted, renders as an accessible HTML button.
   */
  to?: string;
  /**
   * Optional click handler callback.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * Color variant applied to the text.
   * @default 'terracotta'
   */
  variant?: TextLinkVariant;
  /**
   * Centers the link within its parent container.
   * @default false
   */
  center?: boolean;
  /**
   * Optional custom CSS class name for localized adjustments.
   */
  className?: string;
  /**
   * Accessible ARIA label for screen readers if distinct from children.
   */
  ariaLabel?: string;
}

export const TextLink: React.FC<TextLinkProps> = ({
  children,
  to,
  onClick,
  variant = 'terracotta',
  center = false,
  className = '',
  ariaLabel,
}) => {
  const resolvedClasses = [
    styles.link,
    styles[variant],
    center ? styles.center : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={resolvedClasses}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={resolvedClasses}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default TextLink;