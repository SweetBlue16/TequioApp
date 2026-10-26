
export interface TokenStorageInterface {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  subscribe?(listener: () => void): () => void;
}
