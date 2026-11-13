import type { DeliveryPointCoordinates } from '@/types/deliveryPoint/DeliveryPoint';
import type { CreateDeliveryPointRequest } from '@/types/deliveryPoint/DeliveryPointRequest';

export const DEFAULT_DELIVERY_COORDINATES: DeliveryPointCoordinates = {
  latitude: 19.5312,
  longitude: -96.9159,
};

export const buildGoogleMapsSearchUrl = (latitude: number, longitude: number): string => {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

export const searchApproximateCoordinates = async (
  addressQuery: string,
  accessToken: string | undefined
): Promise<DeliveryPointCoordinates | null> => {
  const sanitizedQuery = addressQuery.trim();
  if (!sanitizedQuery || !accessToken) {
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(sanitizedQuery);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${accessToken}&country=mx&proximity=-96.9159,19.5312&limit=1&language=es`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      features?: Array<{ center?: [number, number] }>;
    };

    const firstMatch = data.features?.[0]?.center;
    if (!firstMatch || firstMatch.length < 2) return null;

    return {
      longitude: Number(firstMatch[0].toFixed(6)),
      latitude: Number(firstMatch[1].toFixed(6)),
    };
  } catch {
    return null;
  }
};

export const validateDeliveryPointForm = (
  payload: CreateDeliveryPointRequest
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!payload.name.trim()) errors.name = 'El nombre del punto es obligatorio.';
  if (!payload.street.trim()) errors.street = 'La calle es obligatoria.';
  if (!payload.number.trim()) errors.number = 'El número es obligatorio.';
  if (!payload.neighborhood.trim()) errors.neighborhood = 'La colonia es obligatoria.';
  if (!/^\d{5}$/.test(payload.zipCode.trim())) errors.zipCode = 'El C.P. debe tener 5 dígitos.';
  if (!payload.city.trim()) errors.city = 'La ciudad es obligatoria.';
  if (!payload.businessHours.trim()) errors.businessHours = 'El horario es obligatorio.';

  return errors;
};