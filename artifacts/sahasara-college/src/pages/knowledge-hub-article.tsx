import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Clock3 } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useGetKnowledgeHubArticleBySlug, useGetKnowledgeHubArticlesPage, useGetSiteSettings } from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

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
  return new Intl.DateTimeFormat('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function LoadingArticle() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6" role="status" aria-label="Loading article"><div className="mx-auto max-w-5xl animate-pulse space-y-5 pt-12"><div className="h-5 w-40 rounded-full bg-[hsl(var(--muted))]" /><div className="h-24 max-w-3xl rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-80 rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="space-y-3"><div className="h-5 rounded bg-[hsl(var(--muted))]" /><div className="h-5 rounded bg-[hsl(var(--muted))]" /><div className="h-5 w-4/5 rounded bg-[hsl(var(--muted))]" /></div></div></div>;
}

function ArticleError({ retry }: { retry: () => void }) {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] px-6 py-36"><div className="mx-auto max-w-xl rounded-3xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-8 text-center" role="alert" data-testid="status-knowledge-article-error"><p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--destructive))]">Article unavailable</p><h1 className="mt-3 font-display text-3xl font-semibold text-[hsl(var(--primary))]">This article could not be opened.</h1><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">It may have been moved or is not published yet.</p><button type="button" onClick={retry} className="mt-6 inline-flex h-11 items-center rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-knowledge-article">Try again</button></div></div>;
}

export default function KnowledgeHubArticle() {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug ?? '';
  const articleQuery = useGetKnowledgeHubArticleBySlug(slug);
  const settingsQuery = useGetKnowledgeHubArticlesPage();
  const siteQuery = useGetSiteSettings();

  if (articleQuery.isLoading || settingsQuery.isLoading || siteQuery.isLoading) return <LoadingArticle />;
  if (articleQuery.isError || !articleQuery.data || settingsQuery.isError || !settingsQuery.data) return <ArticleError retry={() => { void articleQuery.refetch(); void settingsQuery.refetch(); }} />;

  const article = articleQuery.data;
  const site = siteQuery.data ?? fallbackSite;
  const themeStyle = createPublicThemeStyle(siteQuery.data?.primaryColor || DEFAULT_PRIMARY_COLOR, siteQuery.data?.accentColor || DEFAULT_ACCENT_COLOR, siteQuery.data?.surfaceColor || DEFAULT_SURFACE_COLOR);
  const category = settingsQuery.data.categories.find((item) => item.id === article.categoryId);

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={{ collegeName: site.collegeName, tagline: site.tagline, logoUrl: site.logoUrl }} activePage="knowledge-hub" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-12 pt-36 text-[hsl(var(--primary-foreground))] sm:pb-16 sm:pt-44 lg:px-10">
          <div className="absolute inset-0 opacity-75" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, hsl(var(--accent) / .26), transparent 28%), linear-gradient(125deg, transparent 0 70%, hsl(var(--accent) / .1) 70.2%, transparent 70.7%)' }} />
          <div className="relative mx-auto max-w-5xl">
            <Link href="/knowledge-hub/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary-foreground)/.88)] transition hover:text-[hsl(var(--primary-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-back-knowledge-articles"><ArrowLeft size={16} /> All articles</Link>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[.15em]">
              <span className="rounded-full border border-[hsl(var(--accent))] bg-[hsl(var(--accent))] px-3 py-1.5 text-[hsl(var(--accent-foreground))]" data-testid="text-knowledge-article-category">{category?.name ?? article.categoryName}</span>
              <span className="hidden text-[hsl(var(--primary-foreground)/.58)] sm:inline" aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1.5 text-[hsl(var(--primary-foreground)/.84)]"><Clock3 size={14} /> {article.readTimeMinutes} minute read</span>
              <span className="hidden text-[hsl(var(--primary-foreground)/.58)] sm:inline" aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1.5 text-[hsl(var(--primary-foreground)/.84)]"><CalendarDays size={14} /> {dateLabel(article.publishedAt)}</span>
            </div>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[.96] tracking-[-.06em] sm:text-7xl" data-testid="text-knowledge-article-title">{article.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[hsl(var(--primary-foreground)/.9)]" data-testid="text-knowledge-article-excerpt">{article.excerpt}</p>
            <p className="mt-6 text-sm font-semibold text-[hsl(var(--primary-foreground)/.8)]" data-testid="text-knowledge-article-author">Written by {article.author}</p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="-mt-7 overflow-hidden rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--primary))] shadow-[var(--shadow-xl)]">
            {article.coverImageUrl ? <img src={article.coverImageUrl} alt={article.coverImageAltText} className="max-h-[560px] min-h-64 w-full object-cover" data-testid="img-knowledge-article-cover" /> : <div className="grid min-h-64 place-items-center bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.72))]"><BookOpen size={70} strokeWidth={1} className="text-[hsl(var(--accent))]" /></div>}
          </div>
        </div>

        <section className="px-6 py-14 sm:py-20 lg:px-10">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <article className="min-w-0">
              <div className="whitespace-pre-wrap text-[1.05rem] leading-[1.9] text-[hsl(var(--foreground))]" data-testid="text-knowledge-article-body">{article.body}</div>
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-6"><Link href="/knowledge-hub/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-knowledge-article-library"><ArrowLeft size={16} /> Browse all guidance</Link><Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]" data-testid="link-knowledge-article-contact">Talk to admissions <ArrowRight size={16} /></Link></div>
            </article>
            <aside className="h-fit rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 lg:sticky lg:top-28" data-testid="panel-knowledge-article-meta">
              <p className="inline-flex rounded-full border border-[hsl(var(--accent)/.22)] bg-[hsl(var(--accent)/.08)] px-2.5 py-1 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">ARTICLE NOTES</p>
              <div className="mt-5 space-y-4 text-sm"><div><p className="text-[hsl(var(--muted-foreground))]">Topic</p><p className="mt-1 font-bold text-[hsl(var(--primary))]">{article.categoryName}</p></div><div><p className="text-[hsl(var(--muted-foreground))]">Published</p><p className="mt-1 font-bold text-[hsl(var(--primary))]">{dateLabel(article.publishedAt)}</p></div><div><p className="text-[hsl(var(--muted-foreground))]">Reading time</p><p className="mt-1 font-bold text-[hsl(var(--primary))]">{article.readTimeMinutes} minutes</p></div></div>
            </aside>
          </div>
        </section>
      </main>
      <PublicFooter settings={{ ...site, footerText: site.footerText || fallbackSite.footerText }} />
    </div>
  );
}