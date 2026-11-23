import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductService } from '@/services/products/ProductService';
import { Catalog } from '../Catalog';

const product = {
  id: 7,
  name: 'Café de prueba',
  shortDescription: 'Tostado local',
  measurementUnit: 'kg',
};

describe('The public catalog', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads a category, shows its products, and updates on selection', async () => {
    const getProducts = jest
      .spyOn(ProductService.prototype, 'getProductsByCategory')
      .mockResolvedValueOnce({ products: [product], itemCount: 1 })
      .mockResolvedValueOnce({ products: [], itemCount: 0 });

    render(<Catalog />);

    expect(await screen.findByRole('heading', { name: product.name })).toBeVisible();
    expect(screen.getByText(product.shortDescription)).toBeVisible();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }), '2');
    expect(
      await screen.findByText('No hay productos disponibles en esta categoría.')
    ).toBeVisible();
    expect(getProducts).toHaveBeenLastCalledWith(2, 1, 10, expect.any(AbortSignal));
  });

  it('announces a failed request and lets visitors retry it', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest
      .spyOn(ProductService.prototype, 'getProductsByCategory')
      .mockRejectedValueOnce(new Error('Test request failure'))
      .mockResolvedValueOnce({ products: [product], itemCount: 1 });

    render(<Catalog />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los productos.');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: product.name })).toBeVisible();
  });
});
