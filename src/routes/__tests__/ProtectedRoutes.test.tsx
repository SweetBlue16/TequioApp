import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { AuthServiceProvider } from '@/contexts/AuthServiceContext';
import { TokenStorage } from '@/services/auth/TokenStorage';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';
import type { ProfileServiceInterface } from '@/services/profile/ProfileService';
import { ProtectedRoutes } from '../ProtectedRoutes';
import { Navbar } from '@/components/layout/Navbar';

const authService: AuthServiceInterface = {
  login: jest.fn(), register: jest.fn(), verify: jest.fn(),
  resendVerificationCode: jest.fn(), requestPasswordReset: jest.fn(), resetPassword: jest.fn(),
};
const profileService: ProfileServiceInterface = {
  getProfile: jest.fn().mockResolvedValue({ id: 7, firstName: 'Ana', paternalLastName: 'Ruiz', profilePictureUrl: null }),
  updateProfile: jest.fn(), uploadImage: jest.fn(), updatePicture: jest.fn(), becomeProducer: jest.fn(),
};

function token(roleId: number, exp = Math.floor(Date.now() / 1000) + 3600) {
  return `header.${btoa(JSON.stringify({ sub: '7', roleId: String(roleId), exp }))}.signature`;
}

function renderAt(path: string, storage: TokenStorage) {
  return render(
    <AuthServiceProvider authService={authService} tokenStorage={storage} profileService={profileService}>
      <MemoryRouter initialEntries={[path]}>
        <Navbar />
        <Routes>
          <Route path="/login" element={<h1>Login requerido</h1>} />
          <Route element={<ProtectedRoutes />}><Route path="/perfil" element={<h1>Perfil privado</h1>} /></Route>
          <Route element={<ProtectedRoutes requiredRoleId={2} />}><Route path="/mis-productos" element={<h1>Productos privados</h1>} /></Route>
        </Routes>
      </MemoryRouter>
    </AuthServiceProvider>,
  );
}

beforeEach(() => localStorage.clear());

test('durante inicialización solo muestra espera, sin contenido protegido', () => {
  const html = renderToString(
    <AuthServiceProvider authService={authService} tokenStorage={new TokenStorage()}>
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes><Route element={<ProtectedRoutes />}><Route path="/perfil" element={<h1>Privado</h1>} /></Route></Routes>
      </MemoryRouter>
    </AuthServiceProvider>,
  );
  expect(html).toContain('Restaurando sesión');
  expect(html).not.toContain('Privado');
});

test('anónimo y token malformado o vencido no montan vistas protegidas', async () => {
  const storage = new TokenStorage();
  const view = renderAt('/perfil', storage);
  expect(await screen.findByText('Login requerido')).toBeInTheDocument();
  expect(screen.queryByText('Perfil privado')).not.toBeInTheDocument();
  view.unmount();
  for (const invalid of ['broken', token(1, 1)]) {
    storage.setToken(invalid);
    const attempt = renderAt('/perfil', storage);
    expect(await screen.findByText('Login requerido')).toBeInTheDocument();
    expect(storage.getToken()).toBeNull();
    attempt.unmount();
  }
});

test('restaura comprador y le impide entrar a productos', async () => {
  const storage = new TokenStorage();
  storage.setToken(token(1));
  renderAt('/mis-productos', storage);
  expect(await screen.findByText('Perfil privado')).toBeInTheDocument();
  expect(screen.queryByText('Productos privados')).not.toBeInTheDocument();
  expect(screen.queryByText('Mis productos')).not.toBeInTheDocument();
  expect(await screen.findByText('Hola, Ana')).toBeInTheDocument();
});

test('productor accede a productos y logout borra sesión y navegación', async () => {
  const storage = new TokenStorage();
  storage.setToken(token(2));
  renderAt('/mis-productos', storage);
  expect(await screen.findByText('Productos privados')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Panel de vendedor' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Salir' }));
  expect(storage.getToken()).toBeNull();
  expect(await screen.findByText('Login requerido')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Panel de vendedor' })).not.toBeInTheDocument();
});

test('limpieza del token sincroniza la UI', async () => {
  const storage = new TokenStorage();
  storage.setToken(token(2));
  renderAt('/mis-productos', storage);
  expect(await screen.findByText('Productos privados')).toBeInTheDocument();
  act(() => storage.clearToken());
  await waitFor(() => expect(screen.getByText('Login requerido')).toBeInTheDocument());
});
