import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Stepper } from '@/components/common/Stepper';
import { InputField } from '@/components/common/InputField';
import { ComboBox } from '@/components/common/ComboBox';
import { Button } from '@/components/common/Button';
import { OrnamentCard } from '@/components/common/OrnamentCard';
import type { OrnamentRibbonPosition } from '@/components/common/OrnamentCard';
import { MapboxPicker } from '@/components/common/MapboxPicker';
import { DeliveryPointDetailCard } from '../DeliveryPointDetailCard';
import type { DeliveryPointSummaryData } from '../DeliveryPointDetailCard';
import { XALAPA_REGION_BOUNDS } from '@/utils/deliveryPointGeocoding';
import { MUNICIPALITY_OPTIONS, useDeliveryPointWizard } from './useDeliveryPointWizard';
import styles from './DeliveryPointWizard.module.css';

export interface DeliveryPointWizardProps {
  mode: 'create' | 'edit';
  initialData?: DeliveryPointSummaryData;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: DeliveryPointSummaryData) => void;
}

const WIZARD_STEPS = [
  { stepNumber: 1, label: 'Datos básicos' },
  { stepNumber: 2, label: 'Ubicación' },
  { stepNumber: 3, label: 'Resumen' },
];

export const DeliveryPointWizard: React.FC<DeliveryPointWizardProps> = ({
  mode,
  initialData,
  isSubmitting = false,
  onCancel,
  onSubmit,
}) => {
  const wizard = useDeliveryPointWizard(initialData, onSubmit);
  const ribbonPosition: OrnamentRibbonPosition = mode === 'create' ? 'top' : 'bottom';
  const formHeading = mode === 'create' ? 'Agregar punto de entrega' : 'Editar punto de entrega';
  const summaryHeading = mode === 'create' ? 'Resumen nuevo punto' : 'Resumen edición punto';
  const confirmButtonText = mode === 'create' ? 'Confirmar registro' : 'Guardar cambios';

  if (wizard.currentStep === 3) {
    return (
      <DeliveryPointDetailCard
        point={wizard.formData}
        mode="summary"
        title={summaryHeading}
        confirmLabel={confirmButtonText}
        ribbonPosition={ribbonPosition}
        isSubmitting={isSubmitting}
        onBack={() => wizard.setCurrentStep(2)}
        onConfirm={wizard.confirmSubmit}
      />
    );
  }

  return (
    <div className={styles.wizardContainer}>
      <header className={styles.topBar}>
        <button
          type="button"
          onClick={wizard.currentStep === 1 ? onCancel : () => wizard.setCurrentStep(1)}
          className={styles.backButton}
          aria-label="Regresar"
        >
          <ChevronLeft size={32} strokeWidth={2.8} />
        </button>
        <h1 className={styles.pageTitle}>{formHeading}</h1>
        <span className={styles.spacer} aria-hidden="true" />
      </header>

      <Stepper steps={WIZARD_STEPS} currentStep={wizard.currentStep} />

      <OrnamentCard ribbonPosition={ribbonPosition}>
        {wizard.currentStep === 1 ? (
          <div className={styles.formFields}>
            <InputField
              label="Nombre del punto*"
              placeholder="Ej. Parque Juárez - Quiosco Central"
              value={wizard.formData.name}
              onChange={(e) => wizard.updateField('name', e.target.value)}
              errorMessage={wizard.errors.name}
              maxLength={150}
            />

            <div className={styles.twoColumns}>
              <InputField
                label="Hora de apertura*"
                type="time"
                value={wizard.openTime}
                onChange={(e) => wizard.updateSchedule(e.target.value, wizard.closeTime)}
                errorMessage={wizard.errors.businessHours}
              />

              <InputField
                label="Hora de cierre*"
                type="time"
                value={wizard.closeTime}
                onChange={(e) => wizard.updateSchedule(wizard.openTime, e.target.value)}
              />
            </div>

            <div className={styles.textAreaWrapper}>
              <label htmlFor="dp-references" className={styles.fieldLabel}>
                Referencias
              </label>
              <textarea
                id="dp-references"
                className={styles.textAreaInput}
                placeholder="Ej. Edificio gris, portón negro, frente a la plaza..."
                value={wizard.formData.references ?? ''}
                onChange={(e) => wizard.updateField('references', e.target.value)}
                maxLength={400}
              />
              {wizard.errors.references && (
                <p className={styles.helperMessage}>{wizard.errors.references}</p>
              )}
            </div>

            <div className={styles.footerActions}>
              <Button variant="primary" onClick={wizard.goToStepTwo}>
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.formFields}>
            <InputField
              label="Calle*"
              placeholder="Ej. Ezequiel Alatriste"
              value={wizard.formData.street}
              onChange={(e) => wizard.updateField('street', e.target.value)}
              errorMessage={wizard.errors.street}
              maxLength={150}
            />

            <InputField
              label="Colonia*"
              placeholder="Ej. Ferrer Guardia"
              value={wizard.formData.neighborhood}
              onChange={(e) => wizard.updateField('neighborhood', e.target.value)}
              errorMessage={wizard.errors.neighborhood}
              maxLength={100}
            />

            <div className={styles.twoColumns}>
              <InputField
                label="Número*"
                placeholder="Ej. 123 o S/N"
                value={wizard.formData.number}
                onChange={(e) => wizard.updateField('number', e.target.value)}
                errorMessage={wizard.errors.number}
                maxLength={50}
              />

              <InputField
                label="C.P.*"
                placeholder="Ej. 91020"
                value={wizard.formData.zipCode}
                onChange={(e) => wizard.updateField('zipCode', e.target.value)}
                errorMessage={wizard.errors.zipCode}
                maxLength={5}
              />
            </div>

            <ComboBox
              label="Ciudad o municipio (Región Xalapa)*"
              options={MUNICIPALITY_OPTIONS}
              value={wizard.formData.city}
              onChange={(e) => wizard.updateField('city', e.target.value)}
              errorMessage={wizard.errors.city}
            />

            <div className={styles.mapToolsRow}>
              <button
                type="button"
                onClick={() => void wizard.locateOnMap()}
                disabled={wizard.isSearchingMap}
                className={styles.locateButton}
              >
                {wizard.isSearchingMap
                  ? 'Buscando en la región...'
                  : 'Ubicar y autocompletar desde el mapa'}
              </button>
              {wizard.mapFeedback && <p className={styles.helperMessage}>{wizard.mapFeedback}</p>}
            </div>

            <MapboxPicker
              coordinates={{
                latitude: wizard.formData.latitude,
                longitude: wizard.formData.longitude,
              }}
              interactive={true}
              maxBounds={XALAPA_REGION_BOUNDS}
              onCoordinatesChange={(coords) => void wizard.updateCoordinates(coords)}
            />

            <div className={styles.footerActions}>
              <Button variant="primary" onClick={wizard.goToStepThree}>
                Continuar
              </Button>
            </div>
          </div>
        )}
      </OrnamentCard>
    </div>
  );
};

export default DeliveryPointWizard;