import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  Flame,
  HeartPulse,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'wouter';
import type { KnowledgeHubMegaMenu, KnowledgeHubMenuCategory } from '@workspace/api-client-react';

const categoryMeta: Record<KnowledgeHubMenuCategory, {
  label: string;
  icon: LucideIcon;
  surface: string;
  iconSurface: string;
  border: string;
  button: string;
  bullets: string[];
}> = {
  articles: {
    label: 'Articles',
    icon: FileText,
    surface: 'bg-rose-50/90',
    iconSurface: 'bg-rose-100 text-rose-700',
    border: 'border-rose-100 hover:border-rose-300',
    button: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
    bullets: ['Study strategies', 'Subject-wise guides', 'Exam preparation tips', 'Parent guidance'],
  },
  'video-hub': {
    label: 'Video Hub',
    icon: PlayCircle,
    surface: 'bg-violet-50/90',
    iconSurface: 'bg-violet-100 text-violet-700',
    border: 'border-violet-100 hover:border-violet-300',
    button: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
    bullets: ['Concept lectures', 'Exam techniques', 'Motivational sessions', 'Expert interviews'],
  },
  'study-resources': {
    label: 'Study Resources',
    icon: BookOpen,
    surface: 'bg-emerald-50/90',
    iconSurface: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-100 hover:border-emerald-300',
    button: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    bullets: ['Notes and PDFs', 'Formula sheets', 'Previous year papers', 'Important downloads'],
  },
  'exam-updates': {
    label: 'Exam Updates',
    icon: Bell,
    surface: 'bg-amber-50/90',
    iconSurface: 'bg-amber-100 text-amber-700',
    border: 'border-amber-100 hover:border-amber-300',
    button: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    bullets: ['Exam notifications', 'Important dates', 'Results and cutoffs', 'News and announcements'],
  },
};

const categoryOrder: KnowledgeHubMenuCategory[] = ['articles', 'video-hub', 'study-resources', 'exam-updates'];

function MenuDestination({
  href,
  onClick,
  className,
  children,
  ariaLabel,
  testId,
}: {
  href: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
  ariaLabel?: string;
  testId?: string;
}) {
  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className={className} aria-label={ariaLabel} data-testid={testId}>{children}</a>;
  }
  return <Link href={href} onClick={onClick} className={className} aria-label={ariaLabel} data-testid={testId}>{children}</Link>;
}

function CategoryCard({
  card,
  onClose,
}: {
  card: KnowledgeHubMegaMenu['cards'][number];
  onClose: () => void;
}) {
  const meta = categoryMeta[card.category];
  const Icon = meta.icon;
  const href = `/knowledge-hub#knowledge-hub-${card.category}`;

  return (
    <MenuDestination
      href={href}
      onClick={onClose}
      className={`group relative flex min-h-[17.6rem] flex-col overflow-hidden rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${meta.surface} ${meta.border}`}
      ariaLabel={`${meta.label}: ${card.description}`}
      testId={`link-knowledge-hub-category-${card.category}`}
    >
      <div className={`grid h-11 w-11 place-items-center rounded-full ${meta.iconSurface}`}>
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <span className="mt-4 font-display text-[1.08rem] font-semibold tracking-[-.025em] text-[hsl(var(--primary))]">{meta.label}</span>
      <span className="mt-1.5 min-h-10 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{card.description}</span>
      <span className="mt-2 inline-flex w-fit rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">Coming Soon</span>
      <ul className="mt-3 space-y-1.5 border-t border-[hsl(var(--primary)/.08)] pt-3 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">
        {meta.bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.iconSurface.split(' ')[0]}`} aria-hidden="true" />
            {bullet}
          </li>
        ))}
      </ul>
      <span className={`mt-auto inline-flex min-h-8 items-center justify-between gap-2 rounded-full px-3 text-[10px] font-bold transition ${meta.button}`}>
        {card.ctaLabel}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </MenuDestination>
  );
}

function BrandPanel({
  panel,
  onClose,
  compact,
}: {
  panel: KnowledgeHubMegaMenu['panel'];
  onClose: () => void;
  compact: boolean;
}) {
  return (
    <aside className={`relative isolate flex min-h-[19rem] flex-col overflow-hidden bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] ${compact ? 'rounded-xl' : 'rounded-xl md:min-h-full md:p-6'}`}>
      {panel.imageUrl ? (
        <img src={panel.imageUrl} alt={panel.imageAltText} className="absolute inset-0 -z-20 h-full w-full object-cover" data-testid="img-knowledge-hub-panel" />
      ) : (
        <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-10 top-8 h-44 w-44 rounded-full border border-white/15" />
          <div className="absolute right-8 top-20 h-24 w-24 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/[.06]" />
          <div className="absolute bottom-10 right-8 h-16 w-16 rounded-full bg-[hsl(var(--accent)/.3)] blur-2xl" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--primary)/.68)] via-[hsl(var(--primary)/.82)] to-[hsl(var(--primary))]" aria-hidden="true" />
      <p className="text-[9px] font-bold uppercase tracking-[.19em] text-[hsl(var(--accent))]" data-testid="text-knowledge-hub-panel-eyebrow">{panel.eyebrow}</p>
      <h3 className="mt-4 max-w-[13rem] font-display text-[2rem] font-semibold leading-[.98] tracking-[-.045em]" data-testid="text-knowledge-hub-panel-title">{panel.title}</h3>
      <p className="mt-4 max-w-[15rem] text-xs leading-5 text-white/75" data-testid="text-knowledge-hub-panel-description">{panel.description}</p>
      <MenuDestination
        href="/knowledge-hub"
        onClick={onClose}
        className="mt-auto inline-flex min-h-10 items-center justify-between gap-2 rounded-full bg-rose-600 px-4 text-[11px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--primary))]"
        ariaLabel={panel.ctaLabel}
        testId="link-knowledge-hub-panel-cta"
      >
        {panel.ctaLabel}
        <ArrowRight size={15} aria-hidden="true" />
      </MenuDestination>
    </aside>
  );
}

export function KnowledgeHubMegaMenuPanel({
  content,
  onClose,
  mobile = false,
  loading = false,
  onRetry,
}: {
  content: KnowledgeHubMegaMenu | undefined;
  onClose: () => void;
  mobile?: boolean;
  loading?: boolean;
  onRetry?: () => void;
}) {
  if (!content) {
    return (
      <div role={loading ? 'status' : 'alert'} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-sm text-[hsl(var(--muted-foreground))]" data-testid="status-knowledge-hub-menu">
        {loading ? 'Loading the Knowledge Hub…' : 'Knowledge Hub menu content is unavailable right now.'}
        {!loading && onRetry && <button type="button" onClick={onRetry} className="ml-2 font-bold text-[hsl(var(--primary))] underline underline-offset-4" data-testid="button-retry-knowledge-hub-menu">Try again</button>}
      </div>
    );
  }

  const cards = [...content.cards]
    .filter((card) => card.isVisible && categoryOrder.includes(card.category))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const trending = [...content.trendingItems]
    .filter((item) => item.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className={`overflow-hidden rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xl ${mobile ? 'space-y-3 p-2.5' : 'p-2.5 md:p-3'}`} data-testid="knowledge-hub-mega-menu">
      <div className={mobile ? 'space-y-3' : 'grid gap-2.5 md:grid-cols-[minmax(0,1fr)_16.5rem]'}>
        <div className={`min-w-0 ${mobile ? 'space-y-2.5' : 'grid grid-cols-2 gap-2.5'}`}>
          {cards.map((card) => <CategoryCard key={card.category} card={card} onClose={onClose} />)}
          {cards.length === 0 && <p className="col-span-2 rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-sm text-[hsl(var(--muted-foreground))]">Knowledge Hub pathways are being prepared.</p>}
        </div>
        <BrandPanel panel={content.panel} onClose={onClose} compact={mobile} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[hsl(var(--border))] px-2 py-2.5" data-testid="knowledge-hub-trending-strip">
        <span className="inline-flex items-center gap-2 whitespace-nowrap pr-1 text-[11px] font-bold text-rose-600">
          <Flame size={16} aria-hidden="true" /> Trending Now
        </span>
        <span className="hidden h-5 w-px bg-[hsl(var(--border))] sm:block" aria-hidden="true" />
        {trending.length > 0 ? trending.map((item) => {
          const ItemIcon = item.title.toLowerCase().includes('date') ? CalendarDays : item.title.toLowerCase().includes('update') ? HeartPulse : FileText;
          const itemClass = 'inline-flex min-h-8 max-w-full items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 text-[10px] font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--accent)/.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]';
          return item.href ? (
            <MenuDestination key={item.id} href={item.href} onClick={onClose} className={itemClass} ariaLabel={item.title} testId={`link-knowledge-hub-trending-${item.id}`}>
              <ItemIcon size={14} className="text-[hsl(var(--accent-foreground))]" aria-hidden="true" /> <span className="truncate">{item.title}</span>
            </MenuDestination>
          ) : (
            <span key={item.id} className={itemClass} data-testid={`text-knowledge-hub-trending-${item.id}`}>
              <ItemIcon size={14} className="text-[hsl(var(--accent-foreground))]" aria-hidden="true" /> <span className="truncate">{item.title}</span>
            </span>
          );
        }) : <span className="text-[10px] text-[hsl(var(--muted-foreground))]" data-testid="empty-knowledge-hub-trending">Fresh academic updates will appear here soon.</span>}
      </div>
    </div>
  );
}