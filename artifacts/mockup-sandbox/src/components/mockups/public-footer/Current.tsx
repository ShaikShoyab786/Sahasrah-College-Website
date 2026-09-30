import './_group.css';

const settings = {
  collegeName: 'Sahasrah Junior College',
  tagline: 'A clear beginning for a remarkable future',
  logoUrl: '/api/uploads/logo-afb86660-e2ed-4965-973e-bd3148a62fda.jpeg',
  email: 'smartshoyab653@gmail.com',
  phone: '+91 XXXXX 00009',
  footerText: 'Building confident futures through focused learning.',
};

export function Current() {
  return (
    <div className="flex min-h-screen items-end bg-[hsl(var(--background))] font-sans" style={{ '--primary': '216 96% 22%', '--primary-foreground': '0 0% 100%', '--accent': '357 90% 43%', '--accent-foreground': '0 0% 100%' } as React.CSSProperties}>
      <footer className="w-full bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_.7fr_.7fr]">
          <div>
            <a href="/" className="group inline-flex items-center gap-3">
              <img src={settings.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-contain" />
              <span className="leading-tight">
                <span className="block font-serif text-lg font-semibold tracking-[-0.02em]">{settings.collegeName}</span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.2em] text-[hsl(var(--accent))]">{settings.tagline}</span>
              </span>
            </a>
            <p className="mt-6 max-w-xs text-sm leading-6" data-testid="text-footer">{settings.footerText}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em]">Navigate</p>
            <div className="mt-5 space-y-3 text-sm">
              <a href="/about" className="block transition hover:underline hover:underline-offset-4">About</a>
              <a href="/contact" className="block transition hover:underline hover:underline-offset-4">Admissions</a>
              <a href="/admin/login" className="block pt-3 transition hover:underline hover:underline-offset-4">Administrator sign in</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em]">Stay in touch</p>
            <p className="mt-5 text-sm leading-6">{settings.email}<br />{settings.phone}</p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl border-t border-[hsl(var(--primary-foreground)/.15)] pt-5 text-xs">© {new Date().getFullYear()} {settings.collegeName}. A public college for purposeful beginnings.</div>
      </footer>
    </div>
  );
}