import React from 'react';
import { Package } from 'lucide-react';
import styles from './ProductListItem.module.css';

/**
 * Domain entity contract representing a base product for listing.
 */
export interface ProductItemData {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  imageUrl?: string | null;
  isActive: boolean;
}

/**
 * Properties contract for the ProductListItem component.
 */
export interface ProductListItemProps {
  /** Base product data payload */
  product: ProductItemData;
  /** Callback triggered when clicking the row to edit/inspect the product */
  onClick: (productId: number) => void;
  /** Callback triggered when confirming deactivation */
  onDeactivate: (productId: number) => void;
  /** Flag indicating whether the deactivation process is ongoing */
  isDeactivating?: boolean;
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * Interactive product item rendering a row on desktop and an accessible touch card on mobile.
 * Uses event.stopPropagation to separate row modification clicks from deactivation actions.
 */
export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onClick,
  onDeactivate,
  isDeactivating = false,
  className = '',
}) => {
  const handleRowClick = () => {
    onClick(product.id);
  };

  const handleDeactivateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDeactivate(product.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(product.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      className={`${styles.itemRow} ${className}`.trim()}
      aria-label={`Modificar producto ${product.name}`}
    >
      <div className={styles.thumbnailWrapper}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`Fotografía de ${product.name}`}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <Package size={32} className={styles.placeholderIcon} aria-hidden="true" />
        )}
      </div>

      <div className={styles.detailsContent}>
        <div className={styles.columnName}>
          <h3 className={styles.productName}>{product.name}</h3>
        </div>

        <div className={styles.columnCategory}>
          <span>{product.category}</span>
        </div>

        <div className={styles.columnSubcategory}>
          <span>{product.subcategory}</span>
        </div>
      </div>

      <div className={styles.actionsWrapper}>
        <button
          type="button"
          onClick={handleDeactivateClick}
          disabled={isDeactivating}
          className={styles.deactivateButton}
          aria-label={`Dar de baja ${product.name}`}
        >
          {isDeactivating ? 'Procesando...' : 'Dar de baja'}
        </button>
      </div>
    </div>
  );
};

export default ProductListItem;