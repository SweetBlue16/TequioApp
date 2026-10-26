import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthServiceProvider } from '@/contexts/AuthServiceContext';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';
import { Login } from '../Login';

test('login válido guarda sesión y navega al destino protegido', async () => {
  localStorage.clear();
  const token = `h.${btoa(JSON.stringify({ sub: '7', roleId: '2', exp: Math.floor(Date.now() / 1000) + 3600 }))}.s`;
  const authService: AuthServiceInterface = {
    login: jest.fn().mockResolvedValue({ token, mensaje: 'ok' }),
    register: jest.fn(), verify: jest.fn(),
  };
  render(
    <AuthServiceProvider authService={authService}>
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/mis-productos' } }]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/mis-productos" element={<h1>Destino privado</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthServiceProvider>,
  );
  await userEvent.type(screen.getByPlaceholderText('Correo electrónico o número de teléfono'), 'ana@example.test');
  await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
  expect(await screen.findByText('Destino privado')).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBe(token);
  expect(authService.login).toHaveBeenCalledWith({ email: 'ana@example.test', password: 'password123' });
});
