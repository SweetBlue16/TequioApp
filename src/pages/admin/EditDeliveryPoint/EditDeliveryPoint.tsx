import { deliveryPointErrorMessage } from '@/services/deliveryPoints/deliveryPointError';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DeliveryPointWizard } from '@/components/admin/deliveryPoints/DeliveryPointWizard';
import type { DeliveryPointSummaryData } from '@/components/admin/deliveryPoints/DeliveryPointDetailCard';
import { deliveryPointService } from '@/services/deliveryPoints/DeliveryPointService';
import type { DeliveryPoint } from '@/types/deliveryPoint/DeliveryPoint';
import { Toast } from '@/components/common/Toast';
import { ROUTES } from '@/constants/routes';

/**
 * Orchestrator page for editing an existing authorized delivery point.
 */
export const EditDeliveryPoint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pointRecord, setPointRecord] = useState<DeliveryPoint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastState, setToastState] = useState<{
    message: string;
    variant: 'error';
  } | null>(null);

  useEffect(() => {
    const loadPoint = async (): Promise<void> => {
      const parsedId = Number(id);
      if (!parsedId) {
        try {
          await navigate(ROUTES.ADMIN.DELIVERY_POINTS);
        } catch (error) {
          console.error('Could not open delivery points for an invalid ID.', error);
          setToastState({
            message: 'No pudimos abrir la lista de puntos de entrega.',
            variant: 'error',
          });
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const found = await deliveryPointService.getDeliveryPointById(parsedId);
        setPointRecord(found);
      } catch (error) {
        setToastState({ message: deliveryPointErrorMessage(error), variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    void loadPoint();
  }, [id, navigate]);

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

  const handleEditSubmit = async (data: DeliveryPointSummaryData): Promise<void> => {
    if (!pointRecord) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deliveryPointService.updateDeliveryPoint({
        id: pointRecord.id,
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

      await returnToList('Cambios guardados con éxito.');
    } catch (error) {
      setToastState({
        message: deliveryPointErrorMessage(error),
        variant: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {toastState && (
        <Toast
          message={toastState.message}
          variant={toastState.variant}
          onClose={() => setToastState(null)}
        />
      )}

      {pointRecord && (
        <DeliveryPointWizard
          mode="edit"
          initialData={pointRecord}
          isSubmitting={isSubmitting}
          onCancel={() => returnToList()}
          onSubmit={(data) => void handleEditSubmit(data)}
        />
      )}
    </>
  );
};

export default EditDeliveryPoint;
