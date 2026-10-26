import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthServiceProvider } from '@/contexts/AuthServiceContext';
import { TokenStorage } from '@/services/auth/TokenStorage';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';
import type { ProfileServiceInterface, UserProfile } from '@/services/profile/ProfileService';
import { ProfilePage } from '../ProfilePage';

const profile: UserProfile = {
  id: 7, email: 'ana@example.test', firstName: 'Ana', paternalLastName: 'Ruiz', maternalLastName: null,
  birthDate: '1990-01-02T00:00:00', phoneNumber: null, locality: null, biography: null,
  profilePictureUrl: 'https://example.test/foto.jpg', isVerified: true, registrationDate: '2025-01-01T00:00:00',
};
const authService: AuthServiceInterface = { login: jest.fn(), register: jest.fn(), verify: jest.fn() };

function setup(serviceOverrides: Partial<ProfileServiceInterface> = {}) {
  const storage = new TokenStorage();
  storage.setToken(`h.${btoa(JSON.stringify({ sub: '7', roleId: '1', exp: Math.floor(Date.now() / 1000) + 3600 }))}.s`);
  const service: ProfileServiceInterface = {
    getProfile: jest.fn().mockResolvedValue(profile),
    updateProfile: jest.fn().mockResolvedValue(undefined),
    uploadImage: jest.fn().mockResolvedValue('https://example.test/new.jpg'),
    updatePicture: jest.fn().mockResolvedValue(undefined),
    ...serviceOverrides,
  };
  render(<AuthServiceProvider authService={authService} tokenStorage={storage} profileService={service}><ProfilePage /></AuthServiceProvider>);
  return service;
}

beforeEach(() => {
  localStorage.clear();
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();
});

test('GET muestra perfil y fotografía guardada', async () => {
  setup();
  expect(await screen.findByDisplayValue('Ana')).toBeInTheDocument();
  expect(screen.getByText('ana@example.test')).toBeInTheDocument();
  expect(screen.getByAltText('Foto de Ana')).toHaveAttribute('src', profile.profilePictureUrl);
});

test('GET fallido muestra reintento sin datos falsos', async () => {
  setup({ getProfile: jest.fn().mockRejectedValue(new Error('offline')) });
  expect(await screen.findByText(/No se pudo cargar el perfil/)).toBeInTheDocument();
  expect(screen.queryByText('ana@example.test')).not.toBeInTheDocument();
});

test('valida obligatorios antes de PUT y envía campos editables tras corregir', async () => {
  const service = setup();
  const firstName = await screen.findByDisplayValue('Ana');
  await userEvent.clear(firstName);
  await userEvent.type(firstName, '   ');
  await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
  expect(service.updateProfile).not.toHaveBeenCalled();
  await userEvent.clear(firstName);
  await userEvent.type(firstName, 'Elena');
  await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(service.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Elena' })));
});

test('error PUT conserva formulario y fotografía anterior', async () => {
  const service = setup({ updateProfile: jest.fn().mockRejectedValue(new Error('offline')) });
  await screen.findByDisplayValue('Ana');
  await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText(/No se pudo completar la actualización/)).toBeInTheDocument();
  expect(service.getProfile).toHaveBeenCalledTimes(1);
  expect(screen.getByAltText('Foto de Ana')).toHaveAttribute('src', profile.profilePictureUrl);
});

test('imagen válida se sube y después se asocia; tipo inválido no llama la API', async () => {
  const service = setup();
  await screen.findByDisplayValue('Ana');
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['x'], 'bad.gif', { type: 'image/gif' })] } });
  expect(service.uploadImage).not.toHaveBeenCalled();
  const file = new File(['image'], 'foto.webp', { type: 'image/webp' });
  fireEvent.change(input, { target: { files: [file] } });
  await userEvent.click(screen.getByRole('button', { name: 'Guardar fotografía' }));
  await waitFor(() => expect(service.uploadImage).toHaveBeenCalledWith(file));
  expect(service.updatePicture).toHaveBeenCalledWith('https://example.test/new.jpg');
});

test('fallo de asociación mantiene foto previa', async () => {
  setup({ updatePicture: jest.fn().mockRejectedValue(new Error('offline')) });
  await screen.findByDisplayValue('Ana');
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['image'], 'foto.png', { type: 'image/png' })] } });
  await userEvent.click(screen.getByRole('button', { name: 'Guardar fotografía' }));
  expect(await screen.findByText(/fotografía anterior permanece visible/)).toBeInTheDocument();
  expect(screen.getByAltText('Foto de Ana')).toHaveAttribute('src', profile.profilePictureUrl);
});

test('imagen mayor de 5 MiB se rechaza antes de la API', async () => {
  const service = setup();
  await screen.findByDisplayValue('Ana');
  const large = new File(['x'], 'grande.png', { type: 'image/png' });
  Object.defineProperty(large, 'size', { value: 5 * 1024 * 1024 + 1 });
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [large] } });
  expect(await screen.findByText(/supera el tamaño máximo/)).toBeInTheDocument();
  expect(service.uploadImage).not.toHaveBeenCalled();
});
