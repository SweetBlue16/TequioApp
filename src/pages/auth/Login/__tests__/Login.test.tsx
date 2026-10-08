/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import { describe, it, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';
import { AuthServiceProvider } from '@/contexts/AuthServiceContext';
import type { AuthServiceInterface } from '@/services/auth/AuthServiceInterface';

/**
 * Mocking react-router-dom to intercept and spy on navigation events.
 */
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actualRouter = jest.requireActual('react-router-dom') as Record<string, unknown>;
  return {
    ...actualRouter,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Mock of the auth service so Login can resolve useAuthService().
 */
const mockAuthService: AuthServiceInterface = {
  login: jest.fn<AuthServiceInterface['login']>(),
  register: jest.fn<AuthServiceInterface['register']>(),
  verify: jest.fn<AuthServiceInterface['verify']>(),
};

/**
 * Helper to render components requiring routing and auth service context.
 */
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <AuthServiceProvider authService={mockAuthService}>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthServiceProvider>
  );
};

describe('Login Component - Client Validations', () => {
  it('should display required validation errors and prevent submit when submitting empty fields', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    // Act
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);

    // Assert
    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should clear error message when user starts typing into an invalid field', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);

    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeInTheDocument();

    // Act
    const emailInput = screen.getByPlaceholderText('Correo electrónico o número de teléfono');
    await user.type(emailInput, 'usuario@ejemplo.com');

    // Assert
    expect(screen.queryByText('Ingresa tu correo electrónico.')).not.toBeInTheDocument();
  });
});