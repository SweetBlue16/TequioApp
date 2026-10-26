import type { AxiosInstance } from 'axios';
import type { TokenStorageInterface } from './TokenStorageInterface';

export function attachAuthInterceptors(client: AxiosInstance, tokenStorage: TokenStorageInterface): void {
  client.interceptors.request.use((config) => {
    const token = tokenStorage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = error.response as { status?: number } | undefined;
        if (response?.status === 401) tokenStorage.clearToken();
      }
      return Promise.reject(error);
    },
  );
}
