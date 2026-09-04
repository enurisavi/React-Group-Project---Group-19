import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../components/Login';

describe('Login component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('updates email and password inputs when the user types', () => {
    render(<Login onLoginSuccess={vi.fn()} />);

    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');

    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'test@example.com' },
    });

    fireEvent.change(passwordInput, {
      target: { name: 'password', value: 'password123' },
    });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits login data to the API', async () => {
    const mockResponse = {
      token: 'test-token',
      name: 'Test User',
      email: 'test@example.com',
    };

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(<Login onLoginSuccess={vi.fn()} />);

    fireEvent.change(document.querySelector('input[name="email"]'), {
      target: { name: 'email', value: 'test@example.com' },
    });

    fireEvent.change(document.querySelector('input[name="password"]'), {
      target: { name: 'password', value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '',
            email: 'test@example.com',
            password: 'password123',
          }),
        }
      );
    });
  });

  it('displays an error message when login fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Invalid email or password',
      }),
    });

    render(<Login onLoginSuccess={vi.fn()} />);

    fireEvent.change(document.querySelector('input[name="email"]'), {
      target: { name: 'email', value: 'wrong@example.com' },
    });

    fireEvent.change(document.querySelector('input[name="password"]'), {
      target: { name: 'password', value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(
      await screen.findByText('Invalid email or password')
    ).toBeInTheDocument();
  });
});
