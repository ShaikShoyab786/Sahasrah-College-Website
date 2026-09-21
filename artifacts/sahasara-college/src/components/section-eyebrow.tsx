type SectionEyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionEyebrow({ children, className = '' }: SectionEyebrowProps) {
  return (
    <div className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-[hsl(var(--accent-foreground))] ${className}`}>
      <span className="h-px w-8 bg-[hsl(var(--accent))]" aria-hidden="true" />
      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}