'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiJson, getApiBaseUrl, getApiErrorMessage } from '@/lib/api';
import { setAccessToken, setAuthUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiJson<{ access_token: string; user: { id: string; email: string } }>(
        '/auth/register',
        { method: 'POST', body: { email: email.trim(), password } },
      );
      setAccessToken(res.access_token);
      setAuthUser(res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormReady = email.trim().length > 0 && password.length >= 8 && confirmPassword.length >= 8;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%)]" />
      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Create your account</h1>
            <p className="mt-2 text-sm text-slate-300">Set up your CareerSync workspace in under a minute.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all placeholder:text-slate-400 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all placeholder:text-slate-400 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/40"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all placeholder:text-slate-400 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/40"
                placeholder="Repeat your password"
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
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:from-violet-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <a
            href={`${getApiBaseUrl()}/auth/google`}
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Continue with Google
          </a>

          <div className="mt-6 text-center text-sm text-slate-300">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-violet-300 transition hover:text-violet-200">
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-slate-400">
            By continuing, you can manage jobs, sync Gmail updates, and optimize resumes from one dashboard.
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:p-10">
          <Link href="/" className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-violet-200 transition hover:bg-white/10">
            CareerSync
          </Link>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Build a cleaner, faster job search system.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                From first application to final offer, CareerSync keeps your inbox, application tracker, and resume tailoring workflow aligned.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['One source of truth', 'Stop juggling spreadsheets, inbox labels, and scattered notes.'],
                ['Smarter follow-ups', 'Bring Gmail activity into your job tracker with one sync.'],
                ['Resume versions on demand', 'Generate tailored resume PDFs for each target role.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
