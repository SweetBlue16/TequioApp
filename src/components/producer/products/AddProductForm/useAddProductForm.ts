import { useState, useMemo } from 'react';
import type { ComboBoxOption } from '@/components/common/ComboBox';
import { PRODUCT_CATEGORIES_TREE, MEASUREMENT_UNITS } from '@/constants/categories';
import {
  executeFieldValidation,
  validateRequiredField,
  validateMaximumLength,
} from '@/utils/formValidators';

export interface ProductFormData {
  name: string;
  shortDescription: string;
  parentCategoryId: number;
  subcategoryId: number;
  measurementUnit: string;
  imageFile: File | null;
}

/**
 * Encapsulates state management, chained options, and validation rules for product creation.
 */
export const useAddProductForm = (onSubmit: (data: ProductFormData) => void) => {
  const [name, setName] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [parentCategoryId, setParentCategoryId] = useState<number>(0);
  const [subcategoryId, setSubcategoryId] = useState<number>(0);
  const [measurementUnit, setMeasurementUnit] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const parentCategoryOptions = useMemo<ComboBoxOption[]>(() => {
    return PRODUCT_CATEGORIES_TREE.map((c) => ({ value: c.id, label: c.label }));
  }, []);

  const subcategoryOptions = useMemo<ComboBoxOption[]>(() => {
    if (!parentCategoryId) return [];
    const parent = PRODUCT_CATEGORIES_TREE.find((item) => item.id === parentCategoryId);
    return parent ? parent.subcategories.map((sub) => ({ value: sub.id, label: sub.label })) : [];
  }, [parentCategoryId]);

  const measurementUnitOptions = useMemo<ComboBoxOption[]>(() => {
    return MEASUREMENT_UNITS.map((u) => ({ value: u.label, label: u.label }));
  }, []);

  const clearError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleParentCategoryChange = (val: string) => {
    setParentCategoryId(Number(val));
    setSubcategoryId(0);
    clearError('category');
    clearError('subcategory');
  };

  const handleSubcategoryChange = (val: string) => {
    setSubcategoryId(Number(val));
    clearError('subcategory');
  };

  const handleMeasurementChange = (val: string) => {
    setMeasurementUnit(val);
    clearError('measurementUnit');
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    clearError('image');
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!imageFile) errors.image = 'Debes subir una fotografía de tu producto.';

    const nameErr = executeFieldValidation(name, [
      validateRequiredField('Nombre del producto'),
      validateMaximumLength('Nombre del producto', 50),
    ]);
    if (nameErr) errors.name = nameErr;

    if (!parentCategoryId) errors.category = 'Selecciona una categoría principal.';
    if (!subcategoryId) errors.subcategory = 'Selecciona una subcategoría.';
    if (!measurementUnit) errors.measurementUnit = 'Selecciona la unidad de medida.';

    const descErr = executeFieldValidation(shortDescription, [
      validateRequiredField('Descripción'),
      validateMaximumLength('Descripción', 180),
    ]);
    if (descErr) {
      errors.shortDescription = descErr;
    } else if (shortDescription.trim().length < 10) {
      errors.shortDescription = 'Ingresa al menos 10 caracteres.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      parentCategoryId,
      subcategoryId,
      measurementUnit,
      imageFile,
    });
  };

  return {
    values: { name, shortDescription, parentCategoryId, subcategoryId, measurementUnit, imageFile },
    fieldErrors,
    options: { parentCategoryOptions, subcategoryOptions, measurementUnitOptions },
    handlers: {
      setName: (val: string) => { setName(val); clearError('name'); },
      setShortDescription: (val: string) => { setShortDescription(val); clearError('shortDescription'); },
      handleParentCategoryChange,
      handleSubcategoryChange,
      handleMeasurementChange,
      handleImageChange,
      setImageError: (msg: string) => setFieldErrors((prev) => ({ ...prev, image: msg })),
      handleSubmit,
    },
  };
};