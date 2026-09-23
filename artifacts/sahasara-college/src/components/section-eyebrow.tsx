type SectionEyebrowProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
};

export function SectionEyebrow({ children, className = '', variant = 'light' }: SectionEyebrowProps) {
  return (
    <div tabIndex={className.includes('about-eyebrow') ? 0 : undefined} className={`section-eyebrow section-eyebrow--${variant} flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] ${className}`}>
      <span className="eyebrow-line h-px w-8 bg-[hsl(var(--accent))]" aria-hidden="true" />
      <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
      <span className="eyebrow-label">{children}</span>
    </div>
  );
}