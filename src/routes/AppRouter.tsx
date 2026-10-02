import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Register } from '@/pages/auth/Register';
import { VerifyAccount } from '@/pages/auth/VerifyAccount';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
            <h1>Bienvenido a Tequio</h1>
            <p style={{ marginTop: '12px', color: 'var(--color-ash-brown)' }}>
              Mercado comunitario de café, miel y cosechas locales de la región.
            </p>
          </div>
        }
      />
      <Route path="/registro" element={<Register />} />
      <Route path="/verificar" element={<VerifyAccount />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;