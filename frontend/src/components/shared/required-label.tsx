import { Label } from '@/components/ui/label';
import type { ComponentProps } from 'react';

type RequiredLabelProps = ComponentProps<typeof Label>;

export function RequiredLabel({ children, ...props }: RequiredLabelProps) {
  return (
    <Label {...props}>
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
      <span className="sr-only">required</span>
    </Label>
  );
}
