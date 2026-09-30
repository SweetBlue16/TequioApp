import React from 'react';
import { CULTURAL_BAND_COLORS } from '@/constants/colors/theme';
import styles from './ColorBar.module.css';

export interface ColorBarProps {
  height?: number | string;
  className?: string;
}

export const ColorBar: React.FC<ColorBarProps> = ({
  height = 6,
  className = '',
}) => {
  const barHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`${styles.container} ${className}`.trim()}
      style={{ height: barHeight }}
    >
      {CULTURAL_BAND_COLORS.map((colorHex) => (
        <span
          key={colorHex}
          className={styles.segment}
          style={{ backgroundColor: colorHex }}
        />
      ))}
    </div>
  );
};

export default ColorBar;