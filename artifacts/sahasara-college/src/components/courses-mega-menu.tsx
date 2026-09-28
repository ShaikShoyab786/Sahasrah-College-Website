import {
  ArrowRight,
  Atom,
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Dna,
  GraduationCap,
  Stethoscope,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'wouter';
import type { CoursesMegaMenu } from '@workspace/api-client-react';

const iconMap: Record<string, LucideIcon> = {
  atom: Atom,
  dna: Dna,
  target: Target,
  stethoscope: Stethoscope,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  users: Users,
  chart: BarChart3,
  clipboard: ClipboardCheck,
  trophy: Award,
};

const tintClasses: Record<string, { surface: string; icon: string; border: string; imageOverlay: string }> = {
  sky: { surface: 'bg-sky-50', icon: 'bg-sky-100 text-sky-800', border: 'border-sky-100 hover:border-sky-300', imageOverlay: 'from-sky-50 via-sky-50/95' },
  rose: { surface: 'bg-rose-50', icon: 'bg-rose-100 text-rose-800', border: 'border-rose-100 hover:border-rose-300', imageOverlay: 'from-rose-50 via-rose-50/95' },
  amber: { surface: 'bg-amber-50', icon: 'bg-amber-100 text-amber-900', border: 'border-amber-100 hover:border-amber-300', imageOverlay: 'from-amber-50 via-amber-50/95' },
  mint: { surface: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-100 hover:border-emerald-300', imageOverlay: 'from-emerald-50 via-emerald-50/95' },
  violet: { surface: 'bg-violet-50', icon: 'bg-violet-100 text-violet-800', border: 'border-violet-100 hover:border-violet-300', imageOverlay: 'from-violet-50 via-violet-50/95' },
  slate: { surface: 'bg-slate-50', icon: 'bg-slate-100 text-slate-800', border: 'border-slate-100 hover:border-slate-300', imageOverlay: 'from-slate-50 via-slate-50/95' },
};

function DestinationLink({
  href,
  className,
  onClick,
  children,
  ...props
}: {
  href: string;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
  'aria-label'?: string;
  'data-testid'?: string;
}) {
  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick} {...props}>{children}</a>;
  }
  return <Link href={href} className={className} onClick={onClick} {...props}>{children}</Link>;
}

function BrandPanel({
  content,
  fallbackLogoUrl,
  compact,
}: {
  content: CoursesMegaMenu;
  fallbackLogoUrl: string | null;
  compact: boolean;
}) {
  const logoUrl = content.sidebarLogoUrl || fallbackLogoUrl;
  return (
    <aside className={`relative isolate flex min-h-[14rem] flex-col overflow-hidden bg-[hsl(var(--primary))] p-6 text-white ${compact ? 'rounded-2xl' : 'md:min-h-full md:rounded-l-[1.6rem] md:p-7'}`}>
      {content.sidebarImageUrl ? (
        <img src={content.sidebarImageUrl} alt={content.sidebarImageAltText} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/15" />
          <div className="absolute -right-5 top-8 h-36 w-36 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-white/[.06]" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--primary)/.78)] via-[hsl(var(--primary)/.88)] to-[hsl(var(--primary))]" aria-hidden="true" />
      <div>
        <div className="flex min-h-12 items-center gap-3">
          {content.sidebarLogoVisible && (logoUrl
            ? <img src={logoUrl} alt={content.sidebarLogoAltText || content.sidebarBrandName} className="max-h-12 max-w-36 object-contain object-left" />
            : <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/25 bg-white/10 font-display text-lg font-bold" aria-hidden="true">{content.sidebarBrandName.trim().charAt(0).toUpperCase() || 'S'}</span>)}
          <p className="max-w-[12rem] text-xs font-bold uppercase leading-5 tracking-[.13em] text-white/90">{content.sidebarBrandName}</p>
        </div>
        <p className="mt-6 max-w-[15rem] text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">{content.sidebarTagline}</p>
        <h3 className="mt-3 max-w-[15rem] font-display text-2xl font-semibold leading-tight tracking-[-.025em] sm:text-3xl">{content.sidebarHeadline}</h3>
        <p className="mt-3 max-w-[17rem] text-sm leading-6 text-white/75">{content.sidebarSupportingText}</p>
      </div>
    </aside>
  );
}

function StandardCourseCard({
  item,
  onClick,
}: {
  item: CoursesMegaMenu['standardCards'][number];
  onClick: () => void;
}) {
  const tint = tintClasses[item.tint] ?? tintClasses.sky;
  const Icon = iconMap[item.icon] ?? BookOpen;
  return (
    <DestinationLink
      href={item.href}
      onClick={onClick}
      className={`group relative isolate flex min-h-[8.5rem] overflow-hidden rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] ${tint.surface} ${tint.border}`}
      data-testid={`link-mega-course-${item.id}`}
      aria-label={`${item.title}: ${item.description}`}
    >
      {item.imageUrl && <img src={item.imageUrl} alt={item.imageAltText} className="absolute inset-y-0 right-0 -z-10 h-full w-[39%] object-cover" />}
      {item.imageUrl && <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${tint.imageOverlay} to-transparent`} aria-hidden="true" />}
      <div className={`flex w-full flex-col ${item.imageUrl ? 'max-w-[68%]' : ''}`}>
        <div className="flex items-center gap-2">
          {!item.imageUrl && <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tint.icon}`}><Icon size={16} aria-hidden="true" /></span>}
          <span className="text-[9px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">{item.category}</span>
        </div>
        <span className="mt-2 font-display text-base font-semibold leading-tight text-[hsl(var(--primary))]">{item.title}</span>
        <span className="mt-1.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{item.description}</span>
      </div>
      <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-[hsl(var(--primary))] shadow-sm transition group-hover:translate-x-0.5 group-hover:bg-white"><ArrowRight size={15} aria-hidden="true" /></span>
    </DestinationLink>
  );
}

function IntegratedCourseCard({ content }: { content: CoursesMegaMenu['integratedCard'] }) {
  const Icon = iconMap[content.icon] ?? BookOpen;
  return (
    <div className="relative isolate flex min-h-[8.5rem] overflow-hidden rounded-2xl border border-dashed border-[hsl(var(--primary)/.2)] bg-[hsl(var(--secondary)/.8)] p-4" aria-disabled="true" data-testid="item-mega-integrated">
      {content.imageUrl && <img src={content.imageUrl} alt={content.imageAltText} className="absolute inset-y-0 right-0 -z-10 h-full w-[39%] object-cover opacity-30" />}
      <div className={`flex w-full flex-col ${content.imageUrl ? 'max-w-[68%]' : ''}`}>
        <div className="flex items-center gap-2">
          {!content.imageUrl && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[hsl(var(--primary))]"><Icon size={16} aria-hidden="true" /></span>}
          <span className="text-[9px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">{content.category}</span>
        </div>
        <span className="mt-2 font-display text-base font-semibold leading-tight text-[hsl(var(--primary))]">{content.title}</span>
        <span className="mt-1.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{content.description}</span>
      </div>
      <span className="absolute right-3 top-3 rounded-full border border-[hsl(var(--border))] bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">{content.statusLabel}</span>
    </div>
  );
}

function MegaMenuBody({
  content,
  fallbackLogoUrl,
  onClose,
  compact,
  loading,
  onRetry,
}: {
  content: CoursesMegaMenu | undefined;
  fallbackLogoUrl: string | null;
  onClose: () => void;
  compact: boolean;
  loading: boolean;
  onRetry?: () => void;
}) {
  if (!content) {
    return (
      <div role={loading ? 'status' : 'alert'} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-sm text-[hsl(var(--muted-foreground))]">
        {loading ? 'Loading course pathways…' : 'Courses menu content is unavailable right now.'}
        {!loading && onRetry && <button type="button" onClick={onRetry} className="ml-2 rounded-sm font-bold text-[hsl(var(--primary))] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]">Try again</button>}
      </div>
    );
  }

  const standardCards = [...content.standardCards].filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const benefits = [...content.footerBenefits].filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const utilityLinks = [...content.utilityLinks].filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const ctaButtons = [...content.ctaButtons].filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className={`overflow-hidden rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-2xl ${compact ? 'space-y-4 p-3 sm:p-4' : 'md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]'}`}>
      <BrandPanel content={content} fallbackLogoUrl={fallbackLogoUrl} compact={compact} />
      <div className={`min-w-0 ${compact ? 'rounded-2xl bg-[hsl(var(--card))] p-3 sm:p-4' : 'p-4 sm:p-6 lg:p-7'}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.19em] text-[hsl(var(--accent-foreground))]">{content.eyebrow}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-.03em] text-[hsl(var(--primary))] sm:text-3xl">{content.heading}</h2>
          </div>
          {content.pathwayBadgeVisible && <span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{content.pathwayBadgeLabel}</span>}
        </div>

        {standardCards.length > 0 || content.integratedCard.isVisible ? (
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {standardCards.map((item) => <StandardCourseCard key={item.id} item={item} onClick={onClose} />)}
            {content.integratedCard.isVisible && <IntegratedCourseCard content={content.integratedCard} />}
          </div>
        ) : null}

        {benefits.length > 0 && (
          <div className="mt-5 grid gap-3 border-t border-[hsl(var(--border))] pt-4 sm:grid-cols-2 xl:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = iconMap[benefit.icon] ?? Award;
              return <div key={benefit.id} className="flex min-w-0 items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[hsl(var(--accent)/.13)] text-[hsl(var(--accent-foreground))]"><Icon size={15} aria-hidden="true" /></span>
                <span className="min-w-0"><span className="block text-xs font-bold text-[hsl(var(--primary))]">{benefit.title}</span><span className="mt-0.5 block text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{benefit.description}</span></span>
              </div>;
            })}
          </div>
        )}

        {(utilityLinks.length > 0 || ctaButtons.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {utilityLinks.map((item) => <DestinationLink key={item.id} href={item.href} onClick={onClose} className="rounded-sm text-xs font-bold text-[hsl(var(--primary))] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]" data-testid={`link-mega-utility-${item.id}`}>{item.label}</DestinationLink>)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ctaButtons.map((item) => <DestinationLink key={item.id} href={item.href} onClick={onClose} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${item.style === 'primary' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] focus-visible:ring-[hsl(var(--primary-foreground))] focus-visible:ring-offset-[hsl(var(--primary))]' : 'border border-[hsl(var(--border))] bg-white text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-white'}`} data-testid={`link-mega-cta-${item.id}`}>{item.label}<ArrowRight size={14} aria-hidden="true" /></DestinationLink>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CoursesMegaMenuPanel({
  content,
  fallbackLogoUrl,
  onClose,
  mobile = false,
  loading = false,
  onRetry,
}: {
  content: CoursesMegaMenu | undefined;
  fallbackLogoUrl: string | null;
  onClose: () => void;
  mobile?: boolean;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <MegaMenuBody content={content} fallbackLogoUrl={fallbackLogoUrl} onClose={onClose} compact={mobile} loading={loading} onRetry={onRetry} />
  );
}