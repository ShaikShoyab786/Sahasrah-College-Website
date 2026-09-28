import { ArrowUpRight, CalendarDays, Image as ImageIcon } from 'lucide-react';
import type { HomepageLiveUpdate } from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';

type HomeLiveUpdatesProps = {
  updates: HomepageLiveUpdate[];
  eyebrow?: string;
  heading?: string; buttonLabel?: string; buttonHref?: string;
};

export function HomeLiveUpdates({ updates, eyebrow = 'From Sahsrah', heading = 'Live Updates', buttonLabel = 'View all updates', buttonHref = '#live-updates' }: HomeLiveUpdatesProps) {
  return (
    <section id="live-updates" className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.45)] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="live-updates-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionEyebrow className="about-eyebrow">{eyebrow}</SectionEyebrow>
            <h2 id="live-updates-heading" className="mt-4 font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{heading}</h2>
          </div>
           <a href={buttonHref} className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]" aria-label={`${buttonLabel}; the homepage shows the latest three`}>
             {buttonLabel} <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {updates.map((update, index) => <UpdateCard key={update.id} update={update} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function UpdateCard({ update, index }: { update: HomepageLiveUpdate; index: number }) {
  const published = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(update.publishDate));
  return (
    <article className="home-reveal-card group flex min-h-[455px] flex-col overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl" style={{ '--home-card-delay': `${index * 90}ms` } as React.CSSProperties}>
    <a href={update.detailUrl} className="flex h-full flex-col rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]" data-testid={`link-live-update-${index + 1}`}>
        <div className="relative aspect-[1.55] shrink-0 overflow-hidden bg-[hsl(var(--primary))]">
          {update.imageUrl ? <img src={update.imageUrl} alt={update.imageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_70%_20%,hsl(var(--accent)/.38),transparent_35%),hsl(var(--primary))] text-[hsl(var(--primary-foreground)/.68)]"><ImageIcon size={28} /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.76)] via-transparent to-transparent transition duration-500 group-hover:from-[hsl(var(--primary)/.9)]" />
          <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
            <span className="rounded-full border border-white/25 bg-[hsl(var(--primary)/.75)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary-foreground))] backdrop-blur-md transition group-hover:border-[hsl(var(--accent)/.8)]">{update.category}</span>
            {update.actionBadge && <span className="rounded-full bg-[hsl(var(--accent))] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[hsl(var(--accent-foreground))]">{update.actionBadge}</span>}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]"><CalendarDays size={14} className="text-[hsl(var(--accent-foreground))]" /> {published}</p>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{update.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{update.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[hsl(var(--primary))] transition group-hover:gap-3 group-hover:text-[hsl(var(--accent-foreground))]">Read article <ArrowUpRight size={16} /></span>
        </div>
      </a>
    </article>
  );
}