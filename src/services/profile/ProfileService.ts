import type { AxiosInstance } from 'axios';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  birthDate: string;
  phoneNumber: string | null;
  locality: string | null;
  biography: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  registrationDate: string;
}

export interface UpdateUserProfile {
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  birthDate: string;
  phoneNumber: string | null;
  locality: string | null;
  biography: string | null;
}

export interface ProfileServiceInterface {
  getProfile(): Promise<UserProfile>;
  updateProfile(data: UpdateUserProfile): Promise<void>;
  uploadImage(file: File): Promise<string>;
  updatePicture(pictureUrl: string): Promise<void>;
}

export class ProfileService implements ProfileServiceInterface {
  private readonly client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/users/me');
    return response.data;
  }

  async updateProfile(data: UpdateUserProfile): Promise<void> {
    await this.client.put('/users/me', data);
  }

  async uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const response = await this.client.post<{ url: string }>('/files/image', form);
    if (!response.data.url) throw new Error('La carga no devolvió una URL.');
    return response.data.url;
  }

  async updatePicture(pictureUrl: string): Promise<void> {
    await this.client.put('/users/me/profile-picture', { pictureUrl });
  }
}
