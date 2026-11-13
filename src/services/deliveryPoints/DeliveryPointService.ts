import type { AxiosInstance } from 'axios';
import type {
  DeliveryPoint,
  DeliveryPointPageResponse,
} from '@/types/deliveryPoint/DeliveryPoint';
import type {
  CreateDeliveryPointRequest,
  UpdateDeliveryPointRequest,
} from '@/types/deliveryPoint/DeliveryPointRequest';

/**
 * Contract defining administrative operations for authorized delivery points.
 */
export interface DeliveryPointServiceInterface {
  getDeliveryPoints(pageIndex: number, pageSize: number): Promise<DeliveryPointPageResponse>;
  getDeliveryPointById(id: number): Promise<DeliveryPoint>;
  createDeliveryPoint(request: CreateDeliveryPointRequest): Promise<number>;
  updateDeliveryPoint(request: UpdateDeliveryPointRequest): Promise<void>;
  toggleDeliveryPointStatus(id: number, isActive: boolean): Promise<void>;
}

/**
 * HTTP client implementation ready to connect with the REST API backend.
 */
export class DeliveryPointService implements DeliveryPointServiceInterface {
  private readonly client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getDeliveryPoints(
    pageIndex: number,
    pageSize: number
  ): Promise<DeliveryPointPageResponse> {
    const response = await this.client.get<DeliveryPointPageResponse>('/delivery-points', {
      params: { pageIndex, pageSize },
    });
    return response.data;
  }

  async getDeliveryPointById(id: number): Promise<DeliveryPoint> {
    const response = await this.client.get<DeliveryPoint>(`/delivery-points/${id}`);
    return response.data;
  }

  async createDeliveryPoint(request: CreateDeliveryPointRequest): Promise<number> {
    const response = await this.client.post<{ id: number }>('/delivery-points', request);
    return response.data.id;
  }

  async updateDeliveryPoint(request: UpdateDeliveryPointRequest): Promise<void> {
    await this.client.put(`/delivery-points/${request.id}`, request);
  }

  async toggleDeliveryPointStatus(id: number, isActive: boolean): Promise<void> {
    const actionSegment = isActive ? 'active' : 'deactive';
    await this.client.patch(`/delivery-points/${id}/${actionSegment}`);
  }
}

const INITIAL_MOCK_DELIVERY_POINTS: DeliveryPoint[] = [
  {
    id: 1,
    name: 'Parque Juárez - Quiosco Central',
    street: 'Juan de la Luz Enríquez',
    number: 'S/N',
    neighborhood: 'Zona Centro',
    zipCode: '91000',
    city: 'Xalapa',
    references: 'Frente a Palacio de Gobierno, junto a las escalinatas principales.',
    businessHours: '09:00 - 17:00',
    latitude: 19.5274,
    longitude: -96.9234,
    isActive: true,
  },
  {
    id: 2,
    name: 'Mercado Los Sauces',
    street: 'Úrsulo Galván',
    number: '142',
    neighborhood: 'Los Sauces',
    zipCode: '91070',
    city: 'Xalapa',
    references: 'Entrada principal por la avenida, local de productos orgánicos.',
    businessHours: '08:00 - 15:00',
    latitude: 19.5218,
    longitude: -96.9298,
    isActive: true,
  },
  {
    id: 3,
    name: 'Parque Hidalgo - Coatepec',
    street: 'Miguel Lerdo',
    number: 'S/N',
    neighborhood: 'Centro',
    zipCode: '91500',
    city: 'Coatepec',
    references: 'Costado norte del parque, frente a la parroquia de San Jerónimo.',
    businessHours: '10:00 - 18:00',
    latitude: 19.4534,
    longitude: -96.9597,
    isActive: false,
  },
];

/**
 * In-memory mock implementation allowing full UI testing before backend integration.
 */
export class MockDeliveryPointService implements DeliveryPointServiceInterface {
  private points: DeliveryPoint[] = [...INITIAL_MOCK_DELIVERY_POINTS];

  private simulateNetworkDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 350));
  }

  async getDeliveryPoints(
    pageIndex: number,
    pageSize: number
  ): Promise<DeliveryPointPageResponse> {
    await this.simulateNetworkDelay();
    const startIndex = (pageIndex - 1) * pageSize;
    const paginatedItems = this.points.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalCount: this.points.length,
      pageIndex,
      pageSize,
    };
  }

  async getDeliveryPointById(id: number): Promise<DeliveryPoint> {
    await this.simulateNetworkDelay();
    const foundPoint = this.points.find((point) => point.id === id);
    if (!foundPoint) {
      throw new Error('No se encontró el punto de entrega solicitado.');
    }
    return foundPoint;
  }

  async createDeliveryPoint(request: CreateDeliveryPointRequest): Promise<number> {
    await this.simulateNetworkDelay();
    const nextId = this.points.length > 0 ? Math.max(...this.points.map((p) => p.id)) + 1 : 1;

    const createdPoint: DeliveryPoint = {
      id: nextId,
      name: request.name,
      street: request.street,
      number: request.number,
      neighborhood: request.neighborhood,
      zipCode: request.zipCode,
      city: request.city,
      references: request.references ?? null,
      businessHours: request.businessHours,
      latitude: request.latitude,
      longitude: request.longitude,
      isActive: true,
    };

    this.points = [createdPoint, ...this.points];
    return nextId;
  }

  async updateDeliveryPoint(request: UpdateDeliveryPointRequest): Promise<void> {
    await this.simulateNetworkDelay();
    this.points = this.points.map((point) =>
      point.id === request.id
        ? {
            ...point,
            ...request,
            references: request.references ?? null,
          }
        : point
    );
  }

  async toggleDeliveryPointStatus(id: number, isActive: boolean): Promise<void> {
    await this.simulateNetworkDelay();
    this.points = this.points.map((point) =>
      point.id === id ? { ...point, isActive } : point
    );
  }
}

export const deliveryPointService: DeliveryPointServiceInterface = new MockDeliveryPointService();