import type { ReactNode } from 'react';

type FieldErrorProps = {
  children?: ReactNode;
  id: string;
};

export const getFieldErrorProps = (fieldId: string, message?: string) => ({
  'aria-describedby': message ? `${fieldId}-error` : undefined,
  'aria-invalid': Boolean(message),
});

export function FieldError({ children, id }: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p id={id} role="alert" className="text-destructive text-sm leading-snug">
      {children}
    </p>
  );
}
