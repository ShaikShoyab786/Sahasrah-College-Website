import { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeCheck, CalendarDays, FlaskConical, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react';
import type { HomepageStatistics } from '@workspace/api-client-react';

const statisticIcons: Record<string, LucideIcon> = {
  'badge-check': BadgeCheck,
  'calendar-days': CalendarDays,
  'flask-conical': FlaskConical,
  'graduation-cap': GraduationCap,
  sparkles: Sparkles,
};

type HomeStatisticsProps = {
  content: HomepageStatistics;
};

export function HomeStatistics({ content }: HomeStatisticsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState(() => content.statistics.map(() => 0));
  const statistics = useMemo(() => content.statistics.filter((statistic) => statistic.isActive), [content.statistics]);

  useEffect(() => {
    setValues(statistics.map(() => 0));
    setStarted(false);
  }, [content.id, content.updatedAt, statistics.length]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || started) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      if (reducedMotion) {
        setValues(statistics.map((statistic) => statistic.numericTarget));
        observer.disconnect();
        return;
      }

      const startedAt = performance.now();
      const duration = 1500;
      let frame = 0;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(statistics.map((statistic) => Math.round(statistic.numericTarget * eased)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      observer.disconnect();
      return () => cancelAnimationFrame(frame);
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [started, statistics]);

  return (
    <section ref={sectionRef} id="home-statistics" className="px-6 py-8 lg:px-10 lg:py-12" aria-labelledby="home-statistics-heading">
      <div className="home-statistics-card relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] shadow-xl md:px-10 lg:px-14 lg:py-16">
        <div className="home-statistics-texture" aria-hidden="true" />
        <div className="relative grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">{content.eyebrow}</p>
            <h2 id="home-statistics-heading" className="mt-4 max-w-md font-display text-4xl font-semibold leading-[.98] tracking-[-.04em] md:text-5xl">{content.heading}</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[hsl(var(--primary-foreground)/.66)]">{content.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4 md:gap-5">
            {statistics.map((statistic, index) => {
              const Icon = statisticIcons[statistic.icon ?? ''] ?? Sparkles;
              return <div key={statistic.id} className="home-statistic-item text-center" style={{ '--home-stat-delay': `${index * 110}ms` } as React.CSSProperties}>
                <Icon size={21} className="mx-auto text-[hsl(var(--accent))] transition duration-300 group-hover:scale-110" aria-hidden="true" />
                <p className="mt-4 font-display text-4xl font-semibold tracking-[-.04em] md:text-5xl">{values[index] ?? statistic.numericTarget}{statistic.suffix}</p>
                <p className="mt-2 text-[10px] font-bold uppercase leading-4 tracking-[.15em] text-[hsl(var(--primary-foreground)/.54)]">{statistic.label}</p>
              </div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}