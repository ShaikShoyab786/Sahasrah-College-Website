import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useGetResultsPage, useGetSiteSettings, type HomepageResult, type ResultStatistic } from '@workspace/api-client-react';
import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR, createPublicThemeStyle } from '@/lib/public-theme';
import { ResultsStoryDialog } from '@/components/results-story-dialog';
import { CompleteMeritList, TopPerformerCard } from '@/components/results-merit-list';
import { ResultsContactCta, ResultsSuccessStories } from '@/components/results-bottom-sections';

const categories = [
  { value: 'ALL', label: 'All' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'JEE_MAIN', label: 'JEE Main' },
  { value: 'NEET', label: 'NEET' },
  { value: 'EAMCET', label: 'EAMCET' },
] as const;

type PublicCategory = (typeof categories)[number]['value'] | 'OTHER';
type MeritSort = 'featured' | 'name-asc' | 'name-desc';

function categoryForResult(result: HomepageResult): PublicCategory {
  if (result.category !== 'OTHER') return result.category;
  // Older published results may be filed under Other despite having an explicit exam name.
  // Use that published name for public filters without changing the shared admin record.
  const exam = result.examName?.toLowerCase() || '';
  const name = exam || `${result.course || ''} ${result.examCourse}`.toLowerCase();
  if (/\b(intermediate|inter)\b/.test(name)) return 'INTERMEDIATE';
  if (/\bjee\b/.test(name)) return 'JEE_MAIN';
  if (/\bneet\b/.test(name)) return 'NEET';
  if (/\b(eamcet|eapcet)\b/.test(name)) return 'EAMCET';
  return 'OTHER';
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
    const updateMotionPreference = () => setReduced(media.matches);
    updateMotionPreference();
    media.addEventListener('change', updateMotionPreference);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.45 });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', updateMotionPreference);
    };
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
  const desktopColumns = statistics.length <= 4
    ? statistics.length
    : [5, 6, 9, 12, 15, 18].includes(statistics.length) ? 3 : 4;
  const centerLastCard = statistics.length > desktopColumns && statistics.length % desktopColumns === 1;
  const desktopColumnClass = desktopColumns === 1
    ? 'max-w-2xl'
    : desktopColumns === 2
      ? 'lg:grid-cols-2'
      : desktopColumns === 3
        ? 'lg:grid-cols-3'
        : 'lg:grid-cols-4';
  const tabletColumnClass = statistics.length > 1 ? 'sm:grid-cols-2' : '';
  return (
    <section
      className={`mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 rounded-[1.5rem] border border-[hsl(var(--primary)/.12)] bg-[#fffdf7] p-3 shadow-[0_16px_38px_hsl(var(--primary)/.10)] ${tabletColumnClass} ${desktopColumnClass}`}
      aria-label="Results at a glance"
      data-testid="results-statistics"
    >
      {statistics.map((stat, index) => (
        <div
          key={stat.id}
          data-testid={`stat-card-${stat.id}`}
          className={`min-w-0 rounded-[1.1rem] bg-[#fffdf7] px-5 py-6 text-center sm:px-6 sm:py-7 ${statistics.length === 1 ? 'mx-auto w-full max-w-2xl' : ''} ${centerLastCard && index === statistics.length - 1 ? 'lg:col-span-2 lg:col-start-2' : ''}`}
        >
          <p className="font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--accent))]"><CountUp value={stat.value} id={stat.id} /></p>
          <p className="mt-3 text-sm font-bold text-[hsl(var(--primary))]">{stat.label}</p>
          {stat.supportingText && <p className="mt-1 text-xs leading-5 text-[hsl(var(--primary)/.72)]">{stat.supportingText}</p>}
        </div>
      ))}
    </section>
  );
}

export default function Results() {
  const query = useGetResultsPage();
  const settingsQuery = useGetSiteSettings();
  const [year, setYear] = useState('');
  const [category, setCategory] = useState<PublicCategory>('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<MeritSort>('featured');
  const [expanded, setExpanded] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const dialogScrollPosition = useRef(0);
  const dialogWasOpen = useRef(false);
  const expandTrigger = useRef<HTMLButtonElement>(null);
  const settings = settingsQuery.data ?? { collegeName: 'Sahsrah Junior College', tagline: '', logoUrl: null, email: '', phone: '', footerText: '', primaryColor: DEFAULT_PRIMARY_COLOR, accentColor: DEFAULT_ACCENT_COLOR, surfaceColor: DEFAULT_SURFACE_COLOR };
  const themeStyle = createPublicThemeStyle(settings.primaryColor || DEFAULT_PRIMARY_COLOR, settings.accentColor || DEFAULT_ACCENT_COLOR, settings.surfaceColor || DEFAULT_SURFACE_COLOR);
  const content = query.data;
  const published = useMemo(() => (content?.results ?? []).filter((result) => result.isPublished), [content?.results]);
  const years = useMemo(() => [...new Set(published.map((result) => result.year).filter((value): value is string => Boolean(value)))].sort((a, b) => b.localeCompare(a)), [published]);
  useEffect(() => {
    if (year && !years.includes(year)) setYear('');
  }, [year, years]);
  const showOther = published.some((result) => categoryForResult(result) === 'OTHER');
  const visibleCategories: { value: PublicCategory; label: string }[] = showOther
    ? [...categories, { value: 'OTHER', label: 'Other' }]
    : [...categories];
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const matching = published.filter((result) =>
      (category === 'ALL' || categoryForResult(result) === category) &&
      (!year || result.year === year) &&
      (!term || result.studentName.toLocaleLowerCase().includes(term))
    );
    return matching.sort((a, b) => {
      if (sort !== 'featured') {
        const byName = a.studentName.localeCompare(b.studentName);
        if (byName) return sort === 'name-asc' ? byName : -byName;
      }
      return a.displayOrder - b.displayOrder || a.id.localeCompare(b.id);
    });
  }, [category, published, search, sort, year]);
  const topPerformers = filtered.slice(0, 3);
  const dialogResults = filtered;
  const storyResult = dialogResults.find((result) => result.id === selectedResultId) ?? null;
  const storyIndex = storyResult ? dialogResults.findIndex((result) => result.id === storyResult.id) : -1;
  const clearFilters = () => {
    setCategory('ALL');
    setYear('');
    setSearch('');
    setSort('featured');
  };
  const collapseList = () => {
    setExpanded(false);
    requestAnimationFrame(() => {
      expandTrigger.current?.focus({ preventScroll: true });
      expandTrigger.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
    });
  };
  const openResultDetails = (id: string) => {
    dialogScrollPosition.current = window.scrollY;
    setSelectedResultId(id);
  };
  useEffect(() => {
    if (dialogWasOpen.current && !selectedResultId) {
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: dialogScrollPosition.current, behavior: 'auto' })));
    }
    dialogWasOpen.current = Boolean(selectedResultId);
  }, [selectedResultId]);
  if (query.isLoading) return <div className="min-h-[100dvh] animate-pulse bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-7xl space-y-6 pt-24"><div className="h-8 w-44 rounded bg-[hsl(var(--muted))]" /><div className="h-64 rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="grid gap-4 md:grid-cols-3"><div className="h-64 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-64 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-64 rounded-2xl bg-[hsl(var(--muted))]" /></div></div></div>;
  if (query.isError || !content) return <div className="min-h-[100dvh] bg-[hsl(var(--background))]"><PublicHeader settings={settings} activePage="results" mobileFlow /><main className="mx-auto max-w-2xl px-6 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Results library</p><h1 className="mt-4 font-display text-4xl font-semibold text-[hsl(var(--primary))]">Results are temporarily unavailable.</h1><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again shortly.</p><button type="button" onClick={() => query.refetch()} data-testid="button-retry-results" className="mt-7 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Try again</button></main></div>;
  if (!content.settings.isVisible) return <div className="min-h-[100dvh] bg-[hsl(var(--background))]"><PublicHeader settings={settings} mobileFlow /><main className="mx-auto max-w-2xl px-6 py-24 text-center"><BookOpen className="mx-auto text-[hsl(var(--accent))]" size={30} /><h1 className="mt-5 font-display text-4xl font-semibold text-[hsl(var(--primary))]">Results will be shared here soon.</h1><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">The Results page is being prepared by the Sahsrah team.</p></main></div>;
  return (
    <div className="paper-grain min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={settings} activePage="results" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-20 pt-36 text-[hsl(var(--primary-foreground))] lg:px-10 lg:pb-28 lg:pt-48">
          <div className="results-hero-orb pointer-events-none absolute -right-24 top-14 h-72 w-72 rounded-full border-[34px] border-[hsl(var(--accent)/.22)]" />
          <div className="mx-auto max-w-7xl text-center">
            <p className="results-hero-eyebrow text-xs font-bold uppercase tracking-[.22em] text-[hsl(var(--eyebrow-dark-text))]" data-testid="text-results-eyebrow">{content.settings.eyebrow}</p>
            <h1 className="results-hero-heading mx-auto mt-6 max-w-4xl font-display text-6xl font-semibold leading-[.92] tracking-[-.06em] md:text-8xl" data-testid="text-results-heading">{content.settings.heading}</h1>
            <p className="results-hero-description mx-auto mt-7 max-w-2xl text-base leading-7 text-[hsl(var(--primary-foreground)/.72)]" data-testid="text-results-description">{content.settings.description}</p>
          </div>
        </section>
        <div className="relative z-10 -mt-8 px-6 lg:px-10"><StatStrip statistics={content.statistics.filter((stat) => stat.isPublished).sort((a, b) => a.displayOrder - b.displayOrder)} /></div>
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24" aria-labelledby="published-results-heading">
          <div className="border-b border-[hsl(var(--border))] pb-8 text-center">
            <p className="text-center text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--eyebrow-text))]">Verified outcomes</p>
            <h2 id="published-results-heading" className="mt-3 text-center font-display text-4xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))] md:text-5xl">Our Top Performers</h2>
            <div className="mt-7 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter results by exam category">
              {visibleCategories.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={category === item.value}
                  onClick={() => setCategory(item.value)}
                  data-testid={`filter-results-${item.value.toLowerCase()}`}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] motion-reduce:transition-none ${category === item.value ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_7px_18px_hsl(var(--primary)/.16)]' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] hover:border-[hsl(var(--accent)/.6)] hover:bg-[hsl(var(--accent)/.06)]'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p className="sr-only" role="status">{filtered.length} published {filtered.length === 1 ? 'result' : 'results'} match the current filters.</p>
          {!expanded && (search || year || sort !== 'featured') && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
              <span>List filters are active{search && ` · Name: ${search}`}{year && ` · Year: ${year}`}{sort !== 'featured' && ' · Name order'}.</span>
              <button type="button" onClick={clearFilters} className="font-bold text-[hsl(var(--primary))] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]">Clear filters</button>
            </div>
          )}
          {topPerformers.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topPerformers.map((result) => <TopPerformerCard key={result.id} result={result} onStory={() => openResultDetails(result.id)} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-14 text-center">
              <p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]" data-testid="empty-results">No published results match these filters.</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try another category or clear the filters.</p>
              {published.length > 0 && <button type="button" onClick={clearFilters} className="mt-5 rounded-full border border-[hsl(var(--primary)/.2)] px-5 py-2.5 text-sm font-bold text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]">Clear filters</button>}
            </div>
          )}
          {published.length > 0 && !expanded && (
            <button
              ref={expandTrigger}
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              aria-controls="complete-merit-list"
              data-testid="button-complete-merit-list"
              className="mx-auto mt-10 flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_24px_hsl(var(--primary)/.16)] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)] motion-reduce:transition-none"
            >
              View Complete Merit List <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
          <div id="complete-merit-list" className={expanded ? 'mt-10' : ''}>
            {expanded && (
              <CompleteMeritList
                results={filtered}
                years={years}
                year={year}
                search={search}
                sort={sort}
                onYearChange={setYear}
                onSearchChange={setSearch}
                onSortChange={setSort}
                onStory={openResultDetails}
                onCollapse={collapseList}
                onClearFilters={clearFilters}
              />
            )}
          </div>
        </section>
        <ResultsSuccessStories testimonials={content.testimonials} />
        {content.settings.ctaIsVisible && (
          <ResultsContactCta
            heading={content.settings.ctaHeading}
            description={content.settings.ctaDescription}
            primaryLabel={content.settings.ctaPrimaryLabel}
            secondaryLabel={content.settings.ctaSecondaryLabel}
            primaryHref={content.settings.ctaPrimaryHref}
            secondaryHref={content.settings.ctaSecondaryHref}
          />
        )}
      </main>
      <PublicFooter settings={settings} />
      <ResultsStoryDialog
        result={storyResult}
        index={storyIndex}
        total={dialogResults.length}
        themeStyle={themeStyle}
        onOpenChange={(open) => !open && setSelectedResultId(null)}
        onPrevious={() => storyIndex > 0 && setSelectedResultId(dialogResults[storyIndex - 1].id)}
        onNext={() => storyIndex >= 0 && storyIndex < dialogResults.length - 1 && setSelectedResultId(dialogResults[storyIndex + 1].id)}
      />
    </div>
  );
}