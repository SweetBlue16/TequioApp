import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const VerifyAccount = lazy(() => import('@/pages/auth/VerifyAccount'));
const RecoverAccount = lazy(() => import('@/pages/auth/RecoverAccount'));

export const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="registro" element={<Register />} />
      <Route path="verificar" element={<VerifyAccount />} />
      <Route path="recuperar" element={<RecoverAccount />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;