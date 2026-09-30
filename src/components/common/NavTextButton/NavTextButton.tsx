import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavTextButton.module.css';

export interface NavTextButtonProps {
  label: string;
  to?: string;
  onClick?: () => void;
  className?: string;
}

export const NavTextButton: React.FC<NavTextButtonProps> = ({
  label,
  to,
  onClick,
  className = '',
}) => {
  if (to) {
    return (
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          `${styles.button} ${isActive ? styles.active : ''} ${className}`.trim()
        }
      >
        {label}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.button} ${className}`.trim()}
    >
      {label}
    </button>
  );
};

export default NavTextButton;