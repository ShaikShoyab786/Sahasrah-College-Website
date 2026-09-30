import { ArrowRight, BookOpen, ChevronUp, Download, FileText, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  useGetKnowledgeHubResourceHubPage,
  useGetKnowledgeHubResources,
  useGetSiteSettings,
  type GetKnowledgeHubResourcesParams,
  type KnowledgeHubResourceSummary,
  type KnowledgeHubResourceType,
} from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const batchSize = 9;
const resourceEyebrowClass = 'text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--primary))]';
const resourceTypeLabels: Record<KnowledgeHubResourceType, string> = {
  notes: 'Notes',
  'previous-year-question-papers': 'Previous-year papers',
  'sample-papers': 'Sample papers',
  worksheets: 'Worksheets',
  'revision-guides': 'Revision guides',
  other: 'Other resources',
};

const fallbackSite = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'A public junior college for purposeful beginnings.',
  logoUrl: null,
  email: '',
  phone: '',
  address: '',
  socialFacebookUrl: '',
  socialInstagramUrl: '',
  socialYoutubeUrl: '',
  socialLinkedinUrl: '',
  footerText: 'A public college for curious minds and purposeful lives.',
};

function dateLabel(value: string | null) {
  if (!value) return 'Published resource';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Published resource' : new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
}

function PageSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6" role="status" aria-label="Loading resource hub">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6 pt-10">
        <div className="h-8 w-44 rounded-full bg-[hsl(var(--muted))]" />
        <div className="h-[360px] rounded-[2rem] bg-[hsl(var(--muted))]" />
        <div className="grid gap-5 md:grid-cols-3">
          <div className="h-56 rounded-2xl bg-[hsl(var(--muted))]" />
          <div className="h-56 rounded-2xl bg-[hsl(var(--muted))]" />
          <div className="h-56 rounded-2xl bg-[hsl(var(--muted))]" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[hsl(var(--destructive)/.28)] bg-[hsl(var(--destructive)/.06)] p-8 text-center" role="alert" data-testid="status-resource-hub-error">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--destructive))]">Resource Hub unavailable</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-[hsl(var(--primary))]">We could not load the library.</h1>
      <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again in a moment. No unpublished material is shown here.</p>
      <button type="button" onClick={retry} className="mt-6 inline-flex h-11 items-center rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-resource-hub">Try again</button>
    </div>
  );
}

function ResourceCard({ resource, featured = false }: { resource: KnowledgeHubResourceSummary; featured?: boolean }) {
  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.55)] hover:shadow-[var(--shadow-lg)] ${featured ? 'lg:grid lg:grid-cols-[.92fr_1.08fr]' : ''}`} data-testid={`card-resource-${resource.id}`}>
      <div className={`relative overflow-hidden bg-[hsl(var(--primary))] ${featured ? 'min-h-64 lg:min-h-full' : 'aspect-[1.7]'}`}>
        {resource.coverImageUrl ? (
          <img src={resource.coverImageUrl} alt={resource.coverImageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" data-testid={`img-resource-cover-${resource.id}`} />
        ) : (
          <div className="relative grid h-full min-h-52 place-items-center bg-[radial-gradient(circle_at_78%_22%,hsl(var(--accent)/.33),transparent_28%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.75))]" aria-hidden="true">
            <FileText size={featured ? 62 : 48} strokeWidth={1.05} className="text-[hsl(var(--accent))]" />
            <span className="absolute bottom-4 left-5 max-w-[78%] text-[10px] font-bold uppercase tracking-[.18em] text-white/65">{resource.categoryName}</span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-[hsl(var(--accent))] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[hsl(var(--accent-foreground))]">{resourceTypeLabels[resource.resourceType]}</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--primary))]">
          <span>{resource.categoryName}</span><span className="text-[hsl(var(--border))]">/</span><span>{dateLabel(resource.publishedAt)}</span>
        </div>
        <h3 className={`${featured ? 'text-2xl sm:text-3xl' : 'text-xl'} mt-3 font-display font-semibold leading-[1.08] tracking-[-.035em] text-[hsl(var(--primary))]`}>{resource.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{resource.description}</p>
        <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span>{resource.subject}</span>
          {resource.classLevel && <><span className="text-[hsl(var(--border))]">·</span><span>{resource.classLevel}</span></>}
          {resource.academicYear && <><span className="text-[hsl(var(--border))]">·</span><span>{resource.academicYear}</span></>}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <a href={resource.pdfViewUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3.5 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid={`link-view-resource-pdf-${resource.id}`}><FileText size={15} /> View PDF</a>
          <a href={resource.pdfDownloadUrl} download={resource.pdfFileName} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.22)] px-3.5 text-xs font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]" data-testid={`link-download-resource-pdf-${resource.id}`}><Download size={15} /> Download PDF</a>
        </div>
      </div>
    </article>
  );
}

export default function KnowledgeHubResources() {
  const pageQuery = useGetKnowledgeHubResourceHubPage();
  const settingsQuery = useGetSiteSettings();
  const [search, setSearch] = useState('');
  const [resourceType, setResourceType] = useState<KnowledgeHubResourceType | ''>('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [exam, setExam] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest' | 'title' | 'displayOrder'>('displayOrder');
  const [offset, setOffset] = useState(0);
  const [loadedResources, setLoadedResources] = useState<KnowledgeHubResourceSummary[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = useMemo<GetKnowledgeHubResourcesParams>(() => ({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(resourceType ? { resourceType } : {}),
    ...(category ? { category } : {}),
    ...(subject.trim() ? { subject: subject.trim() } : {}),
    ...(exam.trim() ? { exam: exam.trim() } : {}),
    ...(academicYear.trim() ? { academicYear: academicYear.trim() } : {}),
    sort,
    offset,
    limit: batchSize,
  }), [academicYear, category, exam, offset, resourceType, search, sort, subject]);
  const resourcesQuery = useGetKnowledgeHubResources(params);
  const page = pageQuery.data;
  const site = settingsQuery.data ?? fallbackSite;
  const categories = useMemo(() => [...(page?.categories ?? [])].filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder), [page?.categories]);

  useEffect(() => {
    const next = resourcesQuery.data?.items ?? [];
    setLoadedResources((current) => {
      const base = offset === 0 ? [] : current;
      const seen = new Set(base.map((item) => item.id));
      const merged = [...base];
      for (const item of next) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
      return merged;
    });
  }, [offset, resourcesQuery.data]);

  const resetLibrary = () => {
    setOffset(0);
    setLoadedResources([]);
  };
  const clearFilters = () => {
    setSearch(''); setResourceType(''); setCategory(''); setSubject(''); setExam(''); setAcademicYear(''); setSort('displayOrder'); resetLibrary();
  };
  const activeFilterCount = [resourceType, category, subject, exam, academicYear].filter(Boolean).length;
  const hasSearchOrFilters = Boolean(search.trim() || resourceType || category || subject.trim() || exam.trim() || academicYear.trim());
  const libraryResources = hasSearchOrFilters || !page?.featuredResource
    ? loadedResources
    : loadedResources.filter((resource) => resource.id !== page.featuredResource?.id);
  const featuredIsOnlyPublished = !hasSearchOrFilters && Boolean(page?.featuredResource) && resourcesQuery.data?.total === 1;

  if (pageQuery.isLoading || settingsQuery.isLoading) return <PageSkeleton />;
  if (pageQuery.isError) return <div className="min-h-[100dvh] bg-[hsl(var(--background))] px-6 py-20"><ErrorState retry={() => pageQuery.refetch()} /></div>;
  if (!page) return null;

  const { settings } = page;
  return (
    <div className="paper-grain min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" style={createPublicThemeStyle(settingsQuery.data?.primaryColor || DEFAULT_PRIMARY_COLOR, settingsQuery.data?.accentColor || DEFAULT_ACCENT_COLOR, settingsQuery.data?.surfaceColor || DEFAULT_SURFACE_COLOR)}>
      <PublicHeader settings={{ collegeName: site.collegeName, tagline: site.tagline, logoUrl: site.logoUrl }} activePage="knowledge-hub" />
      <main>
        <section className="relative isolate overflow-hidden px-6 pb-14 pt-12 lg:px-10 lg:pb-20 lg:pt-16" data-testid="section-resource-hub-hero">
          {settings.heroBackgroundImageUrl && <img src={settings.heroBackgroundImageUrl} alt={settings.heroBackgroundImageAltText} className="absolute inset-0 -z-20 h-full w-full object-cover" data-testid="img-resource-hub-hero" />}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,hsl(var(--primary)/.98)_0%,hsl(var(--primary)/.91)_46%,hsl(var(--primary)/.58)_100%)]" />
          <div className="absolute -right-28 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-3xl py-9 sm:py-16">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white" data-testid="text-resource-hub-hero-eyebrow">{settings.heroEyebrow}</p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[.96] tracking-[-.065em] text-white sm:text-7xl" data-testid="text-resource-hub-hero-heading">{settings.heroHeading}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{settings.heroDescription}</p>
              <a href={settings.heroCtaHref} className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5" data-testid="link-resource-hub-hero-cta">{settings.heroCtaLabel}<ArrowRight size={17} /></a>
            </div>
          </div>
        </section>

        {page.featuredResource && !hasSearchOrFilters && (
          <section className="px-6 py-14 sm:py-20 lg:px-10" data-testid="section-resource-hub-featured">
            <div className="mx-auto max-w-7xl">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div><p className={resourceEyebrowClass}>{settings.featuredEyebrow}</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-.045em] text-[hsl(var(--primary))] sm:text-4xl">Start with a useful resource.</h2></div>
                <span className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))] sm:flex"><BookOpen size={16} /> {page.publishedResourceCount} published resources</span>
              </div>
              <ResourceCard resource={page.featuredResource} featured />
            </div>
          </section>
        )}

        <section id="resource-library" className="bg-[hsl(var(--secondary))] px-6 py-14 sm:py-20 lg:px-10" data-testid="section-resource-library">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div><p className={resourceEyebrowClass}>{settings.libraryEyebrow}</p><h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl" data-testid="text-resource-library-heading">{settings.libraryHeading}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{settings.libraryDescription}</p></div>
              <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold text-[hsl(var(--muted-foreground))]" data-testid="text-resource-count"><BookOpen size={16} /> {page.publishedResourceCount} published</div>
            </div>
            <div className="mt-9 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-[var(--shadow-xs)]">
              <div className="flex flex-col gap-3 lg:flex-row">
                <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl bg-[hsl(var(--secondary))] px-4"><Search size={18} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Search resources</span><input value={search} onChange={(event) => { setSearch(event.target.value); resetLibrary(); }} placeholder={settings.searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-search-resources" />{search && <button type="button" onClick={() => { setSearch(''); resetLibrary(); }} aria-label="Clear resource search" className="rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" data-testid="button-clear-resource-search"><X size={16} /></button>}</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 sm:w-48"><SlidersHorizontal size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Sort resources</span><select value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); resetLibrary(); }} className="w-full bg-transparent text-sm font-semibold outline-none" data-testid="select-resource-sort"><option value="displayOrder">Curated order</option><option value="recent">Latest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></label>
                  <button type="button" onClick={() => setFiltersOpen((current) => !current)} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 text-sm font-bold text-[hsl(var(--primary))] lg:hidden" aria-expanded={filtersOpen} data-testid="button-toggle-resource-filters"><Filter size={16} /> Filters {activeFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[hsl(var(--accent))] px-1 text-[10px] text-[hsl(var(--accent-foreground))]">{activeFilterCount}</span>}</button>
                </div>
              </div>
              <div className={`${filtersOpen ? 'grid' : 'hidden'} mt-3 gap-3 border-t border-[hsl(var(--border))] pt-3 lg:grid lg:grid-cols-5`}>
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3"><span className="sr-only">Resource type</span><select value={resourceType} onChange={(event) => { setResourceType(event.target.value as KnowledgeHubResourceType | ''); resetLibrary(); }} className="w-full bg-transparent text-sm font-semibold outline-none" data-testid="select-resource-type"><option value="">All resource types</option>{Object.entries(resourceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3"><span className="sr-only">Subject</span><input value={subject} onChange={(event) => { setSubject(event.target.value); resetLibrary(); }} placeholder="Subject" className="w-full bg-transparent text-sm outline-none" data-testid="input-filter-subject" /></label>
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3"><span className="sr-only">Exam</span><input value={exam} onChange={(event) => { setExam(event.target.value); resetLibrary(); }} placeholder="Exam" className="w-full bg-transparent text-sm outline-none" data-testid="input-filter-exam" /></label>
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3"><span className="sr-only">Academic year</span><input value={academicYear} onChange={(event) => { setAcademicYear(event.target.value); resetLibrary(); }} placeholder="Academic year" className="w-full bg-transparent text-sm outline-none" data-testid="input-filter-academic-year" /></label>
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3"><span className="sr-only">Category</span><select value={category} onChange={(event) => { setCategory(event.target.value); resetLibrary(); }} className="w-full bg-transparent text-sm font-semibold outline-none" data-testid="select-resource-category"><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
                {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="text-left text-xs font-bold text-[hsl(var(--accent-foreground))] underline underline-offset-4 lg:col-span-5" data-testid="button-clear-resource-filters">Clear all filters</button>}
              </div>
            </div>
            <div className="mt-8" aria-live="polite">
              {resourcesQuery.isLoading && offset === 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-[1.4rem] bg-[hsl(var(--muted))]" role="status" aria-label="Loading resource" />)}</div> : resourcesQuery.isError ? <div className="rounded-2xl border border-[hsl(var(--destructive)/.22)] bg-[hsl(var(--destructive)/.06)] p-8 text-center" role="alert" data-testid="status-resource-library-error"><p className="text-sm text-[hsl(var(--destructive))]">The library could not be loaded.</p><button type="button" onClick={() => resourcesQuery.refetch()} className="mt-3 text-sm font-bold underline" data-testid="button-retry-resource-library">Try again</button></div> : libraryResources.length === 0 ? <div className="rounded-[1.4rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] px-6 py-16 text-center" data-testid="empty-resource-library"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><Search size={23} /></div><h3 className="mt-5 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{hasSearchOrFilters ? 'No resources match your filters.' : featuredIsOnlyPublished ? 'The featured resource is the only published item.' : settings.emptyStateTitle}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{hasSearchOrFilters ? 'Try another search or clear one or more filters.' : featuredIsOnlyPublished ? 'It is shown above. The library will include other resources as they are published.' : settings.emptyStateDescription}</p></div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{libraryResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>}
            </div>
            {!resourcesQuery.isError && loadedResources.length > 0 && (resourcesQuery.data?.hasMore || loadedResources.length > batchSize) && <div className="mt-9 flex flex-wrap justify-center gap-3" data-testid="resource-library-controls">{resourcesQuery.data?.hasMore && <button type="button" onClick={() => setOffset((current) => current + batchSize)} disabled={resourcesQuery.isFetching} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card))] px-5 text-sm font-bold text-[hsl(var(--primary))] disabled:opacity-50" data-testid="button-load-more-resources">{resourcesQuery.isFetching ? 'Loading…' : 'Load More'} <ArrowRight size={16} /></button>}{loadedResources.length > batchSize && <button type="button" onClick={() => { setOffset(0); setLoadedResources((current) => current.slice(0, batchSize)); }} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card))] px-5 text-sm font-bold text-[hsl(var(--primary))]" data-testid="button-view-less-resources">View Less <ChevronUp size={16} /></button>}</div>}
          </div>
        </section>
      </main>
      <PublicFooter settings={{ collegeName: site.collegeName, tagline: site.tagline, logoUrl: site.logoUrl, email: site.email, phone: site.phone, address: site.address, socialFacebookUrl: site.socialFacebookUrl, socialInstagramUrl: site.socialInstagramUrl, socialYoutubeUrl: site.socialYoutubeUrl, socialLinkedinUrl: site.socialLinkedinUrl, footerText: site.footerText || fallbackSite.footerText }} />
    </div>
  );
}