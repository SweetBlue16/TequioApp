import type { AxiosInstance } from 'axios';
import type {
  ProductPageResponse,
  CreateBaseProductPayload,
} from '@/types/product/Product';

/**
 * Contract defining catalog persistence and query actions against the API.
 */
export interface ProductServiceInterface {
  getProductsByProducer(
    producerId: number,
    pageIndex: number,
    pageSize: number
  ): Promise<ProductPageResponse>;
  createBaseProduct(payload: CreateBaseProductPayload): Promise<number>;
  deactivateProduct(productId: number): Promise<void>;
}

/**
 * Concrete client implementation for product catalog operations.
 */
export class ProductService implements ProductServiceInterface {
  private readonly client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getProductsByProducer(
    producerId: number,
    pageIndex: number,
    pageSize: number
  ): Promise<ProductPageResponse> {
    const response = await this.client.get<ProductPageResponse>(
      `/products/producers/${producerId}`,
      {
        params: {
          pageIndex,
          pageSize,
        },
      }
    );
    return response.data;
  }

  async createBaseProduct(payload: CreateBaseProductPayload): Promise<number> {
    const response = await this.client.post<{ productId: number }>(
      '/products',
      payload
    );
    return response.data.productId;
  }

  async deactivateProduct(productId: number): Promise<void> {
    await this.client.patch(`/products/${productId}/deactive`);
  }
}

export default ProductService;