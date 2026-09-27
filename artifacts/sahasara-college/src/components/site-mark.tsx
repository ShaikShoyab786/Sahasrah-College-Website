import { Link } from 'wouter';

type SiteMarkProps = {
  name?: string;
  tagline?: string | null;
  logoUrl?: string | null;
  fallbackLogoUrl?: string | null;
  logoAlt?: string;
  inverse?: boolean;
  compact?: boolean;
  responsive?: boolean;
};

export function SiteMark({ name = 'Sahsrah Junior College', tagline = 'Your College Tagline', logoUrl, fallbackLogoUrl, logoAlt, inverse = false, compact = false, responsive = false }: SiteMarkProps) {
  const resolvedLogoUrl = logoUrl || fallbackLogoUrl;
  return (
    <Link href="/" className={`group inline-flex items-center ${responsive ? 'w-full min-w-0 gap-2 lg:w-auto' : 'gap-3'}`} data-testid="link-site-logo">
      {resolvedLogoUrl ? (
        <img src={resolvedLogoUrl} alt={logoAlt || (logoUrl ? `${name} logo` : 'Sahsrah Junior College')} className={`${compact ? 'h-9 w-9' : responsive ? 'h-9 w-9 sm:h-11 sm:w-11' : 'h-11 w-11'} shrink-0 rounded-xl object-contain`} data-testid="img-college-logo" />
      ) : (
        <span className={`${compact ? 'h-9 w-9 text-sm' : responsive ? 'h-9 w-9 text-sm sm:h-11 sm:w-11 sm:text-base' : 'h-11 w-11 text-base'} grid shrink-0 place-items-center rounded-xl bg-[hsl(var(--accent))] font-bold text-[hsl(var(--primary))] shadow-sm`} data-testid="mark-college-initial">S</span>
      )}
      <span className={`${responsive ? 'min-w-0 flex-1 lg:flex-none' : ''} leading-tight`}>
        <span className={`block font-display ${responsive ? 'max-w-full break-words text-xs leading-4 sm:text-base lg:text-lg' : 'text-lg'} font-semibold tracking-[-0.02em] ${inverse ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--primary))]'}`}>{name}</span>
        {!compact && (
          <span className={`${responsive ? 'mt-1.5 block max-w-full break-words text-[11px] leading-[1.35] tracking-[.08em] sm:text-xs sm:tracking-[.12em]' : 'mt-0.5 block text-[10px] tracking-[0.2em]'} font-semibold uppercase ${responsive ? inverse ? 'text-[hsl(var(--primary-foreground)/.82)]' : 'text-[hsl(var(--muted-foreground))]' : inverse ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
            {tagline || 'Your College Tagline'}
          </span>
        )}
      </span>
    </Link>
  );
}