import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CourseMentor } from '@workspace/api-client-react';
import './course-mentor-carousel.css';

function CourseMentorCard({ mentor, index, total }: { mentor: CourseMentor; index: number; total: number }) {
  const experience = mentor.experience.trim();
  const qualification = mentor.qualification.trim();
  const initials = mentor.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const tint = index % 2 === 0 ? 'bg-sky-50/70 dark:bg-sky-950/20' : 'bg-rose-50/65 dark:bg-rose-950/20';

  return (
    <article
      className={`relative h-full min-w-0 overflow-hidden rounded-2xl border border-[hsl(var(--primary)/.09)] ${tint} shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${mentor.name}, faculty member ${index + 1} of ${total}`}
      data-testid={`card-course-mentor-${mentor.id}`}
    >
      <span aria-hidden="true" className="pointer-events-none absolute right-5 top-3 font-display text-6xl font-semibold leading-none text-[hsl(var(--accent)/.24)] sm:text-7xl">{String(index + 1).padStart(2, '0')}</span>
      <div className="flex min-h-36 items-center gap-4 p-5 pr-20 sm:gap-5 sm:p-6 sm:pr-24">
        {mentor.imageUrl
          ? <img src={mentor.imageUrl} alt={mentor.imageAltText || `${mentor.name} portrait`} className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" data-testid={`img-course-mentor-${mentor.id}`} />
          : <div role="img" className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))] font-display text-3xl font-semibold text-[hsl(var(--accent))] sm:h-28 sm:w-28" aria-label={`${mentor.name} initials portrait`}>{initials}</div>}
        <div className="min-w-0">
          <h3 className="break-words font-display text-xl font-semibold leading-tight text-[hsl(var(--primary))] sm:text-2xl">{mentor.name}</h3>
          {qualification && <p className="mt-2 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{qualification}</p>}
          {mentor.teachingSubjects.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label={`${mentor.name} teaching subjects`}>{mentor.teachingSubjects.map((subject) => <span key={subject} className="rounded-full bg-[hsl(var(--accent)/.11)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--primary))]" data-testid={`tag-course-mentor-subject-${mentor.id}-${subject}`}>{subject}</span>)}</div>}
        </div>
      </div>
      {mentor.biography.trim() && <p className="border-t border-[hsl(var(--primary)/.1)] px-5 py-4 text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:px-6" data-testid={`text-course-mentor-bio-${mentor.id}`}>{mentor.biography}</p>}
      {experience && <div className="border-t border-[hsl(var(--primary)/.1)] px-5 py-3.5 sm:px-6">
        <p className="font-display text-lg font-semibold text-[hsl(var(--primary))]">{experience}</p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Experience</p>
      </div>}
    </article>
  );
}

function CourseMentorGrid({ mentors }: { mentors: CourseMentor[] }) {
  return (
    <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3" data-testid="grid-course-mentors">
      {mentors.map((mentor, index) => (
        <CourseMentorCard key={mentor.id} mentor={mentor} index={index} total={mentors.length} />
      ))}
    </div>
  );
}

export function CourseMentorCarousel({ mentors }: { mentors: CourseMentor[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const touchTimerRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const getSlides = useCallback(() => {
    const track = trackRef.current;
    return track ? Array.from(track.children).filter((child): child is HTMLElement => child instanceof HTMLElement) : [];
  }, []);

  const getMaxSlideIndex = useCallback(() => {
    const track = trackRef.current;
    const slides = getSlides();
    if (!track || slides.length < 2 || track.clientWidth === 0) return 0;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const firstOffset = slides[0].offsetLeft;
    let maxIndex = 0;
    slides.forEach((slide, index) => {
      if (slide.offsetLeft - firstOffset <= maxScrollLeft + 2) maxIndex = index;
    });
    return maxIndex;
  }, [getSlides]);

  const scrollToSlide = useCallback((requestedIndex: number) => {
    const track = trackRef.current;
    const slides = getSlides();
    if (!track || !slides.length) return;
    const nextIndex = Math.max(0, Math.min(requestedIndex, getMaxSlideIndex()));
    const firstOffset = slides[0].offsetLeft;
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const targetLeft = Math.max(0, Math.min(slides[nextIndex].offsetLeft - firstOffset, maxScrollLeft));
    track.scrollTo({ left: targetLeft, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    setActiveIndex(nextIndex);
  }, [getMaxSlideIndex, getSlides, prefersReducedMotion]);

  const pauseAfterInteraction = useCallback((duration = 5000) => {
    setInteractionPaused(true);
    if (pauseTimerRef.current !== null) window.clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = window.setTimeout(() => {
      pauseTimerRef.current = null;
      setInteractionPaused(false);
    }, duration);
  }, []);

  const goNext = useCallback(() => {
    pauseAfterInteraction();
    const maxIndex = getMaxSlideIndex();
    scrollToSlide(activeIndex >= maxIndex ? 0 : activeIndex + 1);
  }, [activeIndex, getMaxSlideIndex, pauseAfterInteraction, scrollToSlide]);

  const goPrevious = useCallback(() => {
    pauseAfterInteraction();
    const maxIndex = getMaxSlideIndex();
    scrollToSlide(activeIndex <= 0 ? maxIndex : activeIndex - 1);
  }, [activeIndex, getMaxSlideIndex, pauseAfterInteraction, scrollToSlide]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(Boolean(entry?.isIntersecting));
    }, { threshold: 0.2 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (mentors.length <= 3 || !isVisible || prefersReducedMotion || isHovered || hasKeyboardFocus || interactionPaused) return;
    const timer = window.setInterval(() => {
      const maxIndex = getMaxSlideIndex();
      scrollToSlide(activeIndex >= maxIndex ? 0 : activeIndex + 1);
    }, 8500);
    return () => window.clearInterval(timer);
  }, [activeIndex, getMaxSlideIndex, hasKeyboardFocus, interactionPaused, isHovered, isVisible, mentors.length, prefersReducedMotion, scrollToSlide]);

  useEffect(() => () => {
    if (pauseTimerRef.current !== null) window.clearTimeout(pauseTimerRef.current);
    if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
    if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
  }, []);

  const handleScroll = () => {
    if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const track = trackRef.current;
      const slides = getSlides();
      if (!track || !slides.length) return;
      const firstOffset = slides[0].offsetLeft;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      slides.forEach((slide, index) => {
        const distance = Math.abs(slide.offsetLeft - firstOffset - track.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      setActiveIndex((current) => current === nearestIndex ? current : nearestIndex);
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      setInteractionPaused(true);
      if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
      return;
    }
    if (event.pointerType === 'mouse') pauseAfterInteraction();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
      touchTimerRef.current = window.setTimeout(() => {
        touchTimerRef.current = null;
        setInteractionPaused(false);
      }, 1100);
    } else if (event.pointerType === 'mouse') {
      pauseAfterInteraction();
    }
  };

  if (mentors.length <= 3) return <CourseMentorGrid mentors={mentors} />;

  return (
    <div
      ref={rootRef}
      className="mt-9 lg:mt-12"
      role="region"
      aria-roledescription="carousel"
      aria-label="Faculty matching this course"
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setIsHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse') setIsHovered(false); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={() => pauseAfterInteraction()}
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLElement) setHasKeyboardFocus(event.target.matches(':focus-visible'));
      }}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
          setHasKeyboardFocus(false);
        }
      }}
      data-testid="carousel-course-mentors"
    >
      <div
        ref={trackRef}
        id="course-mentor-track"
        className="course-mentor-track flex snap-x snap-mandatory gap-5 overflow-x-auto"
        onScroll={handleScroll}
        data-testid="track-course-mentors"
      >
        {mentors.map((mentor, index) => (
          <div className="course-mentor-slide snap-start" key={mentor.id}>
            <CourseMentorCard mentor={mentor} index={index} total={mentors.length} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-end gap-2">
        <p className="mr-auto text-xs font-semibold text-[hsl(var(--muted-foreground))]" aria-hidden="true">
          Faculty {activeIndex + 1} of {mentors.length}
        </p>
        <button
          type="button"
          onClick={goPrevious}
          aria-label="Show previous faculty members"
          aria-controls="course-mentor-track"
          className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
          data-testid="button-course-mentors-previous"
        >
          <ChevronLeft size={19} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Show next faculty members"
          aria-controls="course-mentor-track"
          className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
          data-testid="button-course-mentors-next"
        >
          <ChevronRight size={19} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}