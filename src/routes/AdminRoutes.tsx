import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Admin } from '@/pages/admin/Admin';
import { AdminWelcome } from '@/components/admin/AdminWelcome';
import { DeliveryPoints } from '@/pages/admin/DeliveryPoints';
import { AddDeliveryPoint } from '@/pages/admin/AddDeliveryPoint';
import { EditDeliveryPoint } from '@/pages/admin/EditDeliveryPoint';

/**
 * Dedicated sub-router for all administrator dashboard views.
 */
export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Admin />}>
        <Route index element={<AdminWelcome />} />
        <Route path="puntos-entrega" element={<DeliveryPoints />} />
        <Route path="puntos-entrega/nuevo" element={<AddDeliveryPoint />} />
        <Route path="puntos-entrega/edicion/:id" element={<EditDeliveryPoint />} />

        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;