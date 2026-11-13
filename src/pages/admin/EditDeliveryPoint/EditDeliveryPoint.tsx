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
    variant: 'info' | 'error';
  } | null>(null);

  useEffect(() => {
    const loadPoint = async (): Promise<void> => {
      const parsedId = Number(id);
      if (!parsedId) {
        navigate(ROUTES.ADMIN.DELIVERY_POINTS);
        return;
      }

      const found = await deliveryPointService.getDeliveryPointById(parsedId);
      if (!found) {
        navigate(ROUTES.ADMIN.DELIVERY_POINTS);
        return;
      }

      setPointRecord(found);
      setIsLoading(false);
    };

    void loadPoint();
  }, [id, navigate]);

  const handleEditSubmit = async (data: DeliveryPointSummaryData): Promise<void> => {
    if (!pointRecord) return;

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

      setToastState({
        message: 'Cambios guardados con éxito.',
        variant: 'info',
      });

      setTimeout(() => {
        navigate(ROUTES.ADMIN.DELIVERY_POINTS);
      }, 900);
    } catch {
      setToastState({
        message: 'No se pudieron guardar los cambios. Intenta de nuevo.',
        variant: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading || !pointRecord) {
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

      <DeliveryPointWizard
        mode="edit"
        initialData={pointRecord}
        isSubmitting={isSubmitting}
        onCancel={() => navigate(ROUTES.ADMIN.DELIVERY_POINTS)}
        onSubmit={(data) => void handleEditSubmit(data)}
      />
    </>
  );
};

export default EditDeliveryPoint;