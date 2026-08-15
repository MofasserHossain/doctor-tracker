'use client';

import { RequiredLabel } from '@/components/shared/required-label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '@/lib/services/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation({
    onSuccess: () => {
      const nextPath = new URLSearchParams(window.location.search).get('next');
      router.replace(nextPath?.startsWith('/') ? nextPath : '/');
      router.refresh();
    },
  });
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
    } catch {
      // Error toast is handled by the auth service hook.
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <RequiredLabel htmlFor="email">Email</RequiredLabel>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            {form.formState.errors.email ? (
              <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <RequiredLabel htmlFor="password">Password</RequiredLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button
            className="gap-2"
            disabled={form.formState.isSubmitting || loginMutation.isPending}
          >
            <LogIn className="size-4" aria-hidden="true" />
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
