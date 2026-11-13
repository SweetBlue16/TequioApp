import type { DeliveryPointCoordinates } from '@/types/deliveryPoint/DeliveryPoint';
import { matchAllowedMunicipality } from './deliveryPointValidators';

/**
 * Default geographic coordinates centered on Xalapa, Veracruz.
 */
export const DEFAULT_DELIVERY_COORDINATES: DeliveryPointCoordinates = {
  latitude: 19.5312,
  longitude: -96.9159,
};

/**
 * Geographic bounding box restricting coordinates and Mapbox views to Xalapa & surroundings.
 */
export const XALAPA_REGION_BOUNDS: readonly [
  readonly [number, number],
  readonly [number, number],
] = [
  [-97.08, 19.34],
  [-96.72, 19.68],
] as const;

/**
 * Structured address resolved from Mapbox forward or reverse geocoding.
 */
export interface ResolvedMapAddress {
  readonly coordinates: DeliveryPointCoordinates;
  readonly street?: string;
  readonly neighborhood?: string;
  readonly zipCode?: string;
  readonly city?: string;
}

interface MapboxFeature {
  text?: string;
  center?: [number, number];
  context?: Array<{ id?: string; text?: string }>;
}

/**
 * Builds an external Google Maps search URL for the given geographic coordinates.
 */
export const buildGoogleMapsSearchUrl = (
  latitude: number,
  longitude: number
): string => {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

/**
 * Verifies whether coordinates fall inside the authorized Xalapa regional bounds.
 */
export const isWithinAllowedRegion = (coords: DeliveryPointCoordinates): boolean => {
  const [[minLng, minLat], [maxLng, maxLat]] = XALAPA_REGION_BOUNDS;
  return (
    coords.longitude >= minLng &&
    coords.longitude <= maxLng &&
    coords.latitude >= minLat &&
    coords.latitude <= maxLat
  );
};

/**
 * Extracts structured address fields from a Mapbox geocoding feature.
 */
const parseMapboxFeature = (feature: MapboxFeature): ResolvedMapAddress | null => {
  if (!feature.center || feature.center.length < 2) return null;

  const coordinates: DeliveryPointCoordinates = {
    longitude: Number(feature.center[0].toFixed(6)),
    latitude: Number(feature.center[1].toFixed(6)),
  };

  if (!isWithinAllowedRegion(coordinates)) return null;

  const context = feature.context ?? [];
  const neighborhoodEntry = context.find(
    (c) => c.id?.startsWith('neighborhood') || c.id?.startsWith('locality')
  );
  const postcodeEntry = context.find((c) => c.id?.startsWith('postcode'));
  const placeEntry = context.find((c) => c.id?.startsWith('place'));

  return {
    coordinates,
    street: feature.text?.trim() || undefined,
    neighborhood: neighborhoodEntry?.text?.trim() || undefined,
    zipCode: postcodeEntry?.text?.trim() || undefined,
    city: placeEntry?.text ? (matchAllowedMunicipality(placeEntry.text) ?? undefined) : undefined,
  };
};

/**
 * Performs a regional forward geocoding request restricted to Xalapa & surroundings.
 */
export const searchRegionalAddress = async (
  addressQuery: string,
  accessToken: string | undefined
): Promise<ResolvedMapAddress | null> => {
  const sanitizedQuery = addressQuery.trim();
  if (!sanitizedQuery || !accessToken) return null;

  try {
    const encodedQuery = encodeURIComponent(sanitizedQuery);
    const [[minLng, minLat], [maxLng, maxLat]] = XALAPA_REGION_BOUNDS;
    const bboxParam = `${minLng},${minLat},${maxLng},${maxLat}`;
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json` +
      `?access_token=${accessToken}&country=mx&bbox=${bboxParam}&proximity=-96.9159,19.5312&types=address,poi,neighborhood,locality&limit=1&language=es`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as { features?: MapboxFeature[] };
    return data.features?.[0] ? parseMapboxFeature(data.features[0]) : null;
  } catch {
    return null;
  }
};

/**
 * Performs reverse geocoding when dragging the map pin to auto-fill address details.
 */
export const reverseGeocodeCoordinates = async (
  coordinates: DeliveryPointCoordinates,
  accessToken: string | undefined
): Promise<ResolvedMapAddress | null> => {
  if (!accessToken || !isWithinAllowedRegion(coordinates)) return null;

  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json` +
      `?access_token=${accessToken}&country=mx&types=address,neighborhood,locality,postcode,place&limit=1&language=es`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as { features?: MapboxFeature[] };
    return data.features?.[0] ? parseMapboxFeature(data.features[0]) : null;
  } catch {
    return null;
  }
};