import { CalendarDays, ChevronDown, ChevronUp, ExternalLink, FileText, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import {
  useGetKnowledgeHubExamUpdates,
  useGetKnowledgeHubExamUpdatesPage,
  useGetSiteSettings,
  type GetKnowledgeHubExamUpdatesParams,
  type KnowledgeHubExamUpdate,
} from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const fallbackSite = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'A public junior college for purposeful beginnings.',
  logoUrl: null,
  email: '',
  phone: '',
  footerText: 'A public college for curious minds and purposeful lives.',
};

function formatPublicationDate(value: string | null) {
  if (!value) return 'Publication date not listed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Publication date not listed';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function LoadingState() {
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] px-6 py-10" role="status" aria-label="Loading Exam Updates">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-7 w-48 rounded-full bg-[hsl(var(--muted))]" />
        <div className="h-[360px] rounded-[2rem] bg-[hsl(var(--muted))]" />
        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl bg-[hsl(var(--muted))]" />)}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] px-6 py-20">
      <div className="mx-auto max-w-xl rounded-[1.75rem] border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-8 text-center" role="alert" data-testid="status-exam-updates-error">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--destructive))]">Exam desk unavailable</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))]">We could not load the latest notices.</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again. Only published information from the official desk is shown here.</p>
        <button type="button" onClick={onRetry} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-exam-updates">
          <RotateCcw size={16} /> Try again
        </button>
      </div>
    </div>
  );
}

function UpdateCard({ update }: { update: KnowledgeHubExamUpdate }) {
  const [noticeExpanded, setNoticeExpanded] = useState(false);
  const noticeId = `exam-update-full-notice-${update.id}`;
  return (
    <article className="group flex h-full flex-col rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.58)] hover:shadow-[var(--shadow-lg)] sm:p-6" data-testid={`card-exam-update-${update.id}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex max-w-[75%] items-center rounded-full bg-[hsl(var(--primary)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]" data-testid={`text-exam-${update.id}`}>{update.exam}</span>
        {update.isPinned && <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--accent-foreground))]">Pinned</span>}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em]">
        <span className="rounded-full bg-[hsl(var(--accent)/.1)] px-2.5 py-1 text-[hsl(var(--accent))]" data-testid={`text-update-label-${update.id}`}>{update.label}</span>
        <span className="text-[hsl(var(--muted-foreground))]">{update.updateType}</span>
      </div>
      <h3 className="mt-3 font-display text-2xl font-semibold leading-[1.08] tracking-[-.04em] text-[hsl(var(--primary))]" data-testid={`text-update-title-${update.id}`}>{update.title}</h3>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]" data-testid={`text-update-summary-${update.id}`}>{update.summary}</p>
      <div className="mt-auto border-t border-[hsl(var(--border))] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]" data-testid={`text-update-date-${update.id}`}>
            <CalendarDays size={15} /> {formatPublicationDate(update.publishedAt)}
          </span>
          <button
            type="button"
            aria-expanded={noticeExpanded}
            aria-controls={noticeId}
            onClick={() => setNoticeExpanded((current) => !current)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/.06)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.2)]"
            data-testid={`button-toggle-full-notice-${update.id}`}
          >
            {noticeExpanded ? 'Hide full notice' : 'Read full notice'}
            {noticeExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        {noticeExpanded && (
          <div id={noticeId} className="mt-3 rounded-xl bg-[hsl(var(--secondary))] p-4" data-testid={`text-full-notice-${update.id}`}>
            <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground))]">{update.fullNotice}</p>
          </div>
        )}
        <div className="mt-3 flex justify-end">
          {update.officialUrl ? (
            <a href={update.officialUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3.5 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--primary)/.2)]" data-testid={`link-view-update-${update.id}`}>
              Official source <ExternalLink size={14} />
            </a>
          ) : (
            <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3.5 text-xs font-bold text-[hsl(var(--muted-foreground))]" data-testid={`status-update-source-${update.id}`}>
              Official source pending
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function KnowledgeHubExamUpdates() {
  const pageQuery = useGetKnowledgeHubExamUpdatesPage();
  const siteQuery = useGetSiteSettings();
  const [searchDraft, setSearchDraft] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [exam, setExam] = useState('');
  const [expanded, setExpanded] = useState(false);

  const params = useMemo<GetKnowledgeHubExamUpdatesParams>(() => ({
    ...(committedSearch.trim() ? { search: committedSearch.trim() } : {}),
    ...(exam ? { exam } : {}),
    offset: 0,
    limit: 500,
  }), [committedSearch, exam]);
  const updatesQuery = useGetKnowledgeHubExamUpdates(params);

  const page = pageQuery.data;
  const site = siteQuery.data ?? fallbackSite;
  const updates = updatesQuery.data?.items ?? [];
  const visibleUpdates = expanded ? updates : updates.slice(0, 3);
  const hasActiveSearch = Boolean(committedSearch.trim() || exam);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommittedSearch(searchDraft);
    setExpanded(false);
  };

  const resetSearch = () => {
    setSearchDraft('');
    setCommittedSearch('');
    setExam('');
    setExpanded(false);
  };

  if (pageQuery.isLoading || siteQuery.isLoading) return <LoadingState />;
  if (pageQuery.isError || !page) return <ErrorState onRetry={() => { pageQuery.refetch(); siteQuery.refetch(); }} />;

  return (
    <div
      className="paper-grain min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
      style={createPublicThemeStyle(siteQuery.data?.primaryColor || DEFAULT_PRIMARY_COLOR, siteQuery.data?.accentColor || DEFAULT_ACCENT_COLOR, siteQuery.data?.surfaceColor || DEFAULT_SURFACE_COLOR)}
    >
      <PublicHeader settings={{ collegeName: site.collegeName, tagline: site.tagline, logoUrl: site.logoUrl }} activePage="knowledge-hub" />
      <main>
        <section className="relative isolate overflow-hidden bg-[hsl(var(--primary))] px-6 pb-12 pt-12 lg:px-10 lg:pb-16 lg:pt-16" data-testid="section-exam-updates-hero">
          {page.heroBackgroundImageUrl && <img src={page.heroBackgroundImageUrl} alt={page.heroBackgroundImageAltText} className="absolute inset-0 -z-20 h-full w-full object-cover" data-testid="img-exam-updates-hero" />}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(116deg,hsl(var(--primary)/.98)_0%,hsl(var(--primary)/.9)_54%,hsl(var(--primary)/.58)_100%)]" />
          <div className="absolute -right-32 -top-48 -z-10 h-[36rem] w-[36rem] rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute bottom-[-11rem] right-[18%] -z-10 h-72 w-72 rounded-full border-[26px] border-[hsl(var(--accent)/.22)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-4xl py-7 sm:py-12">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-white/78">
                <ShieldCheck size={16} className="text-[hsl(var(--accent))]" />
                <span data-testid="text-exam-updates-hero-eyebrow">{page.heroEyebrow}</span>
              </div>
              <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[.95] tracking-[-.065em] text-white sm:text-7xl" data-testid="text-exam-updates-hero-headline">{page.heroHeadline}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg" data-testid="text-exam-updates-hero-description">{page.heroDescription}</p>
              <form onSubmit={submitSearch} className="mt-9 flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/15 bg-[hsl(var(--primary)/.42)] p-3 shadow-[0_22px_50px_hsl(var(--primary)/.2)] backdrop-blur-sm sm:flex-row" data-testid="form-exam-updates-search">
                <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-[hsl(var(--background))] px-4 text-[hsl(var(--foreground))]">
                  <Search size={18} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
                  <span className="sr-only">Search exam updates</span>
                  <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={page.searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-search-exam-updates" />
                </label>
                <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40" data-testid="button-search-exam-updates">
                  {page.searchButtonLabel} <Search size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>

        <nav className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-4 lg:px-10" aria-label="Filter notices by exam" data-testid="nav-exam-update-filters">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <span className="shrink-0 text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Browse by exam</span>
            <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap" role="group" aria-label="Exam filters">
              {['All Updates', ...page.examFilters].map((filter) => {
                const value = filter === 'All Updates' ? '' : filter;
                const isSelected = exam === value;
                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => { setExam(value); setExpanded(false); }}
                    className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.2)] ${isSelected ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent)/.5)] hover:text-[hsl(var(--accent))]'}`}
                    data-testid={`button-exam-filter-${filter.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <section className="bg-[hsl(var(--secondary))] px-6 py-14 sm:py-20 lg:px-10" data-testid="section-latest-exam-updates">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--primary))]" data-testid="text-latest-exam-updates-eyebrow">{page.latestEyebrow}</p>
                <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-.055em] text-[hsl(var(--primary))] sm:text-5xl" data-testid="text-latest-exam-updates-heading">{page.latestHeading}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-latest-exam-updates-description">{page.latestDescription}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]" data-testid="text-exam-updates-trust-note"><ShieldCheck size={16} /> Official notices only</div>
            </div>

            {updatesQuery.isLoading ? (
              <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading exam notices">
                {[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-[1.35rem] bg-[hsl(var(--muted))]" />)}
              </div>
            ) : updatesQuery.isError ? (
              <div className="mt-9 rounded-[1.35rem] border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-8 text-center" role="alert" data-testid="status-exam-updates-list-error">
                <p className="text-sm text-[hsl(var(--destructive))]">The notices could not be loaded.</p>
                <button type="button" onClick={() => updatesQuery.refetch()} className="mt-3 text-sm font-bold underline" data-testid="button-retry-exam-updates-list">Try again</button>
              </div>
            ) : updates.length === 0 ? (
              <div className="mt-9 rounded-[1.35rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.58)] px-6 py-16 text-center" data-testid="empty-exam-updates">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))]"><FileText size={24} /></div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{hasActiveSearch ? 'No notices match that search.' : 'No published notices yet.'}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{hasActiveSearch ? 'Try a different exam or search term, or return to the full desk.' : 'Published exam notices will appear here once they are verified and ready to share.'}</p>
                {hasActiveSearch && <button type="button" onClick={resetSearch} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.2)] px-4 text-sm font-bold text-[hsl(var(--primary))]" data-testid="button-reset-exam-updates">Reset search <RotateCcw size={15} /></button>}
              </div>
            ) : (
              <>
                <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
                  {visibleUpdates.map((update) => <UpdateCard key={update.id} update={update} />)}
                </div>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  {updates.length > 3 && <button type="button" onClick={() => setExpanded((current) => !current)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid="button-toggle-all-exam-updates">
                    {expanded ? 'View Less' : 'View All Updates'} {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>}
                  {hasActiveSearch && <button type="button" onClick={resetSearch} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.2)] px-5 text-sm font-bold text-[hsl(var(--primary))]" data-testid="button-reset-exam-updates-results">Reset search <RotateCcw size={15} /></button>}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <PublicFooter settings={{ collegeName: site.collegeName, tagline: site.tagline, logoUrl: site.logoUrl, email: site.email, phone: site.phone, footerText: site.footerText || fallbackSite.footerText }} />
    </div>
  );
}