import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useGetSiteSettings, useLoginAdmin, getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { SiteMark } from '@/components/site-mark';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const defaults = {
  loginLeftEyebrow: 'ACADEMIC ADMINISTRATION',
  loginLeftHeading: 'Manage with',
  loginLeftHighlightedHeading: 'clarity and purpose.',
  loginLeftDescription: 'A secure workspace for managing Sahsrah Junior College operations, academic information, student records, and institutional updates.',
  loginLeftBottomText: 'Authorized administrators only · Internal use',
  loginBackgroundImageUrl: '/api/uploads/admin-login-background.png',
  loginBackgroundImageAltText: 'Sahsrah Junior College academic administration workspace',
  loginRightEyebrow: 'ADMIN WORKSPACE',
  loginRightHeading: 'Welcome back.',
  loginRightDescription: "Sign in to access Sahsrah's administrative workspace.",
  loginEmailLabel: 'Official email address',
  loginPasswordLabel: 'Password',
  loginButtonLabel: 'Sign in →',
  loginSecurityNote: 'This workspace is restricted to authorized Sahsrah administrators.',
  loginBackLinkLabel: 'Back to website',
};

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLoginAdmin();
  const settings = useGetSiteSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const content = {
    ...defaults,
    ...(settings.data ?? {}),
    loginBackgroundImageUrl: settings.data?.loginBackgroundImageUrl || defaults.loginBackgroundImageUrl,
  };
  const themeStyle = createPublicThemeStyle(
    settings.data?.primaryColor || DEFAULT_PRIMARY_COLOR,
    settings.data?.accentColor || DEFAULT_ACCENT_COLOR,
    settings.data?.surfaceColor || DEFAULT_SURFACE_COLOR,
  );

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
    <main className="min-h-[100dvh] overflow-x-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]">
        <section className="relative flex h-[205px] min-h-0 overflow-hidden bg-[hsl(var(--primary))] px-6 py-6 text-[hsl(var(--primary-foreground))] sm:px-10 lg:min-h-[100dvh] lg:h-auto lg:flex-col lg:justify-between lg:px-12 lg:py-12" aria-label={content.loginBackgroundImageAltText}>
          {content.loginBackgroundImageUrl && <img src={content.loginBackgroundImageUrl} alt={content.loginBackgroundImageAltText} className="absolute inset-0 h-full w-full object-cover object-center" />}
          <div className="absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--primary)/.94),hsl(var(--primary)/.72)_55%,hsl(var(--accent)/.48))]" />
          <div className="absolute -right-32 top-10 h-80 w-80 rounded-full border border-[hsl(var(--primary-foreground)/.16)] lg:h-[600px] lg:w-[600px]" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full border border-[hsl(var(--accent)/.38)]" aria-hidden="true" />
          <div className="relative z-[1]"><SiteMark inverse compact name="Sahsrah Junior College" /></div>
          <div className="relative z-[1] mt-5 max-w-xl lg:mt-0">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">{content.loginLeftEyebrow}</p>
            <h1 className="mt-2 max-w-lg font-display text-3xl font-semibold leading-[.96] tracking-[-.05em] sm:text-4xl lg:mt-4 lg:text-6xl">{content.loginLeftHeading}<br /><span className="text-[hsl(var(--accent))]">{content.loginLeftHighlightedHeading}</span></h1>
            <p className="mt-5 hidden max-w-lg text-sm leading-7 text-[hsl(var(--primary-foreground)/.78)] lg:block">{content.loginLeftDescription}</p>
          </div>
          <p className="relative z-[1] mt-5 hidden text-xs text-[hsl(var(--primary-foreground)/.62)] lg:mt-0 lg:block">{content.loginLeftBottomText}</p>
        </section>
        <section className="flex flex-col px-6 py-8 sm:px-12 lg:justify-center lg:px-20 xl:px-28">
          <Link href="/" className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] lg:mb-16" data-testid="link-back-home"><ArrowLeft size={16} /> {content.loginBackLinkLabel}</Link>
          <div className="mx-auto w-full max-w-[460px]">
            <div className="mb-9">
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent-foreground))]"><LockKeyhole size={20} /></div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{content.loginRightEyebrow}</p>
              <h2 className="mt-3 font-display text-5xl font-semibold tracking-[-.045em] text-[hsl(var(--primary))]">{content.loginRightHeading}</h2>
              <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{content.loginRightDescription}</p>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <label className="block space-y-2" htmlFor="email"><span className="text-sm font-semibold text-[hsl(var(--foreground))]">{content.loginEmailLabel}</span><input id="email" type="email" autoComplete="email" placeholder="you@sahsrah.edu" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-13 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.58)] focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.16)]" data-testid="input-admin-email" /></label>
              <label className="block space-y-2" htmlFor="password"><span className="text-sm font-semibold text-[hsl(var(--foreground))]">{content.loginPasswordLabel}</span><span className="relative block"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required className="h-13 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 pr-12 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.58)] focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.16)]" data-testid="input-admin-password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.2)]" data-testid="button-toggle-password">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
              {error && <p className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" role="alert" data-testid="status-login-error">{error}</p>}
              <button type="submit" disabled={login.isPending} className="mt-3 flex h-13 w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none" data-testid="button-login">{login.isPending ? 'Checking details…' : content.loginButtonLabel}</button>
            </form>
            <p className="mt-8 text-center text-xs leading-5 text-[hsl(var(--muted-foreground))]"><span className="mr-1 text-[hsl(var(--accent))]" aria-hidden="true">◆</span>{content.loginSecurityNote}</p>
          </div>
        </section>
      </div>
    </main>
  );
}