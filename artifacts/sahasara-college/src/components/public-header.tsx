import { ArrowRight } from 'lucide-react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { SiteMark } from '@/components/site-mark';

type PublicHeaderProps = {
  settings: {
    collegeName: string;
    tagline: string;
    logoUrl: string | null;
  };
  activePage?: 'home' | 'about' | 'gallery' | 'contact';
  mobileFlow?: boolean;
};

export function PublicHeader({ settings, activePage = 'home', mobileFlow = false }: PublicHeaderProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const homeActive = activePage === 'home' || location === '/';
  const aboutActive = activePage === 'about' || location === '/about';
  const galleryActive = activePage === 'gallery' || location === '/gallery';
  const contactActive = activePage === 'contact' || location === '/contact';
  const contactHref = '/contact';
  const linkClass = (active: boolean) => `transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent ${active ? 'text-[hsl(var(--accent))]' : ''}`;
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`${mobileFlow ? 'relative bg-[hsl(var(--primary))] lg:absolute lg:bg-gradient-to-b lg:from-black/45 lg:to-transparent' : 'absolute bg-gradient-to-b from-black/45 to-transparent'} inset-x-0 top-0 z-20`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-4 sm:px-6 sm:py-5 lg:gap-0 lg:px-10">
        <div className="min-w-0 flex-1 lg:flex-none">
          <SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse responsive />
        </div>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/90 lg:flex" aria-label="Public navigation">
          <a href="/" className={linkClass(homeActive)} aria-current={homeActive ? 'page' : undefined} data-testid="link-nav-home">Home</a>
          <a href="/about" className={linkClass(aboutActive)} aria-current={aboutActive ? 'page' : undefined} data-testid="link-nav-about">About</a>
          <a href="/gallery" className={linkClass(galleryActive)} aria-current={galleryActive ? 'page' : undefined} data-testid="link-nav-gallery">Gallery</a>
          <a href={contactHref} className={linkClass(contactActive)} aria-current={contactActive ? 'page' : undefined} data-testid="link-nav-contact">Contact</a>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a href={contactHref} className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-[hsl(var(--accent))] px-3 text-xs font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent sm:h-11 sm:px-5 sm:text-sm" data-testid="link-header-admissions">
            Admissions <ArrowRight size={16} className="ml-2 hidden sm:inline" />
          </a>
          <button type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="public-mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 text-white transition hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] sm:h-11 sm:w-11 lg:hidden" data-testid="button-public-menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="public-mobile-navigation" className="mx-3 mb-4 rounded-2xl border border-white/15 bg-[hsl(var(--primary)/.94)] p-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md sm:mx-4 lg:hidden" aria-label="Mobile navigation">
          <a href="/" onClick={closeMenu} className={`block rounded-xl px-4 py-3 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${homeActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={homeActive ? 'page' : undefined} data-testid="link-mobile-nav-home">Home</a>
          <a href="/about" onClick={closeMenu} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${aboutActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={aboutActive ? 'page' : undefined} data-testid="link-mobile-nav-about">About</a>
          <a href="/gallery" onClick={closeMenu} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${galleryActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={galleryActive ? 'page' : undefined} data-testid="link-mobile-nav-gallery">Gallery</a>
          <a href={contactHref} onClick={closeMenu} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${contactActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={contactActive ? 'page' : undefined} data-testid="link-mobile-nav-contact">Contact</a>
        </nav>
      )}
    </header>
  );
}