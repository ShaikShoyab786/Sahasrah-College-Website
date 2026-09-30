import { ArrowRight, BookOpen, CheckCircle2, FileText, GraduationCap, PlayCircle, Bell } from 'lucide-react';
import { Link } from 'wouter';
import { useGetKnowledgeHubArticles, useGetKnowledgeHubMegaMenu, useGetKnowledgeHubResourceHubPage, useGetKnowledgeHubResources, useGetKnowledgeHubVideoHubPage, useGetSiteSettings, type KnowledgeHubArticleSummary, type KnowledgeHubMainPageContent, type KnowledgeHubResourceSummary, type KnowledgeHubVideoSummary } from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const fallbackSettings = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'Your College Tagline',
  logoUrl: null,
  email: 'admissions@sahsrah.edu',
  phone: '+91 40 2458 0176',
  address: '18 Vidya Marg, Hyderabad, Telangana 500034',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  surfaceColor: DEFAULT_SURFACE_COLOR,
  footerText: 'A public junior college for curious minds and purposeful lives.',
};

const categories = [
  { id: 'articles', label: 'Articles', icon: FileText, tint: 'rose' },
  { id: 'video-hub', label: 'Video Hub', icon: PlayCircle, tint: 'violet' },
  { id: 'study-resources', label: 'Study Resources', icon: BookOpen, tint: 'emerald' },
  { id: 'exam-updates', label: 'Exam Updates', icon: Bell, tint: 'amber' },
] as const;

const fallbackMainPage: KnowledgeHubMainPageContent = {
  heroPanelTitle: 'A quieter place to find your next useful step.',
  heroPanelDescription: 'Built around the questions that shape confident study.',
  introEyebrow: 'A clear path through the noise',
  introTitle: 'Four ways to make study feel more manageable.',
  introDescription: 'Browse articles, video sessions, study resources, and verified exam notices and dates in one place.',
  sections: [
    { category: 'articles', eyebrow: 'Knowledge Hub', title: 'Articles', description: 'Clear guidance for the questions students and families ask most often.', statusText: 'Browse published articles for students and families.', badgeLabel: null, ctaLabel: 'Explore Articles' },
    { category: 'video-hub', eyebrow: 'Knowledge Hub', title: 'Video Hub', description: 'A future home for focused explanations and practical learning sessions.', statusText: 'This section is being prepared for students and families.', badgeLabel: 'Coming Soon', ctaLabel: null },
    { category: 'study-resources', eyebrow: 'Knowledge Hub', title: 'Resource Hub', description: 'Find study notes, question papers, and revision materials in a searchable library.', statusText: 'Browse published resources for your next step.', badgeLabel: null, ctaLabel: 'Browse Resource Hub' },
    { category: 'exam-updates', eyebrow: 'Knowledge Hub', title: 'Exam Updates', description: 'Find published exam notifications and important dates for JEE, NEET, Intermediate, EAMCET, and more.', statusText: 'Browse verified notices and upcoming exam milestones.', badgeLabel: null, ctaLabel: 'View Exam Updates' },
  ],
};

function KnowledgeHubSkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-6xl animate-pulse space-y-5"><div className="h-10 w-56 rounded-full bg-[hsl(var(--muted))]" /><div className="h-72 rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="grid gap-4 md:grid-cols-4">{categories.map((category) => <div key={category.id} className="h-48 rounded-2xl bg-[hsl(var(--muted))]" />)}</div></div></div>;
}

function CategorySection({
  category,
  section,
  videoPreview,
  videoCount,
  videoLoading,
  videoError,
  articlePreview,
  articleCount,
  articleLoading,
  articleError,
  resourcePreview,
  resourceCount,
  resourceLoading,
  resourceError,
}: {
  category: typeof categories[number];
  section: KnowledgeHubMainPageContent['sections'][number];
  videoPreview: KnowledgeHubVideoSummary | null;
  videoCount: number | null;
  videoLoading: boolean;
  videoError: boolean;
  articlePreview: KnowledgeHubArticleSummary | null;
  articleCount: number | null;
  articleLoading: boolean;
  articleError: boolean;
  resourcePreview: KnowledgeHubResourceSummary | null;
  resourceCount: number | null;
  resourceLoading: boolean;
  resourceError: boolean;
}) {
  const Icon = category.icon;
  const isArticleHub = category.id === 'articles';
  const isVideoHub = category.id === 'video-hub';
  const isResourceHub = category.id === 'study-resources';
  const tint = category.tint === 'rose'
    ? 'bg-rose-50 border-rose-100 text-rose-700'
    : category.tint === 'violet'
      ? 'bg-violet-50 border-violet-100 text-violet-700'
      : category.tint === 'emerald'
        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
        : 'bg-amber-50 border-amber-100 text-amber-700';

  return (
    <section id={`knowledge-hub-${category.id}`} className="scroll-mt-28 border-t border-[hsl(var(--border))] py-16 sm:py-20" data-testid={`section-knowledge-hub-${category.id}`}>
      <div className="mx-auto grid max-w-5xl gap-7 md:grid-cols-[minmax(0,.65fr)_minmax(0,1fr)] md:items-center">
        <div className={`relative grid min-h-40 place-items-center overflow-hidden rounded-[1.75rem] border ${tint}`}>
          {isVideoHub && videoPreview?.thumbnailImageUrl
            ? <>
                <img src={videoPreview.thumbnailImageUrl} alt={videoPreview.thumbnailImageAltText || videoPreview.title} className="absolute inset-0 h-full w-full object-cover" data-testid="img-knowledge-hub-video-preview" />
                <span className="absolute inset-0 grid place-items-center bg-gradient-to-t from-[hsl(var(--primary)/.42)] to-transparent" aria-hidden="true">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-lg"><PlayCircle size={32} strokeWidth={1.7} /></span>
                </span>
              </>
            : <Icon size={54} strokeWidth={1.2} aria-hidden="true" />}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className={`text-xs font-bold uppercase tracking-[.18em] ${isVideoHub ? 'text-[hsl(var(--accent-foreground))]' : 'text-[hsl(var(--primary))]'}`}>{section.eyebrow}</p>
            {isVideoHub && videoCount !== null
              ? <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]" data-testid="badge-knowledge-hub-video-count">{videoCount} published {videoCount === 1 ? 'session' : 'sessions'}</span>
              : !isVideoHub && !isResourceHub && !isArticleHub && section.badgeLabel && <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{section.badgeLabel}</span>}
          </div>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl">{isResourceHub ? 'Resource Hub' : section.title}</h2>
          {isVideoHub ? (
            <>
              {videoPreview ? (
                <div className="mt-4 max-w-xl" data-testid="card-knowledge-hub-video-preview">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--accent-foreground))]">Featured session</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{videoPreview.title}</h3>
                  <p className="mt-3 text-base leading-7 text-[hsl(var(--muted-foreground))]">{videoPreview.description}</p>
                  <p className="mt-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{videoPreview.categoryName} · {videoPreview.instructor} · {videoPreview.duration}</p>
                </div>
              ) : (
                <p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-knowledge-hub-video-empty">
                  {videoLoading ? 'Loading published sessions…' : videoError ? 'The video library is unavailable right now.' : 'No video sessions have been published yet.'}
                </p>
              )}
              <Link href="/knowledge-hub/videos" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-knowledge-hub-videos-cta">{videoPreview ? 'Browse Video Hub' : 'Open Video Hub'} <ArrowRight size={16} aria-hidden="true" /></Link>
            </>
          ) : isResourceHub ? (
            <>
              <p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{section.description}</p>
              {resourcePreview ? (
                <div className="mt-5 max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4" data-testid="card-knowledge-hub-resource-preview">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--primary))]">Featured resource</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-[hsl(var(--primary))]">{resourcePreview.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{resourcePreview.description}</p>
                  <p className="mt-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{resourcePreview.subject} · {resourcePreview.categoryName}</p>
                </div>
              ) : (
                <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary)/.7)]" data-testid="text-knowledge-hub-resource-count">
                  {resourceLoading ? 'Loading published resources…' : resourceError ? 'The resource library is unavailable right now.' : resourceCount === 0 ? 'No resources have been published yet.' : `${resourceCount ?? 0} published ${resourceCount === 1 ? 'resource' : 'resources'}`}
                </p>
              )}
              <Link href="/knowledge-hub/resources" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-knowledge-hub-resources-cta">{section.ctaLabel ?? 'Browse Resource Hub'} <ArrowRight size={16} aria-hidden="true" /></Link>
            </>
          ) : isArticleHub ? (
            <>
              <p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{section.description}</p>
              {articlePreview ? (
                <Link href={`/knowledge-hub/articles/${encodeURIComponent(articlePreview.slug)}`} className="mt-5 block max-w-xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.55)]" data-testid="card-knowledge-hub-article-preview">
                  <div className="flex min-h-32">
                    {articlePreview.coverImageUrl ? (
                      <img src={articlePreview.coverImageUrl} alt={articlePreview.coverImageAltText} className="w-28 shrink-0 object-cover sm:w-36" data-testid="img-knowledge-hub-article-preview" />
                    ) : (
                      <span className="grid w-24 shrink-0 place-items-center bg-[hsl(var(--primary))] text-[hsl(var(--accent))] sm:w-32" aria-hidden="true"><FileText size={32} strokeWidth={1.3} /></span>
                    )}
                    <span className="min-w-0 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--primary))]">Published article</span>
                      <span className="mt-2 block line-clamp-2 font-display text-lg font-semibold leading-tight text-[hsl(var(--primary))]">{articlePreview.title}</span>
                      <span className="mt-2 block line-clamp-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">{articlePreview.excerpt}</span>
                      <span className="mt-2 block text-xs font-semibold text-[hsl(var(--muted-foreground))]">{articlePreview.categoryName} · {articlePreview.readTimeMinutes} min read</span>
                    </span>
                  </div>
                </Link>
              ) : (
                <p className="mt-5 text-sm font-semibold text-[hsl(var(--muted-foreground))]" data-testid="text-knowledge-hub-article-count">
                  {articleLoading ? 'Loading published articles…' : articleError ? 'The article library is unavailable right now.' : articleCount === 0 ? 'No articles have been published yet.' : `${articleCount ?? 0} published ${articleCount === 1 ? 'article' : 'articles'}`}
                </p>
              )}
              <Link href="/knowledge-hub/articles" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-knowledge-hub-articles-cta">{articlePreview ? 'Browse Article Hub' : 'Open Article Hub'} <ArrowRight size={16} aria-hidden="true" /></Link>
            </>
          ) : (
            <>
              <p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{section.description}</p>
              <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary)/.7)]"><CheckCircle2 size={17} className="text-[hsl(var(--accent-foreground))]" /> {section.statusText}</p>
              <Link href="/knowledge-hub/exam-updates" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-knowledge-hub-exam-updates-cta">{section.ctaLabel || 'View Exam Updates'} <ArrowRight size={16} aria-hidden="true" /></Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function KnowledgeHub() {
  const settingsQuery = useGetSiteSettings();
  const menuQuery = useGetKnowledgeHubMegaMenu();
  const articlesQuery = useGetKnowledgeHubArticles({ sort: 'recent', offset: 0, limit: 1 });
  const videoHubQuery = useGetKnowledgeHubVideoHubPage();
  const resourceHubQuery = useGetKnowledgeHubResourceHubPage();
  const resourceListQuery = useGetKnowledgeHubResources({ sort: 'recent', offset: 0, limit: 1 });
  if (settingsQuery.isLoading) return <KnowledgeHubSkeleton />;

  const settings = settingsQuery.data ?? fallbackSettings;
  const videoPreview = videoHubQuery.data?.featuredVideo ?? videoHubQuery.data?.relatedVideos[0] ?? null;
  const videoCount = videoHubQuery.data?.publishedVideoCount ?? null;
  const articlePreview = articlesQuery.data?.items[0] ?? null;
  const articleCount = articlesQuery.data?.total ?? null;
  const resourcePreview = resourceHubQuery.data?.featuredResource ?? resourceListQuery.data?.items[0] ?? null;
  const resourceCount = resourceHubQuery.data?.publishedResourceCount ?? resourceListQuery.data?.total ?? null;
  const mainPage = menuQuery.data?.mainPage ?? fallbackMainPage;
  const sectionByCategory = new Map(mainPage.sections.map((section) => [section.category, section]));
  const orderedSections = categories.map((category, index) => ({
    category,
    section: sectionByCategory.get(category.id) ?? fallbackMainPage.sections[index],
  }));
  const panel = menuQuery.data?.panel ?? {
    eyebrow: 'SAHSRAH KNOWLEDGE HUB',
    title: 'Learn with more clarity.',
    description: 'A focused companion for the study questions, resources, and exam guidance that matter.',
    imageUrl: null,
    imageAltText: '',
    ctaLabel: 'Explore the Hub',
  };

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={createPublicThemeStyle(settings.primaryColor || DEFAULT_PRIMARY_COLOR, settings.accentColor || DEFAULT_ACCENT_COLOR, settings.surfaceColor || DEFAULT_SURFACE_COLOR)}>
      <PublicHeader settings={settings} activePage="knowledge-hub" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-16 pt-36 text-[hsl(var(--primary-foreground))] sm:pb-20 sm:pt-44 lg:px-10">
          <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: 'linear-gradient(120deg, transparent 0 52%, hsl(var(--accent) / .22) 52.2%, transparent 52.5%), radial-gradient(circle at 80% 25%, hsl(var(--accent) / .3), transparent 28%)' }} />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,.72fr)] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.21em] text-[hsl(var(--accent))]" data-testid="text-knowledge-hub-eyebrow">{panel.eyebrow}</p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[.96] tracking-[-.055em] sm:text-7xl" data-testid="text-knowledge-hub-title">{panel.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{panel.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {orderedSections.map(({ category, section }) => <Link key={category.id} href={category.id === 'articles' ? '/knowledge-hub/articles' : category.id === 'video-hub' ? '/knowledge-hub/videos' : category.id === 'study-resources' ? '/knowledge-hub/resources' : '/knowledge-hub/exam-updates'} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid={`link-knowledge-hub-hero-${category.id}`}>{category.id === 'study-resources' ? 'Resource Hub' : section.title}<ArrowRight size={15} aria-hidden="true" /></Link>)}
              </div>
            </div>
            <div className="relative min-h-64 overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-2xl">
              {panel.imageUrl && <img src={panel.imageUrl} alt={panel.imageAltText} className="absolute inset-0 h-full w-full object-cover opacity-45" data-testid="img-knowledge-hub-hero" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))] via-[hsl(var(--primary)/.6)] to-transparent" aria-hidden="true" />
              <div className="relative flex h-full min-h-52 flex-col justify-end">
                <GraduationCap size={26} className="text-[hsl(var(--accent))]" aria-hidden="true" />
                <p className="mt-5 max-w-xs font-display text-2xl leading-tight">{mainPage.heroPanelTitle}</p>
                <p className="mt-3 text-xs text-white/65">{mainPage.heroPanelDescription}</p>
              </div>
            </div>
          </div>
        </section>
        {menuQuery.isError && <div className="mx-auto max-w-7xl px-6 pt-7 lg:px-10"><div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900" data-testid="status-knowledge-hub-error">The Knowledge Hub is taking a moment to load its latest settings. The category guide remains available below.</div></div>}
        <section className="px-6 py-16 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{mainPage.introEyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl">{mainPage.introTitle}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{mainPage.introDescription}</p>
          </div>
        </section>
        <div className="px-6 lg:px-10">{orderedSections.map(({ category, section }) => <CategorySection key={category.id} category={category} section={section} videoPreview={videoPreview} videoCount={videoCount} videoLoading={videoHubQuery.isLoading} videoError={videoHubQuery.isError} articlePreview={articlePreview} articleCount={articleCount} articleLoading={articlesQuery.isLoading} articleError={articlesQuery.isError} resourcePreview={resourcePreview} resourceCount={resourceCount} resourceLoading={resourceHubQuery.isLoading || resourceListQuery.isLoading} resourceError={resourceHubQuery.isError || resourceListQuery.isError} />)}</div>
      </main>
      <PublicFooter settings={{ ...settings, footerText: settings.footerText || fallbackSettings.footerText }} />
    </div>
  );
}