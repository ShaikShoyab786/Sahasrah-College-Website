import { useState } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useLoginAdmin, getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { SiteMark } from '@/components/site-mark';
import { Field } from '@/components/form-fields';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLoginAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    login.mutate({ data: { email, password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() });
        setLocation('/admin');
      },
      onError: (err) => setError((err as { error?: string })?.error || 'Those details did not work. Please try again.'),
    });
  };

  return (
    <main className="grid min-h-[100dvh] bg-[hsl(var(--background))] lg:grid-cols-[.88fr_1.12fr]">
      <section className="relative hidden overflow-hidden bg-[hsl(var(--primary))] p-12 text-[hsl(var(--primary-foreground))] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full border border-[hsl(var(--accent)/.2)]" /><div className="absolute -right-8 top-48 h-[420px] w-[420px] rounded-full border border-[hsl(var(--accent)/.2)]" />
        <SiteMark inverse name="Sahasara Junior College" />
        <div className="relative max-w-md"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">A quiet place to make progress</p><h1 className="mt-6 font-display text-6xl font-semibold leading-[.95] tracking-[-.055em]">Shape the first impression.</h1><p className="mt-7 max-w-sm text-sm leading-7 text-[hsl(var(--primary-foreground)/.6)]">Keep Sahasara’s public voice clear, current, and as welcoming as the campus itself.</p></div>
        <p className="relative text-xs text-[hsl(var(--primary-foreground)/.4)]">Administrator workspace · Internal use</p>
      </section>
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:justify-center lg:px-24">
        <Link href="/" className="mb-16 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--primary))]" data-testid="link-back-home"><ArrowLeft size={16} /> Back to website</Link>
        <div className="mx-auto w-full max-w-[440px]"><div className="mb-10 lg:hidden"><SiteMark name="Sahasara Junior College" /></div><div className="mb-9"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><LockKeyhole size={20} /></div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Admin workspace</p><h2 className="mt-3 font-display text-5xl font-semibold tracking-[-.045em] text-[hsl(var(--primary))]">Welcome back.</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Sign in to keep the college’s story moving.</p></div>
          <form onSubmit={submit} className="space-y-5"><Field id="email" label="Email address" type="email" autoComplete="email" placeholder="you@sahasara.edu" value={email} onChange={(event) => setEmail(event.target.value)} required /><Field id="password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />{error && <p className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" data-testid="status-login-error">{error}</p>}<button type="submit" disabled={login.isPending} className="mt-3 flex h-13 w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 disabled:opacity-60" data-testid="button-login">{login.isPending ? 'Checking details…' : 'Sign in'}{!login.isPending && <ArrowRight size={17} className="ml-2" />}</button></form>
          <p className="mt-8 text-center text-xs leading-5 text-[hsl(var(--muted-foreground))]">This area is for authorised Sahasara administrators.</p>
        </div>
      </section>
    </main>
  );
}