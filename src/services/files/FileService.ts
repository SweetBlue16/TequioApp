import type { AxiosInstance } from 'axios';

/**
 * Contract defining operations for file upload against Tequio API.
 */
export interface FileServiceInterface {
  /**
   * Uploads an image file to the server and returns its public URL.
   * Enforces RN-12 multimedia storage.
   */
  uploadImage(file: File): Promise<string>;
}

/**
 * Service handling binary file transmissions.
 */
export class FileService implements FileServiceInterface {
  private readonly client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * @inheritdoc
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<{ url: string }>(
      '/files/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.url) {
      throw new Error('La carga de la fotografía no devolvió una URL válida.');
    }

    return response.data.url;
  }
}

export default FileService;