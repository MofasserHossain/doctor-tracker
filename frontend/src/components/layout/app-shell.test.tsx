import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from './app-shell';

const mocks = vi.hoisted(() => ({
  logoutMutate: vi.fn(),
  pathname: '/doctors',
  replace: vi.fn(),
  useCurrentUserQuery: vi.fn(),
  useLogoutMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/services/auth', () => ({
  useCurrentUserQuery: mocks.useCurrentUserQuery,
  useLogoutMutation: mocks.useLogoutMutation,
}));

beforeEach(() => {
  mocks.logoutMutate.mockReset();
  mocks.replace.mockReset();
  mocks.useCurrentUserQuery.mockReset();
  mocks.useLogoutMutation.mockReset();
  mocks.pathname = '/doctors';
  mocks.useCurrentUserQuery.mockReturnValue({
    data: {
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@doctortracker.local',
      role: 'ADMIN',
    },
    isError: false,
    isLoading: false,
  });
  mocks.useLogoutMutation.mockReturnValue({
    isPending: false,
    mutate: mocks.logoutMutate,
  });
});

describe('AppShell', () => {
  it('renders admin navigation and asks for permission confirmation before logout', async () => {
    const user = userEvent.setup();

    render(
      <AppShell>
        <h1>Doctors content</h1>
      </AppShell>,
    );

    expect(screen.getByText('Doctors content')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /dashboard/i })[0]).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: /doctors/i })[0]).toHaveAttribute(
      'href',
      '/doctors',
    );
    expect(screen.getAllByRole('link', { name: /patients/i })[0]).toHaveAttribute(
      'href',
      '/patients',
    );

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Sign out?')).toBeInTheDocument();
    expect(
      within(dialog).getByText(/admin permissions for doctor and patient management/i),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /sign out/i }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: /sign out/i,
      }),
    );

    expect(mocks.logoutMutate).toHaveBeenCalledTimes(1);
  });

  it('redirects unauthenticated users back to login with the current path', async () => {
    mocks.pathname = '/patients';
    mocks.useCurrentUserQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    render(
      <AppShell>
        <h1>Patients content</h1>
      </AppShell>,
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith('/login?next=%2Fpatients');
    });
  });
});
