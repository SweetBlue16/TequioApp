import React from 'react';
import { Button } from '@/components/common/Button';
import { InputField } from '@/components/common/InputField';
import { ComboBox } from '@/components/common/ComboBox';
import { ImageUploader } from '@/components/common/ImageUploader';
import { useAddProductForm, type ProductFormData } from './useAddProductForm';
import styles from './AddProductForm.module.css';

export interface AddProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Presentational form component for registering a new base product.
 * Arranges input fields on the left and image uploader on the right.
 */
export const AddProductForm: React.FC<AddProductFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { values, fieldErrors, options, handlers } = useAddProductForm(onSubmit);

  return (
    <form className={styles.formContainer} onSubmit={handlers.handleSubmit} noValidate>
      <div className={styles.layoutGrid}>
        {/* Columna Izquierda: Campos del producto */}
        <div className={styles.fieldsSection}>
          <InputField
            id="product-name"
            label="Nombre del producto*"
            placeholder="Ej. Café tostado artesanal"
            value={values.name}
            onChange={(e) => handlers.setName(e.target.value)}
            errorMessage={fieldErrors.name}
            maxLength={50}
          />

          <div className={styles.fieldsRow}>
            <ComboBox
              id="product-parent-category"
              label="Categoría*"
              placeholderOption="Selecciona categoría"
              options={options.parentCategoryOptions}
              value={values.parentCategoryId || ''}
              onChange={(e) => handlers.handleParentCategoryChange(e.target.value)}
              errorMessage={fieldErrors.category}
            />

            <ComboBox
              id="product-subcategory"
              label="Subcategoría*"
              placeholderOption="Selecciona subcategoría"
              options={options.subcategoryOptions}
              value={values.subcategoryId || ''}
              onChange={(e) => handlers.handleSubcategoryChange(e.target.value)}
              disabled={options.subcategoryOptions.length === 0}
              errorMessage={fieldErrors.subcategory}
            />
          </div>

          <ComboBox
            id="product-measurement-unit"
            label="Unidad de medida*"
            placeholderOption="Selecciona unidad"
            options={options.measurementUnitOptions}
            value={values.measurementUnit}
            onChange={(e) => handlers.handleMeasurementChange(e.target.value)}
            errorMessage={fieldErrors.measurementUnit}
          />

          <div className={styles.fieldGroup}>
            <label htmlFor="product-description" className={styles.inputLabel}>
              Descripción breve*
            </label>
            <textarea
              id="product-description"
              className={`${styles.textArea} ${fieldErrors.shortDescription ? styles.textAreaError : ''}`.trim()}
              placeholder="Describe el origen, notas de sabor, cosecha o proceso artesanal..."
              value={values.shortDescription}
              onChange={(e) => handlers.setShortDescription(e.target.value)}
              maxLength={180}
              aria-invalid={Boolean(fieldErrors.shortDescription)}
            />
            <div className={styles.charCounter}>{values.shortDescription.length} / 180 caracteres</div>
            {fieldErrors.shortDescription && (
              <span className={styles.errorMessage} role="alert">{fieldErrors.shortDescription}</span>
            )}
          </div>
        </div>

        {/* Columna Derecha: Fotografía */}
        <div className={styles.photoSection}>
          <label className={styles.sectionLabel}>
            Fotografía del producto<span className={styles.requiredAsterisk}>*</span>
          </label>
          <ImageUploader
            file={values.imageFile}
            onChange={handlers.handleImageChange}
            showErrorToast={handlers.setImageError}
          />
          {fieldErrors.image && <span className={styles.errorMessage} role="alert">{fieldErrors.image}</span>}
        </div>
      </div>

      <footer className={styles.actionsRow}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          style={{ backgroundColor: '#00bfa5', minWidth: '160px' }}
        >
          Guardar producto
        </Button>
      </footer>
    </form>
  );
};

export default AddProductForm;