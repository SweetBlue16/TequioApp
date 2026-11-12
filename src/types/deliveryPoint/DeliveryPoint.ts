/**
 * Geographic coordinates used by the map picker and external map links.
 */
export interface DeliveryPointCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

/**
 * Data contract representing an authorized delivery point returned by the API.
 */
export interface DeliveryPoint {
  readonly id: number;
  readonly name: string;
  readonly street: string;
  readonly number: string;
  readonly neighborhood: string;
  readonly zipCode: string;
  readonly city: string;
  readonly references: string | null;
  readonly businessHours: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly isActive: boolean;
}

/**
 * Paginated response structure for delivery points listing.
 */
export interface DeliveryPointPageResponse {
  readonly items: readonly DeliveryPoint[];
  readonly totalCount: number;
  readonly pageIndex: number;
  readonly pageSize: number;
}