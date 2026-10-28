import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Toast } from '@/components/common/Toast';
import {
  AddProductForm,
  type ProductFormData,
} from '@/components/producer/products/AddProductForm';
import { useSession } from '@/contexts/AuthContext';
import { createClient } from '@/services/api';
import { TokenStorage } from '@/services/auth/TokenStorage';
import { ProductService } from '@/services/products/ProductService';
import { FileService } from '@/services/files/FileService';
import { ROUTES } from '@/constants/routes';
import styles from './AddProduct.module.css';

const tokenStorage = new TokenStorage();
const apiClient = createClient(tokenStorage);
const productService = new ProductService(apiClient);
const fileService = new FileService(apiClient);

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  const [pendingFormData, setPendingFormData] = useState<ProductFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormSubmit = (data: ProductFormData): void => {
    setPendingFormData(data);
  };

  const handleCancel = (): void => {
    navigate(ROUTES.PRODUCER.PRODUCTS);
  };

  const handleConfirmSave = async (): Promise<void> => {
    if (!pendingFormData || !pendingFormData.imageFile) return;

    const producerId = session?.userId ? Number(session.userId) : 0;
    if (producerId <= 0) {
      setErrorMessage('Tu sesión ha expirado. Inicia sesión nuevamente.');
      return;
    }

    try {
      setIsSubmitting(true);

      const imageUrl = await fileService.uploadImage(pendingFormData.imageFile);

      await productService.createBaseProduct({
        name: pendingFormData.name,
        categoryId: pendingFormData.subcategoryId,
        measurementUnit: pendingFormData.measurementUnit,
        shortDescription: pendingFormData.shortDescription,
        imageUrl,
      });

      setPendingFormData(null);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate(ROUTES.PRODUCER.PRODUCTS);
      }, 1500);
    } catch (error) {
      console.error('Error al registrar el producto base:', error);
      setErrorMessage('No se pudo registrar el producto. Verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Registrar nuevo producto</h1>
      </header>

      <Card className={styles.cardContainer}>
        <AddProductForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Card>

      <Modal
        isOpen={pendingFormData !== null}
        onClose={() => !isSubmitting && setPendingFormData(null)}
        title="¿Guardar producto?"
        highlight={pendingFormData?.name}
        description="Una vez registrado no podrás hacer cambios."
      >
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', width: '100%' }}>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmSave}
            isLoading={isSubmitting}
            style={{ backgroundColor: '#00bfa5', minWidth: '120px' }}
          >
            Sí
          </Button>
          <Button
            type="button"
            variant="terracotta"
            onClick={() => setPendingFormData(null)}
            disabled={isSubmitting}
            style={{ minWidth: '120px' }}
          >
            No
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showSuccessModal} title="Producto registrado con éxito">
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #E040FB 0%, #B388FF 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 32px rgba(224, 64, 251, 0.45)',
            margin: '1.5rem auto 1rem',
          }}
          aria-hidden="true"
        >
          <Check size={40} strokeWidth={3} />
        </div>
      </Modal>

      {errorMessage && (
        <Toast
          message={errorMessage}
          variant="error"
          duration={5000}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </div>
  );
};

export default AddProduct;