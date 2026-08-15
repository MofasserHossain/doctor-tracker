import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PaginationControls } from './pagination-controls';

describe('PaginationControls', () => {
  it('disables previous navigation until a previous cursor exists', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <PaginationControls
        canGoBack={false}
        meta={{ limit: 10, nextCursor: 'next-cursor', hasNextPage: true }}
        pageLabel="Showing 10 doctors"
        onLimitChange={vi.fn()}
        onNext={onNext}
        onPrevious={onPrevious}
      />,
    );

    expect(screen.getByText('Showing 10 doctors')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /next page/i }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('blocks both navigation buttons while a page is fetching', () => {
    render(
      <PaginationControls
        canGoBack
        isFetching
        meta={{ limit: 20, nextCursor: 'next-cursor', hasNextPage: true }}
        pageLabel="Showing 20 patients"
        onLimitChange={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });
});
