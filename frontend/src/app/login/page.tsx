import { LoginForm } from '@/components/auth/login-form';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="bg-muted/30 flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-md gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
            <Activity className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Doctor Tracker</h1>
            <p className="text-muted-foreground text-sm">Care Guide BD admin portal</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
