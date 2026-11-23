import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ComboBox } from '@/components/common/ComboBox';
import { Pagination } from '@/components/common/Pagination';
import { Toast } from '@/components/common/Toast';
import { PRODUCT_CATEGORIES_TREE } from '@/constants/categories';
import { createClient } from '@/services/api';
import { TokenStorage } from '@/services/auth/TokenStorage';
import { ProductService } from '@/services/products/ProductService';
import type { ProductPageResponse } from '@/types/product/Product';
import styles from './Catalog.module.css';

const PAGE_SIZE = 10;
const CATEGORY_OPTIONS = PRODUCT_CATEGORIES_TREE.flatMap(({ id, label, subcategories }) => [
  { value: id, label },
  ...subcategories.map((item) => ({ value: item.id, label: `${label} — ${item.label}` })),
]);
const productService = new ProductService(createClient(new TokenStorage()));

interface CatalogResult {
  requestKey: string;
  page: ProductPageResponse | null;
}

/** Displays the active catalog for the selected category using the public API. */
export const Catalog = () => {
  const [categoryId, setCategoryId] = useState(CATEGORY_OPTIONS[0].value);
  const [pageIndex, setPageIndex] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<CatalogResult | null>(null);
  const requestKey = `${categoryId}:${pageIndex}:${attempt}`;
  const currentResult = result?.requestKey === requestKey ? result : null;
  const products = currentResult?.page?.products ?? [];
  const totalProducts = currentResult?.page?.itemCount ?? 0;

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        const page = await productService.getProductsByCategory(
          categoryId,
          pageIndex,
          PAGE_SIZE,
          controller.signal
        );
        if (!controller.signal.aborted) {
          setResult({ requestKey, page });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Could not load the public catalog.', error);
          setResult({ requestKey, page: null });
        }
      }
    };

    void loadProducts();
    return () => controller.abort();
  }, [categoryId, pageIndex, requestKey]);

  return (
    <section className={styles.catalog} aria-labelledby="catalog-title">
      <h1 id="catalog-title">Catálogo de productos</h1>
      <ComboBox
        label="Categoría"
        options={CATEGORY_OPTIONS}
        value={categoryId}
        onChange={(event) => {
          setCategoryId(Number(event.target.value));
          setPageIndex(1);
        }}
      />

      {!currentResult && <output>Cargando productos…</output>}
      {currentResult && !currentResult.page && (
        <div>
          <Toast message="No pudimos cargar los productos." variant="error" />
          <Button onClick={() => setAttempt((previous) => previous + 1)}>Reintentar</Button>
        </div>
      )}
      {currentResult?.page && products.length === 0 && (
        <output>No hay productos disponibles en esta categoría.</output>
      )}
      {products.length > 0 && (
        <ul className={styles.products} aria-label="Productos de la categoría">
          {products.map((product) => (
            <li key={product.id}>
              <Card>
                {product.imageUrl && (
                  <img className={styles.image} src={product.imageUrl} alt="" loading="lazy" />
                )}
                <h2>{product.name}</h2>
                {product.shortDescription && <p>{product.shortDescription}</p>}
                {product.measurementUnit && <p>{product.measurementUnit}</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        currentPage={pageIndex}
        totalPages={Math.ceil(totalProducts / PAGE_SIZE)}
        totalRecords={totalProducts}
        pageSize={PAGE_SIZE}
        onPageChange={setPageIndex}
      />
    </section>
  );
};
