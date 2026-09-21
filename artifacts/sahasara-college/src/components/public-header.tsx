import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { SiteMark } from '@/components/site-mark';

type PublicHeaderProps = {
  settings: {
    collegeName: string;
    tagline: string;
    logoUrl: string | null;
  };
  activePage?: 'home' | 'about';
};

export function PublicHeader({ settings, activePage = 'home' }: PublicHeaderProps) {
  const [location] = useLocation();
  const aboutActive = activePage === 'about' || location === '/about';
  const contactHref = activePage === 'about' ? '/#contact' : '#contact';

  return (
    <header className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/45 to-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/90 lg:flex" aria-label="Public navigation">
          <a href="/about" className={`transition hover:text-white ${aboutActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={aboutActive ? 'page' : undefined} data-testid="link-nav-about">About</a>
          <a href={contactHref} className="transition hover:text-white" data-testid="link-nav-contact">Contact</a>
        </nav>
        <a href={contactHref} className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5" data-testid="link-header-admissions">
          Admissions <ArrowRight size={16} className="ml-2" />
        </a>
      </div>
    </header>
  );
}