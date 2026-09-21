import { useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Quote } from 'lucide-react';
import {
  useGetAboutChairmanMessage,
  useGetAboutHero,
  useGetAboutStory,
  useGetSiteSettings,
  type AboutChairmanMessage,
  type AboutHero,
  type AboutStory,
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
  const settings = settingsQuery.data ?? fallbackSettings;
  const primaryColor = settings.primaryColor || '#102846';
  const accentColor = settings.accentColor || '#D6AD59';

  if (settingsQuery.isLoading || heroQuery.isLoading || storyQuery.isLoading || chairmanQuery.isLoading) {
    return <AboutSkeleton />;
  }

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={{ '--site-primary': primaryColor, '--site-accent': accentColor } as React.CSSProperties}>
      <PublicHeader settings={settings} activePage="about" />
      <main>
        {heroQuery.data?.isVisible && <AboutHeroSection content={heroQuery.data} />}
        {storyQuery.data?.isVisible && <OurStorySection content={storyQuery.data} />}
        {chairmanQuery.data?.isVisible && <ChairmanMessageSection content={chairmanQuery.data} />}
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
  return (
    <section id="our-story" className="px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.78fr_1fr_.9fr] lg:items-center lg:gap-12">
        <div>
          <SectionEyebrow>{content.eyebrow}</SectionEyebrow>
          <h2 className="mt-5 max-w-md font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-about-story-heading">{content.heading}</h2>
          <p className="mt-7 max-w-md text-[15px] leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-about-story-description">{content.description}</p>
          {content.buttonLabel && <a href={content.buttonHref || '#our-story'} className="mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid="link-about-story">{content.buttonLabel}<ArrowRight size={17} className="ml-2" /></a>}
        </div>
        <StoryCollage content={content} />
        <div id="our-story-timeline" className="relative" aria-label="Sahasara story timeline">
          <div className="absolute bottom-3 left-[9px] top-3 w-px bg-[hsl(var(--border))]" aria-hidden="true" />
          <div className="space-y-8">
            {timeline.map((item) => <article key={item.id} className="relative pl-9"><span className="absolute left-0 top-1.5 h-[19px] w-[19px] rounded-full border-[5px] border-[hsl(var(--background))] bg-[hsl(var(--accent))] shadow-[0_0_0_1px_hsl(var(--accent)/.35)]" aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">{item.period}</p><h3 className="mt-2 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryCollage({ content }: { content: AboutStory }) {
  return (
    <div className="relative mx-auto min-h-[440px] w-full max-w-md">
      <div className="absolute left-0 top-0 h-[76%] w-[72%] overflow-hidden rounded-[1.75rem] bg-[hsl(var(--secondary))] shadow-xl"><MediaOrFallback src={content.mainImage} alt={content.mainImageAltText} label="A shared beginning" /></div>
      <div className="absolute bottom-0 right-0 h-[55%] w-[58%] overflow-hidden rounded-[1.5rem] border-8 border-[hsl(var(--background))] bg-[hsl(var(--card))] shadow-xl"><MediaOrFallback src={content.secondaryImage} alt={content.secondaryImageAltText} label="Learning together" /></div>
      <div className="absolute bottom-16 left-[34%] h-[29%] w-[35%] overflow-hidden rounded-xl border-4 border-[hsl(var(--background))] bg-[hsl(var(--primary))] shadow-lg"><MediaOrFallback src={content.thirdImage} alt={content.thirdImageAltText} label="Looking ahead" dark /></div>
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

function MediaOrFallback({ src, alt, label, dark = false }: { src: string | null; alt: string; label: string; dark?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
  return <div className={`grid h-full w-full place-items-center p-8 text-center ${dark ? 'bg-[radial-gradient(circle_at_35%_25%,hsl(42_63%_60%/.32),transparent_35%),hsl(var(--primary))] text-white/70' : 'bg-[radial-gradient(circle_at_70%_20%,hsl(42_63%_60%/.45),transparent_30%),hsl(var(--secondary))] text-[hsl(var(--primary)/.65)]'}`}><div><BookOpen className="mx-auto mb-3 opacity-60" size={28} /><span className="text-xs font-bold uppercase tracking-[.16em]">{label}</span></div></div>;
}

function AboutSkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-[620px] rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="h-96 rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="h-96 rounded-[2rem] bg-[hsl(var(--muted))]" /></div></div>;
}