import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

/**
 * Properties contract for the Pagination component.
 */
export interface PaginationProps {
  /** Current active page index (1-based) */
  currentPage: number;
  /** Total quantity of existing pages */
  totalPages: number;
  /** Maximum number of records displayed per page */
  pageSize: number;
  /** Total count of records retrieved from backend */
  totalRecords: number;
  /** Callback triggered when a new page is chosen */
  onPageChange: (targetPage: number) => void;
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * Generic accessible pagination controller conforming to WCAG 2.5.5 touch target size.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  className = '',
}) => {
  const firstRecordIndex = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecordIndex = Math.min(currentPage * pageSize, totalRecords);

  const computePageNumbers = (): (number | string)[] => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '..', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '..', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '..', currentPage - 1, currentPage, currentPage + 1, '..', totalPages];
  };

  const pageItems = computePageNumbers();

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 0) {
    return null;
  }

  return (
    <nav
      className={`${styles.paginationContainer} ${className}`.trim()}
      aria-label="Paginación de resultados"
    >
      <p className={styles.recordsSummary}>
        Mostrando{' '}
        <span className={styles.recordsCountBold}>{firstRecordIndex}</span> a{' '}
        <span className={styles.recordsCountBold}>{lastRecordIndex}</span> de{' '}
        <span className={styles.recordsCountBold}>{totalRecords}</span> registros
      </p>

      <ul className={styles.controlsList}>
        <li className={styles.controlItem}>
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={styles.pageButton}
            aria-label="Ir a la página anterior"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </li>

        {pageItems.map((item, index) => {
          if (typeof item === 'string') {
            return (
              <li key={`ellipsis-${index}`} className={styles.controlItem}>
                <span className={styles.ellipsisSpacer} aria-hidden="true">
                  ..
                </span>
              </li>
            );
          }

          const isCurrent = item === currentPage;

          return (
            <li key={item} className={styles.controlItem}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                className={`${styles.pageButton} ${
                  isCurrent ? styles.activePageButton : ''
                }`.trim()}
                aria-label={`Página ${item}`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          );
        })}

        <li className={styles.controlItem}>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
            aria-label="Ir a la página siguiente"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;