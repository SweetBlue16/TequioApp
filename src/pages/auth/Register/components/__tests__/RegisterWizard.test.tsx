/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import { describe, it, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RegisterWizard } from '../RegisterWizard';

/**
 * Helper to render components requiring routing context.
 */
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('RegisterWizard Component - Client Validations', () => {
  it('should display required errors on Step 1 and block step progression when fields are empty', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleReturn = jest.fn();

    renderWithRouter(
      <RegisterWizard
        role="buyer"
        onSubmitRegistration={handleSubmit}
        onReturnToRoleSelection={handleReturn}
      />
    );

    // Act: Click continue without filling firstName and firstLastName
    const continueButton = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueButton);

    // Assert: Errors displayed under inputs
    expect(screen.getByText('Ingresa tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu apellido paterno.')).toBeInTheDocument();

    // Assert: Step 2 fields must not exist in DOM
    expect(screen.queryByLabelText(/correo electrónico\*/i)).not.toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should display required errors on Step 2 when submitting empty contact fields', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleReturn = jest.fn();

    renderWithRouter(
      <RegisterWizard
        role="buyer"
        onSubmitRegistration={handleSubmit}
        onReturnToRoleSelection={handleReturn}
      />
    );

    // Act: Fill Step 1 with valid inputs and move to Step 2
    const nameInput = screen.getByPlaceholderText('Ingresa tu nombre');
    const lastNameInput = screen.getByPlaceholderText('Ingresa tu apellido paterno');
    await user.type(nameInput, 'Abraham');
    await user.type(lastNameInput, 'Cano');

    const continueStep1Button = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueStep1Button);

    // Act: Click continue on Step 2 with empty inputs
    const continueStep2Button = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueStep2Button);

    // Assert: Errors displayed under contact inputs
    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu número de teléfono.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona tu fecha de nacimiento.')).toBeInTheDocument();

    // Assert: Step 3 fields must not exist in DOM
    expect(screen.queryByLabelText(/confirmación de contraseña\*/i)).not.toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});