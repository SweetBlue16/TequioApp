import React from 'react';
import { SearchBar } from '@/components/common/SearchBar';
import { SortSelect } from '@/components/common/SortSelect';
import type { SortOption } from '@/components/common/SortSelect';
import styles from './ProductToolbar.module.css';

/**
 * Properties contract for the ProductToolbar component.
 */
export interface ProductToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSort: string;
  onSortChange: (value: string) => void;
  sortOptions: readonly SortOption[];
  onAddProduct: () => void;
  className?: string;
}

/**
 * Top control bar containing the creation action, search query, and sorting dropdown.
 */
export const ProductToolbar: React.FC<ProductToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSort,
  onSortChange,
  sortOptions,
  onAddProduct,
  className = '',
}) => {
  return (
    <div
      className={`${styles.toolbar} ${className}`.trim()}
      role="region"
      aria-label="Barra de herramientas de productos"
    >
      <div className={styles.actionGroup}>
        <button
          type="button"
          onClick={onAddProduct}
          className={styles.addButton}
          aria-label="Agregar un nuevo producto al catálogo"
        >
          Agregar producto
        </button>
      </div>

      <div className={styles.filtersGroup}>
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por nombre"
        />

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

export default ProductToolbar;