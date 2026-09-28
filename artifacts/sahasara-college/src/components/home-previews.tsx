import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Quote, Star, Trophy } from 'lucide-react';
import type {
  HomepageAchievementRibbon,
  HomepageFacultyMember,
  HomepageGalleryItem,
  HomepageResults,
  HomepageTestimonials,
} from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { FacultyProfileCard } from '@/components/faculty-profile-card';

export const fallbackRibbon: HomepageAchievementRibbon = {
  id: 'fallback-ribbon',
  isVisible: true,
  sortOrder: 7,
  updatedAt: '2026-06-15T00:00:00.000Z',
  phrases: [
    { id: 'ribbon-1', phrase: 'Best NEET Preparation', displayOrder: 1, isActive: true, accentColor: '#D6AD59', separatorStyle: 'star' },
    { id: 'ribbon-2', phrase: 'Excellence', displayOrder: 2, isActive: true, accentColor: '#FFFFFF', separatorStyle: 'dot' },
    { id: 'ribbon-3', phrase: 'Discipline', displayOrder: 3, isActive: true, accentColor: '#75C7B5', separatorStyle: 'star' },
    { id: 'ribbon-4', phrase: 'Dedication', displayOrder: 4, isActive: true, accentColor: '#FFFFFF', separatorStyle: 'dot' },
    { id: 'ribbon-5', phrase: 'Top IIT-JEE Coaching', displayOrder: 5, isActive: true, accentColor: '#D6AD59', separatorStyle: 'star' },
  ],
};

export const fallbackTestimonials: HomepageTestimonials = {
  id: 'fallback-testimonials',
  eyebrow: 'What Parents & Students Say',
  heading: 'Real Stories of Success',
  description: 'Real stories from the KVR Junior College family.',
  isVisible: true,
  sortOrder: 8,
  updatedAt: '2026-06-15T00:00:00.000Z',
  testimonials: [
    { id: 'testimonial-1', rating: 5, quote: 'The regular feedback and personal attention gave our daughter the confidence to keep improving without feeling overwhelmed.', personName: 'Mrs. Lakshmi Rao', role: 'Parent', courseAchievement: 'BiPC · NEET 2025', avatarImageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Parent from the KVR college community', accentColor: '#D6AD59', displayOrder: 1, isActive: true },
    { id: 'testimonial-2', rating: 5, quote: 'Every subject became clearer because our teachers made time for questions. I learned how to prepare with a steady routine.', personName: 'Rohan Mehta', role: 'Student', courseAchievement: 'MPC · IIT-JEE 2025', avatarImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Student from the KVR college community', accentColor: '#2E8C7B', displayOrder: 2, isActive: true },
    { id: 'testimonial-3', rating: 5, quote: 'We chose KVR for the combination of discipline and care. The transition to junior college felt structured and genuinely supportive.', personName: 'Mr. Anil Kumar', role: 'Parent', courseAchievement: 'MPC · EAMCET 2025', avatarImageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Parent from the KVR college community', accentColor: '#17365D', displayOrder: 3, isActive: true },
    { id: 'testimonial-4', rating: 5, quote: 'The mentors helped me see the path ahead, then supported me with the practice and patience to walk it.', personName: 'Nandini Shah', role: 'Alumni', courseAchievement: 'NEET · 2024', avatarImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Alumna from the KVR college community', accentColor: '#C26D3E', displayOrder: 4, isActive: true },
  ],
};

export const fallbackGallery: HomepageGalleryItem[] = [
  { id: 'gallery-1', imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85', imageAltText: 'Bright KVR college classroom', title: 'Learning spaces with purpose', category: 'Campus Feature', description: 'Comfortable classrooms designed for focused daily learning.', locationLabel: 'Academic Block', displayOrder: 1, isFeatured: true, isActive: true },
  { id: 'gallery-2', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85', imageAltText: 'Students working in a KVR science laboratory', title: 'Curiosity in practice', category: 'Labs', description: 'Practical experiences that help concepts become clearer.', locationLabel: 'Science Labs', displayOrder: 2, isFeatured: true, isActive: true },
  { id: 'gallery-3', imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85', imageAltText: 'Quiet KVR library and study area', title: 'Room to read and grow', category: 'Library', description: 'Calm spaces for revision, reading, and independent discovery.', locationLabel: 'Central Library', displayOrder: 3, isFeatured: true, isActive: true },
];

export function HomeResults({ content }: { content: HomepageResults }) {
  const results = content.results.filter((result) => result.isPublished && result.showInHomePreview).sort((a, b) => a.homePreviewOrder - b.homePreviewOrder);
  if (!content.isVisible) return null;
  return (
    <section id="home-results" className="home-preview-section overflow-hidden bg-[hsl(var(--secondary))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-results-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow className="about-eyebrow">{content.eyebrow}</SectionEyebrow>
            <h2 id="home-results-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p>
          </div>
          <a href="/results" className="group inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]" data-testid="link-home-results">{content.viewAllButtonLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.length > 0
            ? results.map((result, index) => <ResultCard key={result.id} result={result} index={index} />)
            : <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-10 text-center sm:col-span-2 lg:col-span-4"><p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">Student achievements will appear here once they’re published and selected for the Home preview.</p></div>}
        </div>
      </div>
    </section>
  );
}

function ResultCard({ result, index }: { result: HomepageResults['results'][number]; index: number }) {
  return (
    <article className="home-reveal group relative overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl focus-within:-translate-y-2" style={{ '--home-card-delay': `${index * 80}ms`, '--result-accent': result.accentColor || '#D6AD59' } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--primary))] text-lg font-bold text-[hsl(var(--accent))]">
          {result.studentImageUrl ? <img src={result.studentImageUrl} alt={result.studentImageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /> : result.studentName.split(' ').map((word) => word[0]).join('').slice(0, 2)}
        </div>
        <span className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]" style={{ borderColor: 'color-mix(in srgb, var(--result-accent) 40%, transparent)', color: 'var(--result-accent)' }}>{result.resultLabel}</span>
      </div>
      <p className="mt-6 text-[10px] font-bold uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">{result.examCourse}</p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{result.studentName}</h3>
      <div className="mt-6 border-t border-[hsl(var(--border))] pt-5">
        <p className="font-display text-4xl font-semibold tracking-[-.04em]" style={{ color: 'var(--result-accent)' }}>{result.score}</p>
        <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">{result.achievement}</p>
        {(result.examName || result.year) && <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{[result.examName, result.year].filter(Boolean).join(' · ')}</p>}
      </div>
    </article>
  );
}

export function AchievementRibbon({ content }: { content: HomepageAchievementRibbon }) {
  const phrases = content.phrases.filter((phrase) => phrase.isActive);
  if (!phrases.length) return null;
  const items = [...phrases, ...phrases];
  return (
    <section className="home-ribbon overflow-hidden bg-[hsl(var(--primary))] text-white" aria-label="KVR achievements">
      <div className="home-marquee" tabIndex={0}>
        <div className="home-marquee-track">
          {items.map((phrase, index) => <span key={`${phrase.id}-${index}`} className="inline-flex shrink-0 items-center gap-8 px-8 text-xs font-bold uppercase tracking-[.2em]" style={{ color: phrase.accentColor || '#FFFFFF' }}>
            {phrase.phrase}
            <span className="text-[hsl(var(--accent))]" aria-hidden="true">{phrase.separatorStyle === 'dot' ? '•' : '✦'}</span>
          </span>)}
        </div>
      </div>
    </section>
  );
}

export function HomeTestimonials({ content }: { content: HomepageTestimonials }) {
  const testimonials = content.testimonials.filter((testimonial) => testimonial.isActive);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const getCardStep = () => {
    const container = carouselRef.current;
    const card = container?.querySelector<HTMLElement>('[data-testimonial-slide]');
    return card ? card.offsetWidth + 16 : container?.clientWidth ?? 0;
  };
  const move = (direction: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const step = getCardStep();
    const next = container.scrollLeft + step * direction;
    const atEnd = direction > 0 && next + container.clientWidth >= container.scrollWidth - 8;
    const atStart = direction < 0 && next <= 0;
    container.scrollTo({ left: atEnd ? 0 : atStart ? Math.max(0, container.scrollWidth - container.clientWidth) : Math.max(0, next), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    if (paused || reducedMotion || testimonials.length < 2) return;
    const timer = window.setInterval(() => move(1), 6500);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, testimonials.length]);

  if (!testimonials.length) return null;
  return (
    <section id="home-testimonials" className="overflow-hidden bg-[hsl(var(--background))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-testimonials-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow className="about-eyebrow about-eyebrow-centered">{content.eyebrow}</SectionEyebrow>
          <h2 id="home-testimonials-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p>
        </div>
        <div className="mt-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}>
          <div ref={carouselRef} className="overflow-x-auto scrollbar-none" role="region" aria-roledescription="carousel" aria-label="Stories from parents and students" onScroll={(event) => { const step = getCardStep(); setSelectedIndex(step ? Math.min(testimonials.length - 1, Math.round(event.currentTarget.scrollLeft / step)) : 0); }}>
            <div className="flex gap-4">
              {testimonials.map((testimonial, index) => <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />)}
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between gap-4">
            <div className="flex gap-1.5" aria-label="Testimonial position">{testimonials.map((testimonial, index) => <button key={testimonial.id} type="button" aria-label={`Go to testimonial from ${testimonial.personName}`} aria-current={selectedIndex === index} onClick={() => carouselRef.current?.scrollTo({ left: getCardStep() * index, behavior: reducedMotion ? 'auto' : 'smooth' })} className="grid h-10 w-10 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"><span aria-hidden="true" className={`block h-1.5 rounded-full transition-all ${selectedIndex === index ? 'w-8 bg-[hsl(var(--accent))]' : 'w-1.5 bg-[hsl(var(--primary))]'}`} /></button>)}</div>
            <div className="flex gap-2"><button type="button" aria-label="Previous testimonial" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]"><ChevronLeft size={18} /></button><button type="button" aria-label="Next testimonial" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]"><ChevronRight size={18} /></button></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: HomepageTestimonials['testimonials'][number]; index: number }) {
  const details = [testimonial.role, testimonial.courseAchievement].filter((value) => value.trim());
  return (
    <article
      data-testimonial-slide
      className="home-reveal min-w-0 flex-[0_0_88%] rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-lg sm:flex-[0_0_56%] lg:flex-[0_0_calc((100%-2rem)/3)]"
      style={{ '--home-card-delay': `${index * 80}ms`, borderBottomColor: testimonial.accentColor || undefined } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-4">
        {testimonial.rating !== null && <div className="flex gap-1 text-[hsl(var(--accent))]" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: testimonial.rating }).map((_, starIndex) => <Star key={starIndex} size={15} fill="currentColor" />)}
        </div>}
        <Quote size={27} className="text-[hsl(var(--accent)/.5)]" />
      </div>
      <p className="mt-7 min-h-[120px] text-base leading-7 text-[hsl(var(--foreground))]">“{testimonial.quote}”</p>
      <div className="mt-7 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--accent))]">
          {testimonial.avatarImageUrl ? (
            <img src={testimonial.avatarImageUrl} alt={testimonial.avatarAltText || ''} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true">{testimonial.personName.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).join('').slice(0, 2)}</span>
          )}
        </div>
        <div>
          {testimonial.personName && <p className="text-sm font-bold text-[hsl(var(--primary))]">{testimonial.personName}</p>}
          {details.length > 0 && <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{details.join(' · ')}</p>}
        </div>
      </div>
    </article>
  );
}

export function HomeFaculty({ faculty, eyebrow = 'Learn From the Best', heading = 'Our Expert Faculty', description = 'Experienced subject-matter experts who make difficult ideas clearer and ambitious goals more achievable.', buttonLabel = 'More Faculty', buttonHref = '/faculty', themeStyle, unavailable = false }: { faculty: HomepageFacultyMember[]; eyebrow?: string; heading?: string; description?: string; buttonLabel?: string; buttonHref?: string; themeStyle?: CSSProperties; unavailable?: boolean }) {
  const members = faculty.filter((member) => member.isActive);
  if (!members.length && !unavailable) return null;
  return (
    <section id="home-faculty" className="overflow-hidden bg-[hsl(var(--secondary))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-faculty-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
           <div className="max-w-2xl"><SectionEyebrow className="about-eyebrow">{eyebrow}</SectionEyebrow><h2 id="home-faculty-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{heading}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{description}</p></div>
           <a href={buttonHref} className="group inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--card))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]">{buttonLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
        </div>
        {unavailable ? (
          <p role="status" className="mt-10 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-8 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Faculty profiles are temporarily unavailable. Please try again shortly.
          </p>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {members.map((member, index) => <FacultyProfileCard key={member.id} member={member} index={index} themeStyle={themeStyle} />)}
          </div>
        )}
      </div>
    </section>
  );
}

const HOME_GALLERY_AUTOPLAY_MS = 4000;
const HOME_GALLERY_CLONE_COUNT = 3;

export function HomeGallery({ gallery, eyebrow = 'Campus Gallery', heading = 'Life at Sahasrah College', description = 'A quick look at the spaces, routines, and experiences that shape the Sahasrah college day.', buttonLabel = 'View Gallery', buttonHref = '/gallery' }: { gallery: HomepageGalleryItem[]; eyebrow?: string; heading?: string; description?: string; buttonLabel?: string; buttonHref?: string }) {
  const items = gallery.filter((item) => item.isActive && item.isFeatured);
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollSettleTimerRef = useRef<number | null>(null);
  const wheelResumeTimerRef = useRef<number | null>(null);
  const touchResumeTimerRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const touchInteractionRef = useRef(false);
  const cloneCount = items.length >= 6 ? Math.min(HOME_GALLERY_CLONE_COUNT, items.length) : 0;
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [pointerPaused, setPointerPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [wheelPaused, setWheelPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const autoplayPaused = hoverPaused || focusPaused || pointerPaused || touchPaused || wheelPaused;

  const getCardStep = useCallback(() => {
    const viewport = carouselRef.current;
    const track = viewport?.firstElementChild as HTMLElement | null;
    const firstCard = track?.firstElementChild as HTMLElement | null;
    if (!viewport || !track || !firstCard) return viewport?.clientWidth ?? 0;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  }, []);

  const jumpToCard = useCallback((physicalIndex: number) => {
    const viewport = carouselRef.current;
    const step = getCardStep();
    if (!viewport || !step) return;
    const originalScrollBehavior = viewport.style.scrollBehavior;
    viewport.style.scrollBehavior = 'auto';
    viewport.scrollLeft = physicalIndex * step;
    if (originalScrollBehavior) viewport.style.scrollBehavior = originalScrollBehavior;
    else viewport.style.removeProperty('scroll-behavior');
  }, [getCardStep]);

  const move = useCallback((direction: number) => {
    const viewport = carouselRef.current;
    const step = getCardStep();
    if (!viewport || !step || items.length < 2) return;
    const nextLogicalIndex = currentIndexRef.current + direction;
    currentIndexRef.current = (nextLogicalIndex + items.length) % items.length;
    viewport.scrollTo({
      left: (cloneCount + nextLogicalIndex) * step,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [cloneCount, getCardStep, items.length, reducedMotion]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    currentIndexRef.current = 0;
    const frame = window.requestAnimationFrame(() => jumpToCard(cloneCount));
    return () => window.cancelAnimationFrame(frame);
  }, [cloneCount, items.length, jumpToCard]);

  useEffect(() => {
    const viewport = carouselRef.current;
    if (!viewport || items.length < 2) return;
    const observer = new ResizeObserver(() => {
      jumpToCard(cloneCount + currentIndexRef.current);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [cloneCount, items.length, jumpToCard]);

  useEffect(() => {
    if (autoplayPaused || reducedMotion || items.length < 2) return;
    const timer = window.setInterval(() => move(1), HOME_GALLERY_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplayPaused, items.length, move, reducedMotion]);

  useEffect(() => () => {
    if (scrollSettleTimerRef.current !== null) window.clearTimeout(scrollSettleTimerRef.current);
    if (wheelResumeTimerRef.current !== null) window.clearTimeout(wheelResumeTimerRef.current);
    if (touchResumeTimerRef.current !== null) window.clearTimeout(touchResumeTimerRef.current);
  }, []);

  const handleScroll = () => {
    if (scrollSettleTimerRef.current !== null) window.clearTimeout(scrollSettleTimerRef.current);
    scrollSettleTimerRef.current = window.setTimeout(() => {
      const viewport = carouselRef.current;
      const step = getCardStep();
      if (!viewport || !step || !items.length) return;
      const physicalIndex = Math.round(viewport.scrollLeft / step);
      const logicalIndex = physicalIndex - cloneCount;
      if (logicalIndex < 0 || logicalIndex >= items.length) {
        const wrappedIndex = (logicalIndex % items.length + items.length) % items.length;
        currentIndexRef.current = wrappedIndex;
        jumpToCard(cloneCount + wrappedIndex);
        return;
      }
      currentIndexRef.current = logicalIndex;
    }, 140);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    setFocusPaused(true);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
  };

  const pauseForWheel = () => {
    setWheelPaused(true);
    if (wheelResumeTimerRef.current !== null) window.clearTimeout(wheelResumeTimerRef.current);
    wheelResumeTimerRef.current = window.setTimeout(() => {
      wheelResumeTimerRef.current = null;
      setWheelPaused(false);
    }, 600);
  };

  const endTouchInteraction = () => {
    setPointerPaused(false);
    if (touchResumeTimerRef.current !== null) window.clearTimeout(touchResumeTimerRef.current);
    touchResumeTimerRef.current = window.setTimeout(() => {
      touchResumeTimerRef.current = null;
      touchInteractionRef.current = false;
      setTouchPaused(false);
    }, 600);
  };

  const leadingClones = cloneCount ? items.slice(items.length - cloneCount) : [];
  const gallerySlides = [
    ...leadingClones.map((item, index) => ({
      item,
      index: items.length - cloneCount + index,
      clone: true,
      key: `leading-${item.id}`,
    })),
    ...items.map((item, index) => ({ item, index, clone: false, key: item.id })),
    ...items.slice(0, cloneCount).map((item, index) => ({
      item,
      index,
      clone: true,
      key: `trailing-${item.id}`,
    })),
  ];

  if (!items.length) return null;
  return (
    <section id="home-gallery" className="overflow-hidden bg-[hsl(var(--background))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-gallery-heading">
      <div className="mx-auto max-w-7xl">
         <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div className="max-w-2xl"><SectionEyebrow className="about-eyebrow">{eyebrow}</SectionEyebrow><h2 id="home-gallery-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{heading}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{description}</p></div><a href={buttonHref} className="group inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]">{buttonLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a></div>
         <div
           className="mt-12"
           onPointerEnter={(event) => {
             if (event.pointerType !== 'touch') setHoverPaused(true);
           }}
           onPointerLeave={(event) => {
             if (event.pointerType !== 'touch') {
               setHoverPaused(false);
               setPointerPaused(false);
             }
           }}
           onFocusCapture={() => {
             if (!touchInteractionRef.current) setFocusPaused(true);
           }}
           onBlurCapture={(event) => {
             if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false);
           }}
         >
           <div
             ref={carouselRef}
             className="overflow-x-auto overscroll-x-contain scrollbar-none snap-x snap-mandatory"
             role="region"
             aria-label={heading}
             aria-roledescription="carousel"
             tabIndex={0}
             data-testid="carousel-home-gallery"
             onScroll={handleScroll}
             onKeyDown={handleKeyDown}
             onPointerDown={(event) => {
               if (event.pointerType === 'touch') {
                 touchInteractionRef.current = true;
                 setPointerPaused(false);
               } else {
                 setPointerPaused(true);
               }
             }}
             onPointerUp={() => setPointerPaused(false)}
             onPointerCancel={(event) => {
               setPointerPaused(false);
               if (event.pointerType === 'touch') endTouchInteraction();
             }}
             onTouchStart={() => {
               touchInteractionRef.current = true;
               setPointerPaused(false);
               setTouchPaused(true);
             }}
             onTouchEnd={endTouchInteraction}
             onTouchCancel={endTouchInteraction}
             onWheel={pauseForWheel}
           >
             <div className="flex gap-5">
               {gallerySlides.map(({ item, index, clone, key }) => (
                 <article
                   key={key}
                   data-home-gallery-slide=""
                   className="home-reveal group min-w-0 flex-[0_0_88%] snap-start overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1 sm:flex-[0_0_56%] md:flex-[0_0_calc((100%-2.5rem)/3)]"
                   tabIndex={clone ? -1 : 0}
                   aria-hidden={clone || undefined}
                   aria-roledescription="slide"
                   aria-label={clone ? undefined : `${index + 1} of ${items.length}`}
                   style={{ '--home-card-delay': `${index * 90}ms` } as React.CSSProperties}
                 >
                   <div className="relative aspect-[1.35] overflow-hidden bg-[hsl(var(--primary))]">
                     {item.imageUrl
                       ? <img src={item.imageUrl} alt={item.imageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                       : <div className="grid h-full place-items-center text-[hsl(var(--accent))]"><Trophy size={38} /></div>}
                     <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.55)] to-transparent opacity-70 transition group-hover:opacity-100" />
                   </div>
                   <div className="p-6">
                     <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">
                       <span>{item.category}</span>
                       {item.locationLabel && <span className="text-[hsl(var(--muted-foreground))]">{item.locationLabel}</span>}
                     </div>
                     <h3 className="mt-3 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.title}</h3>
                     <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p>
                   </div>
                 </article>
               ))}
             </div>
           </div>
         </div>
      </div>
    </section>
  );
}