import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { HomepageResult } from '@workspace/api-client-react';

function studentInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function visibleStoryCount() {
  if (typeof window === 'undefined') return 3;
  if (window.matchMedia('(max-width: 639px)').matches) return 1;
  if (window.matchMedia('(max-width: 1023px)').matches) return 2;
  return 3;
}

function StoryCard({ result, active, onStory }: { result: HomepageResult; active: boolean; onStory?: () => void }) {
  const examDetails = [result.examCourse, result.examName, result.year].filter((item): item is string => Boolean(item?.trim()));
  const story = result.story?.trim();

  if (!story) return null;

  return (
    <article
      data-story-card={result.id}
      aria-current={active ? 'true' : undefined}
      className={`flex h-full min-h-[264px] min-w-0 flex-col rounded-[1.35rem] border px-5 py-6 transition-[transform,opacity,border-color,box-shadow] duration-500 sm:px-6 sm:py-7 ${
        active
          ? 'scale-[1.015] border-[hsl(var(--accent)/.55)] bg-[hsl(var(--card))] opacity-100 shadow-[0_18px_42px_hsl(var(--background)/.25)]'
          : 'border-[hsl(var(--primary-foreground)/.14)] bg-[hsl(var(--primary-foreground)/.68)] opacity-80 shadow-[0_10px_28px_hsl(var(--background)/.14)]'
      } motion-reduce:transform-none motion-reduce:transition-none`}
    >
      <p className="min-w-0 flex-1 whitespace-pre-line break-words text-[13px] leading-[1.75] text-[hsl(var(--foreground)/.8)] sm:text-sm">
        {story}
      </p>
      <div className="mt-6 flex min-w-0 items-center gap-3.5 border-t border-[hsl(var(--primary)/.10)] pt-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[hsl(var(--accent)/.36)] bg-[hsl(var(--secondary))] font-display text-xs font-semibold tracking-wide text-[hsl(var(--primary))]">
          {result.studentImageUrl ? (
            <img
              src={result.studentImageUrl}
              alt={result.studentImageAltText || result.studentName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span aria-hidden="true">{studentInitials(result.studentName)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-[15px] font-semibold leading-tight tracking-[-.02em] text-[hsl(var(--primary))] [overflow-wrap:anywhere]">
            {result.studentName}
          </h3>
          {examDetails.length > 0 && (
            <p className="mt-1 break-words text-[11px] leading-4 text-[hsl(var(--muted-foreground))] [overflow-wrap:anywhere]">
              {examDetails.join(' · ')}
            </p>
          )}
        </div>
        {result.score?.trim() && (
          <p className="max-w-[38%] shrink-0 break-words text-right font-display text-sm font-semibold leading-tight text-[hsl(var(--destructive))] [overflow-wrap:anywhere]">
            {result.score}
          </p>
        )}
      </div>
      {onStory && (
        <button
          type="button"
          onClick={onStory}
          data-testid={`button-open-success-story-${result.id}`}
          className="mt-3 inline-flex min-h-9 w-fit items-center gap-1.5 rounded-md text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:text-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          Read story <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

export function ResultsSuccessStories({
  stories,
  onStory,
}: {
  stories: HomepageResult[];
  onStory?: (story: HomepageResult) => void;
}) {
  const results = stories.filter((result) => Boolean(result.story?.trim()));
  const railRef = useRef<HTMLDivElement>(null);
  const touchResumeRef = useRef<number | null>(null);
  const scrollResumeRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(visibleStoryCount);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const resize = () => setVisibleCount(visibleStoryCount());
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => setReducedMotion(motionQuery.matches);
    resize();
    motionChange();
    window.addEventListener('resize', resize);
    motionQuery.addEventListener('change', motionChange);
    return () => {
      window.removeEventListener('resize', resize);
      motionQuery.removeEventListener('change', motionChange);
    };
  }, []);

  useEffect(() => () => {
    if (touchResumeRef.current !== null) window.clearTimeout(touchResumeRef.current);
    if (scrollResumeRef.current !== null) window.clearTimeout(scrollResumeRef.current);
  }, []);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, results.length - 1)));
  }, [results.length]);

  const scrollToStory = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!results.length) return;
    const nextIndex = (index + results.length) % results.length;
    setActiveIndex(nextIndex);
    if (results.length <= visibleCount) return;
    const target = railRef.current?.querySelector<HTMLElement>(`[data-story-card="${CSS.escape(results[nextIndex].id)}"]`);
    if (!target || !railRef.current) return;
    const rail = railRef.current;
    const targetLeft = target.offsetLeft - rail.offsetLeft;
    programmaticScrollRef.current = true;
    if (scrollResumeRef.current !== null) window.clearTimeout(scrollResumeRef.current);
    rail.scrollTo({ left: targetLeft, behavior: reducedMotion ? 'auto' : behavior });
    scrollResumeRef.current = window.setTimeout(() => { programmaticScrollRef.current = false; }, reducedMotion ? 100 : 700);
  };

  const handleRailScroll = () => {
    const rail = railRef.current;
    if (!rail || results.length <= visibleCount || programmaticScrollRef.current) return;
    const railCenter = rail.scrollLeft + rail.clientWidth / 2;
    const cards = [...rail.querySelectorAll<HTMLElement>('[data-story-card]')];
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const currentDistance = Math.abs(center - railCenter);
      if (currentDistance < distance) {
        distance = currentDistance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  };

  useEffect(() => {
    const hasCarouselMotion = results.length > visibleCount || (results.length === 3 && visibleCount === 3);
    if (!hasCarouselMotion || reducedMotion || hovered || focused || touchPaused) return;
    const timer = window.setInterval(() => scrollToStory(activeIndex + 1), 5200);
    return () => window.clearInterval(timer);
  }, [activeIndex, focused, hovered, reducedMotion, results.length, touchPaused, visibleCount]);

  const pauseForTouch = () => {
    programmaticScrollRef.current = false;
    if (scrollResumeRef.current !== null) window.clearTimeout(scrollResumeRef.current);
    setTouchPaused(true);
    if (touchResumeRef.current !== null) window.clearTimeout(touchResumeRef.current);
  };

  const resumeAfterTouch = () => {
    if (touchResumeRef.current !== null) window.clearTimeout(touchResumeRef.current);
    touchResumeRef.current = window.setTimeout(() => setTouchPaused(false), 5000);
  };

  if (!stories.length || !results.length) return null;

  return (
    <section
      className="relative overflow-hidden bg-[hsl(var(--primary))] px-5 py-16 text-[hsl(var(--primary-foreground))] sm:px-8 sm:py-20 lg:px-10 lg:py-24"
      aria-labelledby="results-success-stories-heading"
      data-testid="results-success-stories"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 h-[26rem] w-[26rem] rounded-full border border-[hsl(var(--primary-foreground)/.08)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-20 h-[17rem] w-[17rem] rounded-full border border-[hsl(var(--accent)/.18)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[hsl(var(--accent))]">Student voices</p>
          <h2 id="results-success-stories-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.045em] text-[hsl(var(--primary-foreground))] sm:text-5xl">
            Success Stories
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[hsl(var(--primary-foreground)/.68)]">
            Hear from our students about their journey to success
          </p>
        </div>

        <div
          className="mt-9 sm:mt-11"
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              scrollToStory(activeIndex - 1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              scrollToStory(activeIndex + 1);
            }
          }}
          onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
          onPointerLeave={(event) => event.pointerType === 'mouse' && setHovered(false)}
          onFocusCapture={(event) => {
            if ((event.target as HTMLElement).matches(':focus-visible')) setFocused(true);
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
          onTouchStart={pauseForTouch}
          onTouchEnd={resumeAfterTouch}
          onTouchCancel={resumeAfterTouch}
        >
          <div
            ref={railRef}
            onScroll={handleRailScroll}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto sm:gap-4"
            aria-label="Student success stories"
            aria-roledescription="carousel"
            tabIndex={0}
          >
            {results.map((result, index) => (
              <div
                key={result.id}
                className="w-full shrink-0 snap-center sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
              >
                <StoryCard result={result} active={activeIndex === index} onStory={onStory ? () => onStory(result) : undefined} />
              </div>
            ))}
          </div>

          {results.length > 1 && <div className="mt-5 flex items-center justify-between gap-4">
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              Story {activeIndex + 1} of {results.length}
            </p>
            <div className="flex items-center gap-2" role="group" aria-label="Choose a success story">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => scrollToStory(index)}
                  aria-label={`Show story ${index + 1}`}
                  aria-current={activeIndex === index ? 'true' : undefined}
                  data-testid={`button-story-indicator-${result.id}`}
                  className={`h-2.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--primary))] ${activeIndex === index ? 'w-7 bg-[hsl(var(--primary-foreground))]' : 'w-2.5 bg-[hsl(var(--primary-foreground)/.38)] hover:bg-[hsl(var(--primary-foreground)/.72)]'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToStory(activeIndex - 1)}
                aria-label="Previous success story"
                data-testid="button-previous-success-story"
                className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--primary-foreground)/.28)] bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--primary-foreground))] transition hover:border-[hsl(var(--primary-foreground)/.65)] hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--primary))]"
              >
                <ArrowLeft size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollToStory(activeIndex + 1)}
                aria-label="Next success story"
                data-testid="button-next-success-story"
                className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--primary-foreground)/.28)] bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--primary-foreground))] transition hover:border-[hsl(var(--primary-foreground)/.65)] hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--primary))]"
              >
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
}

export function ResultsContactCta({
  heading,
  description,
  primaryLabel,
  secondaryLabel,
  primaryHref,
  secondaryHref,
}: {
  heading: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  secondaryHref: string;
}) {
  return (
    <section className="bg-[hsl(var(--background))] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20" aria-labelledby="results-contact-heading">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-[hsl(var(--secondary))] px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[30px] border-[hsl(var(--accent)/.12)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--destructive))]">Your next chapter</p>
            <h2 id="results-contact-heading" className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-.045em] text-[hsl(var(--primary))] sm:text-4xl lg:text-[2.7rem]">
              {heading}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:text-base sm:leading-7">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href={primaryHref}
              data-testid="link-results-contact-primary"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_22px_hsl(var(--primary)/.16)] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--secondary))] motion-reduce:transform-none motion-reduce:transition-none"
            >
              {primaryLabel} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              href={secondaryHref}
              data-testid="link-results-contact-secondary"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[hsl(var(--primary)/.25)] bg-[hsl(var(--card)/.58)] px-6 text-sm font-bold text-[hsl(var(--primary))] transition hover:border-[hsl(var(--primary)/.55)] hover:bg-[hsl(var(--card))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--secondary))] motion-reduce:transition-none"
            >
              {secondaryLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}