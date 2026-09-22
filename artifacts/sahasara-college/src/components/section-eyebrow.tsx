type SectionEyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionEyebrow({ children, className = '' }: SectionEyebrowProps) {
  return (
    <div tabIndex={className.includes('about-eyebrow') ? 0 : undefined} className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-[hsl(var(--accent-foreground))] ${className}`}>
      <span className="eyebrow-line h-px w-8 bg-[hsl(var(--accent))]" aria-hidden="true" />
      <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
      <span className="eyebrow-label">{children}</span>
    </div>
  );
}