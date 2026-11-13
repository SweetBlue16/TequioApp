import { useState } from 'react';
import type { ComboBoxOption } from '@/components/common/ComboBox';
import type { DeliveryPointSummaryData } from '../DeliveryPointDetailCard';
import type { DeliveryPointCoordinates } from '@/types/deliveryPoint/DeliveryPoint';
import {
  ALLOWED_DELIVERY_MUNICIPALITIES,
  validateBusinessHoursRange,
  validateOptionalReferences,
  validatePostalCode,
  validateRegionalMunicipality,
  validateRequiredText,
  validateStreetNumber,
} from '@/utils/deliveryPointValidators';
import {
  DEFAULT_DELIVERY_COORDINATES,
  isWithinAllowedRegion,
  reverseGeocodeCoordinates,
  searchRegionalAddress,
} from '@/utils/deliveryPointGeocoding';
import type { ResolvedMapAddress } from '@/utils/deliveryPointGeocoding';

export const MUNICIPALITY_OPTIONS: ComboBoxOption[] =
  ALLOWED_DELIVERY_MUNICIPALITIES.map((name) => ({ value: name, label: name }));

const parseInitialSchedule = (rawHours?: string): { open: string; close: string } => {
  const match = rawHours?.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  return match ? { open: match[1], close: match[2] } : { open: '09:00', close: '18:00' };
};

export const useDeliveryPointWizard = (
  initialData: DeliveryPointSummaryData | undefined,
  onSubmit: (data: DeliveryPointSummaryData) => void
) => {
  const initialSchedule = parseInitialSchedule(initialData?.businessHours);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [openTime, setOpenTime] = useState<string>(initialSchedule.open);
  const [closeTime, setCloseTime] = useState<string>(initialSchedule.close);
  const [formData, setFormData] = useState<DeliveryPointSummaryData>({
    name: initialData?.name ?? '',
    street: initialData?.street ?? '',
    number: initialData?.number ?? '',
    neighborhood: initialData?.neighborhood ?? '',
    zipCode: initialData?.zipCode ?? '',
    city: initialData?.city ?? 'Xalapa',
    businessHours: initialData?.businessHours ?? `${initialSchedule.open} - ${initialSchedule.close}`,
    references: initialData?.references ?? '',
    latitude: initialData?.latitude ?? DEFAULT_DELIVERY_COORDINATES.latitude,
    longitude: initialData?.longitude ?? DEFAULT_DELIVERY_COORDINATES.longitude,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearchingMap, setIsSearchingMap] = useState<boolean>(false);
  const [mapFeedback, setMapFeedback] = useState<string>('');

  const clearFieldErrors = (fields: string[]): void => {
    setErrors((prev) => {
      const updated = { ...prev };
      fields.forEach((key) => delete updated[key]);
      return updated;
    });
  };

  const updateField = <K extends keyof DeliveryPointSummaryData>(
    field: K,
    value: DeliveryPointSummaryData[K]
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) clearFieldErrors([field]);
  };

  const updateSchedule = (nextOpen: string, nextClose: string): void => {
    setOpenTime(nextOpen);
    setCloseTime(nextClose);
    setFormData((prev) => ({ ...prev, businessHours: `${nextOpen} - ${nextClose}` }));
    clearFieldErrors(['businessHours']);
  };

  const applyResolvedAddress = (resolved: ResolvedMapAddress): void => {
    setFormData((prev) => ({
      ...prev,
      latitude: resolved.coordinates.latitude,
      longitude: resolved.coordinates.longitude,
      street: resolved.street ?? prev.street,
      neighborhood: resolved.neighborhood ?? prev.neighborhood,
      zipCode: resolved.zipCode ?? prev.zipCode,
      city: resolved.city ?? prev.city,
    }));
    clearFieldErrors(['street', 'neighborhood', 'zipCode', 'city']);
  };

  const goToStepTwo = (): void => {
    const nextErrors: Record<string, string> = {};
    const nameErr = validateRequiredText(formData.name, 'nombre del punto', 150, 4);
    const hoursErr = validateBusinessHoursRange(openTime, closeTime);
    const refErr = validateOptionalReferences(formData.references);

    if (nameErr) nextErrors.name = nameErr;
    if (hoursErr) nextErrors.businessHours = hoursErr;
    if (refErr) nextErrors.references = refErr;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setCurrentStep(2);
  };

  const goToStepThree = (): void => {
    const nextErrors: Record<string, string> = {};
    const checks: Array<[string, string | null]> = [
      ['street', validateRequiredText(formData.street, 'calle', 150, 3)],
      ['number', validateStreetNumber(formData.number)],
      ['neighborhood', validateRequiredText(formData.neighborhood, 'colonia', 100, 3)],
      ['zipCode', validatePostalCode(formData.zipCode)],
      ['city', validateRegionalMunicipality(formData.city)],
    ];

    checks.forEach(([field, msg]) => {
      if (msg) nextErrors[field] = msg;
    });

    if (!isWithinAllowedRegion({ latitude: formData.latitude, longitude: formData.longitude })) {
      setMapFeedback('El marcador debe ubicarse dentro de Xalapa o municipios cercanos.');
      return;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setCurrentStep(3);
  };

  const locateOnMap = async (): Promise<void> => {
    const query = [formData.street, formData.number, formData.neighborhood, formData.city || 'Xalapa']
      .filter((part) => part.trim().length > 0)
      .join(', ');
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

    setIsSearchingMap(true);
    setMapFeedback('');
    const resolved = await searchRegionalAddress(query, token);
    setIsSearchingMap(false);

    if (!resolved) {
      setMapFeedback('No encontramos esa dirección en Xalapa o alrededores; arrastra el pin.');
      return;
    }

    applyResolvedAddress(resolved);
    setMapFeedback('Ubicación encontrada y campos completados. Verifica o ajusta el pin.');
  };

  const updateCoordinates = async (coords: DeliveryPointCoordinates): Promise<void> => {
    if (!isWithinAllowedRegion(coords)) {
      setMapFeedback('Fuera de cobertura: coloca el pin dentro de Xalapa o municipios cercanos.');
      return;
    }

    setFormData((prev) => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
    const resolved = await reverseGeocodeCoordinates(coords, token);
    if (resolved) {
      applyResolvedAddress(resolved);
      setMapFeedback('Dirección actualizada según la posición del pin.');
    }
  };

  return {
    currentStep,
    setCurrentStep,
    openTime,
    closeTime,
    formData,
    errors,
    isSearchingMap,
    mapFeedback,
    updateField,
    updateSchedule,
    goToStepTwo,
    goToStepThree,
    locateOnMap,
    updateCoordinates,
    confirmSubmit: () => onSubmit(formData),
  };
};