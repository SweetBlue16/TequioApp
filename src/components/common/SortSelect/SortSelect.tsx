import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './SortSelect.module.css';

/**
 * Sort option definition for dynamic ordering criteria.
 */
export interface SortOption<T extends string = string> {
  /** Visible label displayed in the dropdown (e.g., 'Nombre (A - Z)') */
  label: string;
  /** Internal value identifying the sort key */
  value: T;
}

/**
 * Properties contract for the SortSelect component.
 */
export interface SortSelectProps<T extends string = string> {
  /** Available sort options to select from */
  options: readonly SortOption<T>[];
  /** Currently selected sort criteria value */
  selectedValue: T;
  /** Callback triggered when the sorting criteria changes */
  onChange: (newValue: T) => void;
  /** Optional custom prefix text (defaults to 'Ordenar por :') */
  prefixLabel?: string;
  /** Optional custom CSS class name for external layout overrides */
  className?: string;
  /** Optional accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * Generic pill-styled sort dropdown component adhering to WCAG 2.5.5 touch target guidelines.
 */
export const SortSelect = <T extends string = string>({
  options,
  selectedValue,
  onChange,
  prefixLabel = 'Ordenar por :',
  className = '',
  ariaLabel = 'Criterio de ordenamiento',
}: SortSelectProps<T>): React.ReactElement => {
  const generatedId = useId();

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as T);
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <label htmlFor={generatedId} className={styles.prefixLabel}>
        {prefixLabel}
      </label>

      <div className={styles.selectWrapper}>
        <select
          id={generatedId}
          value={selectedValue}
          onChange={handleSelectChange}
          className={styles.select}
          aria-label={ariaLabel}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className={styles.chevronIcon} aria-hidden="true">
          <ChevronDown size={16} />
        </span>
      </div>
    </div>
  );
};

export default SortSelect;