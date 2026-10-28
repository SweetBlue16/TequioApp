import { useState } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../Toast';

describe('Toast', () => {
  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('should render an error message as an assertive alert', () => {
    render(<Toast message="No se pudo guardar." variant="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar.');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByRole('alert')).toHaveClass('error');
  });

  it('should render an informational message as a polite status by default', () => {
    render(<Toast message="Datos guardados." />);
    expect(screen.getByRole('status')).toHaveTextContent('Datos guardados.');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveClass('info');
  });

  it('should call onClose once and allow the parent to dismiss it manually', async () => {
    const onClose = jest.fn();
    function Host() {
      const [open, setOpen] = useState(true);
      return open ? <Toast message="Aviso" onClose={() => { onClose(); setOpen(false); }} /> : null;
    }
    render(<Host />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should hide the close button when dismissal is disabled', () => {
    render(<Toast message="Aviso" dismissible={false} onClose={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Cerrar notificación' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aviso');
  });

  it('should invoke onClose only after the configured duration', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(<Toast message="Aviso" duration={2000} onClose={onClose} />);
    act(() => { jest.advanceTimersByTime(1999); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(1); });
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => { jest.advanceTimersByTime(5000); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, 0, -1])('should not auto-close when duration is %s', (duration) => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(<Toast message="Aviso" duration={duration} onClose={onClose} />);
    act(() => { jest.advanceTimersByTime(10000); });
    expect(onClose).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('should cancel its timer on unmount without calling onClose', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const view = render(<Toast message="Aviso" duration={2000} onClose={onClose} />);
    expect(jest.getTimerCount()).toBe(1);
    view.unmount();
    expect(jest.getTimerCount()).toBe(0);
    act(() => { jest.advanceTimersByTime(2000); });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should replace the previous timer when duration or callback changes', () => {
    jest.useFakeTimers();
    const firstClose = jest.fn();
    const nextClose = jest.fn();
    const view = render(<Toast message="Aviso" duration={2000} onClose={firstClose} />);
    act(() => { jest.advanceTimersByTime(1000); });
    view.rerender(<Toast message="Nuevo aviso" duration={3000} onClose={nextClose} />);
    expect(jest.getTimerCount()).toBe(1);
    act(() => { jest.advanceTimersByTime(2999); });
    expect(firstClose).not.toHaveBeenCalled();
    expect(nextClose).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(1); });
    expect(nextClose).toHaveBeenCalledTimes(1);
  });
});
