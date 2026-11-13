import React from 'react';
import SearchBar from '@/components/common/SearchBar';
import SortSelect from '@/components/common/SortSelect';
import type { SortOption } from '@/components/common/SortSelect';
import styles from './DeliveryPointToolbar.module.css';

/**
 * Properties contract for the DeliveryPointToolbar component.
 */
export interface DeliveryPointToolbarProps {
  /** Current search query text */
  searchTerm: string;
  /** Callback triggered when the search query changes */
  onSearchChange: (value: string) => void;
  /** Currently selected sort option value */
  selectedSort: string;
  /** Callback triggered when the sort selection changes */
  onSortChange: (value: string) => void;
  /** Available sort criteria options */
  sortOptions: readonly SortOption<string>[];
  /** Callback triggered when clicking the add delivery point button */
  onAddDeliveryPoint: () => void;
}

/**
 * Top action bar for the authorized delivery points table.
 * Groups creation button, name search input, and sorting dropdown.
 */
export const DeliveryPointToolbar: React.FC<DeliveryPointToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSort,
  onSortChange,
  sortOptions,
  onAddDeliveryPoint,
}) => {
  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        onClick={onAddDeliveryPoint}
        className={styles.addButton}
      >
        Agregar punto de entrega
      </button>

      <div className={styles.filtersGroup}>
        <div className={styles.searchContainer}>
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por nombre"
          />
        </div>

        <SortSelect
          options={sortOptions}
          selectedValue={selectedSort}
          onChange={onSortChange}
          prefixLabel="Ordenar por :"
        />
      </div>
    </div>
  );
};

export default DeliveryPointToolbar;