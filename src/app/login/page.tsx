'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/shell/logo';
import { Spinner } from '@/components/ui/primitives';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const DEMO = { email: 'demo@wellfound.dev', password: 'password123' };

export default function LoginPage() {
  const { user, isLoading, login, register } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(DEMO.email);
  const [password, setPassword] = useState(DEMO.password);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace('/jobs');
  }, [isLoading, user, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') await login(email, password);
      else await register({ email, password, name });
      router.replace('/jobs');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not reach the API. Is it running on port 4000?',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo className="scale-125" />
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-semibold text-ink">
            {mode === 'login' ? 'Sign in' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {mode === 'login'
              ? 'Find your next role at a startup.'
              : 'Tell startups what you are looking for.'}
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {mode === 'signup' ? (
              <div>
                <label className="label" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </div>
            ) : null}

            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
              />
              {mode === 'signup' ? (
                <p className="mt-1 text-xs text-ink-subtle">
                  At least 8 characters.
                </p>
              ) : null}
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? <Spinner className="border-white/40 border-t-white" /> : null}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-muted">
            {mode === 'login' ? "Don't have an account?" : 'Already have one?'}{' '}
            <button
              type="button"
              className="font-medium text-brand hover:underline"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {mode === 'login' ? (
          <p className="mt-4 text-center text-xs text-ink-subtle">
            Demo account is pre-filled: <strong>{DEMO.email}</strong> /{' '}
            <strong>{DEMO.password}</strong>
          </p>
        ) : null}
      </div>
    </div>
  );
}
