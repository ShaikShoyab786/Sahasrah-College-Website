import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3 } from 'lucide-react';
import type { HomepageStatistics, ResultStatistic } from '@workspace/api-client-react';

type HomeStatisticsProps = {
  content: HomepageStatistics;
  statistics: ResultStatistic[];
};

export function HomeStatistics({ content, statistics }: HomeStatisticsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    setValues(statistics.map(() => '0'));
    setStarted(false);
  }, [content.id, content.updatedAt, statistics]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || started || !statistics.length) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      if (reducedMotion) {
        setValues(statistics.map((statistic) => statistic.value));
        observer.disconnect();
        return;
      }

      const startedAt = performance.now();
      const duration = 950;
      let frame = 0;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(statistics.map((statistic) => {
          const match = statistic.value.match(/^(\d+(?:\.\d+)?)(.*)$/);
          if (!match) return progress === 1 ? statistic.value : '0';
          const number = Number(match[1]);
          const current = number % 1 === 0 ? Math.round(number * eased) : (number * eased).toFixed(1);
          return `${current}${match[2]}`;
        }));
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
          {statistics.length ? <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4 md:gap-5">
            {statistics.map((statistic, index) => <div key={statistic.id} className="home-statistic-item text-center" data-testid={`home-statistic-${statistic.id}`}><BarChart3 size={21} className="mx-auto text-[hsl(var(--accent))]" aria-hidden="true" /><p className="mt-4 font-display text-4xl font-semibold tracking-[-.04em] md:text-5xl"><span className="sr-only">{statistic.value}</span><span aria-hidden="true">{values[index] ?? statistic.value}</span></p><p className="mt-2 text-[10px] font-bold uppercase leading-4 tracking-[.15em] text-[hsl(var(--primary-foreground)/.54)]">{statistic.label}</p>{statistic.supportingText && <p className="mt-1 text-[11px] text-[hsl(var(--primary-foreground)/.58)]">{statistic.supportingText}</p>}</div>)}
          </div> : <div className="rounded-2xl border border-[hsl(var(--primary-foreground)/.14)] bg-[hsl(var(--primary-foreground)/.05)] px-5 py-8 text-sm leading-6 text-[hsl(var(--primary-foreground)/.65)]" data-testid="empty-home-statistics"><p>No approved outcome statistics have been selected for Home yet.</p><a href="/results" className="mt-4 inline-flex items-center gap-2 font-bold text-[hsl(var(--accent))]">View Results <ArrowRight size={15} /></a></div>}
        </div>
      </div>
    </section>
  );
}