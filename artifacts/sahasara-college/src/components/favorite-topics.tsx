import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Box, ChevronLeft, ChevronRight, Dna, HeartPulse, LineChart, Stethoscope, Trophy, type LucideIcon } from 'lucide-react';
import type { HomepageFavoriteTopics } from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';

const topicIcons: Record<string, LucideIcon> = {
  atom: Box,
  'book-open': BookOpen,
  dna: Dna,
  'heart-pulse': HeartPulse,
  'line-chart': LineChart,
  stethoscope: Stethoscope,
  trophy: Trophy,
};

type FavoriteTopicsProps = {
  content: HomepageFavoriteTopics;
};

export function FavoriteTopics({ content }: FavoriteTopicsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const topics = useMemo(() => content.topics.filter((topic) => topic.isActive), [content.topics]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || topics.length < 2) return;
    const timer = window.setInterval(() => scrollByCard(1), 5200);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, topics.length]);

  if (!topics.length) return null;

  const getCardStep = () => {
    const container = carouselRef.current;
    const card = container?.querySelector<HTMLElement>('[data-topic-slide]');
    return card ? card.offsetWidth + 16 : container?.clientWidth ?? 0;
  };
  const scrollToIndex = (index: number) => carouselRef.current?.scrollTo({ left: getCardStep() * index, behavior: reducedMotion ? 'auto' : 'smooth' });
  function scrollByCard(direction: number) {
    const container = carouselRef.current;
    if (!container) return;
    const nextLeft = container.scrollLeft + getCardStep() * direction;
    const atEnd = direction > 0 && nextLeft + container.clientWidth >= container.scrollWidth - 8;
    container.scrollTo({ left: atEnd ? 0 : Math.max(0, nextLeft), behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  return (
    <section id="favorite-topics" className="overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="favorite-topics-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow className="about-eyebrow about-eyebrow-centered">{content.eyebrow || 'Explore Our Programs'}</SectionEyebrow>
          <h2 id="favorite-topics-heading" className="mt-5 font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p>
        </div>

        <div className="relative mt-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}>
          <div ref={carouselRef} className="overflow-x-auto scroll-smooth scrollbar-none" role="region" aria-roledescription="carousel" aria-label="Favorite programs" onScroll={(event) => {
            const step = getCardStep();
            setSelectedIndex(step ? Math.min(topics.length - 1, Math.round(event.currentTarget.scrollLeft / step)) : 0);
          }}>
            <div className="flex gap-4 touch-pan-y">
              {topics.map((topic, index) => <TopicCard key={topic.id} topic={topic} index={index} buttonLabel={content.buttonLabel || 'Explore curriculum'} />)}
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between gap-4">
            <div className="flex gap-1.5" aria-label="Carousel position">
              {topics.map((topic, index) => <button key={topic.id} type="button" aria-label={`Go to ${topic.title}`} aria-current={selectedIndex === index} onClick={() => scrollToIndex(index)} className={`h-1.5 rounded-full transition-all ${selectedIndex === index ? 'w-8 bg-[hsl(var(--accent))]' : 'w-1.5 bg-[hsl(var(--border))] hover:bg-[hsl(var(--muted-foreground))]'}`} />)}
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous program" onClick={() => scrollByCard(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]" data-testid="button-topics-previous"><ChevronLeft size={18} /></button>
              <button type="button" aria-label="Next program" onClick={() => scrollByCard(1)} className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]" data-testid="button-topics-next"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopicCard({ topic, index, buttonLabel }: { topic: HomepageFavoriteTopics['topics'][number]; index: number; buttonLabel: string }) {
  const Icon = topicIcons[topic.icon ?? ''] ?? BookOpen;
  return (
    <div data-topic-slide className="min-w-0 flex-[0_0_88%] snap-start sm:flex-[0_0_56%] lg:flex-[0_0_31%]">
      <article className="home-topic-card group flex h-full min-h-[500px] flex-col overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition duration-500 hover:-translate-y-2 hover:border-[hsl(var(--accent)/.65)] hover:shadow-xl" style={{ '--home-card-delay': `${index * 70}ms` } as React.CSSProperties}>
        <div className="relative aspect-[1.45] shrink-0 overflow-hidden bg-[hsl(var(--primary))]">
          {topic.imageUrl ? <img src={topic.imageUrl} alt={topic.imageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_70%_20%,hsl(var(--accent)/.38),transparent_35%),hsl(var(--primary))] text-[hsl(var(--accent))]"><Icon size={38} /></div>}
          <div className="absolute inset-0 bg-[hsl(var(--primary)/.1)] transition duration-500 group-hover:bg-[hsl(var(--primary)/.32)]" />
          <div className="absolute bottom-5 left-5 grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))] shadow-lg"><Icon size={20} /></div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[hsl(var(--accent-foreground))]">{topic.categoryLabel}</p>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{topic.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{topic.description}</p>
          <ul className="mt-5 space-y-2.5 text-xs font-semibold text-[hsl(var(--foreground))]">
            {[topic.featureOne, topic.featureTwo, topic.featureThree].map((feature) => <li key={feature} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" /> {feature}</li>)}
          </ul>
           <a href={topic.curriculumUrl} className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-bold text-[hsl(var(--primary))] transition group-hover:gap-3 group-hover:text-[hsl(var(--accent-foreground))]" data-testid={`link-topic-curriculum-${index + 1}`}>{buttonLabel} <ArrowRight size={16} /></a>
        </div>
      </article>
    </div>
  );
}