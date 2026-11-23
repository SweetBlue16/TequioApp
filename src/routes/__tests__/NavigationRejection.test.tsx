import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthServiceProvider } from '@/contexts/AuthServiceContext';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';
import { deliveryPointService } from '@/services/deliveryPoints/DeliveryPointService';
import { ProductService } from '@/services/products/ProductService';
import type { DeliveryPoint } from '@/types/deliveryPoint/DeliveryPoint';
import { AppRouter } from '../AppRouter';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const authService: AuthServiceInterface = {
  login: jest.fn(),
  register: jest.fn(),
  verify: jest.fn(),
  resendVerificationCode: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
};

const point: DeliveryPoint = {
  id: 7,
  name: 'Punto de prueba',
  street: 'Enríquez',
  number: '1',
  neighborhood: 'Centro',
  zipCode: '91000',
  city: 'Xalapa',
  references: null,
  businessHours: '09:00 - 18:00',
  latitude: 19.53,
  longitude: -96.92,
  isActive: true,
};

const openPage = (path: string, roleId: number) => {
  const claims = { sub: '7', roleId, exp: Math.floor(Date.now() / 1000) + 3600 };
  localStorage.setItem('token', `header.${btoa(JSON.stringify(claims))}.signature`);
  render(
    <AuthServiceProvider authService={authService}>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </AuthServiceProvider>
  );
};

describe('Visible feedback when navigation rejects', () => {
  beforeEach(() => {
    mockNavigate.mockRejectedValue(new Error('Navigation failed in test'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockNavigate.mockReset();
    localStorage.clear();
  });

  it('keeps the Admin sign-out error visible after clearing the session (F12)', async () => {
    openPage('/admin', 3);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Cerrar sesión de administrador' })
    );
    expect(localStorage.getItem('token')).toBeNull();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cerraste sesión, pero no pudimos abrir la página de acceso.'
    );
    expect(await screen.findByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
  });

  it('keeps delivery points visible when the edit route rejects (F13)', async () => {
    jest.spyOn(deliveryPointService, 'getDeliveryPoints').mockResolvedValue({
      items: [point],
      totalCount: 1,
      pageIndex: 1,
      pageSize: 100,
    });
    openPage('/admin/puntos-entrega', 3);
    await userEvent.click(await screen.findByRole('button', { name: 'Editar Punto de prueba' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos abrir el formulario de edición.'
    );
    expect(screen.getByRole('button', { name: 'Editar Punto de prueba' })).toBeVisible();
  });

  it('announces a failed return from an invalid delivery point ID (F14)', async () => {
    const load = jest.spyOn(deliveryPointService, 'getDeliveryPointById');
    openPage('/admin/puntos-entrega/edicion/invalido', 3);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos abrir la lista de puntos de entrega.'
    );
    expect(load).not.toHaveBeenCalled();
  });

  it('keeps the producer list visible when the add product route rejects (F19)', async () => {
    jest.spyOn(ProductService.prototype, 'getProductsByProducer').mockResolvedValue({
      products: [{ id: 8, name: 'Café de prueba' }],
      itemCount: 1,
    });
    openPage('/panel-vendedor/productos', 2);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Agregar un nuevo producto al catálogo' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos abrir el formulario de productos.'
    );
    expect(screen.getByRole('button', { name: 'Modificar producto Café de prueba' })).toBeVisible();
  });
});
