import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import type { SortOption } from '@/components/common/SortSelect';
import { DeliveryPointToolbar } from '@/components/admin/deliveryPoints/DeliveryPointToolbar';
import { DeliveryPointListTable } from '@/components/admin/deliveryPoints/DeliveryPointListTable';
import { DeliveryPointDetailCard } from '@/components/admin/deliveryPoints/DeliveryPointDetailCard';
import { deliveryPointService } from '@/services/deliveryPoints/DeliveryPointService';
import type { DeliveryPoint } from '@/types/deliveryPoint/DeliveryPoint';
import { ROUTES } from '@/constants/routes';
import styles from './DeliveryPoints.module.css';

const PAGE_SIZE = 10;

const SORT_OPTIONS: readonly SortOption<string>[] = [
  { label: 'Todos', value: 'default' },
  { label: 'Nombre (A - Z)', value: 'name-asc' },
  { label: 'Nombre (Z - A)', value: 'name-desc' },
  { label: 'Activos primero', value: 'active-first' },
];

/**
 * Applies name search and selected sort criteria to delivery point records.
 */
const filterAndSortDeliveryPoints = (
  points: readonly DeliveryPoint[],
  searchTerm: string,
  sortBy: string
): DeliveryPoint[] => {
  const query = searchTerm.trim().toLowerCase();
  const filtered = query
    ? points.filter((item) => item.name.toLowerCase().includes(query))
    : [...points];

  if (sortBy === 'name-asc') {
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
  if (sortBy === 'name-desc') {
    return filtered.sort((a, b) => b.name.localeCompare(a.name, 'es'));
  }
  if (sortBy === 'active-first') {
    return filtered.sort((a, b) => Number(b.isActive) - Number(a.isActive));
  }
  return filtered;
};

/**
 * Orchestrator page for managing authorized delivery points (/admin/puntos-entrega).
 */
export const DeliveryPoints: React.FC = () => {
  const navigate = useNavigate();

  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [inspectedPoint, setInspectedPoint] = useState<DeliveryPoint | null>(null);
  const [pointToToggle, setPointToToggle] = useState<DeliveryPoint | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Carga el catálogo paginado desde el servicio (base 1, mínimo 10 registros)
  const loadDeliveryPoints = useCallback(async (): Promise<void> => {
    const response = await deliveryPointService.getDeliveryPoints(1, 50);
    const items = 'items' in response ? response.items : [];
    setDeliveryPoints([...items]);
  }, []);

  useEffect(() => {
    void loadDeliveryPoints();
  }, [loadDeliveryPoints]);

  const processedPoints = useMemo(
    () => filterAndSortDeliveryPoints(deliveryPoints, searchTerm, selectedSort),
    [deliveryPoints, searchTerm, selectedSort]
  );

  const totalRecords = processedPoints.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const paginatedPoints = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return processedPoints.slice(startIndex, startIndex + PAGE_SIZE);
  }, [processedPoints, currentPage]);

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string): void => {
    setSelectedSort(value);
    setCurrentPage(1);
  };

  const handleEditPoint = (pointId: number): void => {
    navigate(ROUTES.ADMIN.EDIT_DELIVERY_POINT.replace(':id', String(pointId)));
  };

  const handleConfirmToggleStatus = async (): Promise<void> => {
    if (!pointToToggle) return;

    setIsUpdatingStatus(true);
    await deliveryPointService.toggleDeliveryPointStatus(
      pointToToggle.id,
      !pointToToggle.isActive
    );
    await loadDeliveryPoints();
    setIsUpdatingStatus(false);
    setPointToToggle(null);
  };

  if (inspectedPoint) {
    return (
      <DeliveryPointDetailCard
        point={inspectedPoint}
        mode="detail"
        ribbonPosition="center"
        onBack={() => setInspectedPoint(null)}
      />
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Puntos de entrega autorizados</h1>
      </header>

      <Card padding="lg">
        <div className={styles.cardBody}>
          <DeliveryPointToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedSort={selectedSort}
            onSortChange={handleSortChange}
            sortOptions={SORT_OPTIONS}
            onAddDeliveryPoint={() => navigate(ROUTES.ADMIN.NEW_DELIVERY_POINT)}
          />

          <DeliveryPointListTable
            deliveryPoints={paginatedPoints}
            onSelectPoint={setInspectedPoint}
            onEditPoint={handleEditPoint}
            onTogglePointStatus={setPointToToggle}
          />

          {totalRecords > 0 && (
            <div className={styles.paginationSection}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                totalRecords={totalRecords}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={pointToToggle !== null}
        onClose={() => setPointToToggle(null)}
      >
        {pointToToggle && (
          <div className={styles.modalBody}>
            <h2 className={styles.modalTitle}>
              {pointToToggle.isActive
                ? '¿Desactivar este punto de entrega?'
                : '¿Activar este punto de entrega?'}
            </h2>
            <p className={styles.modalHighlight}>{pointToToggle.name}</p>
            <p className={styles.modalDescription}>
              {pointToToggle.isActive
                ? 'Los productores no podrán seleccionarlo para nuevos lotes mientras esté inactivo.'
                : 'Volverá a estar disponible para programar entregas comunitarias.'}
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="primary"
                isLoading={isUpdatingStatus}
                onClick={() => void handleConfirmToggleStatus()}
              >
                Sí
              </Button>
              <Button
                variant="terracotta"
                disabled={isUpdatingStatus}
                onClick={() => setPointToToggle(null)}
              >
                No
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeliveryPoints;