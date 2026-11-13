import React from 'react';
import type { DeliveryPoint } from '@/types/deliveryPoint/DeliveryPoint';
import { buildGoogleMapsSearchUrl } from '@/utils/deliveryPointGeocoding';
import mapsIcon from '@/assets/icons/common/icon_maps.png';
import styles from './DeliveryPointListItem.module.css';

/**
 * Properties contract for the DeliveryPointListItem component.
 */
export interface DeliveryPointListItemProps {
  /** Delivery point record to render */
  deliveryPoint: DeliveryPoint;
  /** Triggered when clicking the row/card to open the full detail view */
  onSelect: (point: DeliveryPoint) => void;
  /** Navigates to the edit view for this point */
  onEdit: (pointId: number) => void;
  /** Triggers confirmation to activate or deactivate the point */
  onToggleStatus: (point: DeliveryPoint) => void;
}

/**
 * Renders a single authorized delivery point as a touch card on mobile
 * and a 4-column tabular row on desktop screens.
 */
export const DeliveryPointListItem: React.FC<DeliveryPointListItemProps> = ({
  deliveryPoint,
  onSelect,
  onEdit,
  onToggleStatus,
}) => {
  const streetLine = `${deliveryPoint.street} #${deliveryPoint.number}, Col. ${deliveryPoint.neighborhood}`;
  const cityLine = `${deliveryPoint.city} • C.P. ${deliveryPoint.zipCode}`;
  const googleMapsUrl = buildGoogleMapsSearchUrl(
    deliveryPoint.latitude,
    deliveryPoint.longitude
  );

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(deliveryPoint);
    }
  };

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onEdit(deliveryPoint.id);
  };

  const handleToggleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onToggleStatus(deliveryPoint);
  };

  const statusButtonClass = deliveryPoint.isActive
    ? styles.deactivateButton
    : styles.activateButton;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(deliveryPoint)}
      onKeyDown={handleRowKeyDown}
      className={styles.itemRow}
      aria-label={`Ver detalles de ${deliveryPoint.name}`}
    >
      <div className={styles.columnName}>
        <h3 className={styles.pointName}>{deliveryPoint.name}</h3>
        <span
          className={`${styles.statusBadge} ${
            deliveryPoint.isActive ? styles.statusActive : styles.statusInactive
          }`}
        >
          {deliveryPoint.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className={styles.columnLocation}>
        <p className={styles.addressPrimary}>{streetLine}</p>
        <p className={styles.addressSecondary}>{cityLine}</p>
      </div>

      <div className={styles.columnHours}>{deliveryPoint.businessHours}</div>

      <div className={styles.actionsGroup}>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={styles.mapsButton}
          title="Abrir ubicación en Google Maps"
          aria-label={`Abrir ${deliveryPoint.name} en Google Maps`}
        >
          <img src={mapsIcon} alt="" aria-hidden="true" className={styles.mapsIcon} />
        </a>

        <button
          type="button"
          onClick={handleEditClick}
          className={`${styles.actionButton} ${styles.editButton}`}
          aria-label={`Editar ${deliveryPoint.name}`}
        >
          Editar
        </button>

        <button
          type="button"
          onClick={handleToggleClick}
          className={`${styles.actionButton} ${statusButtonClass}`}
          aria-label={`${deliveryPoint.isActive ? 'Desactivar' : 'Activar'} ${deliveryPoint.name}`}
        >
          {deliveryPoint.isActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </article>
  );
};

export default DeliveryPointListItem;