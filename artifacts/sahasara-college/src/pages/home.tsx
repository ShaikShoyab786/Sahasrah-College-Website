import { ArrowRight, Mail, MapPin, Phone, Quote } from 'lucide-react';
import { useGetHomepageAboutPreview, useGetHomepageHero, useGetSiteSettings } from '@workspace/api-client-react';
import { HeroCarousel } from '@/components/hero-carousel';
import { AboutPreview } from '@/components/about-preview';
import { SiteMark } from '@/components/site-mark';

const fallbackSettings = {
  collegeName: 'Sahasara Junior College',
  tagline: 'Your College Tagline',
  logoUrl: null,
  email: 'admissions@sahasara.edu',
  phone: '+91 40 2458 0176',
  address: '18 Vidya Marg, Hyderabad, Telangana 500034',
  primaryColor: '#102846',
  accentColor: '#D6AD59',
  footerText: 'A public junior college for curious minds and purposeful lives.',
};
const fallbackHeroSlides = [
  {
    id: 'fallback-1',
    displayOrder: 1,
    eyebrowText: 'A focused start to a bright future',
    heading: 'Learn with purpose.',
    highlightedHeadingText: 'Grow with confidence.',
    description: 'A welcoming academic environment where students build strong foundations, discover their strengths, and prepare for what comes next.',
    primaryButtonLabel: 'Explore admissions',
    primaryButtonUrl: '#contact',
    secondaryButtonLabel: 'Discover our approach',
    secondaryButtonUrl: '#why-sahasara',
    heroImageUrl: null,
    heroImageAltText: 'Sahasara students learning together',
  },
  {
    id: 'fallback-2',
    displayOrder: 2,
    eyebrowText: 'Make room for possibility',
    heading: 'Ask better',
    highlightedHeadingText: 'questions.',
    description: 'At Sahasara, curiosity is not a detour from learning. It is where confidence, creativity, and clarity begin.',
    primaryButtonLabel: 'See how we learn',
    primaryButtonUrl: '#why-sahasara',
    secondaryButtonLabel: 'Meet Sahasara',
    secondaryButtonUrl: '#contact',
    heroImageUrl: null,
    heroImageAltText: 'Students collaborating in a Sahasara classroom',
  },
  {
    id: 'fallback-3',
    displayOrder: 3,
    eyebrowText: 'Your next chapter starts here',
    heading: 'Find your',
    highlightedHeadingText: 'direction.',
    description: 'Choose a path that fits your strengths, then give yourself the space to discover what it can become.',
    primaryButtonLabel: 'Start a conversation',
    primaryButtonUrl: '#contact',
    secondaryButtonLabel: 'Explore pathways',
    secondaryButtonUrl: '#pathways',
    heroImageUrl: null,
    heroImageAltText: 'Sahasara students looking toward their future',
  },
];

function HomeSkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-8 w-40 rounded-lg bg-[hsl(var(--muted))]" /><div className="h-[520px] rounded-[2rem] bg-[hsl(var(--muted))]" /></div></div>;
}

export default function Home() {
  const settingsQuery = useGetSiteSettings();
  const heroQuery = useGetHomepageHero();
  const aboutPreviewQuery = useGetHomepageAboutPreview();
  if (settingsQuery.isLoading || heroQuery.isLoading) return <HomeSkeleton />;
  const settings = settingsQuery.data ?? fallbackSettings;
  const slides = heroQuery.data?.length === 3 ? heroQuery.data : fallbackHeroSlides;
  const primaryColor = settings.primaryColor || '#102846';
  const accentColor = settings.accentColor || '#D6AD59';

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={{ '--site-primary': primaryColor, '--site-accent': accentColor } as React.CSSProperties}>
      <header className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/45 to-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-white/90 lg:flex">
            <a href="#why-sahasara" className="transition hover:text-white" data-testid="link-nav-about">Why Sahasara</a>
            <a href="#pathways" className="transition hover:text-white" data-testid="link-nav-pathways">Pathways</a>
            <a href="#contact" className="transition hover:text-white" data-testid="link-nav-contact">Contact</a>
          </nav>
          <a href="#contact" className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5" data-testid="link-header-admissions">Admissions <ArrowRight size={16} className="ml-2" /></a>
        </div>
      </header>

      <main>
        <HeroCarousel slides={slides} />
        {aboutPreviewQuery.data?.isVisible && <AboutPreview content={aboutPreviewQuery.data} />}

        <section id="why-sahasara" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">A different kind of beginning</p><h2 className="mt-4 max-w-sm font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-[hsl(var(--primary))]">Room to become more of yourself.</h2></div>
            <div className="grid gap-8 border-t border-[hsl(var(--border))] pt-7 sm:grid-cols-2">
              <div><span className="font-display text-5xl text-[hsl(var(--accent-foreground))]">01</span><h3 className="mt-4 text-xl font-bold">Learn beyond the syllabus</h3><p className="mt-3 text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">Deep subject knowledge is only the start. We make space for experiments, debate, making, and the unexpected connection.</p></div>
              <div><span className="font-display text-5xl text-[hsl(var(--accent-foreground))]">02</span><h3 className="mt-4 text-xl font-bold">Be known, not numbered</h3><p className="mt-3 text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">A thoughtful faculty and a close community mean students get the guidance and challenge that fits who they are.</p></div>
            </div>
          </div>
        </section>

        <section id="pathways" className="bg-[hsl(var(--primary))] px-6 py-24 text-[hsl(var(--primary-foreground))] lg:px-10 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 border-b border-[hsl(var(--primary-foreground)/.18)] pb-10 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Find your path</p><h2 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[.98] tracking-[-.045em]">Serious about the future. Open to the route.</h2></div><p className="max-w-xs text-sm leading-6 text-[hsl(var(--primary-foreground)/.66)]">Choose a direction, then give yourself permission to discover what it can become.</p></div>
            <div className="mt-10 grid gap-4 md:grid-cols-[1.15fr_.85fr]">
              <div className="group rounded-[1.5rem] bg-[hsl(var(--primary-foreground)/.08)] p-7 transition hover:bg-[hsl(var(--primary-foreground)/.13)] md:p-9"><div className="flex items-start justify-between"><span className="text-sm font-bold text-[hsl(var(--accent))]">01 / Sciences</span><ArrowRight size={20} className="transition group-hover:translate-x-1" /></div><h3 className="mt-20 font-display text-4xl font-semibold">Ask how the world works.</h3><p className="mt-4 max-w-md text-sm leading-6 text-[hsl(var(--primary-foreground)/.65)]">For students who find energy in evidence, observation, and the beautiful discipline of finding out.</p></div>
              <div className="grid gap-4"><div className="group rounded-[1.5rem] bg-[hsl(var(--accent))] p-7 text-[hsl(var(--primary))] transition hover:-translate-y-1"><div className="flex items-start justify-between"><span className="text-sm font-bold">02 / Commerce</span><ArrowRight size={20} className="transition group-hover:translate-x-1" /></div><h3 className="mt-12 font-display text-3xl font-semibold">Think in possibilities.</h3></div><div className="group rounded-[1.5rem] border border-[hsl(var(--primary-foreground)/.2)] p-7 transition hover:bg-[hsl(var(--primary-foreground)/.08)]"><div className="flex items-start justify-between"><span className="text-sm font-bold text-[hsl(var(--accent))]">03 / Humanities</span><ArrowRight size={20} className="transition group-hover:translate-x-1" /></div><h3 className="mt-12 font-display text-3xl font-semibold">See the bigger picture.</h3></div></div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid overflow-hidden rounded-[2rem] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-8 md:p-12 lg:p-16"><p className="text-xs font-bold uppercase tracking-[.2em]">Your next chapter starts here</p><h2 className="mt-5 max-w-lg font-display text-5xl font-semibold leading-[.96] tracking-[-.045em]">Bring us your questions. We’ll bring the time.</h2><p className="mt-6 max-w-md text-sm leading-7 text-[hsl(var(--primary)/.72)]">Our admissions team is happy to help with courses, campus visits, applications, and the questions you haven’t found the words for yet.</p><a href={`mailto:${settings.email}`} className="mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid="link-contact-email">Contact admissions <ArrowRight size={16} className="ml-2" /></a></div>
            <div className="flex flex-col justify-end bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] md:p-12 lg:p-16"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Come say hello</p><div className="mt-8 space-y-6 text-sm"><div className="flex gap-4"><Mail size={18} className="mt-0.5 text-[hsl(var(--accent))]" /><span data-testid="text-contact-email">{settings.email}</span></div><div className="flex gap-4"><Phone size={18} className="mt-0.5 text-[hsl(var(--accent))]" /><span data-testid="text-contact-phone">{settings.phone}</span></div><div className="flex gap-4"><MapPin size={18} className="mt-0.5 text-[hsl(var(--accent))]" /><span className="leading-6" data-testid="text-contact-address">{settings.address}</span></div></div><div className="mt-10 border-t border-[hsl(var(--primary-foreground)/.16)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.55)]">Office hours · Monday–Saturday, 9:00–16:30</div></div>
          </div>
        </section>

        <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-10 lg:px-10"><div className="mx-auto flex max-w-7xl items-center gap-4"><Quote size={22} className="shrink-0 text-[hsl(var(--accent-foreground))]" /><p className="font-display text-xl italic text-[hsl(var(--primary))]">“The most useful thing we can teach is how to keep becoming.”</p></div></section>
      </main>
       <footer className="bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] lg:px-10"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_.7fr_.7fr]"><div><SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse /><p className="mt-6 max-w-xs text-sm leading-6 text-[hsl(var(--primary-foreground)/.58)]" data-testid="text-footer">{settings.footerText || fallbackSettings.footerText}</p></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Navigate</p><div className="mt-5 space-y-3 text-sm text-[hsl(var(--primary-foreground)/.7)]"><a href="#why-sahasara" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-about">Why Sahasara</a><a href="#pathways" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-pathways">Pathways</a><a href="#contact" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-contact">Admissions</a><a href="/admin/login" className="block pt-3 text-[hsl(var(--accent))] hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-admin">Administrator sign in</a></div></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Stay in touch</p><p className="mt-5 text-sm leading-6 text-[hsl(var(--primary-foreground)/.7)]">{settings.email}<br />{settings.phone}</p></div></div><div className="mx-auto mt-12 max-w-7xl border-t border-[hsl(var(--primary-foreground)/.15)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.42)]">© {new Date().getFullYear()} {settings.collegeName}. A public college for purposeful beginnings.</div></footer>
    </div>
  );
}