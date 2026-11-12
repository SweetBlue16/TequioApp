/**
 * Request required to register a new authorized delivery point.
 */
export interface CreateDeliveryPointRequest {
  readonly name: string;
  readonly street: string;
  readonly number: string;
  readonly neighborhood: string;
  readonly zipCode: string;
  readonly city: string;
  readonly references?: string | null;
  readonly businessHours: string;
  readonly latitude: number;
  readonly longitude: number;
}

/**
 * Request required to update an existing authorized delivery point.
 */
export interface UpdateDeliveryPointRequest extends CreateDeliveryPointRequest {
  readonly id: number;
}