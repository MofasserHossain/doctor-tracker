import type { LoginPayload } from '@/lib/api/auth';
import type { LoginResponse } from '@/types/domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
    replace: mocks.replace,
  }),
}));

vi.mock('@/lib/services/auth', () => ({
  useLoginMutation: (options: {
    onSuccess?: (data: LoginResponse, variables: LoginPayload) => void | Promise<void>;
  }) => ({
    isPending: false,
    mutateAsync: mocks.mutateAsync.mockImplementation(async (values: LoginPayload) => {
      await options.onSuccess?.(
        {
          user: {
            id: 'admin-id',
            name: 'Admin User',
            email: values.email,
            role: 'ADMIN',
          },
        },
        values,
      );
    }),
  }),
}));

beforeEach(() => {
  mocks.mutateAsync.mockReset();
  mocks.refresh.mockReset();
  mocks.replace.mockReset();
  window.history.pushState({}, '', '/login');
});

describe('LoginForm', () => {
  it('submits the demo credentials and redirects to the requested next path', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/login?next=/patients');

    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        email: 'admin@doctortracker.local',
        password: 'Admin@12345',
      });
    });
    expect(mocks.replace).toHaveBeenCalledWith('/patients');
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors and does not submit invalid credentials', async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.clear(screen.getByLabelText(/email/i));
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
