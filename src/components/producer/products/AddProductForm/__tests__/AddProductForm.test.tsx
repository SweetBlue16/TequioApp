import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddProductForm } from '../AddProductForm';

describe('AddProductForm', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:product');
    URL.revokeObjectURL = jest.fn();
  });

  function setup() {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    render(<AddProductForm onSubmit={onSubmit} onCancel={onCancel} />);
    return { user: userEvent.setup(), onSubmit, onCancel };
  }

  async function fillForm(user: ReturnType<typeof userEvent.setup>, omittedField?: string) {
    await user.type(screen.getByRole('textbox', { name: 'Nombre del producto*' }), ' Café local ');
    if (omittedField !== 'Categoría*') {
      await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría*' }), '5');
      if (omittedField !== 'Subcategoría*') {
        await user.selectOptions(screen.getByRole('combobox', { name: 'Subcategoría*' }), '6');
      }
    }
    if (omittedField !== 'Unidad de medida*') {
      await user.selectOptions(screen.getByRole('combobox', { name: 'Unidad de medida*' }), 'Kilogramo (kg)');
    }
    await user.type(screen.getByRole('textbox', { name: 'Descripción breve*' }), ' Café cultivado en Xalapa. ');
    const file = new File(['photo'], 'cafe.png', { type: 'image/png' });
    fireEvent.drop(screen.getByRole('button', { name: /Clic para subir/ }), { dataTransfer: { files: [file] } });
    await screen.findByRole('img', { name: 'cafe.png' });
    return file;
  }

  it('should show all required errors and prevent submission of an empty form', async () => {
    const { user, onSubmit } = setup();
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));

    for (const message of [
      'Ingresa tu nombre del producto.', 'Selecciona una categoría principal.',
      'Selecciona una subcategoría.', 'Selecciona la unidad de medida.',
      'Ingresa tu descripción.', 'Debes subir una fotografía de tu producto.',
    ]) expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['Nombre del producto*', '', 'Ingresa tu nombre del producto.'],
    ['Nombre del producto*', '   ', 'Ingresa tu nombre del producto.'],
    ['Descripción breve*', '', 'Ingresa tu descripción.'],
    ['Descripción breve*', '   ', 'Ingresa tu descripción.'],
    ['Descripción breve*', '123456789', 'Ingresa al menos 10 caracteres.'],
  ])('should reject %s containing %j even when other fields are valid', async (label, value, message) => {
    const { user, onSubmit } = setup();
    await fillForm(user);
    const input = screen.getByRole('textbox', { name: label });
    await user.clear(input);
    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['Categoría*', 'Selecciona una categoría principal.'],
    ['Subcategoría*', 'Selecciona una subcategoría.'],
    ['Unidad de medida*', 'Selecciona la unidad de medida.'],
  ])('should prevent submission without %s', async (label, message) => {
    const { user, onSubmit } = setup();
    await fillForm(user, label);
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should require a photograph again after the selected image is removed', async () => {
    const { user, onSubmit } = setup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Eliminar imagen' }));
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(screen.getByText('Debes subir una fotografía de tu producto.')).toHaveAttribute('role', 'alert');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should reset the subcategory and replace its options when the parent category changes', async () => {
    const { user, onSubmit } = setup();
    await fillForm(user);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría*' }), '1');

    expect(screen.getByRole('combobox', { name: 'Subcategoría*' })).toHaveValue('');
    expect(screen.queryByRole('option', { name: 'Café en grano' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Frutas y Cítricos' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(screen.getByText('Selecciona una subcategoría.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit complete normalized data and accept the minimum description length', async () => {
    const { user, onSubmit } = setup();
    const file = await fillForm(user);
    await user.clear(screen.getByRole('textbox', { name: 'Descripción breve*' }));
    await user.type(screen.getByRole('textbox', { name: 'Descripción breve*' }), ' 1234567890 ');
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Café local', shortDescription: '1234567890', parentCategoryId: 5,
      subcategoryId: 6, measurementUnit: 'Kilogramo (kg)', imageFile: file,
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    ['Nombre del producto*', 50], ['Descripción breve*', 180],
  ])('should limit user input in %s to %i characters and accept that boundary', async (label, max) => {
    const { user, onSubmit } = setup();
    await fillForm(user);
    const input = screen.getByRole('textbox', { name: label });
    await user.clear(input);
    await user.click(input);
    await user.paste('a'.repeat(max + 1));
    expect(input).toHaveValue('a'.repeat(max));
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      [label === 'Nombre del producto*' ? 'name' : 'shortDescription']: 'a'.repeat(max),
    }));
  });

  it.each([
    ['Nombre del producto*', 50, 'El nombre del producto no puede exceder los 50 caracteres.'],
    ['Descripción breve*', 180, 'El descripción no puede exceder los 180 caracteres.'],
  ])('should validate %s above the limit if native maxlength is bypassed', async (label, max, message) => {
    const { user, onSubmit } = setup();
    await fillForm(user);
    // Exercise the form validator as well as the native input restriction tested above.
    fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value: 'a'.repeat(max + 1) } });
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onCancel without submitting the form', async () => {
    const { user, onSubmit, onCancel } = setup();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
