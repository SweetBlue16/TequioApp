import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { OrnamentCard } from '@/components/common/OrnamentCard';
import type { OrnamentRibbonPosition } from '@/components/common/OrnamentCard';
import { MapboxPicker } from '@/components/common/MapboxPicker';
import { buildGoogleMapsSearchUrl } from '@/utils/deliveryPointGeocoding';
import styles from './DeliveryPointDetailCard.module.css';

/**
 * Data contract required to render a delivery point summary or detail view.
 */
export interface DeliveryPointSummaryData {
  readonly name: string;
  readonly street: string;
  readonly number: string;
  readonly neighborhood: string;
  readonly zipCode: string;
  readonly city: string;
  readonly businessHours: string;
  readonly references?: string | null;
  readonly latitude: number;
  readonly longitude: number;
}

/**
 * Properties contract for the DeliveryPointDetailCard component.
 */
export interface DeliveryPointDetailCardProps {
  /** Delivery point data to display */
  point: DeliveryPointSummaryData;
  /** 'detail' hides the confirmation button; 'summary' shows title and submit CTA */
  mode: 'detail' | 'summary';
  /** Optional heading shown above the card in summary mode */
  title?: string;
  /** Label for the confirmation button in summary mode */
  confirmLabel?: string;
  /** Controls which vertical section of barraAdorno.png is visible */
  ribbonPosition?: OrnamentRibbonPosition;
  /** Disables the confirm button while saving */
  isSubmitting?: boolean;
  /** Navigates back to the previous step or table */
  onBack: () => void;
  /** Triggered when confirming creation or edit in summary mode */
  onConfirm?: () => void;
}

/**
 * Reusable detail and confirmation card for authorized delivery points.
 * Renders all location fields, static Mapbox preview, and optional confirm CTA.
 */
export const DeliveryPointDetailCard: React.FC<DeliveryPointDetailCardProps> = ({
  point,
  mode,
  title,
  confirmLabel = 'Confirmar registro',
  ribbonPosition = 'center',
  isSubmitting = false,
  onBack,
  onConfirm,
}) => {
  const googleMapsUrl = buildGoogleMapsSearchUrl(point.latitude, point.longitude);
  const referenceText = point.references?.trim() || 'Sin referencias adicionales.';

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
          aria-label="Regresar"
        >
          <ChevronLeft size={32} strokeWidth={2.8} />
        </button>

        {mode === 'summary' && title && (
          <h1 className={styles.pageTitle}>{title}</h1>
        )}

        <span className={styles.spacer} aria-hidden="true" />
      </header>

      <OrnamentCard ribbonPosition={ribbonPosition}>
        <div className={styles.fieldsGrid}>
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Nombre del punto*</span>
            <p className={styles.highlightValue}>{point.name}</p>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Calle*</span>
            <p className={styles.fieldValue}>{point.street}</p>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Colonia*</span>
            <p className={styles.fieldValue}>{point.neighborhood}</p>
          </div>

          <div className={styles.twoColumns}>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Número*</span>
              <p className={styles.fieldValue}># {point.number}</p>
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>C.P.*</span>
              <p className={styles.fieldValue}>{point.zipCode}</p>
            </div>
          </div>

          <div className={styles.twoColumns}>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Ciudad o municipio*</span>
              <p className={styles.fieldValue}>{point.city}</p>
            </div>

            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Horario de atención</span>
              <p className={styles.fieldValue}>{point.businessHours}</p>
            </div>
          </div>

          <div className={styles.mapSection}>
            <MapboxPicker
              coordinates={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              interactive={false}
            />

            {mode === 'detail' && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapsExternalLink}
              >
                Abrir ubicación en Google Maps
              </a>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Referencias</span>
            <p className={styles.fieldValue}>{referenceText}</p>
          </div>

          {mode === 'summary' && onConfirm && (
            <div className={styles.confirmWrapper}>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className={styles.confirmButton}
              >
                {isSubmitting ? 'Guardando...' : confirmLabel}
              </button>
            </div>
          )}
        </div>
      </OrnamentCard>
    </div>
  );
};

export default DeliveryPointDetailCard;