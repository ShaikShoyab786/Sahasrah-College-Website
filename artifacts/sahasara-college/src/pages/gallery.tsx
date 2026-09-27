import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useGetGalleryPage, useGetSiteSettings } from '@workspace/api-client-react';
import { PublicHeader } from '@/components/public-header';
import { SiteMark } from '@/components/site-mark';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const CATEGORIES = ['All', 'Campus', 'Classrooms', 'Sports', 'Labs', 'Library', 'Achievements', 'Events'] as const;
const INITIAL_BATCH = 8;

function GallerySkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-8 pt-16"><div className="h-5 w-32 rounded-full bg-[hsl(var(--muted))]" /><div className="h-20 max-w-2xl rounded-2xl bg-[hsl(var(--muted))]" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[.84] rounded-[1.5rem] bg-[hsl(var(--muted))]" />)}</div></div></div>;
}

export default function Gallery() {
  const settingsQuery = useGetSiteSettings();
  const galleryQuery = useGetGalleryPage();
  const settings = settingsQuery.data;
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const items = useMemo(() => galleryQuery.data?.items ?? [], [galleryQuery.data?.items]);
  const filtered = useMemo(() => category === 'All' ? items : items.filter((item) => item.category === category), [category, items]);
  const visibleItems = filtered.slice(0, visibleCount);
  const selected = selectedIndex === null ? null : filtered[selectedIndex];
  const themeStyle = createPublicThemeStyle(settings?.primaryColor || DEFAULT_PRIMARY_COLOR, settings?.accentColor || DEFAULT_ACCENT_COLOR, settings?.surfaceColor || DEFAULT_SURFACE_COLOR);

  useEffect(() => { setVisibleCount(INITIAL_BATCH); setSelectedIndex(null); }, [category]);
  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedIndex(null);
      if (event.key === 'ArrowRight') setSelectedIndex((current) => current === null ? 0 : (current + 1) % filtered.length);
      if (event.key === 'ArrowLeft') setSelectedIndex((current) => current === null ? 0 : (current - 1 + filtered.length) % filtered.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown); };
  }, [filtered.length, selectedIndex]);

  if (settingsQuery.isLoading || galleryQuery.isLoading) return <GallerySkeleton />;
  if (settingsQuery.isError || galleryQuery.isError) return <div className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--background))] px-6"><div className="max-w-md text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Gallery unavailable</p><h1 className="mt-4 font-display text-4xl font-semibold text-[hsl(var(--primary))]">We could not open the campus window.</h1><button type="button" onClick={() => { void settingsQuery.refetch(); void galleryQuery.refetch(); }} className="mt-7 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-gallery">Try again</button></div></div>;

  const page = galleryQuery.data;
  const collegeName = settings?.collegeName || 'Sahsrah Junior College';
  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={{ collegeName, tagline: settings?.tagline || '', logoUrl: settings?.logoUrl || null }} activePage="gallery" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-20 pt-36 text-[hsl(var(--primary-foreground))] lg:px-10 lg:pb-28">
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-[hsl(var(--accent)/.22)]" />
          <div className="absolute right-12 top-44 h-36 w-36 rounded-full border border-[hsl(var(--accent)/.18)]" />
          <div className="relative mx-auto max-w-7xl">
            <SectionEyebrow className="about-eyebrow section-eyebrow--dark">{page?.settings.eyebrow || 'Campus Gallery'}</SectionEyebrow>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[.94] tracking-[-.05em] md:text-7xl">{page?.settings.heading || 'Life at Sahasrah College'}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[hsl(var(--primary-foreground)/.7)]">{page?.settings.description}</p>
            <div className="mt-9 flex items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]"><span className="h-px w-12 bg-[hsl(var(--accent))]" />{items.length} moments from campus life</div>
          </div>
        </section>
        <section className="bg-[hsl(var(--background))] px-6 py-14 lg:px-10 lg:py-20" aria-labelledby="gallery-grid-heading">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <h2 id="gallery-grid-heading" className="font-display text-3xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))]">A closer look</h2>
              <div className="flex max-w-full flex-wrap gap-2" role="group" aria-label="Filter gallery by category">
                {CATEGORIES.map((value) => <button key={value} type="button" onClick={() => setCategory(value)} aria-pressed={category === value} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] ${category === value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--primary))]'}`} data-testid={`button-filter-gallery-${value.toLowerCase()}`}>{value}</button>)}
              </div>
            </div>
            {visibleItems.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{visibleItems.map((item, index) => <button key={item.id} type="button" onClick={() => setSelectedIndex(index)} className="gallery-card group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.35)]" data-testid={`button-open-gallery-${item.id}`}><div className="relative aspect-[.84] overflow-hidden bg-[hsl(var(--primary))]">{item.imageUrl && <img src={item.imageUrl} alt={item.imageAltText} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}<div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.9)] via-[hsl(var(--primary)/.1)] to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-white/25 bg-[hsl(var(--primary)/.6)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-white backdrop-blur-sm">{item.category}</span><div className="absolute inset-x-0 bottom-0 p-5 text-white"><p className="font-display text-2xl font-semibold leading-tight">{item.title}</p>{item.locationLabel && <p className="mt-2 text-xs font-semibold text-white/70">{item.locationLabel}</p>}</div></div><div className="flex items-center justify-between gap-3 px-5 py-4"><span className="line-clamp-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">{item.description || item.imageAltText}</span><ArrowUpRight size={17} className="shrink-0 text-[hsl(var(--accent-foreground))] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div></button>)}</div> : <div className="mt-9 rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-6 py-16 text-center"><p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Nothing in this collection yet.</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try another category to keep exploring campus life.</p></div>}
            {visibleCount < filtered.length && <div className="mt-10 flex justify-center"><button type="button" onClick={() => setVisibleCount((count) => count + INITIAL_BATCH)} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]" data-testid="button-load-more-gallery">Load more <ChevronDown size={16} /></button></div>}
          </div>
        </section>
      </main>
      <footer className="bg-[hsl(var(--primary))] px-6 py-10 text-[hsl(var(--primary-foreground))] lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end"><div><SiteMark name={collegeName} tagline={settings?.tagline || ''} logoUrl={settings?.logoUrl || null} inverse /><p className="mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--primary-foreground)/.58)]">{settings?.footerText || 'A public college for purposeful beginnings.'}</p></div><a href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--accent))] hover:text-[hsl(var(--primary-foreground))]">Talk with admissions <ArrowUpRight size={16} /></a></div></footer>
      {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--primary)/.88)] p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedIndex(null); }}><div role="dialog" aria-modal="true" aria-label={selected.title} className="relative w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/15 bg-[hsl(var(--card))] shadow-2xl"><button type="button" onClick={() => setSelectedIndex(null)} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--primary)/.75)] text-white backdrop-blur transition hover:bg-[hsl(var(--primary))]" data-testid="button-close-gallery-lightbox"><X size={18} /></button><div className="grid max-h-[88vh] overflow-auto md:grid-cols-[1.25fr_.75fr]"><div className="min-h-[280px] bg-[hsl(var(--primary))]">{selected.imageUrl && <img src={selected.imageUrl} alt={selected.imageAltText} className="h-full max-h-[72vh] w-full object-contain" />}</div><div className="flex flex-col justify-between p-7 md:p-9"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">{selected.category}{selected.locationLabel ? ` · ${selected.locationLabel}` : ''}</p><h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-[hsl(var(--primary))]">{selected.title}</h2><p className="mt-5 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{selected.description || selected.imageAltText}</p></div><div className="mt-8 flex justify-between gap-3"><button type="button" onClick={() => setSelectedIndex((selectedIndex === null ? 0 : selectedIndex - 1 + filtered.length) % filtered.length)} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))]" data-testid="button-previous-gallery-image"><ChevronLeft size={16} /> Previous</button><button type="button" onClick={() => setSelectedIndex((selectedIndex === null ? 0 : selectedIndex + 1) % filtered.length)} className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-next-gallery-image">Next <ChevronRight size={16} /></button></div></div></div></div></div>}
    </div>
  );
}