import type { HomepageResult } from '@workspace/api-client-react';
import { ArrowRight, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StudentPortrait({ result, size = 'large' }: { result: HomepageResult; size?: 'large' | 'small' }) {
  const dimensions = size === 'large' ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-12 w-12';

  return (
    <div
      className={`grid ${dimensions} shrink-0 place-items-center overflow-hidden rounded-2xl border border-[hsl(var(--primary)/.12)] bg-[hsl(var(--secondary))] font-display text-xl font-semibold tracking-wide text-[hsl(var(--primary))]`}
    >
      {result.studentImageUrl ? (
        <img
          src={result.studentImageUrl}
          alt={result.studentImageAltText || result.studentName}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials(result.studentName)}</span>
      )}
    </div>
  );
}

function ResultLabel({ label }: { label: string }) {
  if (!label.trim()) return null;

  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-[hsl(var(--destructive)/.24)] bg-[hsl(var(--destructive)/.07)] px-3 py-1 text-[10px] font-bold uppercase leading-4 tracking-[.12em] text-[hsl(var(--destructive))]">
      {label}
    </span>
  );
}

export function TopPerformerCard({
  result,
  onStory,
}: {
  result: HomepageResult;
  onStory: () => void;
}) {
  return (
    <article
      data-testid={`result-card-${result.id}`}
      className="group relative flex h-full min-w-0 flex-col items-center overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-7 text-center shadow-[0_14px_36px_hsl(var(--primary)/.07)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.55)] hover:shadow-[0_20px_42px_hsl(var(--primary)/.12)] motion-reduce:transform-none motion-reduce:transition-none sm:px-6 sm:py-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[hsl(var(--destructive))]" />
      <div className="flex min-w-0 max-w-full flex-col items-center">
        <div className="rounded-full border border-[hsl(var(--accent)/.42)] p-1">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] font-display text-xl font-semibold tracking-wide text-[hsl(var(--primary))] sm:h-28 sm:w-28">
            {result.studentImageUrl ? (
              <img
                src={result.studentImageUrl}
                alt={result.studentImageAltText || result.studentName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{initials(result.studentName)}</span>
            )}
          </div>
        </div>
        <p className="mt-4 max-w-full break-words [overflow-wrap:anywhere] text-[10px] font-bold uppercase leading-5 tracking-[.15em] text-[hsl(var(--muted-foreground))]">
          {result.examCourse}
        </p>
        <div className="mt-2 flex max-w-full flex-wrap items-center justify-center gap-2">
          <h3 className="min-w-0 max-w-full break-words [overflow-wrap:anywhere] font-display text-2xl font-semibold leading-tight tracking-[-.035em] text-[hsl(var(--primary))] sm:text-[1.7rem]">
            {result.studentName}
          </h3>
          <ResultLabel label={result.resultLabel} />
        </div>
      </div>

      <div className="mt-5 flex w-full min-w-0 flex-1 flex-col items-center border-t border-[hsl(var(--border))] pt-5">
        <p
          className="max-w-full break-words font-display text-3xl font-semibold leading-tight tracking-[-.035em] text-[hsl(var(--destructive))] [overflow-wrap:anywhere] sm:text-4xl"
          data-testid={`text-result-score-${result.id}`}
        >
          {result.score}
        </p>
        <p className="mt-2 max-w-full break-words [overflow-wrap:anywhere] text-sm font-semibold leading-6 text-[hsl(var(--foreground))]">
          {result.achievement}
        </p>
        {(result.examName || result.year) && (
          <p className="mt-2 max-w-full break-words [overflow-wrap:anywhere] text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            {[result.examName, result.year].filter(Boolean).join(' · ')}
          </p>
        )}
        <button
          type="button"
          onClick={onStory}
          data-testid={`button-read-story-${result.id}`}
          className="mt-auto inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-md px-2 pt-5 text-sm font-bold text-[hsl(var(--primary))] underline decoration-[hsl(var(--destructive)/.65)] underline-offset-4 transition-colors hover:text-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-4 motion-reduce:transition-none"
        >
          <span className="break-words">Read Success Story</span>
          <ArrowRight size={15} aria-hidden="true" className="shrink-0" />
        </button>
      </div>
    </article>
  );
}

type MeritSort = 'featured' | 'name-asc' | 'name-desc';

export function CompleteMeritList({
  results,
  years,
  year,
  search,
  sort,
  onYearChange,
  onSearchChange,
  onSortChange,
  onStory,
  onCollapse,
  onClearFilters,
}: {
  results: HomepageResult[];
  years: string[];
  year: string;
  search: string;
  sort: MeritSort;
  onYearChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: MeritSort) => void;
  onStory: (id: string) => void;
  onCollapse: () => void;
  onClearFilters: () => void;
}) {
  return (
    <section
      aria-labelledby="complete-merit-list-heading"
      className="mt-8 overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_16px_40px_hsl(var(--primary)/.06)]"
      data-testid="complete-merit-list"
    >
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.55)] px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--destructive))]">
              Published achievements
            </p>
            <h2
              id="complete-merit-list-heading"
              className="mt-2 font-display text-3xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))] sm:text-4xl"
            >
              Complete Merit List
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Browse every published student achievement.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_auto_auto] lg:min-w-[min(100%,650px)]">
            <label className="relative block min-w-0">
              <span className="sr-only">Search by student name</span>
              <Search
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search student name"
                data-testid="input-merit-search"
                className="h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-10 pr-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              />
            </label>

            <label className="relative">
              <span className="sr-only">Filter by year</span>
              <select
                value={year}
                onChange={(event) => onYearChange(event.target.value)}
                data-testid="select-merit-year"
                className="h-11 w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2 pl-3.5 pr-10 text-sm font-semibold text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              >
                <option value="">All years</option>
                {years.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              />
            </label>

            <label className="relative">
              <span className="sr-only">Sort merit list</span>
              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value as MeritSort)}
                data-testid="select-merit-sort"
                className="h-11 w-full appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2 pl-3.5 pr-10 text-sm font-semibold text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              >
                <option value="featured">Featured order</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <SlidersHorizontal
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              />
            </label>
          </div>
        </div>
      </div>

      {results.length ? (
        <ul className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Published student results">
          {results.map((result) => (
            <li
              key={result.id}
              data-testid={`merit-row-${result.id}`}
              className="flex min-w-0 flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 transition-colors hover:border-[hsl(var(--accent)/.55)] hover:bg-[hsl(var(--secondary)/.45)] sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-3.5">
                <StudentPortrait result={result} size="small" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3
                      className="min-w-0 max-w-full break-words [overflow-wrap:anywhere] font-display text-lg font-semibold leading-tight tracking-[-.025em] text-[hsl(var(--primary))]"
                      data-testid={`text-merit-name-${result.id}`}
                    >
                      {result.studentName}
                    </h3>
                    <ResultLabel label={result.resultLabel} />
                  </div>
                  <p className="mt-1 break-words [overflow-wrap:anywhere] text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    {result.examCourse}
                    {(result.examName || result.year) && (
                      <span> · {[result.examName, result.year].filter(Boolean).join(' · ')}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 min-w-0 border-t border-[hsl(var(--border))] pt-3">
                <p className="max-w-full break-words [overflow-wrap:anywhere] font-display text-2xl font-semibold leading-tight tracking-[-.03em] text-[hsl(var(--destructive))]">
                  {result.score}
                </p>
                <p className="mt-1 max-w-full break-words [overflow-wrap:anywhere] text-sm leading-5 text-[hsl(var(--foreground))]">
                  {result.achievement}
                </p>
                {(result.institution || result.course) && (
                  <p className="mt-2 max-w-full break-words [overflow-wrap:anywhere] text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                    {[result.course, result.institution].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onStory(result.id)}
                aria-label={`View ${result.studentName}'s achievement details`}
                data-testid={`button-merit-details-${result.id}`}
                className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-2 pt-3 text-sm font-bold text-[hsl(var(--primary))] transition hover:text-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              >
                View details <ArrowRight size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="px-5 py-14 text-center sm:py-16"
          role="status"
          data-testid="empty-merit-list"
        >
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
            <Search size={19} aria-hidden="true" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold text-[hsl(var(--primary))]">
            No published results found
          </h3>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Try another name or year, or clear the current filters.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            data-testid="button-clear-merit-filters"
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card))] px-5 text-sm font-bold text-[hsl(var(--primary))] transition hover:border-[hsl(var(--destructive)/.55)] hover:text-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="flex justify-center border-t border-[hsl(var(--border))] px-4 py-4">
        <button
          type="button"
          onClick={onCollapse}
          data-testid="button-collapse-merit-list"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--card))] px-5 text-sm font-bold text-[hsl(var(--primary))] transition hover:border-[hsl(var(--destructive)/.5)] hover:text-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          Show Less <ChevronUp size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}