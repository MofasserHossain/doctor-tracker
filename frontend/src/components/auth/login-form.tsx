'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/lib/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@doctortracker.local',
      password: 'Admin@12345',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values);
      toast.success('Signed in');
      router.push('/');
    } catch {
      toast.error('Invalid email or password');
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            {form.formState.errors.email ? (
              <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
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

          <Button className="gap-2" disabled={form.formState.isSubmitting}>
            <LogIn className="size-4" aria-hidden="true" />
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
