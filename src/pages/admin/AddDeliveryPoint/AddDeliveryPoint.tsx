import { deliveryPointErrorMessage } from '@/services/deliveryPoints/deliveryPointError';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeliveryPointWizard } from '@/components/admin/deliveryPoints/DeliveryPointWizard';
import type { DeliveryPointSummaryData } from '@/components/admin/deliveryPoints/DeliveryPointDetailCard';
import { deliveryPointService } from '@/services/deliveryPoints/DeliveryPointService';
import { Toast } from '@/components/common/Toast';
import { ROUTES } from '@/constants/routes';

/**
 * Orchestrator page for registering a new authorized delivery point.
 */
export const AddDeliveryPoint: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastState, setToastState] = useState<{
    message: string;
    variant: 'error';
  } | null>(null);

  const returnToList = async (deliveryPointNotice?: string): Promise<void> => {
    try {
      await navigate(ROUTES.ADMIN.DELIVERY_POINTS, {
        state: { deliveryPointNotice },
      });
    } catch (error) {
      console.error('Could not open delivery points.', error);
      setToastState({
        message: 'No pudimos abrir la lista de puntos de entrega.',
        variant: 'error',
      });
    }
  };

  const handleCreateSubmit = async (data: DeliveryPointSummaryData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await deliveryPointService.createDeliveryPoint({
        name: data.name,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        zipCode: data.zipCode,
        city: data.city,
        businessHours: data.businessHours,
        references: data.references,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      await returnToList('Punto de entrega registrado con éxito.');
    } catch (error) {
      setToastState({
        message: deliveryPointErrorMessage(error),
        variant: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toastState && (
        <Toast
          message={toastState.message}
          variant={toastState.variant}
          onClose={() => setToastState(null)}
        />
      )}

      <DeliveryPointWizard
        mode="create"
        isSubmitting={isSubmitting}
        onCancel={() => returnToList()}
        onSubmit={(data) => void handleCreateSubmit(data)}
      />
    </>
  );
};

export default AddDeliveryPoint;
