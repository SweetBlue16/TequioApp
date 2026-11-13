import type { CreateDeliveryPointRequest } from '@/types/deliveryPoint/DeliveryPointRequest';

/**
 * Authorized municipalities within Xalapa and its surrounding metropolitan region.
 */
export const ALLOWED_DELIVERY_MUNICIPALITIES: readonly string[] = [
  'Xalapa',
  'Coatepec',
  'Xico',
  'Emiliano Zapata',
  'Banderilla',
  'Tlalnelhuayocan',
  'Teocelo',
  'Rafael Lucio',
  'Naolinco',
] as const;

const VALID_STREET_NUMBER_REGEX =
  /^(s\/n|sn|\d+[a-zA-Z0-9\-\/\s.]*|km\.?\s*\d+(\.\d+)?)$/i;

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Matches a raw municipality name against the authorized regional catalog.
 */
export const matchAllowedMunicipality = (rawCity: string): string | null => {
  const normalized = rawCity
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (!normalized) return null;

  const matched = ALLOWED_DELIVERY_MUNICIPALITIES.find((municipality) => {
    const target = municipality
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return normalized.includes(target) || target.includes(normalized);
  });

  return matched ?? null;
};

/**
 * Validates required text fields enforcing minimum meaningful length and max DB size.
 */
export const validateRequiredText = (
  value: string,
  fieldName: string,
  maxLength: number,
  minLength = 3
): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return `El campo ${fieldName} es obligatorio.`;
  if (trimmed.length < minLength) {
    return `El campo ${fieldName} debe tener al menos ${minLength} caracteres.`;
  }
  if (trimmed.length > maxLength) {
    return `El campo ${fieldName} no debe exceder ${maxLength} caracteres.`;
  }
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]/.test(trimmed)) {
    return `Ingresa un valor válido para ${fieldName}.`;
  }
  return null;
};

/**
 * Validates exterior street numbers (e.g., "123", "45-B", "Km 4.5", or "S/N").
 */
export const validateStreetNumber = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return 'El número exterior es obligatorio.';
  if (trimmed.length > 50) return 'El número no debe exceder 50 caracteres.';
  if (!VALID_STREET_NUMBER_REGEX.test(trimmed)) {
    return 'Ingresa un número válido (ej. 123, 45-B, Km 2 o S/N).';
  }
  return null;
};

/**
 * Validates a 5-digit postal code belonging to the Xalapa region (91000-91699).
 */
export const validatePostalCode = (zipCode: string): string | null => {
  const trimmed = zipCode.trim();
  if (!trimmed) return 'El código postal es obligatorio.';
  if (!/^\d{5}$/.test(trimmed)) {
    return 'El C.P. debe contener exactamente 5 dígitos.';
  }
  const numericZip = Number(trimmed);
  if (numericZip < 91000 || numericZip > 91699) {
    return 'El C.P. debe pertenecer a Xalapa o alrededores (91000 - 91699).';
  }
  return null;
};

/**
 * Validates that the municipality belongs to Xalapa and its surrounding region.
 */
export const validateRegionalMunicipality = (city: string): string | null => {
  if (!city.trim()) return 'Selecciona un municipio de la región.';
  if (!matchAllowedMunicipality(city)) {
    return 'Solo se permiten puntos en Xalapa y municipios cercanos.';
  }
  return null;
};

/**
 * Validates opening and closing business hours in 24-hour HH:MM format.
 */
export const validateBusinessHoursRange = (
  openTime: string,
  closeTime: string
): string | null => {
  if (!TIME_24H_REGEX.test(openTime) || !TIME_24H_REGEX.test(closeTime)) {
    return 'Selecciona una hora de apertura y cierre válidas.';
  }
  if (closeTime <= openTime) {
    return 'La hora de cierre debe ser posterior a la hora de apertura.';
  }
  return null;
};

/**
 * Validates optional reference notes when provided by the administrator.
 */
export const validateOptionalReferences = (references?: string | null): string | null => {
  const trimmed = (references ?? '').trim();
  if (!trimmed) return null;
  if (trimmed.length < 5) {
    return 'Las referencias deben tener al menos 5 caracteres si decides agregarlas.';
  }
  if (trimmed.length > 400) {
    return 'Las referencias no deben exceder 400 caracteres.';
  }
  return null;
};

/**
 * Validates the complete delivery point payload before persistence.
 */
export const validateDeliveryPointForm = (
  payload: CreateDeliveryPointRequest
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const checks: Array<[string, string | null]> = [
    ['name', validateRequiredText(payload.name, 'nombre del punto', 150, 4)],
    ['street', validateRequiredText(payload.street, 'calle', 150, 3)],
    ['number', validateStreetNumber(payload.number)],
    ['neighborhood', validateRequiredText(payload.neighborhood, 'colonia', 100, 3)],
    ['zipCode', validatePostalCode(payload.zipCode)],
    ['city', validateRegionalMunicipality(payload.city)],
    ['businessHours', validateRequiredText(payload.businessHours, 'horario', 200, 5)],
    ['references', validateOptionalReferences(payload.references)],
  ];

  checks.forEach(([field, message]) => {
    if (message) errors[field] = message;
  });

  return errors;
};