import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploader } from '../ImageUploader';

describe('ImageUploader', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });

  function setup() {
    const onChange = jest.fn();
    const onError = jest.fn();
    const onSuccess = jest.fn();
    function Host() {
      const [file, setFile] = useState<File | null>(null);
      return <ImageUploader file={file} onChange={(next) => { onChange(next); setFile(next); }}
        showErrorToast={onError} showSuccessToast={onSuccess} />;
    }
    return { ...render(<Host />), onChange, onError, onSuccess };
  }

  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'should accept %s at exactly 5 MiB and display its preview', async (type) => {
      const { onChange, onError, onSuccess, unmount } = setup();
      const file = new File(['photo'], 'foto', { type });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });
      fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), { dataTransfer: { files: [file] } });

      expect(await screen.findByRole('img', { name: 'foto' })).toHaveAttribute('src', 'blob:preview');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(file);
      expect(onError).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Imagen cargada correctamente.');
      unmount();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    },
  );

  it.each([
    ['image/gif', 1, 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP.'],
    ['text/plain', 1, 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP.'],
    ['image/png', 5 * 1024 * 1024 + 1, 'El archivo supera el tamaño máximo permitido de 5MB.'],
  ])('should reject %s with size %i without changing the selected file', (type, size, message) => {
    const { onChange, onError, onSuccess } = setup();
    const file = new File(['invalid'], 'archivo', { type });
    Object.defineProperty(file, 'size', { value: size });
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), { dataTransfer: { files: [file] } });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(message);
    expect(onChange).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('should remove the selected image and release its preview URL', async () => {
    const { onChange } = setup();
    const file = new File(['photo'], 'foto.png', { type: 'image/png' });
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), { dataTransfer: { files: [file] } });
    await screen.findByRole('img', { name: 'foto.png' });
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar imagen' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole('img', { name: 'foto.png' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clic para subir/ })).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('should ignore an empty drop without callbacks', () => {
    const { onChange, onError, onSuccess } = setup();
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), { dataTransfer: { files: [] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
