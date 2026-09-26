import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { useGetResultsPage, useGetSiteSettings, type HomepageResult, type ResultStatistic } from '@workspace/api-client-react';
import { PublicHeader } from '@/components/public-header';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR, createPublicThemeStyle } from '@/lib/public-theme';

const categories = [
  { value: 'ALL', label: 'All results' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'JEE_MAIN', label: 'JEE Main' },
  { value: 'NEET', label: 'NEET' },
  { value: 'EAMCET', label: 'EAMCET' },
  { value: 'OTHER', label: 'Other' },
] as const;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
}

function CountUp({ value, id }: { value: string; id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const number = match ? Number(match[1]) : null;
  const suffix = match?.[2] ?? '';
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.45 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!visible || number === null || reduced) {
      if (visible && number !== null) setCurrent(number);
      return;
    }
    const started = performance.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / 950);
      setCurrent(number * (1 - Math.pow(1 - progress, 3)));
      if (progress === 1) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [number, reduced, visible]);
  const shown = number === null ? value : `${number % 1 === 0 ? Math.round(current) : current.toFixed(1)}${suffix}`;
  return (
    <span ref={ref} data-testid={`stat-value-${id}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

function StatStrip({ statistics }: { statistics: ResultStatistic[] }) {
  if (!statistics.length) return null;
  return (
    <section className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-[1.5rem] border border-[hsl(var(--primary)/.18)] bg-[hsl(var(--primary)/.18)] sm:grid-cols-2 lg:grid-cols-4" aria-label="Results at a glance">
      {statistics.map((stat) => (
        <div key={stat.id} data-testid={`stat-card-${stat.id}`} className="bg-[hsl(var(--primary))] px-6 py-7 text-[hsl(var(--primary-foreground))]">
          <p className="font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--accent))]"><CountUp value={stat.value} id={stat.id} /></p>
          <p className="mt-3 text-sm font-bold">{stat.label}</p>
          {stat.supportingText && <p className="mt-1 text-xs leading-5 text-[hsl(var(--primary-foreground)/.62)]">{stat.supportingText}</p>}
        </div>
      ))}
    </section>
  );
}

function ResultCard({ result, onStory }: { result: HomepageResult; onStory: () => void }) {
  const accent = result.accentColor || DEFAULT_ACCENT_COLOR;
  return (
    <article data-testid={`result-card-${result.id}`} className="group flex min-h-[330px] flex-col overflow-hidden rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_12px_30px_hsl(var(--primary)/.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_hsl(var(--primary)/.12)]">
      <div className="flex items-center justify-between gap-4 px-5 pt-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[hsl(var(--primary))] font-display text-lg font-semibold text-[hsl(var(--accent))]">
          {result.studentImageUrl ? <img src={result.studentImageUrl} alt={result.studentImageAltText} className="h-full w-full object-cover" data-testid={`img-result-${result.id}`} /> : initials(result.studentName)}
        </div>
        {result.resultLabel && <span className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em]" style={{ borderColor: `${accent}55`, color: accent }}>{result.resultLabel}</span>}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{result.examCourse}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-.03em] text-[hsl(var(--primary))]" data-testid={`text-result-name-${result.id}`}>{result.studentName}</h2>
        <div className="mt-auto border-t border-[hsl(var(--border))] pt-5">
          <p className="font-display text-4xl font-semibold tracking-[-.04em]" style={{ color: accent }} data-testid={`text-result-score-${result.id}`}>{result.score}</p>
          <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">{result.achievement}</p>
          {(result.examName || result.year) && <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{[result.examName, result.year].filter(Boolean).join(' · ')}</p>}
          {result.story && <button type="button" onClick={onStory} data-testid={`button-read-story-${result.id}`} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))] underline decoration-[hsl(var(--accent)/.5)] underline-offset-4 transition hover:text-[hsl(var(--accent-foreground))]">Read their story <ArrowRight size={14} /></button>}
        </div>
      </div>
    </article>
  );
}

export default function Results() {
  const query = useGetResultsPage();
  const settingsQuery = useGetSiteSettings();
  const [year, setYear] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]['value']>('ALL');
  const [expanded, setExpanded] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const settings = settingsQuery.data ?? { collegeName: 'Sahsrah Junior College', tagline: '', logoUrl: null, primaryColor: DEFAULT_PRIMARY_COLOR, accentColor: DEFAULT_ACCENT_COLOR, surfaceColor: DEFAULT_SURFACE_COLOR };
  const themeStyle = createPublicThemeStyle(settings.primaryColor || DEFAULT_PRIMARY_COLOR, settings.accentColor || DEFAULT_ACCENT_COLOR, settings.surfaceColor || DEFAULT_SURFACE_COLOR);
  const content = query.data;
  const years = useMemo(() => [...new Set((content?.results ?? []).map((result) => result.year).filter((value): value is string => Boolean(value)))].sort((a, b) => b.localeCompare(a)), [content?.results]);
  useEffect(() => {
    if (!year && years.length) {
      const configured = content?.settings.configuredYear;
      setYear(configured && years.includes(configured) ? configured : years[0]);
    }
  }, [content?.settings.configuredYear, year, years]);
  const availableCategories = useMemo(() => categories.filter((item) => item.value === 'ALL' || (content?.results ?? []).some((result) => result.category === item.value && (!year || result.year === year))), [content?.results, year]);
  useEffect(() => {
    if (!availableCategories.some((item) => item.value === category)) setCategory('ALL');
  }, [availableCategories, category]);
  const filtered = useMemo(() => (content?.results ?? []).filter((result) => (!year || result.year === year) && (category === 'ALL' || result.category === category)).sort((a, b) => a.displayOrder - b.displayOrder), [category, content?.results, year]);
  const storyResult = filtered.find((result) => result.id === storyId) ?? null;
  const storyIndex = storyResult ? filtered.findIndex((result) => result.id === storyResult.id) : -1;
  const openStory = (id: string) => setStoryId(id);
  if (query.isLoading) return <div className="min-h-[100dvh] animate-pulse bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-7xl space-y-6 pt-24"><div className="h-8 w-44 rounded bg-[hsl(var(--muted))]" /><div className="h-64 rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="grid gap-4 md:grid-cols-3"><div className="h-64 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-64 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-64 rounded-2xl bg-[hsl(var(--muted))]" /></div></div></div>;
  if (query.isError || !content) return <div className="min-h-[100dvh] bg-[hsl(var(--background))]"><PublicHeader settings={settings} activePage="results" mobileFlow /><main className="mx-auto max-w-2xl px-6 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Results library</p><h1 className="mt-4 font-display text-4xl font-semibold text-[hsl(var(--primary))]">Results are temporarily unavailable.</h1><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again shortly.</p><button type="button" onClick={() => query.refetch()} data-testid="button-retry-results" className="mt-7 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Try again</button></main></div>;
  if (!content.settings.isVisible) return <div className="min-h-[100dvh] bg-[hsl(var(--background))]"><PublicHeader settings={settings} mobileFlow /><main className="mx-auto max-w-2xl px-6 py-24 text-center"><BookOpen className="mx-auto text-[hsl(var(--accent))]" size={30} /><h1 className="mt-5 font-display text-4xl font-semibold text-[hsl(var(--primary))]">Results will be shared here soon.</h1><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">The Results page is being prepared by the Sahsrah team.</p></main></div>;
  return (
    <div className="paper-grain min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={settings} activePage="results" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-20 pt-36 text-[hsl(var(--primary-foreground))] lg:px-10 lg:pb-28 lg:pt-48">
          <div className="pointer-events-none absolute -right-24 top-14 h-72 w-72 rounded-full border-[34px] border-[hsl(var(--accent)/.22)] motion-safe:animate-drift" />
          <div className="mx-auto max-w-7xl">
            <p className="animate-rise text-xs font-bold uppercase tracking-[.22em] text-[hsl(var(--accent))]" data-testid="text-results-eyebrow">{content.settings.eyebrow}</p>
            <h1 className="animate-rise-delay mt-6 max-w-4xl font-display text-6xl font-semibold leading-[.92] tracking-[-.06em] md:text-8xl" data-testid="text-results-heading">{content.settings.heading}</h1>
            <p className="animate-rise-delay mt-7 max-w-2xl text-base leading-7 text-[hsl(var(--primary-foreground)/.68)]" data-testid="text-results-description">{content.settings.description}</p>
          </div>
        </section>
        <div className="relative z-10 -mt-8 px-6 lg:px-10"><StatStrip statistics={content.statistics.filter((stat) => stat.isPublished).sort((a, b) => a.displayOrder - b.displayOrder)} /></div>
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24" aria-labelledby="published-results-heading">
          <div className="flex flex-col gap-7 border-b border-[hsl(var(--border))] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Verified outcomes</p><h2 id="published-results-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))] md:text-5xl">A record of focused work.</h2></div>
            <div className="flex flex-wrap items-center gap-3">
              {years.length > 1 && <label className="relative"><span className="sr-only">Filter by year</span><select value={year} onChange={(event) => setYear(event.target.value)} data-testid="select-results-year" className="h-11 appearance-none rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2 pl-4 pr-10 text-sm font-bold text-[hsl(var(--primary))] outline-none focus:border-[hsl(var(--accent))]"><option value="">All years</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5" size={15} /></label>}
              <SlidersHorizontal size={17} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-7 flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter results by exam category">
            {availableCategories.map((item) => <button key={item.value} type="button" role="tab" aria-selected={category === item.value} onClick={() => setCategory(item.value)} data-testid={`filter-results-${item.value.toLowerCase()}`} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${category === item.value ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--primary))]'}`}>{item.label}</button>)}
          </div>
          {!filtered.length ? <div className="mt-10 rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center"><p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]" data-testid="empty-results">No published results match these filters.</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try another year or category.</p></div> : <><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.slice(0, expanded ? undefined : 6).map((result) => <ResultCard key={result.id} result={result} onStory={() => openStory(result.id)} />)}</div>{filtered.length > 6 && <button type="button" onClick={() => setExpanded((current) => !current)} data-testid="button-complete-merit-list" className="mx-auto mt-10 flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]">{expanded ? 'Show featured results' : 'View Complete Merit List'} {expanded ? <ChevronLeft size={16} /> : <ArrowRight size={16} />}</button>}</>}
        </section>
      </main>
      <Dialog open={Boolean(storyResult)} onOpenChange={(open) => !open && setStoryId(null)}>
        <DialogContent className="max-w-2xl rounded-[1.5rem] border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 text-[hsl(var(--foreground))]">
          {storyResult && <div className="p-7 sm:p-10"><DialogHeader><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{storyResult.resultLabel || 'Student story'}</p><DialogTitle data-testid="dialog-story-title" className="mt-4 font-display text-4xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))]">{storyResult.studentName}</DialogTitle><DialogDescription className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{[storyResult.examName, storyResult.year, storyResult.institution, storyResult.course].filter(Boolean).join(' · ')}</DialogDescription></DialogHeader><p className="mt-8 whitespace-pre-line text-lg leading-8 text-[hsl(var(--foreground))]" data-testid="dialog-story-content">{storyResult.story?.trim() || 'A written story is not available for this result.'}</p><div className="mt-10 flex items-center justify-between border-t border-[hsl(var(--border))] pt-5"><button type="button" disabled={storyIndex <= 0} onClick={() => setStoryId(filtered[storyIndex - 1].id)} data-testid="button-story-previous" className="inline-flex items-center gap-2 text-sm font-bold disabled:opacity-30"><ChevronLeft size={17} /> Previous</button><span className="text-xs text-[hsl(var(--muted-foreground))]">{storyIndex + 1} of {filtered.length}</span><button type="button" disabled={storyIndex >= filtered.length - 1} onClick={() => setStoryId(filtered[storyIndex + 1].id)} data-testid="button-story-next" className="inline-flex items-center gap-2 text-sm font-bold disabled:opacity-30">Next <ChevronRight size={17} /></button></div><DialogClose asChild><button type="button" aria-label="Close story" data-testid="button-close-story" className="absolute right-5 top-5 rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"><X size={17} /></button></DialogClose></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}