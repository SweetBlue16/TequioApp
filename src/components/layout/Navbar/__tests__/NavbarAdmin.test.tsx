import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Admin } from '@/pages/admin/Admin';
import { Login } from '@/pages/auth/Login';
import { ProtectedRoutes } from '@/routes/ProtectedRoutes';
import { AuthServiceProvider } from '@/contexts/AuthServiceContext';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';
import { decodeSession } from '@/services/auth/decodeSession';

const roleNames: Record<number, string> = { 1: 'Buyer', 2: 'Producer', 3: 'Admin', 4: 'MasterAdmin' };
const token = (roleId: number) => `h.${btoa(JSON.stringify({
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '7',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': roleNames[roleId],
  exp: Math.floor(Date.now() / 1000) + 3600,
}))}.s`;
const authService: AuthServiceInterface = {
  login: jest.fn(), register: jest.fn(), verify: jest.fn(), resendVerificationCode: jest.fn(),
  requestPasswordReset: jest.fn(), resetPassword: jest.fn(),
};
const mount = (path = '/') => render(
  <AuthServiceProvider authService={authService}>
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Inicio</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<h1>Perfil</h1>} />
        <Route element={<ProtectedRoutes requiredRoleId={3} />}>
          <Route path="/admin" element={<Admin />}>
            <Route index element={<h1>Panel existente</h1>} />
            <Route path="puntos-entrega" element={<h1>Catálogo de puntos</h1>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  </AuthServiceProvider>,
);

beforeEach(() => { localStorage.clear(); jest.clearAllMocks(); });

describe('Admin navigation respects the current session role', () => {
  it.each([null, 1, 2, 4])('hides the admin entry for role %s in desktop and mobile menus', async (roleId) => {
    if (roleId) localStorage.setItem('token', token(roleId));
    mount();
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Panel de administración' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    expect(within(screen.getByRole('navigation', { name: 'Menú móvil' })).queryByRole('link', { name: 'Panel de administración' })).not.toBeInTheDocument();
    if (roleId) expect(screen.getAllByRole('link', { name: 'Panel de vendedor' })).toHaveLength(2);
  });

  it('restores an Admin JWT and follows the desktop panel and delivery points links', async () => {
    localStorage.setItem('token', token(3));
    mount();
    const entry = await screen.findByRole('link', { name: 'Panel de administración' });
    expect(entry).toHaveAttribute('href', '/admin');
    await userEvent.click(entry);
    expect(await screen.findByRole('heading', { name: 'Panel existente' })).toBeInTheDocument();
    const points = screen.getByRole('link', { name: 'Puntos de entrega' });
    expect(points).toHaveAttribute('href', '/admin/puntos-entrega');
    await userEvent.click(points);
    expect(await screen.findByRole('heading', { name: 'Catálogo de puntos' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión de administrador' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Panel de administración' })).not.toBeInTheDocument();
  });

  it('shows the mobile Admin entry and closes the drawer after navigation', async () => {
    localStorage.setItem('token', token(3));
    mount();
    await screen.findByRole('link', { name: 'Panel de administración' });
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Menú móvil' })).getByRole('link', { name: 'Panel de administración' }));
    expect(await screen.findByRole('heading', { name: 'Panel existente' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Menú móvil' })).not.toBeInTheDocument();
  });

  it.each([1, 2, 4])('keeps the panel protected from authenticated role %s', async (roleId) => {
    localStorage.setItem('token', token(roleId));
    mount('/admin/puntos-entrega');
    expect(await screen.findByRole('heading', { name: 'Perfil' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Catálogo de puntos' })).not.toBeInTheDocument();
  });

  it('recognizes the Admin role after real login form submission and stores its session', async () => {
    jest.mocked(authService.login).mockResolvedValue({ token: token(3), mensaje: 'ok' });
    mount('/login');
    await userEvent.type(screen.getByPlaceholderText('Correo electrónico o número de teléfono'), 'admin@example.test');
    await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'TEST_PASSWORD_123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    expect(await screen.findByRole('link', { name: 'Panel de administración' })).toBeInTheDocument();
    expect(decodeSession(localStorage.getItem('token'))?.roleId).toBe(3);
  });
});
