import { act, render, screen, waitFor, fireEvent, within } from '@testing-library/react';
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
const authService: AuthServiceInterface = {
  login: jest.fn(), register: jest.fn(), verify: jest.fn(),
  resendVerificationCode: jest.fn(), requestPasswordReset: jest.fn(), resetPassword: jest.fn(),
};

function setup(serviceOverrides: Partial<ProfileServiceInterface> = {}) {
  const storage = new TokenStorage();
  storage.setToken(`h.${btoa(JSON.stringify({ sub: '7', roleId: '1', exp: Math.floor(Date.now() / 1000) + 3600 }))}.s`);
  const service: ProfileServiceInterface = {
    getProfile: jest.fn().mockResolvedValue(profile),
    updateProfile: jest.fn().mockResolvedValue(undefined),
    uploadImage: jest.fn().mockResolvedValue('https://example.test/new.jpg'),
    updatePicture: jest.fn().mockResolvedValue(undefined),
    becomeProducer: jest.fn().mockResolvedValue(undefined),
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
  const service = setup({ updateProfile: jest.fn().mockRejectedValue({
    isAxiosError: true, response: { status: 500, data: { error: 'Error al actualizar.' } },
  }) });
  const firstName = await screen.findByDisplayValue('Ana');
  await userEvent.clear(firstName);
  await userEvent.type(firstName, 'Elena');
  await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  const message = await screen.findByText(/No se pudo completar la actualización/);
  expect(message.closest('[role="alert"]')).toHaveClass('error');
  expect(screen.getByLabelText('Nombre *')).toHaveValue('Elena');
  expect(service.updateProfile).toHaveBeenCalledTimes(1);
  expect(service.getProfile).toHaveBeenCalledTimes(1);
  expect(screen.getByAltText('Foto de Ana')).toHaveAttribute('src', profile.profilePictureUrl);
});

test('imagen válida se sube y después se asocia; tipo inválido no llama la API', async () => {
  const service = setup();
  await screen.findByDisplayValue('Ana');
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['x'], 'bad.gif', { type: 'image/gif' })] } });
  expect(screen.getByRole('alert')).toHaveTextContent('Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP.');
  expect(screen.getByRole('alert')).toHaveClass('error');
  expect(service.uploadImage).not.toHaveBeenCalled();
  expect(service.updatePicture).not.toHaveBeenCalled();
  const file = new File(['image'], 'foto.webp', { type: 'image/webp' });
  fireEvent.change(input, { target: { files: [file] } });
  await userEvent.click(screen.getByRole('button', { name: 'Guardar fotografía' }));
  await waitFor(() => expect(service.uploadImage).toHaveBeenCalledWith(file));
  expect(service.updatePicture).toHaveBeenCalledWith('https://example.test/new.jpg');
});

test('fallo de asociación mantiene foto previa', async () => {
  const service = setup({ updatePicture: jest.fn().mockRejectedValue(new Error('offline')) });
  await screen.findByDisplayValue('Ana');
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['image'], 'foto.png', { type: 'image/png' })] } });
  await userEvent.click(screen.getByRole('button', { name: 'Guardar fotografía' }));
  const message = await screen.findByText(/fotografía anterior permanece visible/);
  expect(message.closest('[role="alert"]')).toHaveClass('error');
  expect(service.uploadImage).toHaveBeenCalledTimes(1);
  expect(service.updatePicture).toHaveBeenCalledTimes(1);
  expect(service.getProfile).toHaveBeenCalledTimes(1);
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

describe('ProfilePage validation and submission', () => {
  it.each([
    ['Nombre *', '', 'El nombre es obligatorio.'],
    ['Apellido paterno *', '', 'El apellido paterno es obligatorio.'],
    ['Apellido paterno *', '   ', 'El apellido paterno es obligatorio.'],
  ])('should block updates when %s contains %j', async (label, value, message) => {
    const user = userEvent.setup();
    const service = setup();
    await screen.findByDisplayValue('Ana');
    const input = screen.getByLabelText(label);
    await user.clear(input);
    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(service.updateProfile).not.toHaveBeenCalled();
    expect(service.uploadImage).not.toHaveBeenCalled();
    expect(service.updatePicture).not.toHaveBeenCalled();
  });

  it.each(['', '2999-01-01', '2023-02-29'])(
    'should reject an empty, future or invalid birth date: %j', async (value) => {
      const service = setup();
      await screen.findByDisplayValue('Ana');
      const input = screen.getByLabelText('Fecha de nacimiento *');
      // Native date inputs do not support userEvent.type consistently in JSDOM.
      fireEvent.change(input, { target: { value } });
      await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

      expect(screen.getByText('Ingresa una fecha de nacimiento válida que no sea futura.')).toHaveAttribute('role', 'alert');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(service.updateProfile).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['Nombre *', 100, 'El nombre'],
    ['Apellido paterno *', 100, 'El apellido paterno'],
    ['Apellido materno', 100, 'El apellido materno'],
    ['Teléfono', 20, 'El teléfono'],
    ['Localidad', 100, 'La localidad'],
  ])('should reject %s above its maximum length', async (label, max, prefix) => {
    const user = userEvent.setup();
    const service = setup();
    await screen.findByDisplayValue('Ana');
    const input = screen.getByLabelText(label);
    await user.clear(input);
    await user.click(input);
    await user.paste('a'.repeat(max + 1));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(screen.getByText(`${prefix} no puede exceder ${max} caracteres.`)).toHaveAttribute('role', 'alert');
    expect(service.updateProfile).not.toHaveBeenCalled();
  });

  it('should accept all fields at their maximum lengths', async () => {
    const user = userEvent.setup();
    const service = setup();
    await screen.findByDisplayValue('Ana');
    for (const [label, length] of [
      ['Nombre *', 100], ['Apellido paterno *', 100], ['Apellido materno', 100],
      ['Teléfono', 20], ['Localidad', 100],
    ] as const) {
      const input = screen.getByLabelText(label);
      await user.clear(input);
      await user.click(input);
      await user.paste('a'.repeat(length));
    }
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Perfil actualizado correctamente.');
    expect(service.updateProfile).toHaveBeenCalledTimes(1);
    expect(service.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'a'.repeat(100), paternalLastName: 'a'.repeat(100),
      maternalLastName: 'a'.repeat(100), phoneNumber: 'a'.repeat(20), locality: 'a'.repeat(100),
    }));
  });

  it.each([false, true])('should trim fields and normalize optional values before updating (filled: %s)', async (filled) => {
    const user = userEvent.setup();
    const service = setup();
    await screen.findByDisplayValue('Ana');
    for (const [label, value] of [
      ['Nombre *', ' Ana María '], ['Apellido paterno *', ' Ruiz '],
      ['Apellido materno', filled ? ' Pérez ' : '   '],
      ['Teléfono', filled ? ' 5551234567 ' : '   '],
      ['Localidad', filled ? ' Xalapa ' : '   '],
      ['Biografía', filled ? ' Productora local ' : '   '],
    ]) {
      const input = screen.getByLabelText(label);
      await user.clear(input);
      await user.type(input, value);
    }
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(service.updateProfile).toHaveBeenCalledTimes(1));
    expect(service.updateProfile).toHaveBeenCalledWith({
      firstName: 'Ana María', paternalLastName: 'Ruiz',
      maternalLastName: filled ? 'Pérez' : null,
      phoneNumber: filled ? '5551234567' : null,
      locality: filled ? 'Xalapa' : null,
      biography: filled ? 'Productora local' : null,
      birthDate: '1990-01-02T00:00:00.000Z',
    });
    await waitFor(() => expect(service.getProfile).toHaveBeenCalledTimes(2));
    expect(service.uploadImage).not.toHaveBeenCalled();
    expect(service.updatePicture).not.toHaveBeenCalled();
  });

  it('should show an error Toast and skip association when photo upload fails', async () => {
    const service = setup({ uploadImage: jest.fn().mockRejectedValue(new Error('upload failed')) });
    await screen.findByDisplayValue('Ana');
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), {
      dataTransfer: { files: [new File(['photo'], 'foto.png', { type: 'image/png' })] },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar fotografía' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La fotografía anterior permanece visible.');
    expect(screen.getByRole('alert')).toHaveClass('error');
    expect(screen.getByAltText('Foto de Ana')).toHaveAttribute('src', profile.profilePictureUrl);
    expect(service.uploadImage).toHaveBeenCalledTimes(1);
    expect(service.updatePicture).not.toHaveBeenCalled();
    expect(service.getProfile).toHaveBeenCalledTimes(1);
    await userEvent.click(within(screen.getByRole('alert')).getByRole('button', { name: 'Cerrar notificación' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should prevent duplicate updates and photo saves while an update is pending', async () => {
    let resolveUpdate!: () => void;
    const pending = new Promise<void>((resolve) => { resolveUpdate = resolve; });
    const service = setup({ updateProfile: jest.fn().mockReturnValue(pending) });
    await screen.findByDisplayValue('Ana');
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), {
      dataTransfer: { files: [new File(['photo'], 'foto.png', { type: 'image/png' })] },
    });
    const save = screen.getByRole('button', { name: 'Guardar cambios' });
    await userEvent.dblClick(save);

    expect(save).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar fotografía' })).toBeDisabled();
    expect(service.updateProfile).toHaveBeenCalledTimes(1);
    expect(service.uploadImage).not.toHaveBeenCalled();
    await act(async () => { resolveUpdate(); await pending; });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled());
  });

  it('should prevent duplicate uploads and updates until the photo is associated', async () => {
    let resolveAssociation!: () => void;
    const pending = new Promise<void>((resolve) => { resolveAssociation = resolve; });
    const service = setup({ updatePicture: jest.fn().mockReturnValue(pending) });
    await screen.findByDisplayValue('Ana');
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), {
      dataTransfer: { files: [new File(['photo'], 'foto.png', { type: 'image/png' })] },
    });
    const savePhoto = screen.getByRole('button', { name: 'Guardar fotografía' });
    await userEvent.dblClick(savePhoto);

    expect(savePhoto).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
    expect(service.uploadImage).toHaveBeenCalledTimes(1);
    expect(service.updatePicture).toHaveBeenCalledTimes(1);
    expect(service.updateProfile).not.toHaveBeenCalled();
    await act(async () => { resolveAssociation(); await pending; });
    expect(await screen.findByRole('status')).toHaveTextContent('Fotografía actualizada correctamente.');
  });
});
