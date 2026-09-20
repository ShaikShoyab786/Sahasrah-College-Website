import { ArrowRight, Check, Mail, MapPin, Phone, Quote, Sparkles } from 'lucide-react';
import { useGetHomepageHero, useGetSiteSettings } from '@workspace/api-client-react';
import { SiteMark } from '@/components/site-mark';

const fallbackSettings = {
  collegeName: 'Sahasara Junior College',
  tagline: 'A clear beginning for a remarkable future.',
  logoUrl: null,
  email: 'admissions@sahasara.edu',
  phone: '+91 40 2458 0176',
  address: '18 Vidya Marg, Hyderabad, Telangana 500034',
  primaryColor: '#102846',
  accentColor: '#D6AD59',
  footerText: 'A public junior college for curious minds and purposeful lives.',
};
const fallbackHero = {
  eyebrowText: 'Admissions open for 2025–26',
  heading: 'Find your direction.',
  highlightedHeadingText: 'Make it meaningful.',
  description: 'Sahasara is a public junior college where strong foundations, generous questions, and the confidence to try again come together.',
  primaryButtonLabel: 'Start a conversation',
  primaryButtonUrl: '#contact',
  secondaryButtonLabel: 'Explore Sahasara',
  secondaryButtonUrl: '#why-sahasara',
  heroImageUrl: null,
  isPublished: true,
};

function HomeSkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-8 w-40 rounded-lg bg-[hsl(var(--muted))]" /><div className="h-[520px] rounded-[2rem] bg-[hsl(var(--muted))]" /></div></div>;
}

export default function Home() {
  const settingsQuery = useGetSiteSettings();
  const heroQuery = useGetHomepageHero();
  if (settingsQuery.isLoading || heroQuery.isLoading) return <HomeSkeleton />;
  const settings = settingsQuery.data ?? fallbackSettings;
  const hero = heroQuery.data ?? fallbackHero;
  const primaryColor = settings.primaryColor || '#102846';
  const accentColor = settings.accentColor || '#D6AD59';

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={{ '--site-primary': primaryColor, '--site-accent': accentColor } as React.CSSProperties}>
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <SiteMark name={settings.collegeName} logoUrl={settings.logoUrl} />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[hsl(var(--primary))] lg:flex">
            <a href="#why-sahasara" className="transition hover:text-[hsl(var(--accent-foreground))]" data-testid="link-nav-about">Why Sahasara</a>
            <a href="#pathways" className="transition hover:text-[hsl(var(--accent-foreground))]" data-testid="link-nav-pathways">Pathways</a>
            <a href="#contact" className="transition hover:text-[hsl(var(--accent-foreground))]" data-testid="link-nav-contact">Contact</a>
          </nav>
          <a href="#contact" className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:bg-[hsl(216_48%_19%)]" data-testid="link-header-admissions">Admissions <ArrowRight size={16} className="ml-2" /></a>
        </div>
      </header>

      <main>
        <section className="relative min-h-[760px] overflow-hidden bg-[hsl(var(--secondary))]">
          <div className="absolute -right-24 top-20 h-[520px] w-[520px] rounded-full border border-[hsl(var(--accent)/.35)] lg:right-[-60px] lg:top-[-20px]" />
          <div className="absolute -right-6 top-40 h-[380px] w-[380px] rounded-full border border-[hsl(var(--accent)/.3)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-36 lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:pt-44">
            <div className="relative z-10 min-w-0 max-w-2xl">
              <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/.45)] bg-[hsl(var(--card)/.5)] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]" data-testid="text-hero-eyebrow"><Sparkles size={14} className="text-[hsl(var(--accent-foreground))]" /> {hero.eyebrowText}</div>
              <h1 className="animate-rise-delay mt-7 max-w-full break-words font-display text-[clamp(3.15rem,13vw,6.7rem)] font-semibold leading-[.93] tracking-[-0.055em] text-[hsl(var(--primary))] sm:tracking-[-0.065em]" data-testid="text-hero-heading">
                {hero.heading}{' '}
                <span className="text-[hsl(var(--accent-foreground))] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] border-b-4 border-[hsl(var(--accent))]">
                  {hero.highlightedHeadingText}
                </span>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]" data-testid="text-hero-description">{hero.description}</p>
              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <a href={hero.primaryButtonUrl || '#contact'} className="inline-flex h-13 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/.14)] transition hover:-translate-y-1 sm:w-auto" data-testid="link-hero-primary">{hero.primaryButtonLabel || 'Start a conversation'} <ArrowRight size={17} className="ml-2" /></a>
                <a href={hero.secondaryButtonUrl || '#why-sahasara'} className="inline-flex h-13 items-center justify-center rounded-full px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--card)/.6)] sm:w-auto" data-testid="link-hero-secondary">{hero.secondaryButtonLabel || 'Explore Sahasara'}</a>
              </div>
              <div className="mt-12 flex items-center gap-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><Check size={15} /></span> A public college built around possibility</div>
            </div>
            <div className="relative mx-auto w-full max-w-[510px] lg:ml-auto">
              <div className="animate-drift relative aspect-[.86] overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))] shadow-2xl shadow-[hsl(var(--primary)/.2)]">
                {hero.heroImageUrl ? <img src={hero.heroImageUrl} alt="Sahasara students learning together" className="h-full w-full object-cover opacity-90" data-testid="img-hero" /> : <div className="relative h-full overflow-hidden bg-[hsl(var(--primary))]" data-testid="img-hero-fallback"><div className="absolute inset-5 rounded-[1.5rem] border border-[hsl(var(--accent)/.4)]" /><div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[hsl(var(--accent)/.18)] blur-3xl" /><div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[hsl(var(--primary))] to-transparent" /><div className="absolute bottom-10 left-8 right-8"><p className="font-display text-4xl leading-tight text-[hsl(var(--primary-foreground))]">Good questions<br /><em className="text-[hsl(var(--accent))]">change everything.</em></p><div className="mt-6 flex items-center gap-3"><span className="h-px w-10 bg-[hsl(var(--accent))]" /><span className="text-xs font-semibold uppercase tracking-[.18em] text-[hsl(var(--primary-foreground)/.7)]">Since 1987</span></div></div></div>}
                <div className="absolute bottom-5 left-5 rounded-2xl border border-[hsl(var(--primary-foreground)/.2)] bg-[hsl(var(--primary)/.72)] px-4 py-3 backdrop-blur-md"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">The Sahasara way</p><p className="mt-1 text-sm font-semibold text-[hsl(var(--primary-foreground))]">Curious. Capable. Kind.</p></div>
              </div>
              <span className="absolute -bottom-7 -left-8 hidden h-16 w-16 rounded-full bg-[hsl(var(--accent))] lg:block" />
            </div>
          </div>
        </section>

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
      <footer className="bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] lg:px-10"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_.7fr_.7fr]"><div><SiteMark name={settings.collegeName} logoUrl={settings.logoUrl} inverse /><p className="mt-6 max-w-xs text-sm leading-6 text-[hsl(var(--primary-foreground)/.58)]" data-testid="text-footer">{settings.footerText || fallbackSettings.footerText}</p></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Navigate</p><div className="mt-5 space-y-3 text-sm text-[hsl(var(--primary-foreground)/.7)]"><a href="#why-sahasara" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-about">Why Sahasara</a><a href="#pathways" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-pathways">Pathways</a><a href="#contact" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-contact">Admissions</a></div></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Stay in touch</p><p className="mt-5 text-sm leading-6 text-[hsl(var(--primary-foreground)/.7)]">{settings.email}<br />{settings.phone}</p></div></div><div className="mx-auto mt-12 max-w-7xl border-t border-[hsl(var(--primary-foreground)/.15)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.42)]">© {new Date().getFullYear()} {settings.collegeName}. A public college for purposeful beginnings.</div></footer>
    </div>
  );
}