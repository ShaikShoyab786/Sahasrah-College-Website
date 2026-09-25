import { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Inbox, Mail, Phone, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminContactEnquiriesQueryKey,
  useDeleteAdminContactEnquiry,
  useGetAdminContactEnquiries,
  useUpdateAdminContactEnquiry,
  type ContactEnquiry,
} from '@workspace/api-client-react';

export default function AdminDashboard() {
  const query = useGetAdminContactEnquiries();
  const client = useQueryClient();
  const update = useUpdateAdminContactEnquiry();
  const remove = useDeleteAdminContactEnquiry();
  const [actionError, setActionError] = useState('');
  const enquiries = query.data ?? [];
  const latest = enquiries.slice(0, 5);
  const newCount = enquiries.filter((item) => !item.contacted).length;
  const resolvedCount = enquiries.filter((item) => item.resolved).length;

  const markReviewed = (item: ContactEnquiry) => {
    setActionError('');
    update.mutate({ id: item.id, data: { contacted: !item.contacted, resolved: item.resolved } }, {
      onSuccess: (saved) => client.setQueryData(
        getGetAdminContactEnquiriesQueryKey(),
        (current: ContactEnquiry[] | undefined) => current?.map((entry) => entry.id === saved.id ? saved : entry),
      ),
      onError: () => setActionError('We could not update that enquiry. Please try again.'),
    });
  };

  const deleteEnquiry = (item: ContactEnquiry) => {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    setActionError('');
    remove.mutate({ id: item.id }, {
      onSuccess: () => client.setQueryData(
        getGetAdminContactEnquiriesQueryKey(),
        (current: ContactEnquiry[] | undefined) => current?.filter((entry) => entry.id !== item.id),
      ),
      onError: () => setActionError('We could not delete that enquiry. Please try again.'),
    });
  };

  return (
    <div className="animate-rise">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Admin dashboard</p>
          <h1 className="mt-2 font-display text-5xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))]" data-testid="text-admin-dashboard-heading">Admissions enquiries</h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Review and manage Contact form submissions.</p>
        </div>
        <Link href="/admin/contact-enquiries" className="inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5">
          All enquiries <ArrowRight size={16} />
        </Link>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Enquiry summary">
        <SummaryCard label="Total enquiries" value={query.isLoading ? '—' : enquiries.length} icon={<Inbox size={19} />} />
        <SummaryCard label="New / unreviewed" value={query.isLoading ? '—' : newCount} icon={<Clock3 size={19} />} />
        <SummaryCard label="Resolved" value={query.isLoading ? '—' : resolvedCount} icon={<CheckCircle2 size={19} />} />
      </section>

      <section className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-7" aria-labelledby="latest-enquiries-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 id="latest-enquiries-title" className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Latest submissions</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Newest Contact enquiries, saved for authorized administrators.</p>
          </div>
          <Link href="/admin/contact-enquiries" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent-foreground))]">
            View enquiry details <ArrowRight size={15} />
          </Link>
        </div>

        {actionError && <p role="alert" className="mt-5 rounded-xl border border-red-700/20 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>}
        {query.isLoading && <p className="mt-6 rounded-xl bg-[hsl(var(--background))] p-6 text-sm text-[hsl(var(--muted-foreground))]">Loading enquiries…</p>}
        {query.isError && <div className="mt-6 rounded-xl bg-[hsl(var(--background))] p-6"><p className="text-sm text-[hsl(var(--muted-foreground))]">Enquiries could not be loaded.</p><button type="button" onClick={() => query.refetch()} className="mt-3 text-sm font-bold text-[hsl(var(--primary))]">Try again</button></div>}
        {!query.isLoading && !query.isError && latest.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
            <Inbox className="mx-auto text-[hsl(var(--muted-foreground))]" size={24} />
            <p className="mt-3 text-sm font-semibold">No enquiries yet</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">New Contact submissions will appear here.</p>
          </div>
        )}
        <div className="mt-5 space-y-3">
          {latest.map((item) => (
            <article key={item.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 md:p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-semibold text-[hsl(var(--primary))]">{item.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.contacted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{item.contacted ? 'Reviewed' : 'New'}</span>
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{new Date(item.createdAt).toLocaleString()} · {item.course || 'Course not specified'} · {item.source === 'callback-request' ? 'Callback Request' : 'Contact Form'}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <a href={`tel:${item.phone}`} className="inline-flex items-center gap-2 font-semibold text-[hsl(var(--primary))]"><Phone size={15} />{item.phone}</a>
                    {item.email && <a href={`mailto:${item.email}`} className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))]"><Mail size={15} />{item.email}</a>}
                  </div>
                  {item.message && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.message}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={item.contacted} onChange={() => markReviewed(item)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                    Reviewed
                  </label>
                  <button type="button" onClick={() => deleteEnquiry(item)} disabled={remove.isPending} aria-label={`Delete enquiry from ${item.name}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {enquiries.length > latest.length && <p className="mt-4 text-right text-xs text-[hsl(var(--muted-foreground))]">Showing the 5 newest of {enquiries.length}</p>}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]"><span className="text-sm font-semibold">{label}</span>{icon}</div>
      <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-[hsl(var(--primary))]">{value}</p>
    </div>
  );
}