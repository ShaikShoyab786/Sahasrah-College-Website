import { SiteMark } from '@/components/site-mark';

type PublicFooterProps = {
  settings: {
    collegeName: string;
    tagline: string;
    logoUrl: string | null;
    email: string;
    phone: string;
    footerText: string;
  };
};

export function PublicFooter({ settings }: PublicFooterProps) {
  return (
    <footer className="bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_.7fr_.7fr]">
        <div>
          <SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse />
          <p className="mt-6 max-w-xs text-sm leading-6 text-[hsl(var(--primary-foreground)/.58)]" data-testid="text-footer">{settings.footerText}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Navigate</p>
          <div className="mt-5 space-y-3 text-sm text-[hsl(var(--primary-foreground)/.7)]">
            <a href="/about" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-about">About</a>
            <a href="/#contact" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-contact">Admissions</a>
            <a href="/admin/login" className="block pt-3 text-[hsl(var(--accent))] hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-admin">Administrator sign in</a>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Stay in touch</p>
          <p className="mt-5 text-sm leading-6 text-[hsl(var(--primary-foreground)/.7)]">{settings.email}<br />{settings.phone}</p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-[hsl(var(--primary-foreground)/.15)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.42)]">© {new Date().getFullYear()} {settings.collegeName}. A public college for purposeful beginnings.</div>
    </footer>
  );
}