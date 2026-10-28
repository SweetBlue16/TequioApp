import React from 'react';
import { ProductListItem } from '../ProductListItem';
import type { ProductItemData } from '../ProductListItem';
import styles from './ProductListTable.module.css';

/**
 * Properties contract for the ProductListTable component.
 */
export interface ProductListTableProps {
  products: readonly ProductItemData[];
  onProductClick: (productId: number) => void;
  onDeactivateProduct: (productId: number) => void;
  deactivatingId?: number | null;
  className?: string;
}

/**
 * Presents a responsive list of producer products with desktop column titles.
 */
export const ProductListTable: React.FC<ProductListTableProps> = ({
  products,
  onProductClick,
  onDeactivateProduct,
  deactivatingId = null,
  className = '',
}) => {
  if (products.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        <p>No se encontraron productos registrados con ese criterio.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.tableWrapper} ${className}`.trim()}>
      <header className={styles.headerRow} aria-hidden="true">
        <span className={styles.columnHeader}>Foto</span>
        <span className={styles.columnHeader}>Nombre</span>
        <span className={styles.columnHeader}>Categoría</span>
        <span className={styles.columnHeader}>Unidad</span>
        <span className={styles.columnHeaderAction}>Acción</span>
      </header>

      <section className={styles.itemsContainer} aria-label="Catálogo de productos registrados">
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            onClick={onProductClick}
            onDeactivate={onDeactivateProduct}
            isDeactivating={deactivatingId === product.id}
          />
        ))}
      </section>
    </div>
  );
};

export default ProductListTable;