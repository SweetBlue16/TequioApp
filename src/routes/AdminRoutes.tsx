import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Admin } from '@/pages/admin/Admin';
import { AdminWelcome } from '@/components/admin/AdminWelcome';

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Admin />}>
        <Route index element={<AdminWelcome />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;