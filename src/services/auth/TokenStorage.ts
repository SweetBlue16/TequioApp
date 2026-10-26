import type { TokenStorageInterface } from './TokenStorageInterface';

export class TokenStorage implements TokenStorageInterface {
  private readonly TOKEN_KEY = 'token';
  private readonly listeners = new Set<() => void>();

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.listeners.forEach((listener) => listener());
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
