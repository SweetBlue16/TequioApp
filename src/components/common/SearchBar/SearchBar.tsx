import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

/**
 * Properties for the SearchBar component.
 */
export interface SearchBarProps {
  /** Current search input value */
  value: string;
  /** Callback triggered whenever the input text changes */
  onChange: (value: string) => void;
  /** Optional placeholder text displayed inside the field */
  placeholder?: string;
  /** Optional custom CSS class name for layout constraints */
  className?: string;
}

/**
 * Reusable search bar input component with integrated clear action.
 * Complies with WCAG 2.5.5 minimum touch sizes (48px) and fluid responsive layouts.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar por nombre',
  className = '',
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`${styles.searchContainer} ${className}`.trim()}>
      <span className={styles.iconWrapper} aria-hidden="true">
        <Search className={styles.icon} />
      </span>

      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={styles.input}
        aria-label={placeholder}
      />

      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Limpiar búsqueda"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;