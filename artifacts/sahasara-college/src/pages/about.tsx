import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpen, CalendarDays, CheckCircle2, Eye, GraduationCap, HeartHandshake, Quote, ShieldCheck, Sparkles, Star, Target, Users, type LucideIcon } from 'lucide-react';
import {
  useGetAboutChairmanMessage,
  useGetAboutHero,
  useGetAboutGuidingPrinciples,
  useGetAboutLeadership,
  useGetAboutStory,
  useGetAboutWhyParentsChoose,
  useGetSiteSettings,
  type AboutChairmanMessage,
  type AboutHero,
  type AboutGuidingPrinciples,
  type AboutLeadership,
  type AboutStory,
  type AboutWhyParentsChoose,
} from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';

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

export default function About() {
  const settingsQuery = useGetSiteSettings();
  const heroQuery = useGetAboutHero();
  const storyQuery = useGetAboutStory();
  const chairmanQuery = useGetAboutChairmanMessage();
  const principlesQuery = useGetAboutGuidingPrinciples();
  const parentChoiceQuery = useGetAboutWhyParentsChoose();
  const leadershipQuery = useGetAboutLeadership();
  const settings = settingsQuery.data ?? fallbackSettings;
  const primaryColor = settings.primaryColor || '#102846';
  const accentColor = settings.accentColor || '#D6AD59';

  if (settingsQuery.isLoading || heroQuery.isLoading || storyQuery.isLoading || chairmanQuery.isLoading || principlesQuery.isLoading || parentChoiceQuery.isLoading || leadershipQuery.isLoading) {
    return <AboutSkeleton />;
  }

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={{ '--site-primary': primaryColor, '--site-accent': accentColor } as React.CSSProperties}>
      <PublicHeader settings={settings} activePage="about" />
      <main>
        {heroQuery.data?.isVisible && <AboutHeroSection content={heroQuery.data} />}
        {storyQuery.data?.isVisible && <OurStorySection content={storyQuery.data} />}
        {chairmanQuery.data?.isVisible && <ChairmanMessageSection content={chairmanQuery.data} />}
        {principlesQuery.data?.isVisible && <GuidingPrinciplesSection content={principlesQuery.data} />}
        {parentChoiceQuery.data?.isVisible && <WhyParentsChooseSection content={parentChoiceQuery.data} />}
        {leadershipQuery.data?.isVisible && <LeadershipSection content={leadershipQuery.data} />}
      </main>
      <PublicFooter settings={{ ...settings, footerText: settings.footerText || fallbackSettings.footerText }} />
    </div>
  );
}

function AboutHeroSection({ content }: { content: AboutHero }) {
  const visibleStats = content.stats.filter((stat) => stat.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section id="about-hero" className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-20 pt-36 text-[hsl(var(--primary-foreground))] lg:px-10 lg:pb-28 lg:pt-48">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/.18),transparent_35%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
        <div>
          <SectionEyebrow className="!text-[hsl(var(--accent))]">{content.eyebrow}</SectionEyebrow>
          <h1 className="mt-6 max-w-2xl font-display text-6xl font-semibold leading-[.91] tracking-[-.06em] md:text-7xl lg:text-[clamp(4.7rem,7vw,7.2rem)]" data-testid="text-about-hero-heading">{content.heading}</h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-white/70 md:text-lg" data-testid="text-about-hero-description">{content.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {content.primaryButtonVisible && <a href={content.primaryButtonUrl || '#contact'} className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5" data-testid="link-about-hero-primary">{content.primaryButtonLabel}<ArrowRight size={17} className="ml-2" /></a>}
            {content.secondaryButtonVisible && <a href={content.secondaryButtonUrl || '#contact'} className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10" data-testid="link-about-hero-secondary">{content.secondaryButtonLabel}</a>}
          </div>
          <div className="mt-12 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:grid-cols-4">
            {visibleStats.map((stat) => <div key={stat.id} className="min-h-28 bg-[hsl(var(--primary))] p-4 sm:p-5"><p className="font-display text-3xl font-semibold text-[hsl(var(--accent))]" data-testid={`text-about-stat-value-${stat.displayOrder}`}>{stat.value}</p><p className="mt-2 text-xs leading-5 text-white/60">{stat.label}</p></div>)}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl pb-8 lg:pb-0">
          <div className="aspect-[.86] overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/30">
            <MediaOrFallback src={content.mainImageUrl} alt={content.mainImageAltText} label="Sahasara learning together" dark />
          </div>
          <div className="absolute -bottom-1 left-4 right-4 rounded-2xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--background))] p-5 text-[hsl(var(--primary))] shadow-2xl sm:left-10 sm:right-10 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">{content.floatingLabel}</p><p className="mt-2 font-display text-3xl font-semibold">{content.floatingAcademicYear}</p></div>
              {content.floatingImageUrl ? <img src={content.floatingImageUrl} alt={content.floatingImageAltText} className="h-12 w-12 rounded-full object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--accent-foreground))]"><CalendarDays size={20} /></div>}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={16} className="text-emerald-700" />{content.floatingAvailabilityText}</p>
            <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{content.floatingSupportingText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OurStorySection({ content }: { content: AboutStory }) {
  const timeline = content.timelineItems.filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasEntered) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <section ref={sectionRef} id="our-story" className={`story-section px-6 py-24 lg:px-10 lg:py-32 ${hasEntered ? 'story-is-visible' : ''}`} style={{ '--story-duration': `${Math.max(timeline.length, 1) * 780}ms` } as React.CSSProperties}>
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.78fr_1fr_.9fr] lg:items-center lg:gap-12">
        <div className="story-copy">
          <div className="story-reveal story-reveal-eyebrow"><SectionEyebrow>{content.eyebrow}</SectionEyebrow></div>
          <h2 className="story-reveal story-reveal-heading mt-5 max-w-md font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-about-story-heading">{content.heading}</h2>
          <p className="story-reveal story-reveal-description mt-7 max-w-md text-[15px] leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-about-story-description">{content.description}</p>
          {content.buttonLabel && <a href={content.buttonHref || '#our-story'} className="story-reveal story-reveal-button group mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" data-testid="link-about-story">{content.buttonLabel}<ArrowRight size={17} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" /></a>}
        </div>
        <StoryCollage content={content} hasEntered={hasEntered} />
        <div id="our-story-timeline" className="relative" aria-label="Sahasara story timeline">
          <div className="story-timeline-line absolute bottom-3 left-[9px] top-3 w-px bg-[hsl(var(--border))]" aria-hidden="true"><div className="story-timeline-progress" /></div>
          <div className="space-y-8">
            {timeline.map((item, index) => <article key={item.id} className="story-timeline-item relative pl-9" style={{ '--story-delay': `${index * 780}ms` } as React.CSSProperties}><span className="story-timeline-marker absolute left-0 top-1.5 h-[19px] w-[19px] rounded-full border-[5px] border-[hsl(var(--background))] bg-[hsl(var(--accent))] shadow-[0_0_0_1px_hsl(var(--accent)/.35)]" aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">{item.period}</p><h3 className="story-timeline-title mt-2 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryCollage({ content, hasEntered }: { content: AboutStory; hasEntered: boolean }) {
  return (
    <div className={`story-collage relative mx-auto w-full max-w-md ${hasEntered ? 'story-collage-is-visible' : ''}`}>
      <div className="story-collage-card story-collage-main overflow-hidden rounded-[1.75rem] bg-[hsl(var(--secondary))] shadow-xl"><MediaOrFallback src={content.mainImage} alt={content.mainImageAltText} label="A shared beginning" /></div>
      <div className="story-collage-card story-collage-secondary overflow-hidden rounded-[1.5rem] border-8 border-[hsl(var(--background))] bg-[hsl(var(--card))] shadow-xl"><MediaOrFallback src={content.secondaryImage} alt={content.secondaryImageAltText} label="Learning together" /></div>
      <div className="story-collage-card story-collage-third overflow-hidden rounded-xl border-4 border-[hsl(var(--background))] bg-[hsl(var(--primary))] shadow-lg"><MediaOrFallback src={content.thirdImage} alt={content.thirdImageAltText} label="Looking ahead" dark /></div>
    </div>
  );
}

function ChairmanMessageSection({ content }: { content: AboutChairmanMessage }) {
  return (
    <section id="chairman-message" className="bg-[hsl(var(--secondary))] px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
        <div className="relative mx-auto w-full max-w-md pl-5 pt-5">
          <div className="absolute inset-0 rounded-[2rem] bg-[hsl(var(--accent)/.55)]" aria-hidden="true" />
          <div className="relative aspect-[.82] overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))] shadow-xl">
            <MediaOrFallback src={content.portraitImage} alt={content.portraitAltText} label="Sahasara leadership" dark />
          </div>
        </div>
        <div className="max-w-2xl">
          <Quote size={52} className="text-[hsl(var(--accent))]" aria-hidden="true" />
          <SectionEyebrow className="mt-7">{content.eyebrow}</SectionEyebrow>
          <h2 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-chairman-heading">{content.heading}</h2>
          <p className="mt-7 text-lg leading-8 text-[hsl(var(--muted-foreground))]" data-testid="text-chairman-message">{content.message}</p>
          <div className="mt-8 border-t border-[hsl(var(--border))] pt-5"><p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{content.signatureName}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{content.role}</p></div>
          {content.buttonVisible && content.buttonLabel && <a href={content.buttonHref || '#contact'} className="mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5">{content.buttonLabel}<ArrowRight size={17} className="ml-2" /></a>}
        </div>
      </div>
    </section>
  );
}

const principleIcons: Record<string, LucideIcon> = { eye: Eye, target: Target, star: Star, sparkles: Sparkles, shield: ShieldCheck };
const benefitIcons: Record<string, LucideIcon> = {
  users: Users,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  'check-circle': CheckCircle2,
  'heart-handshake': HeartHandshake,
  'badge-check': BadgeCheck,
};

function useRevealOnce() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);
  return { ref, isVisible };
}

function GuidingPrinciplesSection({ content }: { content: AboutGuidingPrinciples }) {
  const { ref, isVisible } = useRevealOnce();
  const cards = [
    { icon: content.visionIcon, title: content.visionTitle, description: content.visionDescription, values: [] as string[] },
    { icon: content.missionIcon, title: content.missionTitle, description: content.missionDescription, values: [] as string[] },
    { icon: content.valuesIcon, title: content.valuesTitle, description: '', values: content.values.filter((value) => value.isVisible).sort((a, b) => a.displayOrder - b.displayOrder).map((value) => value.value) },
  ];
  return (
    <section ref={ref} id="guiding-principles" className={`about-next-section about-principles-section ${isVisible ? 'about-section-is-visible' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-2xl text-center"><SectionEyebrow>GUIDING PRINCIPLES</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = principleIcons[card.icon] || Sparkles;
            return <article key={card.title} className="principle-card about-reveal-card rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 text-center shadow-sm" style={{ '--about-card-delay': `${index * 110}ms` } as React.CSSProperties}><div className="principle-icon mx-auto grid h-16 w-16 place-items-center rounded-full border border-[hsl(var(--accent)/.25)] bg-[hsl(var(--secondary))] text-[hsl(var(--accent-foreground))]"><Icon size={27} strokeWidth={1.7} /></div><h3 className="principle-title mt-7 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{card.title}</h3>{card.values.length ? <ul className="mt-5 space-y-3 text-left text-sm leading-6 text-[hsl(var(--muted-foreground))]">{card.values.map((value) => <li key={value} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />{value}</li>)}</ul> : <p className="mt-5 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{card.description}</p>}</article>;
          })}
        </div>
      </div>
    </section>
  );
}

function WhyParentsChooseSection({ content }: { content: AboutWhyParentsChoose }) {
  const { ref, isVisible } = useRevealOnce();
  const benefits = content.benefits.filter((benefit) => benefit.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section ref={ref} id="why-parents-choose" className={`about-next-section about-benefits-section ${isVisible ? 'about-section-is-visible' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-2xl text-center"><SectionEyebrow>WHY SAHASARA</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div>
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {benefits.map((benefit, index) => {
            const Icon = benefitIcons[benefit.icon] || Sparkles;
            return <article key={benefit.id} tabIndex={0} className="benefit-item about-reveal-card group text-center outline-none" style={{ '--about-card-delay': `${index * 80}ms` } as React.CSSProperties}><div className="benefit-icon mx-auto grid h-16 w-16 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--primary))] transition duration-300 group-hover:border-[hsl(var(--accent))] group-hover:bg-[hsl(var(--accent))] group-hover:text-[hsl(var(--primary))] group-focus-visible:border-[hsl(var(--accent))] group-focus-visible:bg-[hsl(var(--accent))]"><Icon size={25} strokeWidth={1.7} /></div><h3 className="benefit-title mt-5 text-sm font-bold leading-5 text-[hsl(var(--primary))] transition-colors duration-300 group-hover:text-[hsl(var(--accent-foreground))] group-focus-visible:text-[hsl(var(--accent-foreground))]">{benefit.title}</h3>{benefit.description && <p className="benefit-description mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{benefit.description}</p>}</article>;
          })}
        </div>
      </div>
    </section>
  );
}

function LeadershipSection({ content }: { content: AboutLeadership }) {
  const { ref, isVisible } = useRevealOnce();
  const members = content.members.filter((member) => member.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section ref={ref} id="leadership" className={`about-next-section about-leadership-section ${isVisible ? 'about-section-is-visible' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-2xl text-center"><SectionEyebrow>OUR LEADERSHIP</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => <article key={member.id} tabIndex={0} className="leadership-card about-reveal-card group relative min-h-[390px] overflow-hidden rounded-[1.5rem] bg-[hsl(var(--primary))] shadow-lg outline-none" style={{ '--about-card-delay': `${index * 110}ms` } as React.CSSProperties}><div className="absolute inset-0">{member.portraitImage ? <img src={member.portraitImage} alt={member.portraitAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-focus-visible:scale-105" /> : <MediaOrFallback src={null} alt={member.portraitAltText} label={member.designation} dark />}</div><div className="leadership-overlay absolute inset-0" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><h3 className="font-display text-2xl font-semibold">{member.name}</h3><p className="mt-1 text-sm font-semibold text-white/75">{member.designation}</p><div className="leadership-details mt-5"><p className="text-sm font-bold text-[hsl(var(--accent))]">{member.qualification}</p><p className="mt-2 text-sm leading-6 text-white/75">{member.biography}</p>{member.socialUrl && <a href={member.socialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Connect <ArrowRight size={14} className="ml-2" /></a>}</div></div></article>)}
        </div>
      </div>
    </section>
  );
}

function MediaOrFallback({ src, alt, label, dark = false }: { src: string | null; alt: string; label: string; dark?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
  return <div className={`grid h-full w-full place-items-center p-8 text-center ${dark ? 'bg-[radial-gradient(circle_at_35%_25%,hsl(42_63%_60%/.32),transparent_35%),hsl(var(--primary))] text-white/70' : 'bg-[radial-gradient(circle_at_70%_20%,hsl(42_63%_60%/.45),transparent_30%),hsl(var(--secondary))] text-[hsl(var(--primary)/.65)]'}`}><div><BookOpen className="mx-auto mb-3 opacity-60" size={28} /><span className="text-xs font-bold uppercase tracking-[.16em]">{label}</span></div></div>;
}

function AboutSkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-[620px] rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="h-96 rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="h-96 rounded-[2rem] bg-[hsl(var(--muted))]" /></div></div>;
}