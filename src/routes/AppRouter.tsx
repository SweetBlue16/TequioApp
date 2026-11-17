import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { VerifyAccount } from '@/pages/auth/VerifyAccount';
import { RecoverAccount } from '@/pages/auth/RecoverAccount';
import { ProtectedRoutes } from './ProtectedRoutes';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { MyProducts } from '@/pages/MyProducts';
import { ProducerRoutes } from './ProducerRoutes';
import { AdminRoutes } from './AdminRoutes';

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
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/verificar" element={<VerifyAccount />} />
      <Route path="/recuperar" element={<RecoverAccount />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route element={<ProtectedRoutes requiredRoleId={2} />}>
        <Route path="/mis-productos" element={<MyProducts />} />
      </Route>

      {/*Panel de Vendedor */}
      <Route path="/panel-vendedor/*" element={<ProducerRoutes />} />
      
      {/* Panel de Administrador */}
      <Route element={<ProtectedRoutes requiredRoleId={3} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>

      {/* Panel de Administrador Maestro */}
      <Route element={<ProtectedRoutes requiredRoleId={4} />}>
        <Route path="/adminMaestro/*" element={
            <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
              <h1>Panel de Administrador Maestro</h1>
            </div>
          }
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRouter;