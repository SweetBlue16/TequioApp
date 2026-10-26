import { createContext, useContext } from 'react';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';
import type { Session } from '@/services/auth/decodeSession';
import type { LoginRequest } from '@/types/login/LoginRequest';
import type { ProfileServiceInterface, UserProfile } from '@/services/profile/ProfileService';

export interface AuthContextValue {
  authService: AuthServiceInterface;
  profileService?: ProfileServiceInterface;
  session: Session | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  profile: UserProfile | null;
  profileStatus: 'idle' | 'loading' | 'ready' | 'error';
  login(request: LoginRequest): Promise<void>;
  logout(): void;
  refreshProfile(): Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthService = (): AuthServiceInterface => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthService must be used within an AuthServiceProvider');
  return context.authService;
};

export const useSession = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useSession must be used within an AuthServiceProvider');
  return context;
};
