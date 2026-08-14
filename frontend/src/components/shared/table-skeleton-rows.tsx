'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type TableSkeletonRowsProps = {
  columnCount: number;
  rows?: number;
};

const skeletonWidths = ['w-36', 'w-44', 'w-28', 'w-32', 'w-24', 'w-40', 'w-16'];

export function TableSkeletonRows({ columnCount, rows = 6 }: TableSkeletonRowsProps) {
  return Array.from({ length: rows }, (_unusedRow, rowIndex) => (
    <TableRow key={`skeleton-row-${rowIndex.toString()}`}>
      {Array.from({ length: columnCount }, (_unusedColumn, columnIndex) => (
        <TableCell key={`skeleton-cell-${rowIndex.toString()}-${columnIndex.toString()}`}>
          <Skeleton
            className={cn(
              'h-4 max-w-full',
              skeletonWidths[columnIndex % skeletonWidths.length],
              columnIndex === columnCount - 1 && 'ml-auto',
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
