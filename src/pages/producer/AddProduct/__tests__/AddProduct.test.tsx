import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext';
import { ProductService } from '@/services/products/ProductService';
import { FileService } from '@/services/files/FileService';
import { ROUTES } from '@/constants/routes';
import { AddProduct } from '../AddProduct';

// Prevent import.meta configuration and any real HTTP client from entering this suite.
jest.mock('@/services/api', () => ({ createClient: jest.fn(() => ({})) }));

describe('AddProduct', () => {
  let uploadImage: jest.SpiedFunction<FileService['uploadImage']>;
  let createProduct: jest.SpiedFunction<ProductService['createBaseProduct']>;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:product');
    URL.revokeObjectURL = jest.fn();
    uploadImage = jest.spyOn(FileService.prototype, 'uploadImage').mockResolvedValue('https://example.test/cafe.png');
    createProduct = jest.spyOn(ProductService.prototype, 'createBaseProduct').mockResolvedValue(71);
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function setup(authenticated = true) {
    const context: AuthContextValue = {
      authService: {
        login: jest.fn(), register: jest.fn(), verify: jest.fn(), resendVerificationCode: jest.fn(),
        requestPasswordReset: jest.fn(), resetPassword: jest.fn(),
      },
      session: authenticated ? { userId: 7, roleId: 2, token: 'test-token', expiresAt: 4102444800000 } : null,
      isAuthenticated: authenticated, isInitializing: false,
      profile: null, profileStatus: 'idle', login: jest.fn(), logout: jest.fn(), refreshProfile: jest.fn(),
    };
    render(
      <AuthContext.Provider value={context}>
        <MemoryRouter initialEntries={['/add-product']}>
          <Routes>
            <Route path="/add-product" element={<AddProduct />} />
            <Route path={ROUTES.PRODUCER.PRODUCTS} element={<h1>Mis productos</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
  }

  async function completeForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByRole('textbox', { name: 'Nombre del producto*' }), ' Café local ');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría*' }), '5');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Subcategoría*' }), '6');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Unidad de medida*' }), 'Kilogramo (kg)');
    await user.type(screen.getByRole('textbox', { name: 'Descripción breve*' }), ' Café cultivado en Xalapa. ');
    const file = new File(['photo'], 'cafe.png', { type: 'image/png' });
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), { dataTransfer: { files: [file] } });
    await screen.findByRole('img', { name: 'cafe.png' });
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('¿Guardar producto?');
    return file;
  }

  it('should show validation errors without opening confirmation or calling services for invalid data', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(screen.getByText('Ingresa tu nombre del producto.')).toBeInTheDocument();
    expect(screen.getByText('Debes subir una fotografía de tu producto.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(uploadImage).not.toHaveBeenCalled();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('should open confirmation for valid data and cancel it without API calls', async () => {
    setup();
    const user = userEvent.setup();
    await completeForm(user);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Café local');
    expect(dialog).toHaveTextContent('Una vez registrado no podrás hacer cambios.');
    expect(uploadImage).not.toHaveBeenCalled();
    expect(createProduct).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'No' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Nombre del producto*' })).toHaveValue(' Café local ');
    expect(uploadImage).not.toHaveBeenCalled();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('should upload first, create the normalized product once and navigate after success', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    setup();
    const operations: string[] = [];
    uploadImage.mockImplementation(async () => { operations.push('upload'); return 'https://example.test/cafe.png'; });
    createProduct.mockImplementation(async () => { operations.push('create'); return 71; });
    const file = await completeForm(user);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí' }));
    expect(await screen.findByRole('heading', { name: 'Producto registrado con éxito' })).toBeInTheDocument();
    expect(operations).toEqual(['upload', 'create']);
    expect(uploadImage).toHaveBeenCalledTimes(1);
    expect(uploadImage).toHaveBeenCalledWith(file);
    expect(createProduct).toHaveBeenCalledTimes(1);
    expect(createProduct).toHaveBeenCalledWith({
      name: 'Café local', categoryId: 6, measurementUnit: 'Kilogramo (kg)',
      shortDescription: 'Café cultivado en Xalapa.', imageUrl: 'https://example.test/cafe.png',
    });
    expect(screen.queryByRole('heading', { name: 'Mis productos' })).not.toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(1500); });
    expect(screen.getByRole('heading', { name: 'Mis productos' })).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('should block duplicate requests while image upload is pending', async () => {
    const user = userEvent.setup();
    setup();
    let rejectUpload!: (error: Error) => void;
    const pending = new Promise<string>((_, reject) => { rejectUpload = reject; });
    uploadImage.mockReturnValue(pending);
    await completeForm(user);
    const confirm = within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí' });
    await user.dblClick(confirm);

    expect(confirm).toBeDisabled();
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'No' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(uploadImage).toHaveBeenCalledTimes(1);
    expect(createProduct).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => { rejectUpload(new Error('upload failed')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo registrar el producto.');
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí' })).toBeEnabled();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it.each(['upload', 'create'] as const)(
    'should show an error Toast and preserve form data when %s fails', async (stage) => {
      setup();
      const user = userEvent.setup();
      const expected = new Error('HTTP 500');
      if (stage === 'upload') uploadImage.mockRejectedValue(expected);
      else createProduct.mockRejectedValue(expected);
      const file = await completeForm(user);
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí' }));

      const toast = await screen.findByRole('alert');
      expect(toast).toHaveTextContent('No se pudo registrar el producto. Verifica tu conexión e inténtalo de nuevo.');
      expect(toast).toHaveClass('error');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
      expect(screen.getByRole('textbox', { name: 'Nombre del producto*' })).toHaveValue(' Café local ');
      expect(screen.getByRole('textbox', { name: 'Descripción breve*' })).toHaveValue(' Café cultivado en Xalapa. ');
      expect(screen.getByRole('img', { name: 'cafe.png' })).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveTextContent('¿Guardar producto?');
      expect(uploadImage).toHaveBeenCalledTimes(1);
      expect(uploadImage).toHaveBeenCalledWith(file);
      if (stage === 'upload') expect(createProduct).not.toHaveBeenCalled();
      else expect(createProduct).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith('Error al registrar el producto base:', expected);
      await user.click(within(toast).getByRole('button', { name: 'Cerrar notificación' }));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('should reject confirmation with an expired session before uploading or creating', async () => {
    setup(false);
    const user = userEvent.setup();
    await completeForm(user);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Tu sesión ha expirado. Inicia sesión nuevamente.');
    expect(uploadImage).not.toHaveBeenCalled();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it.each([
    ['image/gif', 1, 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP.'],
    ['image/png', 5 * 1024 * 1024 + 1, 'El archivo supera el tamaño máximo permitido de 5MB.'],
  ])('should display the image validation error for %s of size %i without API calls', (type, size, message) => {
    setup();
    const file = new File(['photo'], 'foto', { type });
    Object.defineProperty(file, 'size', { value: size });
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), { dataTransfer: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(uploadImage).not.toHaveBeenCalled();
    expect(createProduct).not.toHaveBeenCalled();
  });
});
