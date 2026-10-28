/**
 * Data contract representing a base product as returned by the backend.
 */
export interface ProductItemResponse {
  readonly id: number;
  readonly producerId?: number;
  readonly categoryId?: number;
  readonly name: string;
  readonly shortDescription?: string;
  readonly imageUrl?: string | null;
  readonly measurementUnit?: string;
  readonly isActive?: boolean;
}

/**
 * Paginated response structure matching ProductPageDto from the .NET backend.
 */
export interface ProductPageResponse {
  readonly products?: readonly ProductItemResponse[];
  readonly items?: readonly ProductItemResponse[];
  readonly itemCount?: number;
  readonly totalCount?: number;
  readonly pageIndex?: number;
  readonly pageSize?: number;
}

/**
 * Payload required to register a new base product (USP_CreateBaseProduct).
 */
export interface CreateBaseProductPayload {
  readonly categoryId: number;
  readonly name: string;
  readonly shortDescription: string;
  readonly measurementUnit: string;
  readonly imageUrl?: string | null;
}