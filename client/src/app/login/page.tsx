'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiJson, getApiBaseUrl, getApiErrorMessage } from '@/lib/api';
import { setAccessToken, setAuthUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await apiJson<{ access_token: string; user: { id: string; email: string } }>(
        '/auth/login',
        { method: 'POST', body: { email: email.trim(), password } },
      );
      setAccessToken(res.access_token);
      setAuthUser(res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormReady = email.trim().length > 0 && password.length >= 8;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:p-10">
          <Link href="/" className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200 transition hover:bg-white/10">
            CareerSync
          </Link>
          <div className="mt-8 max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Keep every application, interview, and follow-up in one place.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              Sign in to manage your pipeline, sync Gmail updates, and generate job-specific resume versions without leaving your dashboard.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Track jobs', 'Centralize status, dates, and company details.'],
              ['Sync Gmail', 'Pull job-related updates straight from your inbox.'],
              ['Tailor resumes', 'Generate optimized resume PDFs for each role.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-300">Sign in to your CareerSync workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all placeholder:text-slate-400 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-200">Password</label>
                <span className="text-xs text-slate-400">Minimum 8 characters</span>
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all placeholder:text-slate-400 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/40"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !isFormReady}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <a
            href={`${getApiBaseUrl()}/auth/google`}
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Continue with Google
          </a>

          <div className="mt-6 text-center text-sm text-slate-300">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-cyan-300 transition hover:text-cyan-200">
              Create one
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400">
            Need a fresh start? <Link href="/" className="text-slate-300 underline underline-offset-4">Return to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
