import { Link } from 'wouter';

type SiteMarkProps = {
  name?: string;
  logoUrl?: string | null;
  inverse?: boolean;
  compact?: boolean;
};

export function SiteMark({ name = 'Sahasara Junior College', logoUrl, inverse = false, compact = false }: SiteMarkProps) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" data-testid="link-site-logo">
      {logoUrl ? (
        <img src={logoUrl} alt={`${name} logo`} className={`${compact ? 'h-9 w-9' : 'h-11 w-11'} rounded-xl object-cover`} data-testid="img-college-logo" />
      ) : (
        <span className={`${compact ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base'} grid place-items-center rounded-xl bg-[hsl(var(--accent))] font-bold text-[hsl(var(--primary))] shadow-sm`} data-testid="mark-college-initial">S</span>
      )}
      <span className="leading-tight">
        <span className={`block font-display text-lg font-semibold tracking-[-0.02em] ${inverse ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--primary))]'}`}>{name}</span>
        {!compact && <span className={`mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] ${inverse ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`}>Learn with purpose</span>}
      </span>
    </Link>
  );
}