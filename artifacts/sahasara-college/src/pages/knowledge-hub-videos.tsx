import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, Clock3, ExternalLink, Play, Search, SlidersHorizontal, Video, X } from 'lucide-react';
import { Link } from 'wouter';
import { useGetKnowledgeHubVideoHubPage, useGetKnowledgeHubVideoHubVideos, useGetSiteSettings, type KnowledgeHubVideoSummary } from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const fallbackSettings = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'A public junior college for purposeful beginnings.',
  logoUrl: null,
  email: 'admissions@sahsrah.edu',
  phone: '+91 40 2458 0176',
  footerText: 'A public college for curious minds and purposeful lives.',
};

function isYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return false;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = url.hostname === 'youtu.be'
      ? pathParts.length === 1 ? pathParts[0] : ''
      : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)
        ? url.pathname === '/watch' ? url.searchParams.get('v') : pathParts.length === 2 && ['shorts', 'embed', 'live', 'v'].includes(pathParts[0]) ? pathParts[1] : ''
        : '';
    return /^[A-Za-z0-9_-]{11}$/.test(id || '');
  } catch {
    return false;
  }
}

function dateLabel(value?: string | null) {
  if (!value) return 'Published session';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Published session' : new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
}

function VideoThumbnail({ video, compact = false }: { video: KnowledgeHubVideoSummary; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-[hsl(var(--primary))] ${compact ? 'aspect-[1.55]' : 'aspect-[1.78]'}`}>
      {video.thumbnailImageUrl ? (
        <img src={video.thumbnailImageUrl} alt={video.thumbnailImageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" data-testid={`img-video-thumbnail-${video.id}`} />
      ) : (
        <div className="relative grid h-full place-items-center bg-[radial-gradient(circle_at_70%_20%,hsl(var(--accent)/.26),transparent_34%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/.72))]" aria-hidden="true">
          <Video size={compact ? 34 : 46} strokeWidth={1.1} className="text-[hsl(var(--accent))]" />
          <span className="absolute bottom-3 left-4 max-w-[70%] text-[10px] font-bold uppercase tracking-[.18em] text-white/65">{video.categoryName}</span>
        </div>
      )}
      <span className="absolute bottom-3 right-3 rounded-md bg-[hsl(var(--primary)/.86)] px-2 py-1 text-[11px] font-bold text-white">{video.duration}</span>
      <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[var(--shadow)] transition group-hover:scale-105" aria-hidden="true"><Play size={16} fill="currentColor" /></span>
    </div>
  );
}

function VideoCard({ video }: { video: KnowledgeHubVideoSummary }) {
  return (
    <article className="knowledge-card group overflow-hidden rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.58)] hover:shadow-[var(--shadow-lg)]" data-testid={`card-video-${video.id}`}>
      <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.32)]" data-testid={`link-video-${video.id}`}>
        <VideoThumbnail video={video} compact />
        <div className="p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--accent-foreground))]"><span className="rounded-full bg-[hsl(var(--accent)/.19)] px-2.5 py-1">{video.categoryName}</span><span className="text-[hsl(var(--muted-foreground))]">{dateLabel(video.publishedAt)}</span></div>
          <h3 className="mt-4 line-clamp-2 font-display text-[1.35rem] font-semibold leading-tight tracking-[-.03em] text-[hsl(var(--primary))]">{video.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{video.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]"><span className="inline-flex min-w-0 items-center gap-2 truncate"><CheckCircle2 size={14} className="shrink-0 text-[hsl(var(--accent-foreground))]" />{video.instructor}</span><span className="inline-flex shrink-0 items-center gap-1 text-[hsl(var(--primary))]">Watch <ExternalLink size={13} /></span></div>
        </div>
      </a>
    </article>
  );
}

function FeaturedSession({ video, relatedVideos, eyebrow, onSelect }: { video: KnowledgeHubVideoSummary; relatedVideos: KnowledgeHubVideoSummary[]; eyebrow: string; onSelect: (video: KnowledgeHubVideoSummary) => void }) {
  return (
    <section className="px-6 py-14 sm:py-20 lg:px-10" data-testid="section-featured-video">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--primary))]">{eyebrow}</p></div>
        <div className="grid overflow-hidden rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] shadow-[var(--shadow-md)] lg:grid-cols-[1.1fr_.9fr]">
          <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="group block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent)/.32)]" data-testid={`link-featured-video-${video.id}`}><VideoThumbnail video={video} /></a>
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--accent-foreground))]"><span className="rounded-full bg-[hsl(var(--accent)/.2)] px-3 py-1.5">{video.categoryName}</span><span className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))]"><Clock3 size={13} /> {video.duration}</span></div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl">{video.title}</h2>
            <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{video.description}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">With {video.instructor}</p>
            <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid={`button-watch-featured-${video.id}`}>Watch on YouTube <ArrowRight size={17} /></a>
          </div>
        </div>
        {relatedVideos.length > 0 && <div className="mt-5 flex gap-3 overflow-x-auto pb-2" aria-label="Select a featured session" data-testid="featured-video-choices">{relatedVideos.map((candidate) => <button key={candidate.id} type="button" onClick={() => onSelect(candidate)} className="group w-52 shrink-0 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.28)]" data-testid={`button-select-featured-${candidate.id}`}><VideoThumbnail video={candidate} compact /><span className="block truncate px-3 py-2.5 text-xs font-semibold text-[hsl(var(--primary))]">{candidate.title}</span><span className="sr-only">Make {candidate.title} the featured session</span></button>)}</div>}
      </div>
    </section>
  );
}

function PublicSkeleton() {
  return <div className="min-h-[100dvh] animate-pulse bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-7xl space-y-8"><div className="h-8 w-48 rounded-full bg-[hsl(var(--muted))]" /><div className="h-[25rem] rounded-[2rem] bg-[hsl(var(--muted))]" /><div className="grid gap-5 md:grid-cols-3"><div className="h-72 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-72 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-72 rounded-2xl bg-[hsl(var(--muted))]" /></div></div></div>;
}

export default function KnowledgeHubVideos() {
  const siteQuery = useGetSiteSettings();
  const pageQuery = useGetKnowledgeHubVideoHubPage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'displayOrder' | 'recent' | 'oldest' | 'title'>('displayOrder');
  const [offset, setOffset] = useState(0);
  const [activeFeaturedId, setActiveFeaturedId] = useState<string | null>(null);
  const params = useMemo(() => ({ ...(search.trim() ? { search: search.trim() } : {}), ...(category ? { category } : {}), sort, offset, limit: 9 }), [search, category, sort, offset]);
  const videosQuery = useGetKnowledgeHubVideoHubVideos(params);
  const settings = siteQuery.data ?? fallbackSettings;
  const page = pageQuery.data;
  const videos = videosQuery.data?.items ?? [];
  const validVideos = videos.filter((video) => isYoutubeUrl(video.youtubeUrl));
  const visibleCategories = page?.categories?.filter((item) => item.isVisible) ?? [];
  const featuredCandidates = page ? [...(page.featuredVideo ? [page.featuredVideo] : []), ...page.relatedVideos] : [];
  const activeFeaturedVideo = featuredCandidates.find((video) => video.id === activeFeaturedId) ?? page?.featuredVideo ?? page?.relatedVideos[0] ?? null;
  const otherFeaturedVideos = featuredCandidates.filter((video) => video.id !== activeFeaturedVideo?.id);

  useEffect(() => {
    setActiveFeaturedId(null);
  }, [page?.featuredVideo?.id]);

  useEffect(() => {
    if (!page) return;
    const title = `${settings.collegeName} Video Hub | Learning Sessions`;
    const description = `${page.settings.libraryDescription.trim()} Search published sessions by subject, instructor, or keyword.`;
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const openGraphTitleTag = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const openGraphDescriptionTag = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const twitterTitleTag = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    const twitterDescriptionTag = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    const previousTitle = document.title;
    const previousDescription = descriptionTag?.content;
    const previousOpenGraphTitle = openGraphTitleTag?.content;
    const previousOpenGraphDescription = openGraphDescriptionTag?.content;
    const previousTwitterTitle = twitterTitleTag?.content;
    const previousTwitterDescription = twitterDescriptionTag?.content;
    document.title = title;
    if (descriptionTag) descriptionTag.content = description;
    if (openGraphTitleTag) openGraphTitleTag.content = title;
    if (openGraphDescriptionTag) openGraphDescriptionTag.content = description;
    if (twitterTitleTag) twitterTitleTag.content = title;
    if (twitterDescriptionTag) twitterDescriptionTag.content = description;
    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription !== undefined) descriptionTag.content = previousDescription;
      if (openGraphTitleTag && previousOpenGraphTitle !== undefined) openGraphTitleTag.content = previousOpenGraphTitle;
      if (openGraphDescriptionTag && previousOpenGraphDescription !== undefined) openGraphDescriptionTag.content = previousOpenGraphDescription;
      if (twitterTitleTag && previousTwitterTitle !== undefined) twitterTitleTag.content = previousTwitterTitle;
      if (twitterDescriptionTag && previousTwitterDescription !== undefined) twitterDescriptionTag.content = previousTwitterDescription;
    };
  }, [page?.settings.libraryDescription, page, settings.collegeName]);

  if (pageQuery.isLoading || siteQuery.isLoading) return <PublicSkeleton />;
  if (pageQuery.isError || !page) {
    return <main className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--background))] px-6"><div className="max-w-lg text-center" role="alert" data-testid="status-video-hub-error"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Video Hub unavailable</p><h1 className="mt-4 font-display text-4xl font-semibold text-[hsl(var(--primary))]">The library could not be loaded.</h1><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again shortly.</p><button type="button" onClick={() => pageQuery.refetch()} className="mt-6 inline-flex h-11 items-center rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-video-hub">Try again</button></div></main>;
  }

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" style={createPublicThemeStyle(siteQuery.data?.primaryColor || DEFAULT_PRIMARY_COLOR, siteQuery.data?.accentColor || DEFAULT_ACCENT_COLOR, siteQuery.data?.surfaceColor || DEFAULT_SURFACE_COLOR)}>
      <PublicHeader settings={settings} activePage="knowledge-hub" />
      <main>
        <section className="relative isolate overflow-hidden bg-[hsl(var(--primary))] px-6 py-20 text-[hsl(var(--primary-foreground))] sm:py-28 lg:px-10">
          {page.settings.heroBackgroundImageUrl && <img src={page.settings.heroBackgroundImageUrl} alt={page.settings.heroBackgroundImageAltText} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" data-testid="img-video-hub-hero" />}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(var(--primary)/.98),hsl(var(--primary)/.78)_52%,hsl(var(--primary)/.5))]" aria-hidden="true" />
          <div className="absolute -right-20 top-12 -z-10 h-80 w-80 rounded-full border border-[hsl(var(--accent)/.35)] opacity-70" aria-hidden="true" />
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="results-hero-eyebrow inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] px-3 py-2 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]" data-testid="text-video-hub-hero-eyebrow"><Play size={14} fill="currentColor" />{page.settings.heroEyebrow}</p>
              <h1 className="results-hero-heading mt-6 max-w-3xl font-display text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl" data-testid="text-video-hub-hero-title">{page.settings.heroTitle}{page.settings.heroAccentText && <span className="block text-[hsl(var(--accent))]">{page.settings.heroAccentText}</span>}</h1>
              <p className="results-hero-description mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{page.settings.heroDescription}</p>
              <a href="#video-library" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" data-testid="link-video-hub-hero-cta">{page.settings.heroCtaLabel} <ArrowRight size={17} /></a>
            </div>
            {page.settings.highlights.length > 0 && <div className="mt-14 grid max-w-4xl gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">{page.settings.highlights.map((highlight, index) => <div key={`${highlight.label}-${index}`} className="border-l border-[hsl(var(--accent)/.55)] pl-4" data-testid={`highlight-video-hub-${index}`}><p className="text-sm font-bold">{highlight.label}</p><p className="mt-1 text-xs leading-5 text-white/65">{highlight.description}</p></div>)}</div>}
          </div>
        </section>
        {activeFeaturedVideo && isYoutubeUrl(activeFeaturedVideo.youtubeUrl) && <FeaturedSession video={activeFeaturedVideo} relatedVideos={otherFeaturedVideos} onSelect={(video) => setActiveFeaturedId(video.id)} eyebrow={page.settings.featuredEyebrow} />}
        <section id="video-library" className="bg-[hsl(var(--secondary))] px-6 py-14 sm:py-20 lg:px-10" data-testid="section-video-library">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{page.settings.libraryEyebrow}</p><h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl" data-testid="text-video-library-title">{page.settings.libraryTitle}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{page.settings.libraryDescription}</p></div><div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold text-[hsl(var(--muted-foreground))]" data-testid="text-video-count"><Video size={16} /> {page.publishedVideoCount} published {page.publishedVideoCount === 1 ? 'session' : 'sessions'}</div></div>
            <div className="mt-9 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-[var(--shadow-xs)]"><div className="flex flex-col gap-3 lg:flex-row"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl bg-[hsl(var(--secondary))] px-4"><Search size={18} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Search videos</span><input value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} placeholder={page.settings.searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-search-videos" />{search && <button type="button" onClick={() => { setSearch(''); setOffset(0); }} className="rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Clear search" data-testid="button-clear-video-search"><X size={16} /></button>}</label><div className="flex gap-3"><label className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 lg:w-48"><SlidersHorizontal size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Sort videos</span><select value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); setOffset(0); }} className="w-full bg-transparent text-sm font-semibold outline-none" data-testid="select-video-sort"><option value="displayOrder">Curated order</option><option value="recent">Latest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></label><label className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 lg:w-52"><ChevronDown size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Filter videos</span><select value={category} onChange={(event) => { setCategory(event.target.value); setOffset(0); }} className="w-full bg-transparent text-sm font-semibold outline-none" data-testid="select-video-category"><option value="">All subjects</option>{visibleCategories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label></div></div></div>
            {videosQuery.isError ? <div className="mt-8 rounded-2xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-7 text-center" role="alert" data-testid="status-video-library-error"><p className="text-sm font-bold text-[hsl(var(--destructive))]">The sessions could not be loaded.</p><button type="button" onClick={() => videosQuery.refetch()} className="mt-4 inline-flex h-10 items-center rounded-lg bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-video-library">Try again</button></div> : videosQuery.isLoading ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><div className="h-80 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-80 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-80 rounded-2xl bg-[hsl(var(--muted))]" /></div> : validVideos.length > 0 ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{validVideos.map((video) => <VideoCard key={video.id} video={video} />)}</div> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center" data-testid="empty-video-library"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent)/.17)] text-[hsl(var(--accent-foreground))]"><Search size={22} /></div><h3 className="mt-5 font-display text-3xl font-semibold text-[hsl(var(--primary))]">{search || category ? 'No sessions match that search.' : page.settings.emptyStateTitle}</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">{search || category ? 'Try a different subject or clear the search to browse every published session.' : page.settings.emptyStateDescription}</p>{(search || category) && <button type="button" onClick={() => { setSearch(''); setCategory(''); setOffset(0); }} className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-reset-video-filters">Clear filters <X size={14} /></button>}</div>}
            {videosQuery.isError ? <div className="mt-8 rounded-2xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-7 text-center" role="alert" data-testid="status-video-library-error"><p className="text-sm font-bold text-[hsl(var(--destructive))]">The sessions could not be loaded.</p><button type="button" onClick={() => videosQuery.refetch()} className="mt-4 inline-flex h-10 items-center rounded-lg bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-video-library">Try again</button></div> : videosQuery.isLoading ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><div className="h-80 animate-pulse rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-80 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-80 rounded-2xl bg-[hsl(var(--muted))]" /></div> : validVideos.length > 0 ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{validVideos.map((video) => <VideoCard key={video.id} video={video} />)}</div> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center" data-testid="empty-video-library"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent)/.17)] text-[hsl(var(--accent-foreground))]"><Search size={22} /></div><h3 className="mt-5 font-display text-3xl font-semibold text-[hsl(var(--primary))]">{search || category ? 'No sessions match that search.' : page.settings.emptyStateTitle}</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">{search || category ? 'Try a different subject or clear the search to browse every published session.' : page.settings.emptyStateDescription}</p>{(search || category) && <button type="button" onClick={() => { setSearch(''); setCategory(''); setOffset(0); }} className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-reset-video-filters">Clear filters <X size={14} /></button>}</div>}
            {!videosQuery.isError && videosQuery.data && videosQuery.data.total > videosQuery.data.limit && <nav className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-6 sm:flex-row" aria-label="Video library pages" data-testid="video-library-pagination"><p className="text-sm text-[hsl(var(--muted-foreground))]">Showing {videosQuery.data.total === 0 ? 0 : offset + 1}–{Math.min(offset + videosQuery.data.items.length, videosQuery.data.total)} of {videosQuery.data.total}</p><div className="flex gap-2"><button type="button" onClick={() => setOffset((current) => Math.max(0, current - videosQuery.data!.limit))} disabled={offset === 0 || videosQuery.isFetching} className="inline-flex h-10 items-center rounded-lg border border-[hsl(var(--border))] px-4 text-sm font-semibold text-[hsl(var(--primary))] disabled:opacity-45" data-testid="button-video-page-previous">Previous</button><button type="button" onClick={() => setOffset((current) => current + videosQuery.data!.limit)} disabled={!videosQuery.data.hasMore || videosQuery.isFetching} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-[hsl(var(--primary-foreground))] disabled:opacity-45" data-testid="button-video-page-next">Next <ArrowRight size={15} /></button></div></nav>}
          </div>
        </section>
      </main>
      <PublicFooter settings={{ ...settings, footerText: settings.footerText || fallbackSettings.footerText }} />
    </div>
  );
}