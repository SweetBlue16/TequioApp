import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import styles from './BecomeSellerModal.module.css';

/**
 * Contract for a single seller policy term.
 */
interface PolicyClause {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

const SELLER_POLICIES: readonly PolicyClause[] = [
  {
    id: 'origin',
    title: '1. Origen local y producción genuina',
    description: 'Los productos y cosechas ofertados deben provenir directamente de tu huerto, finca o taller artesanal regional. Queda estrictamente prohibida la reventa de productos industrializados.',
  },
  {
    id: 'packaging',
    title: '2. Empaque y venta en paquetes cerrados',
    description: 'La comercialización se realiza exclusivamente en paquetes cerrados, higiénicos y previamente especificados. No se permite la entrega a granel sin empaque protector.',
  },
  {
    id: 'commitment',
    title: '3. Cumplimiento de metas y entregas',
    description: 'Al confirmarse un lote por alcanzar la meta comunitaria, te comprometes a entregar el pedido en la fecha y en el punto de recolección físico autorizado seleccionado.',
  },
  {
    id: 'fair-pricing',
    title: '4. Transparencia y precio justo',
    description: 'El precio pactado al publicar el lote es definitivo. No se permiten cobros adicionales ni modificaciones arancelarias al momento de validar la entrega física.',
  },
] as const;

/**
 * Properties contract for the BecomeSellerModal component.
 */
export interface BecomeSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * Accessible dialog presenting community seller policies and requiring explicit acceptance.
 */
export const BecomeSellerModal: React.FC<BecomeSellerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setHasAcceptedTerms(event.target.checked);
  };

  const handleConfirmClick = (): void => {
    if (!hasAcceptedTerms) return;
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lineamientos de venta comunitaria"
      description="Antes de habilitar tu panel de vendedor, acepta los principios de comercio justo de Tequio."
    >
      <div className={styles.modalContainer}>
        <div
          className={styles.termsScrollBox}
          tabIndex={0}
          role="region"
          aria-label="Políticas y lineamientos para vendedores"
        >
          {SELLER_POLICIES.map((policy) => (
            <article key={policy.id} className={styles.policyItem}>
              <h3 className={styles.policyTitle}>{policy.title}</h3>
              <p className={styles.policyText}>{policy.description}</p>
            </article>
          ))}
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={hasAcceptedTerms}
            onChange={handleCheckboxChange}
            className={styles.checkboxInput}
          />
          <span>He leído y me comprometo a respetar los lineamientos y reglas de entrega comunitaria.</span>
        </label>

        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmClick}
            disabled={!hasAcceptedTerms}
            isLoading={isSubmitting}
            type="button"
            style={{ backgroundColor: '#00bfa5' }}
          >
            Activar panel de vendedor
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BecomeSellerModal;