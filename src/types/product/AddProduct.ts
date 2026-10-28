/**
 * Form values contract for base product registration.
 */
export interface AddProductFormValues {
  readonly name: string;
  readonly categoryId: number;
  readonly measurementUnit: string;
  readonly shortDescription: string;
  readonly imageFile: File | null;
  readonly imageUrl: string | null;
}

/**
 * Validation error state mapping each form field to an error message.
 */
export interface AddProductFormErrors {
  readonly name?: string;
  readonly categoryId?: string;
  readonly measurementUnit?: string;
  readonly shortDescription?: string;
  readonly image?: string;
}