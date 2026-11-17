import axios from 'axios';

/** Carries only a safe presentation message across the HTTP service boundary. */
export class DeliveryPointRequestError extends Error {}

/** Converts catalog HTTP failures into safe, actionable Spanish notices. */
export const deliveryPointErrorMessage = (error: unknown): string => {
  if (error instanceof DeliveryPointRequestError) return error.message;
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 409) return 'El punto ya existe o tiene lotes vigentes que impiden desactivarlo. Revisa sus datos.';
  if (status === 400) return 'Verifica los campos obligatorios, las coordenadas y el municipio.';
  if (status === 403) return 'Solo un administrador puede gestionar puntos de entrega.';
  if (status === 401) return 'Inicia sesión nuevamente para continuar.';
  if (status === 404) return 'No se encontró el punto de entrega.';
  return 'No se pudo completar la operación. Intenta de nuevo.';
};
