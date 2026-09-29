import { ArrowRight, BookOpen, Clock3, Compass, FlaskConical, GraduationCap, HeartPulse, Lightbulb, Search, Sparkles, Stethoscope, Target, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  getGetKnowledgeHubArticlesQueryKey,
  useGetKnowledgeHubArticles,
  useGetKnowledgeHubArticlesPage,
  useGetSiteSettings,
  type KnowledgeHubArticleCategory,
  type KnowledgeHubArticleSummary,
  type KnowledgeHubArticlesPageSettings,
} from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const limit = 9;

const fallbackSite = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'Your College Tagline',
  logoUrl: null,
  email: '',
  phone: '',
  footerText: 'A public junior college for curious minds and purposeful lives.',
};

function dateLabel(value: string | null) {
  if (!value) return 'Recently published';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function PageSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6" role="status" aria-label="Loading Knowledge Hub">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6 pt-10">
        <div className="h-8 w-44 rounded-full bg-[hsl(var(--muted))]" />
        <div className="h-[360px] rounded-[2rem] bg-[hsl(var(--muted))]" />
        <div className="grid gap-5 md:grid-cols-3"><div className="h-48 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-48 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-48 rounded-2xl bg-[hsl(var(--muted))]" /></div>
      </div>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-8 text-center" role="alert" data-testid="status-knowledge-hub-articles-error">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--destructive))]">Knowledge Hub unavailable</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-[hsl(var(--primary))]">We could not load the latest articles.</h1>
      <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again in a moment. Your saved filters will stay in place.</p>
      <button type="button" onClick={retry} className="mt-6 inline-flex h-11 items-center rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-knowledge-hub-articles">Try again</button>
    </div>
  );
}

function ArticleCard({ article }: { article: KnowledgeHubArticleSummary }) {
  return (
    <article className="knowledge-card group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.55)] hover:shadow-[var(--shadow-lg)]" data-testid={`card-knowledge-article-${article.id}`}>
      <Link href={`/knowledge-hub/articles/${article.slug}`} className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]" data-testid={`link-knowledge-article-${article.id}`}>
        <div className="relative aspect-[1.55] overflow-hidden bg-[hsl(var(--primary))]">
          {article.coverImageUrl ? <img src={article.coverImageUrl} alt={article.coverImageAltText} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" data-testid={`img-knowledge-article-${article.id}`} /> : (
            <div className="relative grid h-full place-items-center bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.72))]">
              <BookOpen size={46} strokeWidth={1.2} className="text-[hsl(var(--accent))]" aria-hidden="true" />
              <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[.18em] text-white/60">{article.categoryName}</span>
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[hsl(var(--primary)/.78)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-white backdrop-blur-sm">{article.categoryName}</span>
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]"><span className="inline-flex items-center gap-1"><Clock3 size={13} /> {article.readTimeMinutes} min read</span><span aria-hidden="true">·</span><span>{dateLabel(article.publishedAt)}</span></div>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-[-.035em] text-[hsl(var(--primary))]">{article.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{article.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[hsl(var(--primary))]">Read article <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
        </div>
      </Link>
    </article>
  );
}

function EmptyArticles({ searched }: { searched: boolean }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.62)] px-6 py-14 text-center" data-testid="empty-knowledge-hub-articles">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent-foreground))]"><BookOpen size={25} /></div>
      <h3 className="mt-5 font-display text-3xl font-semibold tracking-[-.03em] text-[hsl(var(--primary))]">{searched ? 'No articles match that search.' : 'The first articles are being prepared.'}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{searched ? 'Try another phrase or choose a different topic. Published guidance will appear here as it is approved.' : 'There are no published articles in the Knowledge Hub yet. Check back soon for practical guidance from the college.'}</p>
    </div>
  );
}

function SupportPanel({ title, description, label, href, tone }: { title: string; description: string; label: string; href: string; tone: 'dark' | 'warm' }) {
  return (
    <section className={`relative overflow-hidden rounded-[1.65rem] border p-7 ${tone === 'dark' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--accent)/.24)] bg-[hsl(var(--accent)/.09)] text-[hsl(var(--primary))]'}`} data-testid={`panel-knowledge-${tone}`}>
      <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full border-[22px] border-[hsl(var(--accent)/.22)]" aria-hidden="true" />
      <Sparkles size={22} className={tone === 'dark' ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--accent-foreground))]'} aria-hidden="true" />
      <h2 className="relative mt-6 max-w-sm font-display text-3xl font-semibold leading-tight tracking-[-.035em]">{title}</h2>
      <p className={`relative mt-3 max-w-md text-sm leading-6 ${tone === 'dark' ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'}`}>{description}</p>
      <a href={href} className={`relative mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition hover:-translate-y-0.5 ${tone === 'dark' ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : 'border border-[hsl(var(--primary)/.18)] bg-[hsl(var(--card))] text-[hsl(var(--primary))]'}`} data-testid={`link-knowledge-${tone}-panel`}>{label}<ArrowRight size={16} /></a>
    </section>
  );
}

const categoryIcons: Record<string, LucideIcon> = {
  target: Target,
  stethoscope: Stethoscope,
  'book-open': BookOpen,
  'flask-conical': FlaskConical,
  'heart-pulse': HeartPulse,
  lightbulb: Lightbulb,
  'graduation-cap': GraduationCap,
  compass: Compass,
};

function CategorySidebar({ categories, selected, total, onSelect, settings }: {
  categories: KnowledgeHubArticleCategory[];
  selected: string;
  total: number;
  onSelect: (slug: string) => void;
  settings: KnowledgeHubArticlesPageSettings;
}) {
  const categoryButtonClass = (active: boolean) => `flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${active ? 'bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]' : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'}`;
  return (
    <aside className="space-y-5" aria-label="Article topics and help">
      <section className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)]" data-testid="panel-knowledge-article-categories">
        <h2 className="font-display text-xl font-semibold tracking-[-.03em] text-[hsl(var(--primary))]">Browse by category</h2>
        <div className="mt-4 space-y-1">
          <button type="button" onClick={() => onSelect('')} aria-pressed={!selected} className={categoryButtonClass(!selected)} data-testid="button-knowledge-category-all">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--accent-foreground))]"><BookOpen size={16} /></span>
            <span className="flex-1">All Articles</span>
            <span className="min-w-7 rounded-full bg-[hsl(var(--secondary))] px-2 py-1 text-center text-[11px] text-[hsl(var(--muted-foreground))]" data-testid="count-knowledge-category-all">{total}</span>
          </button>
          {categories.map((item) => {
            const Icon = categoryIcons[item.icon] ?? BookOpen;
            const active = selected === item.slug;
            return (
              <button key={item.id} type="button" onClick={() => onSelect(item.slug)} aria-pressed={active} className={categoryButtonClass(active)} data-testid={`button-knowledge-category-${item.slug}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${active ? 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'}`}><Icon size={16} /></span>
                <span className="flex-1">{item.name}</span>
                <span className="min-w-7 rounded-full bg-[hsl(var(--secondary))] px-2 py-1 text-center text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`count-knowledge-category-${item.slug}`}>{item.publishedArticleCount}</span>
              </button>
            );
          })}
        </div>
      </section>
      {settings.topicPanelVisible && <SupportPanel title={settings.topicPanelTitle} description={settings.topicPanelDescription} label={settings.topicPanelCtaLabel} href={settings.topicPanelHref} tone="warm" />}
      {settings.updatesPanelVisible && <SupportPanel title={settings.updatesPanelTitle} description={settings.updatesPanelDescription} label={settings.updatesPanelCtaLabel} href={settings.updatesPanelHref} tone="dark" />}
    </aside>
  );
}

export default function KnowledgeHubArticles() {
  const settingsQuery = useGetKnowledgeHubArticlesPage();
  const siteQuery = useGetSiteSettings();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [offset, setOffset] = useState(0);
  const [loadedArticles, setLoadedArticles] = useState<KnowledgeHubArticleSummary[]>([]);
  const params = useMemo(() => ({ search: search.trim() || undefined, category: category || undefined, sort, offset, limit }), [category, offset, search, sort]);
  const articlesQuery = useGetKnowledgeHubArticles(params, { query: { queryKey: getGetKnowledgeHubArticlesQueryKey(params) } });
  const pageData = settingsQuery.data;
  const settings = pageData?.settings;
  const site = siteQuery.data ?? fallbackSite;

  useEffect(() => { setOffset(0); setLoadedArticles([]); }, [category, search, sort]);
  useEffect(() => {
    if (!articlesQuery.data) return;
    setLoadedArticles((current) => articlesQuery.data.offset === 0 ? articlesQuery.data.items : [...current, ...articlesQuery.data.items.filter((item) => !current.some((existing) => existing.id === item.id))]);
  }, [articlesQuery.data]);

  if (settingsQuery.isLoading || siteQuery.isLoading) return <PageSkeleton />;
  if (settingsQuery.isError || !pageData || !settings) return <div className="min-h-[100dvh] bg-[hsl(var(--background))] px-6 py-32"><ErrorState retry={() => { void settingsQuery.refetch(); }} /></div>;

  const themeStyle = createPublicThemeStyle(siteQuery.data?.primaryColor || DEFAULT_PRIMARY_COLOR, siteQuery.data?.accentColor || DEFAULT_ACCENT_COLOR, siteQuery.data?.surfaceColor || DEFAULT_SURFACE_COLOR);
  const featured = pageData.featuredArticle;
  const categories = pageData.categories.filter((item) => item.isVisible);
  const articles = loadedArticles;

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={{ collegeName: site.collegeName, tagline: site.tagline, logoUrl: site.logoUrl }} activePage="knowledge-hub" appearance="light" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--background))] px-6 pb-16 pt-36 text-[hsl(var(--foreground))] sm:pb-20 sm:pt-44 lg:px-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[43%] bg-[hsl(var(--secondary)/.55)] lg:block" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.92fr)] lg:items-center">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/.2)] bg-[hsl(var(--accent)/.07)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-[hsl(var(--primary))]" data-testid="text-articles-hero-eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />{settings.heroEyebrow}</p>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[.96] tracking-[-.065em] text-[hsl(var(--primary))] sm:text-7xl" data-testid="text-articles-hero-title">{settings.heroTitle} <span className="text-[hsl(var(--accent))]">{settings.heroAccentText}</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg" data-testid="text-articles-hero-description">{settings.heroDescription}</p>
              <div className="mt-7 flex max-w-xl flex-col border-y border-[hsl(var(--border))] sm:flex-row">
                <div className="flex items-center gap-3 py-4 sm:min-w-44 sm:flex-1 sm:pr-5" data-testid="metric-published-articles">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.09)] text-[hsl(var(--accent-foreground))]"><BookOpen size={18} aria-hidden="true" /></span>
                  <span><span className="block font-display text-2xl font-semibold leading-none text-[hsl(var(--primary))]">{pageData.publishedArticleCount}</span><span className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{settings.articlesMetricLabel}</span></span>
                </div>
                <div className="flex items-center gap-3 border-t border-[hsl(var(--border))] py-4 sm:min-w-52 sm:flex-1 sm:border-l sm:border-t-0 sm:pl-5" data-testid="metric-expert-insights">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.09)] text-[hsl(var(--accent-foreground))]"><Sparkles size={18} aria-hidden="true" /></span>
                  <span><span className="block text-sm font-bold text-[hsl(var(--primary))]">{settings.expertsMetricTitle}</span><span className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{settings.expertsMetricDescription}</span></span>
                </div>
              </div>
              <a href={settings.heroCtaHref} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]" data-testid="link-articles-hero-cta">{settings.heroCtaLabel}<ArrowRight size={17} /></a>
            </div>
            <div className="relative aspect-[1.25/1] min-h-64 overflow-hidden rounded-[1.7rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] shadow-[var(--shadow-xl)] sm:min-h-[23rem]" data-testid="media-articles-hero">
              {settings.heroImageUrl ? (
                <img src={settings.heroImageUrl} alt={settings.heroImageAltText} className="absolute inset-0 h-full w-full object-cover" data-testid="img-articles-hero" />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/.16),transparent_35%),linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--background)))]" aria-hidden="true"><BookOpen size={58} strokeWidth={1} className="text-[hsl(var(--accent))]" /></div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] border-[10px] border-white/15" aria-hidden="true" />
            </div>
          </div>
        </section>

        {featured && (
          <section className="px-6 py-14 sm:py-20 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{settings.featuredEyebrow}</p>
              <Link href={`/knowledge-hub/articles/${featured.slug}`} className="knowledge-featured group mt-5 grid overflow-hidden rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-xl)] md:grid-cols-[.9fr_1.1fr]" data-testid="link-knowledge-featured-article">
                <div className="relative min-h-64 overflow-hidden bg-[hsl(var(--primary))] md:min-h-80">{featured.coverImageUrl ? <img src={featured.coverImageUrl} alt={featured.coverImageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" data-testid="img-knowledge-featured-article" /> : <div className="grid h-full place-items-center"><BookOpen size={64} strokeWidth={1} className="text-[hsl(var(--accent))]" /></div>}</div>
                <div className="flex flex-col justify-center p-7 sm:p-10"><div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]"><span className="text-[hsl(var(--accent-foreground))]">{featured.categoryName}</span><span>•</span><span>{featured.readTimeMinutes} min read</span></div><h2 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl">{featured.title}</h2><p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{featured.excerpt}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]">Open featured article <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span></div>
              </Link>
            </div>
          </section>
        )}

        <section className="home-paper-grid border-y border-[hsl(var(--border))] px-6 py-16 sm:py-20 lg:px-10" id="articles-list">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{settings.articlesEyebrow}</p><h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl" data-testid="text-articles-heading">{settings.articlesHeading}</h2><p className="mt-4 text-base leading-7 text-[hsl(var(--muted-foreground))]">{settings.articlesDescription}</p></div>
            <div className="mt-9 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="min-w-0">
            <div className="mt-0 flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.86)] p-3 shadow-[var(--shadow-xs)] sm:flex-row">
              <label className="relative flex min-h-12 flex-1 items-center"><Search size={18} className="absolute left-4 text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Search articles</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={settings.searchPlaceholder} className="h-12 w-full rounded-xl bg-transparent pl-11 pr-4 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-knowledge-article-search" /></label>
              <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="min-h-12 min-w-36 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none" aria-label="Sort articles" data-testid="select-knowledge-article-sort"><option value="recent">Most recent</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]"><span data-testid="text-knowledge-article-result-count">{articlesQuery.data?.total ?? 0} published {articlesQuery.data?.total === 1 ? 'article' : 'articles'}</span>{(search || category) && <button type="button" onClick={() => { setSearch(''); setCategory(''); }} className="text-[hsl(var(--accent-foreground))] hover:underline" data-testid="button-clear-knowledge-article-filters">Clear filters</button>}</div>
            <div className="mt-5">{articlesQuery.isLoading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><div className="h-96 animate-pulse rounded-[1.45rem] bg-[hsl(var(--muted))]" /><div className="h-96 animate-pulse rounded-[1.45rem] bg-[hsl(var(--muted))]" /><div className="h-96 animate-pulse rounded-[1.45rem] bg-[hsl(var(--muted))]" /></div> : articlesQuery.isError ? <ErrorState retry={() => { void articlesQuery.refetch(); }} /> : articles.length === 0 ? <EmptyArticles searched={Boolean(search || category)} /> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>}</div>
            {!articlesQuery.isLoading && !articlesQuery.isError && articles.length > 0 && articlesQuery.data?.hasMore && <div className="mt-9 text-center"><button type="button" onClick={() => setOffset((current) => current + limit)} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card))] px-5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]" data-testid="button-load-more-knowledge-articles">Load more articles <ArrowRight size={16} /></button></div>}
              </div>
              <CategorySidebar categories={categories} selected={category} total={pageData.publishedArticleCount} onSelect={setCategory} settings={settings} />
            </div>
          </div>
        </section>

      </main>
      <PublicFooter settings={{ ...site, footerText: site.footerText || fallbackSite.footerText }} />
    </div>
  );
}