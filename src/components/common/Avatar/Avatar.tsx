import React, { useState } from 'react';
import { User } from 'lucide-react';
import styles from './Avatar.module.css';

export interface AvatarProps {
  src?: string | null;
  altName?: string;
  size?: number | string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  altName = 'Usuario',
  size,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const containerStyle: React.CSSProperties = size
    ? {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }
    : {};

  const initial = altName.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`${styles.container} ${className}`.trim()}
      style={containerStyle}
      role="img"
      aria-label={`Foto de perfil de ${altName}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={`Foto de ${altName}`}
          className={styles.image}
          onError={() => setHasError(true)}
        />
      ) : initial ? (
        <span className={styles.initial} aria-hidden="true">
          {initial}
        </span>
      ) : (
        <div className={styles.iconWrapper} aria-hidden="true">
          <User />
        </div>
      )}
    </div>
  );
};

export default Avatar;