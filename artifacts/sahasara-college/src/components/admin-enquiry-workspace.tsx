import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, Clock3, FileText, Inbox, Mail, MessageSquarePlus, Phone, RefreshCw, Search, Trash2, UserRound, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminContactEnquiriesQueryKey,
  getGetAdminContactEnquiryQueryKey,
  useCreateAdminContactEnquiryNote,
  useDeleteAdminContactEnquiry,
  useGetAdminContactEnquiries,
  useGetAdminContactEnquiry,
  useUpdateAdminContactEnquiry,
  type ContactEnquiry,
  type ContactEnquiryDetail,
  type ContactEnquiryNote,
  type ContactEnquiryUpdate,
} from '@workspace/api-client-react';

const statuses = ['new', 'follow-up-needed', 'completed'] as const;
const types = ['call-back-requested', 'campus-visit-planned', 'topic-suggestion', 'course-admissions-question', 'other'] as const;
type Status = (typeof statuses)[number];
type EnquiryType = (typeof types)[number];

const statusLabels: Record<Status, string> = {
  new: 'New',
  'follow-up-needed': 'Follow-up needed',
  completed: 'Completed — no further follow-up',
};

const typeLabels: Record<EnquiryType, string> = {
  'call-back-requested': 'Call-back requested',
  'campus-visit-planned': 'Campus visit planned',
  'topic-suggestion': 'Topic suggestion',
  'course-admissions-question': 'Course/admissions question',
  other: 'Other',
};

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function dateInputValue(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function sourceLabel(item: ContactEnquiry) {
  return item.source === 'callback-request' ? 'Callback popup' : 'Contact form';
}

function dueWindow(value: string | null): 'overdue' | 'today' | 'upcoming' | null {
  if (!value) return null;
  const due = new Date(value);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);
  if (due < today) return 'overdue';
  if (due < tomorrow) return 'today';
  if (due < nextWeek) return 'upcoming';
  return null;
}

function statusTone(status: Status) {
  if (status === 'completed') return 'bg-[hsl(155_32%_91%)] text-[hsl(155_38%_27%)]';
  if (status === 'follow-up-needed') return 'bg-[hsl(39_72%_90%)] text-[hsl(27_52%_31%)]';
  return 'bg-[hsl(211_42%_91%)] text-[hsl(213_50%_29%)]';
}

function typeTone(type: EnquiryType) {
  if (type === 'call-back-requested') return 'bg-[hsl(9_55%_93%)] text-[hsl(9_46%_34%)]';
  if (type === 'campus-visit-planned') return 'bg-[hsl(171_28%_90%)] text-[hsl(173_39%_27%)]';
  return 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--primary))]';
}

function updateCache(client: ReturnType<typeof useQueryClient>, saved: ContactEnquiry) {
  client.setQueryData(getGetAdminContactEnquiriesQueryKey(), (current: ContactEnquiry[] | undefined) => current?.map((item) => item.id === saved.id ? saved : item));
  client.setQueryData(getGetAdminContactEnquiryQueryKey(saved.id), (current: ContactEnquiryDetail | undefined) => current ? { ...current, enquiry: saved } : current);
}

function EnquirySkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading enquiries" data-testid="loading-enquiries">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="enquiry-skeleton h-24 rounded-2xl" />
      ))}
    </div>
  );
}

function QueryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--destructive)/.22)] bg-[hsl(var(--destructive)/.06)] p-7" role="alert" data-testid="error-enquiries">
      <p className="font-semibold text-[hsl(var(--foreground))]">The admissions register could not be loaded.</p>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Try again, or check that your admin session is still active.</p>
      <button type="button" onClick={onRetry} className="enquiry-action mt-5 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-enquiries">
        <RefreshCw size={15} /> Try again
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[11px] font-bold leading-4 ${statusTone(status)}`} data-testid={`status-enquiry-${status}`}>{statusLabels[status]}</span>;
}

function TypeBadge({ type }: { type: EnquiryType }) {
  return <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[11px] font-bold leading-4 ${typeTone(type)}`} data-testid={`type-enquiry-${type}`}>{typeLabels[type]}</span>;
}

function EnquiryRow({ item, onOpen, onNote, onStatusChange, isUpdating }: {
  item: ContactEnquiry;
  onOpen: () => void;
  onNote: () => void;
  onStatusChange: (status: Status) => void;
  isUpdating: boolean;
}) {
  return (
    <article className="enquiry-row rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 md:p-5" data-testid={`row-enquiry-${item.id}`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-semibold tracking-[-.02em] text-[hsl(var(--primary))]" data-testid={`text-enquiry-name-${item.id}`}>{item.name}</h3>
            <StatusBadge status={item.status} />
            <TypeBadge type={item.type} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{formatDateTime(item.createdAt)}</span>
            <span className="text-[hsl(var(--border))]">|</span>
            <span>{item.course || 'Course not specified'}</span>
            <span className="text-[hsl(var(--border))]">|</span>
            <span>{sourceLabel(item)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-[hsl(var(--primary))]" data-testid={`text-phone-enquiry-${item.id}`}><Phone size={15} />{item.phone}</span>
            {item.email && <span className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))]" data-testid={`text-email-enquiry-${item.id}`}><Mail size={15} />{item.email}</span>}
          </div>
          {(item.nextAction || item.nextActionDueAt) && (
            <div className={`mt-4 flex flex-wrap items-center gap-2 text-sm ${dueWindow(item.nextActionDueAt) === 'overdue' ? 'text-[hsl(9_52%_38%)]' : dueWindow(item.nextActionDueAt) ? 'text-[hsl(27_52%_35%)]' : 'text-[hsl(var(--foreground))]'}`}>
              <Clock3 size={15} />
              <span className="font-semibold">{item.nextAction || 'Follow-up reminder'}</span>
              {item.nextActionDueAt && <span className="text-xs">· {dueWindow(item.nextActionDueAt) === 'overdue' ? `Overdue · ${formatDate(item.nextActionDueAt)}` : dueWindow(item.nextActionDueAt) === 'today' ? 'Due today' : formatDate(item.nextActionDueAt)}</span>}
            </div>
          )}
          {item.message && <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.message}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 xl:max-w-[250px] xl:justify-end">
          <label className="relative">
            <span className="sr-only">Change status for {item.name}</span>
            <select value={item.status} disabled={isUpdating} onChange={(event) => onStatusChange(event.target.value as Status)} className="enquiry-filter h-10 appearance-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2 pl-3 pr-8 text-xs font-bold text-[hsl(var(--foreground))] disabled:opacity-60" data-testid={`select-status-enquiry-${item.id}`}>
              {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-3 text-[hsl(var(--muted-foreground))]" />
          </label>
          <button type="button" onClick={onNote} className="enquiry-action inline-flex h-10 items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-xs font-bold text-[hsl(var(--primary))]" data-testid={`button-add-note-${item.id}`}><MessageSquarePlus size={15} /> Add note</button>
          <button type="button" onClick={onOpen} className="enquiry-action inline-flex h-10 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 text-xs font-bold text-[hsl(var(--primary-foreground))]" data-testid={`button-open-enquiry-${item.id}`}>Open record</button>
        </div>
      </div>
    </article>
  );
}

export function EnquiryDashboard() {
  const query = useGetAdminContactEnquiries();
  const client = useQueryClient();
  const update = useUpdateAdminContactEnquiry();
  const [statusFilter, setStatusFilter] = useState<'active' | 'new' | 'follow-up-needed'>('active');
  const [typeFilter, setTypeFilter] = useState<'all' | EnquiryType>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusNotes, setFocusNotes] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const enquiries = query.data ?? [];
  const active = useMemo(() => enquiries.filter((item) => item.status !== 'completed'), [enquiries]);
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return active
      .filter((item) => statusFilter === 'active' || item.status === statusFilter)
      .filter((item) => typeFilter === 'all' || item.type === typeFilter)
      .filter((item) => !needle || [item.name, item.phone, item.email, item.course, item.message, item.nextAction].some((value) => value?.toLowerCase().includes(needle)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [active, search, statusFilter, typeFilter]);
  const followUpCount = active.filter((item) => item.status === 'follow-up-needed').length;
  const dueTodayCount = active.filter((item) => dueWindow(item.nextActionDueAt) === 'today').length;
  const overdueCount = active.filter((item) => dueWindow(item.nextActionDueAt) === 'overdue').length;

  const changeStatus = (item: ContactEnquiry, status: Status) => {
    setNotice('');
    setError('');
    const data: ContactEnquiryUpdate = { status };
    update.mutate({ id: item.id, data }, {
      onSuccess: (saved) => {
        updateCache(client, saved);
        setNotice(`${item.name}'s status is now ${statusLabels[status]}.`);
      },
      onError: () => setError('That status could not be saved. Please try again.'),
    });
  };

  return (
    <div className="animate-rise max-w-7xl" data-testid="admin-dashboard-enquiries">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="enquiry-kicker text-xs font-bold uppercase">Admissions register</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[.98] tracking-[-.055em] text-[hsl(var(--primary))]" data-testid="text-admin-dashboard-heading">Keep every conversation moving.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">A focused view of open parent and student enquiries. Completed records stay in the full history.</p>
        </div>
        <a href="/admin/contact-enquiries" className="enquiry-action inline-flex w-fit items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-all-enquiries">Open full history <FileText size={16} /></a>
      </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Follow-up counts">
        <MetricCard label="Open enquiries" value={query.isLoading ? '—' : active.length} detail="New and active follow-up" icon={<Inbox size={18} />} />
          <MetricCard label="Follow-up needed" value={query.isLoading ? '—' : followUpCount} detail="Status: follow-up needed" icon={<Clock3 size={18} />} />
          <MetricCard label="Due today" value={query.isLoading ? '—' : dueTodayCount} detail="Scheduled for today" icon={<CalendarDays size={18} />} />
          <MetricCard label="Overdue" value={query.isLoading ? '—' : overdueCount} detail="Past the follow-up date" icon={<Clock3 size={18} />} />
      </section>

      <section className="enquiry-surface mt-6 rounded-2xl border border-[hsl(var(--border))] p-4 md:p-6" aria-labelledby="follow-up-enquiries-title">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
              <p className="enquiry-kicker text-[11px] font-bold uppercase">Working view</p>
            </div>
            <h2 id="follow-up-enquiries-title" className="mt-2 font-display text-3xl font-semibold tracking-[-.03em] text-[hsl(var(--primary))]">Follow-up enquiries</h2>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-3 text-[hsl(var(--muted-foreground))]" />
            <label htmlFor="dashboard-search" className="sr-only">Search active enquiries</label>
            <input id="dashboard-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone or course" className="enquiry-filter h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-dashboard-search" />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-y border-[hsl(var(--border))] py-4 md:flex-row">
          <FilterSelect label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as 'active' | 'new' | 'follow-up-needed')} options={[['active', 'All active'], ['new', 'New'], ['follow-up-needed', 'Follow-up needed']]} testId="select-dashboard-status" />
          <FilterSelect label="Type" value={typeFilter} onChange={(value) => setTypeFilter(value as 'all' | EnquiryType)} options={[['all', 'All types'], ...types.map((type) => [type, typeLabels[type]] as [string, string])]} testId="select-dashboard-type" />
          <p className="self-center text-xs text-[hsl(var(--muted-foreground))]" data-testid="text-dashboard-result-count">{visible.length} {visible.length === 1 ? 'record' : 'records'} shown</p>
        </div>
        {notice && <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-700/20 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800" role="status" data-testid="status-dashboard-saved"><Check size={15} /> {notice}</p>}
        {error && <p className="mt-4 rounded-xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" role="alert" data-testid="error-dashboard-action">{error}</p>}
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-3">
            {query.isLoading && <EnquirySkeleton />}
            {query.isError && !query.data && <QueryError onRetry={() => query.refetch()} />}
            {!query.isLoading && !query.isError && visible.length === 0 && <EmptyState hasSearch={Boolean(search || typeFilter !== 'all' || statusFilter !== 'active')} />}
            {visible.map((item) => <EnquiryRow key={item.id} item={item} onOpen={() => { setSelectedId(item.id); setFocusNotes(false); }} onNote={() => { setSelectedId(item.id); setFocusNotes(true); }} onStatusChange={(status) => changeStatus(item, status)} isUpdating={update.isPending} />)}
          </div>
          {selectedId && <EnquiryDetailPanel id={selectedId} focusNotes={focusNotes} onClose={() => setSelectedId(null)} onDeleted={() => setSelectedId(null)} />}
        </div>
      </section>
    </div>
  );
}

export function EnquiryHistory() {
  const query = useGetAdminContactEnquiries();
  const client = useQueryClient();
  const update = useUpdateAdminContactEnquiry();
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | EnquiryType>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusNotes, setFocusNotes] = useState(false);
  const [error, setError] = useState('');
  const enquiries = query.data ?? [];
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return enquiries
      .filter((item) => statusFilter === 'all' || item.status === statusFilter)
      .filter((item) => typeFilter === 'all' || item.type === typeFilter)
      .filter((item) => !needle || [item.name, item.phone, item.email, item.course, item.message, item.nextAction].some((value) => value?.toLowerCase().includes(needle)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [enquiries, search, statusFilter, typeFilter]);
  const changeStatus = (item: ContactEnquiry, status: Status) => {
    setError('');
    update.mutate({ id: item.id, data: { status } }, {
      onSuccess: (saved) => updateCache(client, saved),
      onError: () => setError('That status could not be saved. Please try again.'),
    });
  };

  return (
    <div className="animate-rise max-w-7xl" data-testid="admin-contact-enquiries">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="enquiry-kicker text-xs font-bold uppercase">Admissions register / full history</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[.98] tracking-[-.055em] text-[hsl(var(--primary))]" data-testid="text-contact-enquiries-heading">Every question, kept in context.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">Search open and completed enquiries, then open one record to review private notes and the next action.</p>
        </div>
        <a href="/admin/dashboard" className="enquiry-action inline-flex w-fit items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="link-dashboard-view">Back to working view <Inbox size={16} /></a>
      </header>
      <section className="enquiry-surface mt-8 rounded-2xl border border-[hsl(var(--border))] p-4 md:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_240px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-3 text-[hsl(var(--muted-foreground))]" />
            <label htmlFor="history-search" className="sr-only">Search enquiry history</label>
            <input id="history-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, email, course or message" className="enquiry-filter h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-history-search" />
          </div>
          <FilterSelect label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as 'all' | Status)} options={[['all', 'All statuses'], ...statuses.map((status) => [status, statusLabels[status]] as [string, string])]} testId="select-history-status" />
          <FilterSelect label="Type" value={typeFilter} onChange={(value) => setTypeFilter(value as 'all' | EnquiryType)} options={[['all', 'All types'], ...types.map((type) => [type, typeLabels[type]] as [string, string])]} testId="select-history-type" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-xs text-[hsl(var(--muted-foreground))]">
          <span data-testid="text-history-result-count">{visible.length} {visible.length === 1 ? 'record' : 'records'} in history</span>
          <span>Completed records remain available here</span>
        </div>
        {error && <p className="mt-4 rounded-xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" role="alert" data-testid="error-history-action">{error}</p>}
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-3">
            {query.isLoading && <EnquirySkeleton rows={5} />}
            {query.isError && !query.data && <QueryError onRetry={() => query.refetch()} />}
            {!query.isLoading && !query.isError && visible.length === 0 && <EmptyState hasSearch={Boolean(search || typeFilter !== 'all' || statusFilter !== 'all')} history />}
            {visible.map((item) => <EnquiryRow key={item.id} item={item} onOpen={() => { setSelectedId(item.id); setFocusNotes(false); }} onNote={() => { setSelectedId(item.id); setFocusNotes(true); }} onStatusChange={(status) => changeStatus(item, status)} isUpdating={update.isPending} />)}
          </div>
          {selectedId && <EnquiryDetailPanel id={selectedId} focusNotes={focusNotes} onClose={() => setSelectedId(null)} onDeleted={() => setSelectedId(null)} />}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon }: { label: string; value: number | string; detail: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]"><span className="text-sm font-semibold">{label}</span><span className="text-[hsl(var(--accent-foreground))]">{icon}</span></div><p className="mt-3 font-display text-4xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))]">{value}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p></div>;
}

function FilterSelect({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][]; testId: string }) {
  return <label className="relative block"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="enquiry-filter h-11 w-full appearance-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 pr-9 text-sm font-semibold text-[hsl(var(--foreground))]" data-testid={testId}>{options.map(([option, optionLabel]) => <option key={option} value={option}>{optionLabel}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-[hsl(var(--muted-foreground))]" /></label>;
}

function EmptyState({ hasSearch, history = false }: { hasSearch: boolean; history?: boolean }) {
  return <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)] px-6 py-12 text-center" data-testid="empty-enquiries"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--accent)/.15)] text-[hsl(var(--primary))]"><Inbox size={22} /></div><p className="mt-4 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{hasSearch ? 'No matching records' : history ? 'No enquiries in the register' : 'The working view is clear'}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{hasSearch ? 'Try a broader search or another status or type.' : history ? 'New Contact form and callback submissions will appear here.' : 'New enquiries will appear here when a parent or student reaches out.'}</p></div>;
}

function EnquiryDetailPanel({ id, focusNotes, onClose, onDeleted }: { id: string; focusNotes: boolean; onClose: () => void; onDeleted: () => void }) {
  const query = useGetAdminContactEnquiry(id, { query: { enabled: Boolean(id), queryKey: getGetAdminContactEnquiryQueryKey(id) } });
  const client = useQueryClient();
  const update = useUpdateAdminContactEnquiry();
  const createNote = useCreateAdminContactEnquiryNote();
  const remove = useDeleteAdminContactEnquiry();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<Status>('new');
  const [type, setType] = useState<EnquiryType>('other');
  const [nextAction, setNextAction] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [error, setError] = useState('');
  const detail = query.data;
  const item = detail?.enquiry;

  useEffect(() => {
    if (!item) return;
    setStatus(item.status);
    setType(item.type);
    setNextAction(item.nextAction ?? '');
    setDueAt(dateInputValue(item.nextActionDueAt));
  }, [item]);

  useEffect(() => {
    if (focusNotes && item) noteRef.current?.focus();
  }, [focusNotes, item]);

  const saveDetails = () => {
    setSaveNotice('');
    setError('');
    const data: ContactEnquiryUpdate = {
      status,
      type,
      nextAction: nextAction.trim() || null,
      nextActionDueAt: dueAt ? new Date(`${dueAt}T09:00:00`).toISOString() : null,
    };
    update.mutate({ id, data }, {
      onSuccess: (saved) => {
        updateCache(client, saved);
        setSaveNotice('Record saved.');
      },
      onError: () => setError('We could not save this record. Please try again.'),
    });
  };

  const appendNote = () => {
    const body = noteBody.trim();
    if (!body) {
      setError('Write a note before saving it.');
      noteRef.current?.focus();
      return;
    }
    setSaveNotice('');
    setError('');
    createNote.mutate({ id, data: { body } }, {
      onSuccess: (saved) => {
        client.setQueryData(getGetAdminContactEnquiryQueryKey(id), (current: ContactEnquiryDetail | undefined) => current ? { ...current, notes: [...current.notes, saved] } : current);
        setNoteBody('');
        setSaveNotice('Private note added.');
      },
      onError: () => setError('We could not add that private note. Please try again.'),
    });
  };

  const deleteRecord = () => {
    if (!item || !window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    setError('');
    remove.mutate({ id }, {
      onSuccess: () => {
        client.setQueryData(getGetAdminContactEnquiriesQueryKey(), (current: ContactEnquiry[] | undefined) => current?.filter((entry) => entry.id !== id));
        client.removeQueries({ queryKey: getGetAdminContactEnquiryQueryKey(id) });
        onDeleted();
      },
      onError: () => setError('We could not delete this enquiry. Please try again.'),
    });
  };

  return (
    <aside className="enquiry-detail min-w-0 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-6 xl:sticky xl:top-6 xl:self-start" aria-label="Enquiry detail" data-testid={`panel-enquiry-detail-${id}`}>
      <div className="flex items-start justify-between gap-3 border-b border-[hsl(var(--border))] pb-5">
        <div>
          <p className="enquiry-kicker text-[10px] font-bold uppercase">Private record</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{item?.name || 'Enquiry detail'}</h2>
        </div>
        <button type="button" onClick={onClose} className="enquiry-action grid h-9 w-9 place-items-center rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]" aria-label="Close enquiry detail" data-testid="button-close-enquiry-detail"><X size={17} /></button>
      </div>
      {query.isLoading && <div className="space-y-3 py-6"><div className="enquiry-skeleton h-20 rounded-xl" /><div className="enquiry-skeleton h-36 rounded-xl" /></div>}
      {query.isError && <div className="py-6"><p className="text-sm text-[hsl(var(--muted-foreground))]">This enquiry could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 text-sm font-bold text-[hsl(var(--primary))]" data-testid="button-retry-enquiry-detail">Try again</button></div>}
      {item && (
        <>
          <div className="grid gap-3 border-b border-[hsl(var(--border))] py-5 text-sm">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))]" data-testid={`text-detail-phone-${id}`}><Phone size={15} /><span className="font-semibold">{item.phone}</span></div>
            {item.email && <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]" data-testid={`text-detail-email-${id}`}><Mail size={15} /><span>{item.email}</span></div>}
            <div className="flex items-start gap-2 text-[hsl(var(--muted-foreground))]"><UserRound size={15} className="mt-0.5 shrink-0" /><span>{item.course || 'Course not specified'} · {sourceLabel(item)}</span></div>
            <div className="flex items-start gap-2 text-[hsl(var(--muted-foreground))]"><FileText size={15} className="mt-0.5 shrink-0" /><span className="whitespace-pre-wrap leading-6">{item.message || 'No message included.'}</span></div>
          </div>
          <div className="space-y-4 border-b border-[hsl(var(--border))] py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldSelect label="Status" value={status} onChange={(value) => setStatus(value as Status)} options={statuses.map((entry) => [entry, statusLabels[entry]])} testId={`select-detail-status-${id}`} />
              <FieldSelect label="Type" value={type} onChange={(value) => setType(value as EnquiryType)} options={types.map((entry) => [entry, typeLabels[entry]])} testId={`select-detail-type-${id}`} />
            </div>
            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Next action<input value={nextAction} onChange={(event) => setNextAction(event.target.value)} maxLength={500} placeholder="For example, confirm campus visit" className="enquiry-filter mt-2 h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm font-normal tracking-normal text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" data-testid={`input-next-action-${id}`} /></label>
            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Follow-up date<input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="enquiry-filter mt-2 h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm font-normal tracking-normal text-[hsl(var(--foreground))]" data-testid={`input-follow-up-date-${id}`} /></label>
            <button type="button" onClick={saveDetails} disabled={update.isPending} className="enquiry-action inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-60" data-testid={`button-save-enquiry-${id}`}><Check size={15} />{update.isPending ? 'Saving…' : 'Save record'}</button>
          </div>
          <div className="py-5">
            <div className="flex items-center justify-between gap-3"><div><p className="enquiry-kicker text-[10px] font-bold uppercase">Staff notes</p><h3 className="mt-1 font-display text-xl font-semibold text-[hsl(var(--primary))]">Private history</h3></div><MessageSquarePlus size={18} className="text-[hsl(var(--accent-foreground))]" /></div>
            <div className="mt-4 space-y-3">
              {detail?.notes.length ? detail.notes.map((note) => <NoteCard key={note.id} note={note} />) : <p className="rounded-xl bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]" data-testid={`empty-notes-${id}`}>No private notes yet.</p>}
            </div>
            <label className="mt-4 block text-xs font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Add private note<textarea ref={noteRef} value={noteBody} onChange={(event) => setNoteBody(event.target.value)} maxLength={5000} placeholder="Record what the next staff member should know…" className="enquiry-filter mt-2 min-h-24 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3 text-sm font-normal normal-case tracking-normal leading-6 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" data-testid={`textarea-private-note-${id}`} /></label>
            <button type="button" onClick={appendNote} disabled={createNote.isPending} className="enquiry-action mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary))] disabled:opacity-60" data-testid={`button-save-note-${id}`}><MessageSquarePlus size={15} />{createNote.isPending ? 'Adding note…' : 'Add private note'}</button>
          </div>
          {saveNotice && <p className="rounded-xl border border-emerald-700/20 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800" role="status" data-testid={`status-detail-saved-${id}`}>{saveNotice}</p>}
          {error && <p className="mt-3 rounded-xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] px-3 py-2.5 text-sm text-[hsl(var(--destructive))]" role="alert" data-testid={`error-detail-${id}`}>{error}</p>}
          <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
            <button type="button" onClick={deleteRecord} disabled={remove.isPending} className="enquiry-action inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--destructive))] disabled:opacity-50" data-testid={`button-delete-enquiry-${id}`}><Trash2 size={14} /> Delete record</button>
            <p className="mt-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Created {formatDateTime(item.createdAt)} · Updated {formatDateTime(item.updatedAt)}</p>
          </div>
        </>
      )}
    </aside>
  );
}

function FieldSelect({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][]; testId: string }) {
  return <label className="block text-xs font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{label}<span className="relative mt-2 block"><select value={value} onChange={(event) => onChange(event.target.value)} className="enquiry-filter h-11 w-full appearance-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 pr-8 text-sm font-normal normal-case tracking-normal text-[hsl(var(--foreground))]" data-testid={testId}>{options.map(([option, optionLabel]) => <option key={option} value={option}>{optionLabel}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5" /></span></label>;
}

function NoteCard({ note }: { note: ContactEnquiryNote }) {
  return <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3.5" data-testid={`note-${note.id}`}><div className="flex items-center justify-between gap-3 text-[11px] font-bold text-[hsl(var(--primary))]"><span>{note.authorName}</span><time className="font-normal text-[hsl(var(--muted-foreground))]" dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground))]">{note.body}</p></div>;
}