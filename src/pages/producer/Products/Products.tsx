import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { Toast } from '@/components/common/Toast';
import type { SortOption } from '@/components/common/SortSelect';
import { ProductToolbar } from '@/components/producer/products/ProductToolbar';
import { ProductListTable } from '@/components/producer/products/ProductListTable';
import type { ProductItemData } from '@/components/producer/products/ProductListItem';
import type { ProductPageResponse, ProductItemResponse } from '@/types/product/Product';
import { useSession } from '@/contexts/AuthContext';
import { createClient } from '@/services/api';
import { TokenStorage } from '@/services/auth/TokenStorage';
import { ProductService } from '@/services/products/ProductService';
import { PRODUCT_CATEGORIES_TREE } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';
import styles from './Products.module.css';

const tokenStorage = new TokenStorage();
const apiClient = createClient(tokenStorage);
const productService = new ProductService(apiClient);

const PRODUCT_SORT_OPTIONS: readonly SortOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'name_asc', label: 'Nombre (A - Z)' },
  { value: 'name_desc', label: 'Nombre (Z - A)' },
  { value: 'category_asc', label: 'Categoría' },
];

const ITEMS_PER_PAGE = 10;

/**
 * Traduce el categoryId que viene de la BD al nombre legible de la categoría.
 */
const resolveCategoryName = (categoryId?: number): string => {
  if (!categoryId) return 'General';
  for (const parent of PRODUCT_CATEGORIES_TREE) {
    if (parent.id === categoryId) return parent.label;
    const sub = parent.subcategories.find((s) => s.id === categoryId);
    if (sub) return `${parent.label}`;
  }
  return 'General';
};

/**
 * Maps raw backend response items to the visual representation required by ProductListItem.
 */
const mapToPresentationItems = (
  items: readonly ProductItemResponse[]
): ProductItemData[] => {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: resolveCategoryName(item.categoryId), // <-- Nombre real de la categoría
    subcategory: item.measurementUnit || 'Pieza',   // <-- Columna "Unidad"
    imageUrl: item.imageUrl,
    isActive: item.isActive ?? true,
  }));
};

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  const producerId = session?.userId ? Number(session.userId) : 0;

  const [products, setProducts] = useState<readonly ProductItemData[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(() => producerId > 0);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('all');

  const [productToDelete, setProductToDelete] = useState<ProductItemData | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const reloadProducts = useCallback(async (): Promise<void> => {
    if (producerId <= 0) return;

    try {
      setIsLoading(true);
      const response: ProductPageResponse = await productService.getProductsByProducer(
        producerId,
        currentPage,
        ITEMS_PER_PAGE
      );

      const list = response?.products ?? response?.items ?? [];
      const total = response?.itemCount ?? response?.totalCount ?? list.length;

      setProducts(mapToPresentationItems(list));
      setTotalRecords(total);
    } catch (error) {
      console.error('Error al actualizar productos:', error);
      setToastMessage('No se pudo actualizar el catálogo de productos.');
    } finally {
      setIsLoading(false);
    }
  }, [producerId, currentPage]);

  useEffect(() => {
    if (producerId <= 0) return;

    let isCurrent = true;

    productService
      .getProductsByProducer(producerId, currentPage, ITEMS_PER_PAGE)
      .then((response) => {
        if (!isCurrent) return;
        const list = response?.products ?? response?.items ?? [];
        const total = response?.itemCount ?? response?.totalCount ?? list.length;

        setProducts(mapToPresentationItems(list));
        setTotalRecords(total);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          console.error('Error al cargar productos iniciales:', error);
          setToastMessage('Error al conectar con el servidor.');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [producerId, currentPage]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const result = products.filter((item) =>
      item.name.toLowerCase().includes(query)
    );

    if (selectedSort === 'name_asc') {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (selectedSort === 'name_desc') {
      return [...result].sort((a, b) => b.name.localeCompare(a.name));
    }
    if (selectedSort === 'category_asc') {
      return [...result].sort((a, b) => a.category.localeCompare(b.category));
    }

    return result;
  }, [products, searchTerm, selectedSort]);

  const handleNavigateToNewProduct = (): void => {
    navigate(ROUTES.PRODUCER.NEW_PRODUCT);
  };

  const handleProductClick = (productId: number): void => {
    console.info(`Detalles del producto ID: ${productId}`);
  };

  const handlePageChange = (newPage: number): void => {
    setIsLoading(true);
    setCurrentPage(newPage);
  };

  const handleRequestDeactivation = (productId: number): void => {
    const targetProduct = products.find((item) => item.id === productId) ?? null;
    setProductToDelete(targetProduct);
  };

  const handleConfirmDeactivation = async (): Promise<void> => {
    if (!productToDelete) return;

    try {
      setIsDeactivating(true);
      await productService.deactivateProduct(productToDelete.id);
      setProductToDelete(null);
      setShowSuccessModal(true);

      await reloadProducts();

      setTimeout(() => {
        setShowSuccessModal(false);
      }, 1600);
    } catch (error) {
      console.error('Error al dar de baja el producto:', error);
      setToastMessage('No se pudo dar de baja el producto.');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Mis productos</h1>
      </header>

      <Card className={styles.cardContent}>
        <ProductToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          sortOptions={PRODUCT_SORT_OPTIONS}
          onAddProduct={handleNavigateToNewProduct}
        />

        <section className={styles.tableSection}>
          {isLoading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#63584f' }}>
              <p>Cargando catálogo...</p>
            </div>
          ) : (
            <ProductListTable
              products={filteredProducts}
              onProductClick={handleProductClick}
              onDeactivateProduct={handleRequestDeactivation}
            />
          )}
        </section>

        <footer className={styles.paginationSection}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE))}
            totalRecords={totalRecords}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </footer>
      </Card>

      <Modal
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        title="¿Estás seguro de que quieres dar de baja este producto?"
        highlight={productToDelete?.name}
        description="Esta acción no se puede deshacer."
      >
        <div style={{ display: 'flex', gap: '1.25rem', width: '100%', justifyContent: 'center' }}>
          <Button
            variant="primary"
            onClick={handleConfirmDeactivation}
            isLoading={isDeactivating}
            style={{ backgroundColor: '#00bfa5', minWidth: '120px' }}
          >
            Sí
          </Button>
          <Button
            variant="terracotta"
            onClick={() => setProductToDelete(null)}
            disabled={isDeactivating}
            style={{ minWidth: '120px' }}
          >
            No
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showSuccessModal} title="El producto ha sido descartado">
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

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="error"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default Products;