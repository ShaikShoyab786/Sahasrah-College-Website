import { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarClock, CalendarDays, ChevronDown, ChevronUp, CircleAlert, CircleCheck, ExternalLink, FilePenLine, RotateCcw, XCircle } from 'lucide-react';
import { useGetKnowledgeHubExamUpdatesImportantDates, type KnowledgeHubExamUpdatesImportantDatesMilestone as Milestone } from '@workspace/api-client-react';
import { EXAMS, formatMilestoneRange, getMilestoneDateStatus, indiaToday, sortMilestones } from '@/lib/important-dates';

const icons = {
  completed: CircleCheck,
  ongoing: CalendarClock,
  upcoming: CalendarDays,
  postponed: CircleAlert,
  cancelled: XCircle,
  'date pending': FilePenLine,
};
const tones = {
  completed: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
  ongoing: 'bg-[hsl(var(--chart-3)/.14)] text-[hsl(var(--foreground))]',
  upcoming: 'bg-[hsl(var(--accent)/.18)] text-[hsl(var(--foreground))]',
  postponed: 'bg-[hsl(var(--chart-4)/.18)] text-[hsl(var(--foreground))]',
  cancelled: 'bg-[hsl(var(--destructive)/.12)] text-[hsl(var(--destructive))]',
  'date pending': 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
};

function MilestoneCard({ item, index, today }: { item: Milestone; index: number; today: string }) {
  const state = getMilestoneDateStatus(item, today);
  const Icon = icons[state];
  return (
    <article className="important-dates-item relative min-w-0 pl-16 md:pl-0" data-testid={`card-important-date-${item.id}`}>
      <div className={`important-dates-node absolute left-0 top-0 z-10 grid h-11 w-11 place-items-center rounded-xl border border-[hsl(var(--border))] ${tones[state]} md:relative md:mb-6`} aria-hidden="true"><Icon size={19} strokeWidth={1.8} /></div>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)] md:min-h-[270px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{String(index + 1).padStart(2, '0')} / {item.milestoneType}</span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${tones[state]}`} data-testid={`status-important-date-${item.id}`}>{state}</span>
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold leading-tight tracking-[-.03em] text-[hsl(var(--foreground))]" data-testid={`text-important-date-title-${item.id}`}>{item.title}</h3>
        <p className="mt-3 flex items-start gap-2 text-sm font-bold text-[hsl(var(--foreground))]" data-testid={`text-important-date-range-${item.id}`}><CalendarDays size={16} className="mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))]" />{formatMilestoneRange(item.startDate, item.endDate)}</p>
        {item.description && <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]" data-testid={`text-important-date-description-${item.id}`}>{item.description}</p>}
        {item.officialUrl && /^https:\/\//i.test(item.officialUrl) && <a href={item.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-10 items-center gap-1.5 border-b border-[hsl(var(--accent))] text-xs font-bold text-[hsl(var(--foreground))] transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[hsl(var(--accent))]" data-testid={`link-important-date-source-${item.id}`}>Official source <ExternalLink size={14} /></a>}
      </div>
    </article>
  );
}

export function ImportantDates() {
  const query = useGetKnowledgeHubExamUpdatesImportantDates();
  const [exam, setExam] = useState<(typeof EXAMS)[number]>('JEE');
  const [chosenCycle, setChosenCycle] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [today, setToday] = useState(() => indiaToday());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const syncAndSchedule = () => {
      if (timer) clearTimeout(timer);
      const now = new Date();
      const currentDay = indiaToday(now);
      setToday(currentDay);
      // India uses UTC+05:30 year-round. Calculate tomorrow's local midnight as
      // an instant, not by parsing a date-only string in the browser's timezone.
      const [year, month, day] = currentDay.split('-').map(Number);
      const nextMidnight = Date.UTC(year, month - 1, day + 1) - 330 * 60_000;
      timer = setTimeout(syncAndSchedule, Math.max(1000, nextMidnight - now.getTime() + 100));
    };
    const onVisibilityChange = () => {
      if (!document.hidden) syncAndSchedule();
    };
    syncAndSchedule();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  if (query.isLoading) return <section className="bg-[hsl(var(--background))] px-6 py-16 lg:px-10" role="status" aria-label="Loading important dates" data-testid="loading-important-dates"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-9 w-64 rounded-lg bg-[hsl(var(--muted))]" /><div className="h-12 max-w-2xl rounded-lg bg-[hsl(var(--muted))]" /><div className="h-56 rounded-xl bg-[hsl(var(--muted))]" /></div></section>;
  if (query.isError) return <section className="bg-[hsl(var(--background))] px-6 py-16 lg:px-10"><div className="mx-auto max-w-7xl rounded-2xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--card))] p-7" role="alert" data-testid="error-important-dates"><h2 className="font-display text-2xl text-[hsl(var(--foreground))]">Important dates are unavailable</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">We could not load the calendar. Please check again shortly.</p><button type="button" onClick={() => query.refetch()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 text-sm font-bold" data-testid="button-retry-important-dates"><RotateCcw size={15} /> Try again</button></div></section>;
  if (!query.data?.settings.visible) return null;

  const { settings } = query.data;
  const publicItems = query.data.milestones.filter(item => item.status === 'published' && !item.isDemo);
  const cycles = [...new Set(publicItems.filter(item => item.exam === exam).map(item => item.cycleYear))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const cycle = cycles.includes(chosenCycle) ? chosenCycle : cycles[0] ?? '';
  const items = sortMilestones(publicItems.filter(item => item.exam === exam && item.cycleYear === cycle));
  const visible = expanded ? items : items.slice(0, 4);

  return (
    <section className="bg-[hsl(var(--background))] px-6 py-16 sm:py-20 lg:px-10" aria-labelledby="important-dates-heading" data-testid="section-important-dates">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-[hsl(var(--border))] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Exam calendar / Official milestones</p><h2 id="important-dates-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.055em] text-[hsl(var(--foreground))] sm:text-5xl" data-testid="text-important-dates-heading">{settings.heading}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-important-dates-description">{settings.description}</p></div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))]"><CalendarCheck2 size={15} /> Published dates only</div>
        </div>
        <div className="mt-7 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter important dates by exam">
          {EXAMS.map(key => <button key={key} type="button" aria-pressed={exam === key} onClick={() => { setExam(key); setChosenCycle(''); setExpanded(false); }} className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${exam === key ? 'border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))]'}`} data-testid={`tab-important-dates-${key.toLowerCase().replace(/\s+/g, '-')}`}>{settings.examLabels[key]}</button>)}
        </div>
        {cycles.length > 0 && <div className="mt-6 flex items-center gap-3"><label htmlFor="important-dates-cycle" className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Exam cycle</label><select id="important-dates-cycle" value={cycle} onChange={event => { setChosenCycle(event.target.value); setExpanded(false); }} className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm font-bold text-[hsl(var(--foreground))] focus-visible:outline-2 focus-visible:outline-[hsl(var(--accent))]" data-testid="select-important-dates-cycle">{cycles.map(value => <option key={value} value={value}>{value}</option>)}</select></div>}
        {items.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.65)] p-8 sm:p-12" data-testid="empty-important-dates"><CalendarDays className="text-[hsl(var(--muted-foreground))]" size={27} /><h3 className="mt-4 font-display text-2xl text-[hsl(var(--foreground))]">No published dates for {settings.examLabels[exam]} yet.</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Dates will appear here once confirmed with an official source. Please do not use sample dates for planning.</p></div> : <>
          <div className="mt-9 md:overflow-x-auto md:pb-3" aria-label="Important dates timeline">
            <div className="relative md:w-max">
              <div className="important-dates-rail absolute bottom-4 left-[21px] top-4 w-px md:bottom-auto md:left-5 md:right-5 md:top-[21px] md:h-px md:w-auto" aria-hidden="true" />
              <div className="relative flex flex-col gap-7 md:flex-row md:gap-5" data-testid="list-important-dates">{visible.map((item, index) => <div key={item.id} className="md:w-[270px] md:shrink-0 lg:w-[285px]"><MilestoneCard item={item} index={index} today={today} /></div>)}</div>
            </div>
          </div>
          {items.length > 4 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="mt-9 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--foreground))] px-5 text-sm font-bold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--secondary))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]" data-testid="button-toggle-important-dates">{expanded ? 'View Less' : 'View Full Calendar'} {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>}
        </>}
      </div>
    </section>
  );
}