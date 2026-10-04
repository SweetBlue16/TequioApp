import React, { createContext, useContext } from 'react';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';

const AuthServiceContext = createContext<AuthServiceInterface | null>(null);

interface AuthServiceProviderProps {
  authService: AuthServiceInterface;
  children: React.ReactNode;
}

export const AuthServiceProvider: React.FC<AuthServiceProviderProps> = ({ 
  authService, 
  children 
}) => {
  return (
    <AuthServiceContext.Provider value={authService}>
      {children}
    </AuthServiceContext.Provider>
  );
};

export const useAuthService = (): AuthServiceInterface => {
  const context = useContext(AuthServiceContext);
  if (!context) {
    throw new Error('useAuthService must be used within an AuthServiceProvider');
  }
  return context;
};
