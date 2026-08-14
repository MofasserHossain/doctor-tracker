'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CursorPaginationMeta } from '@/types/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationControlsProps = {
  meta?: CursorPaginationMeta;
  isFetching?: boolean;
  canGoBack?: boolean;
  pageLabel: string;
  onNext: () => void;
  onPrevious: () => void;
  onLimitChange: (limit: number) => void;
};

const pageSizes = [5, 10, 20, 50];

export function PaginationControls({
  meta,
  isFetching = false,
  canGoBack = false,
  pageLabel,
  onNext,
  onPrevious,
  onLimitChange,
}: PaginationControlsProps) {
  const limit = meta?.limit ?? 10;

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">{pageLabel}</p>
      <div className="flex items-center gap-2">
        <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
          <SelectTrigger className="w-24" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          aria-label="Previous page"
          disabled={isFetching || !canGoBack}
          onClick={onPrevious}
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button
          aria-label="Next page"
          disabled={isFetching || !meta?.hasNextPage}
          onClick={onNext}
          size="icon-sm"
          variant="outline"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
