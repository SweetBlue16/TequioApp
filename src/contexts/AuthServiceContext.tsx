import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';
import type { TokenStorageInterface } from '@/services/auth/TokenStorageInterface';
import { TokenStorage } from '@/services/auth/TokenStorage';
import { decodeSession, type Session } from '@/services/auth/decodeSession';
import type { LoginRequest } from '@/types/login/LoginRequest';
import type { ProfileServiceInterface, UserProfile } from '@/services/profile/ProfileService';
import { AuthContext } from './AuthContext';

interface AuthServiceProviderProps {
  authService: AuthServiceInterface;
  tokenStorage?: TokenStorageInterface;
  profileService?: ProfileServiceInterface;
  children: React.ReactNode;
}

export const AuthServiceProvider: React.FC<AuthServiceProviderProps> = ({ authService, tokenStorage, profileService, children }) => {
  const storage = useMemo(() => tokenStorage ?? new TokenStorage(), [tokenStorage]);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const sync = () => {
      const token = storage.getToken();
      const restored = decodeSession(token);
      if (token && !restored) storage.clearToken();
      setSession(restored);
      if (!restored) {
        setProfile(null);
        setProfileStatus('idle');
      }
      setIsInitializing(false);
    };
    const unsubscribe = storage.subscribe?.(sync);
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === null) sync();
    };
    window.addEventListener('storage', onStorage);
    sync();
    return () => {
      unsubscribe?.();
      window.removeEventListener('storage', onStorage);
    };
  }, [storage]);

  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => storage.clearToken(), Math.max(0, session.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session, storage]);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    const token = storage.getToken();
    if (!token || !decodeSession(token) || !profileService) return null;
    setProfileStatus('loading');
    try {
      const next = await profileService.getProfile();
      if (storage.getToken() !== token) return null;
      setProfile(next);
      setProfileStatus('ready');
      return next;
    } catch (error) {
      if (storage.getToken() === token) setProfileStatus('error');
      throw error;
    }
  }, [profileService, storage]);

  useEffect(() => {
    if (!session || !profileService) return;
    const task = window.setTimeout(() => void refreshProfile().catch(() => undefined), 0);
    return () => window.clearTimeout(task);
  }, [session, profileService, refreshProfile]);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request);
    const restored = decodeSession(response.token);
    if (!restored) {
      storage.clearToken();
      throw new Error('El servidor devolvió una sesión inválida.');
    }
    storage.setToken(response.token);
    setSession(restored);
  }, [authService, storage]);

  const logout = useCallback(() => {
    storage.clearToken();
    setSession(null);
    setProfile(null);
    setProfileStatus('idle');
  }, [storage]);

  const value = useMemo(() => ({
    authService, profileService, session, isAuthenticated: Boolean(session), isInitializing,
    profile, profileStatus, login, logout, refreshProfile,
  }), [authService, profileService, session, isInitializing, profile, profileStatus, login, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
