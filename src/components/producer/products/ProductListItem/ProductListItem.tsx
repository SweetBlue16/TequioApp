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
  product: ProductItemData;
  onClick: (productId: number) => void;
  onDeactivate: (productId: number) => void;
  isDeactivating?: boolean;
  className?: string;
}

/**
 * Interactive product item rendering a row on desktop and an accessible touch card on mobile.
 */
export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onClick,
  onDeactivate,
  isDeactivating = false,
  className = '',
}) => {
  return (
    <div className={`${styles.itemRow} ${className}`.trim()}>
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
          <h3 className={styles.productName}>
            <button
              type="button"
              className={styles.productButton}
              onClick={() => onClick(product.id)}
              aria-label={`Modificar producto ${product.name}`}
            >
              {product.name}
            </button>
          </h3>
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
          onClick={() => onDeactivate(product.id)}
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
