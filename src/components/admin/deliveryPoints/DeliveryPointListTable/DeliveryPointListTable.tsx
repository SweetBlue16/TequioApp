import React from 'react';
import type { DeliveryPoint } from '@/types/deliveryPoint/DeliveryPoint';
import { DeliveryPointListItem } from '../DeliveryPointListItem';
import styles from './DeliveryPointListTable.module.css';

/**
 * Properties contract for the DeliveryPointListTable component.
 */
export interface DeliveryPointListTableProps {
  /** Collection of authorized delivery points to render */
  deliveryPoints: readonly DeliveryPoint[];
  /** Triggered when clicking a row/card to inspect full details */
  onSelectPoint: (point: DeliveryPoint) => void;
  /** Navigates to the edit view for the selected point */
  onEditPoint: (pointId: number) => void;
  /** Triggers confirmation to activate or deactivate a point */
  onTogglePointStatus: (point: DeliveryPoint) => void;
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * Presents a responsive list of authorized delivery points with desktop column headers.
 */
export const DeliveryPointListTable: React.FC<DeliveryPointListTableProps> = ({
  deliveryPoints,
  onSelectPoint,
  onEditPoint,
  onTogglePointStatus,
  className = '',
}) => {
  if (deliveryPoints.length === 0) {
    return (
      <output className={styles.emptyState}>
        No se encontraron puntos de entrega autorizados con ese criterio.
      </output>
    );
  }

  return (
    <div className={`${styles.tableWrapper} ${className}`.trim()}>
      <header className={styles.headerRow} aria-hidden="true">
        <span className={styles.columnHeader}>Punto de entrega</span>
        <span className={styles.columnHeader}>Ubicación</span>
        <span className={styles.columnHeader}>Horario de atención</span>
        <span className={styles.columnHeaderActions}>Acciones</span>
      </header>

      <ul className={styles.itemsContainer} aria-label="Listado de puntos de entrega autorizados">
        {deliveryPoints.map((point) => (
          <DeliveryPointListItem
            key={point.id}
            deliveryPoint={point}
            onSelect={onSelectPoint}
            onEdit={onEditPoint}
            onToggleStatus={onTogglePointStatus}
          />
        ))}
      </ul>
    </div>
  );
};

export default DeliveryPointListTable;
