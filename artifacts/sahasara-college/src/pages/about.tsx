import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpen, Building2, CalendarDays, CheckCircle2, ChevronDown, Eye, FlaskConical, GraduationCap, HeartHandshake, House, Library, Mail, MapPin, MonitorPlay, Phone, Quote, ShieldCheck, Sparkles, Star, Stethoscope, Target, Trophy, Users, type LucideIcon } from 'lucide-react';
import {
  useGetAboutChairmanMessage,
  useGetAboutAchievements,
  useGetAboutAdmissionCta,
  useGetAboutCampusHighlights,
  useGetAboutFaq,
  useGetAboutHero,
  useGetAboutGuidingPrinciples,
  useGetAboutLeadership,
  useGetAboutStory,
  useGetAboutWhyParentsChoose,
  useGetSiteSettings,
  type AboutChairmanMessage,
  type AboutAchievements,
  type AboutAdmissionCta,
  type AboutCampusHighlights,
  type AboutFaq,
  type AboutHero,
  type AboutGuidingPrinciples,
  type AboutLeadership,
  type AboutStory,
  type AboutWhyParentsChoose,
} from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

type PublicSettings = {
  collegeName: string;
  tagline: string;
  logoUrl: string | null;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  footerText: string;
};

const fallbackSettings: PublicSettings = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'Your College Tagline',
  logoUrl: null,
  email: 'admissions@sahsrah.edu',
  phone: '+91 40 2458 0176',
  address: '18 Vidya Marg, Hyderabad, Telangana 500034',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  surfaceColor: DEFAULT_SURFACE_COLOR,
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
  const campusQuery = useGetAboutCampusHighlights();
  const achievementsQuery = useGetAboutAchievements();
  const faqQuery = useGetAboutFaq();
  const admissionCtaQuery = useGetAboutAdmissionCta();
  const settings = settingsQuery.data ?? fallbackSettings;
  const primaryColor = settings.primaryColor || DEFAULT_PRIMARY_COLOR;
  const accentColor = settings.accentColor || DEFAULT_ACCENT_COLOR;
  const surfaceColor = settings.surfaceColor || DEFAULT_SURFACE_COLOR;

  if (settingsQuery.isLoading || heroQuery.isLoading || storyQuery.isLoading || chairmanQuery.isLoading || principlesQuery.isLoading || parentChoiceQuery.isLoading || leadershipQuery.isLoading || campusQuery.isLoading || achievementsQuery.isLoading || faqQuery.isLoading || admissionCtaQuery.isLoading) {
    return <AboutSkeleton />;
  }

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={createPublicThemeStyle(primaryColor, accentColor, surfaceColor)}>
      <PublicHeader settings={settings} activePage="about" />
      <main>
        {heroQuery.data?.isVisible && <AboutHeroSection content={heroQuery.data} />}
        {storyQuery.data?.isVisible && <OurStorySection content={storyQuery.data} />}
        {chairmanQuery.data?.isVisible && <ChairmanMessageSection content={chairmanQuery.data} />}
        {principlesQuery.data?.isVisible && <GuidingPrinciplesSection content={principlesQuery.data} />}
        {parentChoiceQuery.data?.isVisible && <WhyParentsChooseSection content={parentChoiceQuery.data} />}
        {leadershipQuery.data?.isVisible && <LeadershipSection content={leadershipQuery.data} />}
        {campusQuery.data?.isVisible && <CampusHighlightsSection content={campusQuery.data} />}
        {achievementsQuery.data?.isVisible && <AchievementStatisticsSection content={achievementsQuery.data} />}
        {faqQuery.data?.isVisible && <FaqSection content={faqQuery.data} cta={admissionCtaQuery.data} settings={settings} />}
        {admissionCtaQuery.data?.isVisible && <AdmissionCtaSection content={admissionCtaQuery.data} />}
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
          <SectionEyebrow variant="dark" className="about-eyebrow">{content.eyebrow}</SectionEyebrow>
          <h1 className="mt-6 max-w-2xl font-display text-6xl font-semibold leading-[.91] tracking-[-.06em] md:text-7xl lg:text-[clamp(4.7rem,7vw,7.2rem)]" data-testid="text-about-hero-heading">{content.heading}</h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-white/70 md:text-lg" data-testid="text-about-hero-description">{content.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {content.primaryButtonVisible && <a href={content.primaryButtonUrl || '/contact'} className="group inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" data-testid="link-about-hero-primary">{content.primaryButtonLabel}<ArrowRight size={17} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" /></a>}
            {content.secondaryButtonVisible && <a href={content.secondaryButtonUrl || '/contact'} className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg" data-testid="link-about-hero-secondary">{content.secondaryButtonLabel}</a>}
          </div>
          <div className="mt-12 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:grid-cols-4">
            {visibleStats.map((stat) => <div key={stat.id} className="about-stat-card min-h-28 bg-[hsl(var(--primary))] p-4 sm:p-5"><p className="font-display text-3xl font-semibold text-[hsl(var(--accent))]" data-testid={`text-about-stat-value-${stat.displayOrder}`}>{stat.value}</p><p className="mt-2 text-xs leading-5 text-white/60">{stat.label}</p></div>)}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl pb-8 lg:pb-0">
            <div className="about-hero-image aspect-[.86] overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/30">
            <MediaOrFallback src={content.mainImageUrl} alt={content.mainImageAltText} label="Sahsrah learning together" dark />
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
      <section ref={sectionRef} id="our-story" className={`story-section px-6 py-24 lg:px-10 lg:py-32 ${hasEntered ? 'story-is-visible' : ''}`} style={{ '--story-duration': `${Math.max(timeline.length, 1) * 820}ms` } as React.CSSProperties}>
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.78fr_1fr_.9fr] lg:items-center lg:gap-12">
        <div className="story-copy">
          <div className="story-reveal story-reveal-eyebrow"><SectionEyebrow className="about-eyebrow">{content.eyebrow}</SectionEyebrow></div>
          <h2 className="story-reveal story-reveal-heading mt-5 max-w-md font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-about-story-heading">{content.heading}</h2>
          <p className="story-reveal story-reveal-description mt-7 max-w-md text-[15px] leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-about-story-description">{content.description}</p>
          {content.buttonLabel && <a href={content.buttonHref || '#our-story'} className="story-reveal story-reveal-button group mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" data-testid="link-about-story">{content.buttonLabel}<ArrowRight size={17} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" /></a>}
        </div>
        <StoryCollage content={content} hasEntered={hasEntered} />
        <div id="our-story-timeline" className="relative" aria-label="Sahsrah story timeline">
          <div className="story-timeline-list">
            {timeline.map((item, index) => <article key={item.id} className="story-timeline-item relative" style={{ '--story-delay': `${index * 820}ms` } as React.CSSProperties}>
              <span className="story-timeline-marker h-[21px] w-[21px] rounded-full border-[5px] border-[hsl(var(--background))] bg-[hsl(var(--accent))] shadow-[0_0_0_1px_hsl(var(--accent)/.35)]" aria-hidden="true" />
              {index < timeline.length - 1 && <span className="story-timeline-connector" aria-hidden="true"><span className="story-timeline-progress" /></span>}
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{item.period}</p>
                <h3 className="story-timeline-title mt-2 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p>
              </div>
            </article>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryCollage({ content, hasEntered }: { content: AboutStory; hasEntered: boolean }) {
  return (
      <div className={`story-collage relative mx-auto w-full max-w-md ${hasEntered ? 'story-collage-is-visible' : ''}`}>
      <div tabIndex={0} className="story-collage-card story-collage-main overflow-hidden rounded-[1.75rem] bg-[hsl(var(--secondary))] shadow-xl outline-none"><MediaOrFallback src={content.mainImage} alt={content.mainImageAltText} label="A shared beginning" /></div>
      <div tabIndex={0} className="story-collage-card story-collage-secondary overflow-hidden rounded-[1.5rem] border-8 border-[hsl(var(--background))] bg-[hsl(var(--card))] shadow-xl outline-none"><MediaOrFallback src={content.secondaryImage} alt={content.secondaryImageAltText} label="Learning together" /></div>
      <div tabIndex={0} className="story-collage-card story-collage-third overflow-hidden rounded-xl border-4 border-[hsl(var(--background))] bg-[hsl(var(--primary))] shadow-lg outline-none"><MediaOrFallback src={content.thirdImage} alt={content.thirdImageAltText} label="Looking ahead" dark /></div>
    </div>
  );
}

function ChairmanMessageSection({ content }: { content: AboutChairmanMessage }) {
  return (
    <section id="chairman-message" className="bg-[hsl(var(--secondary))] px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
        <div className="relative mx-auto w-full max-w-md pl-5 pt-5">
          <div className="absolute inset-0 rounded-[2rem] bg-[hsl(var(--accent)/.55)]" aria-hidden="true" />
          <div className="about-chairman-image relative aspect-[.82] overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))] shadow-xl">
            <MediaOrFallback src={content.portraitImage} alt={content.portraitAltText} label="Sahsrah leadership" dark />
          </div>
        </div>
        <div className="max-w-2xl">
          <Quote size={52} className="text-[hsl(var(--accent))]" aria-hidden="true" />
          <SectionEyebrow className="about-eyebrow mt-7">{content.eyebrow}</SectionEyebrow>
          <h2 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-chairman-heading">{content.heading}</h2>
          <p className="mt-7 text-lg leading-8 text-[hsl(var(--muted-foreground))]" data-testid="text-chairman-message">{content.message}</p>
          <div className="mt-8 border-t border-[hsl(var(--border))] pt-5"><p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{content.signatureName}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{content.role}</p></div>
          {content.buttonVisible && content.buttonLabel && <a href={content.buttonHref || '/contact'} className="group mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">{content.buttonLabel}<ArrowRight size={17} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" /></a>}
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
        <div className="mx-auto max-w-2xl text-center"><SectionEyebrow className="about-eyebrow about-eyebrow-centered">GUIDING PRINCIPLES</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div>
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
        <div className="mx-auto max-w-2xl text-center"><SectionEyebrow className="about-eyebrow about-eyebrow-centered">WHY SAHSRAH</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div>
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {benefits.map((benefit, index) => {
            const Icon = benefitIcons[benefit.icon] || Sparkles;
            return <article key={benefit.id} tabIndex={0} className="benefit-item about-reveal-card group text-center outline-none" style={{ '--about-card-delay': `${index * 80}ms` } as React.CSSProperties}><div className="benefit-icon mx-auto grid h-16 w-16 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--primary))] transition duration-300 group-hover:border-[hsl(var(--accent))] group-hover:bg-[hsl(var(--accent))] group-hover:text-[hsl(var(--primary))] group-focus-visible:border-[hsl(var(--accent))] group-focus-visible:bg-[hsl(var(--accent))]"><Icon size={25} strokeWidth={1.7} /></div><h3 className="benefit-title mt-5 text-sm font-bold leading-5 text-[hsl(var(--primary))] transition-colors duration-300 group-hover:text-[hsl(var(--primary))] group-focus-visible:text-[hsl(var(--primary))]">{benefit.title}</h3>{benefit.description && <p className="benefit-description mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{benefit.description}</p>}</article>;
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
        <div className="mx-auto max-w-2xl text-center"><SectionEyebrow className="about-eyebrow about-eyebrow-centered">OUR LEADERSHIP</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => <article key={member.id} tabIndex={0} className="leadership-card about-reveal-card group relative min-h-[390px] overflow-hidden rounded-[1.5rem] bg-[hsl(var(--primary))] shadow-lg outline-none" style={{ '--about-card-delay': `${index * 110}ms` } as React.CSSProperties}><div className="absolute inset-0">{member.portraitImage ? <img src={member.portraitImage} alt={member.portraitAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-focus-visible:scale-105" /> : <MediaOrFallback src={null} alt={member.portraitAltText} label={member.designation} dark />}</div><div className="leadership-overlay absolute inset-0" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><h3 className="font-display text-2xl font-semibold">{member.name}</h3><p className="mt-1 text-sm font-semibold text-white/75">{member.designation}</p><div className="leadership-details mt-5"><p className="text-sm font-bold text-[hsl(var(--accent))]">{member.qualification}</p><p className="mt-2 text-sm leading-6 text-white/75">{member.biography}</p>{member.socialUrl && <a href={member.socialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Connect <ArrowRight size={14} className="ml-2" /></a>}</div></div></article>)}
        </div>
      </div>
    </section>
  );
}

const campusIcons: Record<string, LucideIcon> = {
  'building-2': Building2,
  'flask-conical': FlaskConical,
  'monitor-play': MonitorPlay,
  library: Library,
  house: House,
  trophy: Trophy,
};

const achievementIcons: Record<string, LucideIcon> = {
  'calendar-days': CalendarDays,
  users: Users,
  'graduation-cap': GraduationCap,
  stethoscope: Stethoscope,
  'heart-handshake': HeartHandshake,
  'badge-check': BadgeCheck,
};

function CampusHighlightsSection({ content }: { content: AboutCampusHighlights }) {
  const { ref, isVisible } = useRevealOnce();
  const highlights = content.highlights.filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section ref={ref} id="campus-highlights" className={`about-campus-section ${isVisible ? 'about-section-is-visible' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="max-w-2xl"><SectionEyebrow className="about-eyebrow">CAMPUS LIFE</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-campus-highlights-heading">{content.heading}</h2><p className="mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = campusIcons[item.icon || ''] || Sparkles;
            return <article key={item.id} tabIndex={0} className="campus-highlight-card group relative min-h-[300px] overflow-hidden rounded-[1.5rem] bg-[hsl(var(--primary))] shadow-lg outline-none" style={{ '--about-card-delay': `${index * 85}ms` } as React.CSSProperties}>
              <div className="absolute inset-0">{item.imageUrl ? <img src={item.imageUrl} alt={item.imageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-focus-visible:scale-105" /> : <MediaOrFallback src={null} alt={item.imageAltText} label={item.title} dark />}</div>
              <div className="campus-highlight-overlay absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white"><div className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/10 text-[hsl(var(--accent))] transition duration-300 group-hover:scale-105 group-hover:bg-[hsl(var(--accent))] group-hover:text-[hsl(var(--primary))] group-focus-visible:scale-105"><Icon size={21} /></div><h3 className="mt-5 font-display text-2xl font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/72">{item.description}</p></div>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}

function useCountUp(target: number, isVisible: boolean, delay: number) {
  const [value, setValue] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    if (reducedMotion || target === 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const startedAt = performance.now() + delay;
    const duration = 1100;
    const tick = (now: number) => {
      if (now < startedAt) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [delay, isVisible, reducedMotion, target]);
  return reducedMotion ? target : value;
}

function AchievementStatistic({ target, suffix, label, icon, index, isVisible }: { target: number; suffix: string; label: string; icon: string | null; index: number; isVisible: boolean }) {
  const value = useCountUp(target, isVisible, index * 100);
  const Icon = achievementIcons[icon || ''] || Sparkles;
  return <article className="achievement-stat about-reveal-card" style={{ '--about-card-delay': `${index * 100}ms` } as React.CSSProperties}><Icon size={21} className="text-[hsl(var(--accent))]" aria-hidden="true" /><p className="mt-5 font-display text-4xl font-semibold tracking-[-.04em] text-white md:text-5xl">{value.toLocaleString('en-IN')}{suffix}</p><p className="mt-2 text-xs font-bold uppercase tracking-[.15em] text-white/58">{label}</p></article>;
}

function AchievementStatisticsSection({ content }: { content: AboutAchievements }) {
  const { ref, isVisible } = useRevealOnce();
  const statistics = content.statistics.filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  return <section ref={ref} id="achievement-statistics" className={`achievement-band ${isVisible ? 'about-section-is-visible' : ''}`}><div className="achievement-band-texture" aria-hidden="true" /><div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24"><div className="mx-auto max-w-2xl text-center"><SectionEyebrow variant="dark" className="about-eyebrow">OUR IMPACT</SectionEyebrow><h2 className="mt-5 font-display text-4xl font-semibold leading-none tracking-[-.04em] text-white md:text-5xl">{content.heading}</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/62">{content.description}</p></div><div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6">{statistics.map((statistic, index) => <AchievementStatistic key={statistic.id} target={statistic.numericTarget} suffix={statistic.suffix} label={statistic.label} icon={statistic.icon} index={index} isVisible={isVisible} />)}</div></div></section>;
}

function FaqSection({ content, cta, settings }: { content: AboutFaq; cta?: AboutAdmissionCta; settings: PublicSettings }) {
  const { ref, isVisible } = useRevealOnce();
  const questions = content.questions.filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const [openId, setOpenId] = useState<string | null>(questions[0]?.id ?? null);
  const phone = cta?.admissionPhone && !cta.admissionPhone.includes('XXXXX') ? cta.admissionPhone : settings.phone;
  return <section ref={ref} id="faq" className={`about-faq-section ${isVisible ? 'about-section-is-visible' : ''}`}><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="mx-auto max-w-2xl text-center"><SectionEyebrow className="about-eyebrow about-eyebrow-centered">NEED TO KNOW</SectionEyebrow><h2 className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-faq-heading">{content.heading}</h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p></div><div className="mt-14 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-start"><div className="space-y-3">{questions.map((item, index) => { const open = openId === item.id; return <div key={item.id} className={`faq-item about-reveal-card rounded-2xl border bg-[hsl(var(--card))] ${open ? 'border-[hsl(var(--accent)/.65)] shadow-md' : 'border-[hsl(var(--border))]'}`} style={{ '--about-card-delay': `${index * 75}ms` } as React.CSSProperties}><button type="button" aria-expanded={open} aria-controls={`faq-answer-${item.id}`} onClick={() => setOpenId(open ? null : item.id)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left text-base font-bold text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] md:px-6"><span>{item.question}</span><ChevronDown size={19} className={`shrink-0 text-[hsl(var(--accent-foreground))] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} /></button><div id={`faq-answer-${item.id}`} role="region" aria-hidden={!open} className={`faq-answer grid transition-[grid-template-rows,opacity] duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 overflow-hidden"><p className="border-t border-[hsl(var(--border))] px-5 py-5 text-sm leading-7 text-[hsl(var(--muted-foreground))] md:px-6">{item.answer}</p></div></div></div>; })}</div><aside className="faq-contact-card rounded-[1.5rem] bg-[hsl(var(--primary))] p-7 text-white shadow-xl md:p-9"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><Phone size={21} /></div><p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]">Admissions help</p><h3 className="mt-3 font-display text-3xl font-semibold leading-tight">{cta?.counselorButtonLabel ? 'Still Have Questions?' : 'Talk with our admissions team.'}</h3><p className="mt-4 text-sm leading-7 text-white/68">Our admission experts are here to help you compare programs, plan a campus visit, and take the next step.</p><div className="mt-7 space-y-4 border-t border-white/15 pt-6 text-sm text-white/75"><a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-3 transition hover:text-white"><Phone size={17} className="text-[hsl(var(--accent))]" />{phone}</a><div className="flex items-center gap-3"><MapPin size={17} className="text-[hsl(var(--accent))]" />{cta?.workingHours || 'Monday–Saturday, 9:00–16:30'}</div><a href={`mailto:${settings.email}`} className="flex items-center gap-3 transition hover:text-white"><Mail size={17} className="text-[hsl(var(--accent))]" />{settings.email}</a></div><a href={cta?.counselorButtonHref || `mailto:${settings.email}`} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]">{cta?.counselorButtonLabel || 'Talk to Admission Counselor'}<ArrowRight size={16} className="ml-2" /></a></aside></div></div></section>;
}

function AdmissionCtaSection({ content }: { content: AboutAdmissionCta }) {
  const { ref, isVisible } = useRevealOnce();
  return <section ref={ref} id="admission-cta" className={`admission-cta-section ${isVisible ? 'about-section-is-visible' : ''}`}><div className="admission-cta-image absolute inset-0" style={content.backgroundImage ? { backgroundImage: `url("${content.backgroundImage}")` } : undefined} aria-label={content.backgroundImageAltText} /><div className="admission-cta-overlay absolute inset-0" /><div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:px-10 lg:py-32"><SectionEyebrow variant="dark" className="about-eyebrow">ADMISSIONS 2026–27</SectionEyebrow><h2 className="mt-6 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-white md:text-6xl" data-testid="text-admission-cta-heading">{content.heading}</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70">{content.supportingText}</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap"><a href={content.applyButtonHref} className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]">{content.applyButtonLabel}<ArrowRight size={16} className="ml-2" /></a><a href={content.campusVisitButtonHref} className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30">{content.campusVisitButtonLabel}</a><a href={content.prospectusButtonHref} className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30">{content.prospectusButtonLabel}</a></div></div></section>;
}

function MediaOrFallback({ src, alt, label, dark = false }: { src: string | null; alt: string; label: string; dark?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
  return <div className={`grid h-full w-full place-items-center p-8 text-center ${dark ? 'bg-[radial-gradient(circle_at_35%_25%,hsl(42_63%_60%/.32),transparent_35%),hsl(var(--primary))] text-white/70' : 'bg-[radial-gradient(circle_at_70%_20%,hsl(42_63%_60%/.45),transparent_30%),hsl(var(--secondary))] text-[hsl(var(--primary)/.65)]'}`}><div><BookOpen className="mx-auto mb-3 opacity-60" size={28} /><span className="text-xs font-bold uppercase tracking-[.16em]">{label}</span></div></div>;
}

function AboutSkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-[620px] rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="h-96 rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="h-96 rounded-[2rem] bg-[hsl(var(--muted))]" /></div></div>;
}