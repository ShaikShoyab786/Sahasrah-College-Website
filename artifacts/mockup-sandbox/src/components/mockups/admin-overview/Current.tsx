import './_group.css';
import type { ComponentProps } from 'react';
import { ArrowUpRight, CheckCircle2, PanelsTopLeft, Settings2 } from 'lucide-react';

const settings = {
  collegeName: 'Sahasrah Junior College',
  tagline: 'A clear beginning for a remarkable future',
};

const firstSlide = {
  heading: 'Build your foundation.',
  highlightedHeadingText: '',
  description: 'Build a strong foundation in Intermediate, sharpen your concepts for JEE and NEET, and prepare with the discipline, guidance, and confidence to take on what comes next.',
};

function MockLink({ href, className, children, ...props }: ComponentProps<'a'>) {
  return <a href={href} onClick={(event) => event.preventDefault()} className={className} {...props}>{children}</a>;
}

export function Current() {
  const active = true;

  return (
    <div className="min-h-screen bg-[hsl(var(--admin-background))] p-6 text-[hsl(var(--admin-text))] md:p-10">
      <main className="mx-auto max-w-7xl animate-rise">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Good morning</p>
            <h1 className="mt-2 font-display text-5xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))]">The front door, in order.</h1>
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">A concise view of what prospective students see first.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary))]">
            <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            {active ? 'Homepage published' : 'Homepage draft'}
          </span>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
          <div className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] shadow-lg md:p-9">
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><PanelsTopLeft size={20} /></div>
              <span className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--primary-foreground)/.5)]">Three-slide hero</span>
            </div>
            <h2 className="mt-12 max-w-xl font-display text-4xl font-semibold leading-tight">{firstSlide.heading} {firstSlide.highlightedHeadingText}</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[hsl(var(--primary-foreground)/.62)]">{firstSlide.description}</p>
            <MockLink href="/admin/pages/home/hero" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary-foreground))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5">Edit homepage slides <ArrowUpRight size={15} /></MockLink>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 md:p-9">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Settings2 size={20} /></div>
            <p className="mt-12 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Site identity</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-[hsl(var(--primary))]">{settings.collegeName}</h2>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{settings.tagline}</p>
            <MockLink href="/admin/site-settings" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent-foreground))]">Edit identity <ArrowUpRight size={15} /></MockLink>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><CheckCircle2 className="text-emerald-700" size={19} /><p className="mt-5 text-sm font-bold">Identity ready</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Name and contact details are available to visitors.</p></div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><CheckCircle2 className="text-emerald-700" size={19} /><p className="mt-5 text-sm font-bold">Responsive by default</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">The public site adapts to every screen.</p></div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><CheckCircle2 className="text-emerald-700" size={19} /><p className="mt-5 text-sm font-bold">Three slides ready</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Control the rotating homepage story from the hero editor.</p></div>
        </div>
      </main>
    </div>
  );
}