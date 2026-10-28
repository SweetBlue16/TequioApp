import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Producer } from '@/pages/producer/Producer';
import { ProducerWelcome } from '@/components/producer/ProducerWelcome';
import { Products } from '@/pages/producer/Products';
import { AddProduct } from '@/pages/producer/AddProduct';

export const ProducerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Producer />}>
        <Route index element={<ProducerWelcome />} />
        <Route path="productos" element={<Products />} />
        <Route path="productos/nuevo" element={<AddProduct />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default ProducerRoutes;