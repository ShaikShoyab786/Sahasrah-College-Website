import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Sparkles } from 'lucide-react';
import type { HomepageHeroSlide } from '@workspace/api-client-react';

type HeroCarouselProps = {
  slides: HomepageHeroSlide[];
};

const fallbackGradients = [
  'bg-[radial-gradient(circle_at_72%_22%,hsl(var(--accent)/.38),transparent_34%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.78))]',
  'bg-[radial-gradient(circle_at_24%_28%,hsl(var(--accent)/.55),transparent_38%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.78))]',
  'bg-[radial-gradient(circle_at_78%_72%,hsl(var(--accent)/.48),transparent_34%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.78))]',
];

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const resumeTimer = useRef<number | undefined>(undefined);
  const safeSlides = slides.length === 3 ? slides : slides.slice(0, 3);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (activeIndex >= safeSlides.length) setActiveIndex(0);
  }, [activeIndex, safeSlides.length]);

  useEffect(() => {
    if (reducedMotion || isInteracting || safeSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isInteracting, reducedMotion, safeSlides.length]);

  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  const pauseBriefly = () => {
    setIsInteracting(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setIsInteracting(false), 8000);
  };

  const goTo = (index: number) => {
    setActiveIndex(index);
    pauseBriefly();
  };

  const goPrevious = () => goTo((activeIndex - 1 + safeSlides.length) % safeSlides.length);
  const goNext = () => goTo((activeIndex + 1) % safeSlides.length);

  if (!safeSlides.length) return null;

  return (
    <section
      aria-label="Sahsrah homepage highlights"
      aria-roledescription="carousel"
      className="relative min-h-[100svh] overflow-hidden bg-[hsl(var(--primary))] text-white"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      {safeSlides.map((slide, index) => {
        const active = index === activeIndex;
        const slideKey = slide.id || String(slide.displayOrder);
        const showImage = Boolean(slide.heroImageUrl) && !failedImageIds.has(slideKey);
        return (
          <div
            key={slideKey}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            aria-hidden={!active}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${safeSlides.length}`}
          >
            {showImage ? (
              <img
                src={slide.heroImageUrl ?? undefined}
                alt={slide.heroImageAltText}
                className="h-full w-full object-cover"
                onError={() => setFailedImageIds((current) => new Set(current).add(slideKey))}
              />
            ) : (
              <div className={`h-full w-full ${fallbackGradients[index % fallbackGradients.length]}`} aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
          </div>
        );
      })}

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-start px-5 pb-32 pt-[calc(var(--public-header-height,4.75rem)+1.5rem)] sm:px-6 sm:pb-36 lg:items-center lg:px-10 lg:pb-20 lg:pt-40">
        <div className="max-w-3xl">
          {safeSlides.map((slide, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={`content-${slide.id || slide.displayOrder}`}
                className={active ? 'animate-rise' : 'hidden'}
                aria-hidden={!active}
                aria-live={active ? 'polite' : undefined}
              >
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm" data-testid={`text-hero-eyebrow-${slide.displayOrder}`}>
                  <Sparkles size={14} className="shrink-0 text-[hsl(var(--accent))]" />
                  <span>{slide.eyebrowText}</span>
                </div>
                <h1 className="mt-5 max-w-4xl break-words font-display text-[clamp(3.4rem,10vw,7.8rem)] font-semibold leading-[.9] tracking-[-0.06em] text-white sm:mt-6" data-testid={`text-hero-heading-${slide.displayOrder}`}>
                  {slide.heading}{' '}
                  <span className="text-[hsl(var(--accent))] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                    {slide.highlightedHeadingText}
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:mt-6 sm:text-lg sm:leading-8" data-testid={`text-hero-description-${slide.displayOrder}`}>
                  {slide.description}
                </p>
                <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
                  <a href={slide.primaryButtonUrl || '/contact'} className="inline-flex h-13 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--primary))] shadow-lg shadow-black/20 transition hover:-translate-y-1" data-testid={`link-hero-primary-${slide.displayOrder}`}>
                    {slide.primaryButtonLabel}
                    <ArrowRight size={17} className="ml-2" />
                  </a>
                  <a href={slide.secondaryButtonUrl || '#about-preview'} className="inline-flex h-13 items-center justify-center rounded-full border border-white/35 bg-black/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/15" data-testid={`link-hero-secondary-${slide.displayOrder}`}>
                    {slide.secondaryButtonLabel}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 pb-7 lg:px-10">
          <div className="flex items-center gap-2" role="tablist" aria-label="Choose homepage slide">
            {safeSlides.map((slide, index) => (
              <button
                key={`dot-${slide.id || slide.displayOrder}`}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-10 bg-[hsl(var(--accent))]' : 'w-2 bg-white/55 hover:bg-white'}`}
                data-testid={`button-hero-indicator-${index + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={goPrevious} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/15 text-white transition hover:bg-white/15" aria-label="Previous homepage slide" data-testid="button-hero-previous">
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={goNext} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/15 text-white transition hover:bg-white/15" aria-label="Next homepage slide" data-testid="button-hero-next">
              <ArrowRight size={18} />
            </button>
            <button type="button" onClick={() => setIsInteracting((current) => !current)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/15 text-white transition hover:bg-white/15" aria-label={isInteracting ? 'Resume automatic slide rotation' : 'Pause automatic slide rotation'} data-testid="button-hero-autoplay">
              {isInteracting ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}