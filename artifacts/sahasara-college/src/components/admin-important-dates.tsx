import { useEffect, useRef, useState } from 'react';
import { Archive, CalendarDays, ExternalLink, Plus, RotateCcw, Save, ShieldCheck, Trash2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type Control } from 'react-hook-form';
import {
  getGetAdminKnowledgeHubExamUpdatesImportantDatesQueryKey,
  getGetKnowledgeHubExamUpdatesImportantDatesQueryKey,
  useGetAdminKnowledgeHubExamUpdatesImportantDates,
  useUpdateAdminKnowledgeHubExamUpdatesImportantDatesSettings,
  useCreateAdminKnowledgeHubExamUpdatesImportantDatesMilestone,
  useUpdateAdminKnowledgeHubExamUpdatesImportantDatesMilestone,
  useDeleteAdminKnowledgeHubExamUpdatesImportantDatesMilestone,
  type KnowledgeHubExamUpdatesImportantDatesMilestone as Milestone,
  type KnowledgeHubExamUpdatesImportantDatesMilestoneInput as MilestoneInput,
  type KnowledgeHubExamUpdatesImportantDatesSettingsInput as SettingsInput,
} from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { EditorCard } from '@/pages/admin-about-hero';
import { EXAMS, formatMilestoneRange } from '@/lib/important-dates';

const inputClass = 'min-h-11 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--admin-focus))] disabled:cursor-not-allowed disabled:opacity-50';
const labelClass = 'text-xs font-bold text-[hsl(var(--admin-text))]';

function emptyMilestone(order: number): MilestoneInput {
  return { exam: 'JEE', cycleYear: '', title: '', milestoneType: '', startDate: null, endDate: null, description: '', officialUrl: null, eventStatusOverride: 'automatic', status: 'draft', displayOrder: order, isDemo: false };
}

function Field({ control, name, label, required, type = 'text', placeholder }: { control: Control<any>; name: string; label: string; required?: boolean; type?: string; placeholder?: string }) {
  return <FormField control={control} name={name} rules={required ? { required: `${label} is required.` } : undefined} render={({ field }) =>
    <FormItem><FormLabel className={labelClass}>{label}</FormLabel><FormControl><input {...field} value={field.value ?? ''} onChange={event => field.onChange(type === 'number' ? Number(event.target.value) : event.target.value)} type={type} min={type === 'number' ? 1 : undefined} max={type === 'number' ? 10000 : undefined} placeholder={placeholder} className={inputClass} data-testid={`input-important-dates-${name.replace(/\./g, '-')}`} /></FormControl><FormMessage /></FormItem>
  } />;
}
function Textarea({ control, name, label }: { control: Control<any>; name: string; label: string }) {
  return <FormField control={control} name={name} render={({ field }) =>
    <FormItem><FormLabel className={labelClass}>{label}</FormLabel><FormControl><textarea {...field} value={field.value ?? ''} rows={3} className={`${inputClass} resize-y py-3`} data-testid={`input-important-dates-${name}`} /></FormControl><FormMessage /></FormItem>
  } />;
}
function Choice({ control, name, label, options }: { control: Control<any>; name: string; label: string; options: readonly string[] }) {
  return <FormField control={control} name={name} render={({ field }) =>
    <FormItem><FormLabel className={labelClass}>{label}</FormLabel><FormControl><select {...field} className={inputClass} data-testid={`select-important-dates-${name}`}>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></FormControl><FormMessage /></FormItem>
  } />;
}
function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'The change could not be saved. Check the fields and try again.';
}

export function AdminImportantDates() {
  const client = useQueryClient();
  const query = useGetAdminKnowledgeHubExamUpdatesImportantDates();
  const settingsMutation = useUpdateAdminKnowledgeHubExamUpdatesImportantDatesSettings();
  const createMutation = useCreateAdminKnowledgeHubExamUpdatesImportantDatesMilestone();
  const updateMutation = useUpdateAdminKnowledgeHubExamUpdatesImportantDatesMilestone();
  const deleteMutation = useDeleteAdminKnowledgeHubExamUpdatesImportantDatesMilestone();
  const settingsForm = useForm<SettingsInput>({ defaultValues: { heading: 'Important Dates', description: '', visible: false, examLabels: { JEE: 'JEE', NEET: 'NEET', Intermediate: 'Intermediate', EAMCET: 'EAMCET', 'Other Exams': 'Other Exams' } } });
  const recordForm = useForm<MilestoneInput>({ defaultValues: emptyMilestone(1) });
  const initialized = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const records = [...(query.data?.milestones ?? [])].sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title));
  const selected = records.find(record => record.id === selectedId);
  const working = recordForm.watch();
  const busy = settingsMutation.isPending || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  useEffect(() => {
    if (!query.data || initialized.current) return;
    initialized.current = true;
    settingsForm.reset(query.data.settings);
    if (query.data.milestones[0]) {
      setSelectedId(query.data.milestones[0].id);
      recordForm.reset(query.data.milestones[0]);
    }
  }, [query.data, settingsForm, recordForm]);

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: getGetAdminKnowledgeHubExamUpdatesImportantDatesQueryKey() }),
      client.invalidateQueries({ queryKey: getGetKnowledgeHubExamUpdatesImportantDatesQueryKey() }),
    ]);
  };
  const success = (message: string) => { setFeedback(message); setError(''); void refresh(); };
  const fail = (reason: unknown) => { setError(errorText(reason)); setFeedback(''); };
  const select = (record: Milestone) => { setSelectedId(record.id); recordForm.reset(record); setError(''); setFeedback(''); };
  const startNew = () => { setSelectedId(null); recordForm.reset(emptyMilestone(Math.max(0, ...records.map(item => item.displayOrder)) + 1)); setError(''); setFeedback(''); };

  const saveSettings = (values: SettingsInput) => {
    const data = { ...values, heading: values.heading.trim(), description: values.description.trim(), examLabels: Object.fromEntries(EXAMS.map(key => [key, values.examLabels[key].trim()])) as SettingsInput['examLabels'] };
    if (!data.heading || EXAMS.some(key => !data.examLabels[key])) { setError('Add a heading and a label for each exam tab.'); return; }
    settingsMutation.mutate({ data }, { onSuccess: saved => { settingsForm.reset(saved); success('Important Dates settings saved.'); }, onError: fail });
  };
  const saveRecord = (values: MilestoneInput) => {
    setFeedback(''); setError('');
    const data: MilestoneInput = { ...values, title: values.title.trim(), cycleYear: values.cycleYear.trim(), milestoneType: values.milestoneType.trim(), description: values.description.trim(), officialUrl: values.officialUrl?.trim() || null, startDate: values.startDate || null, endDate: values.endDate || null, displayOrder: Number(values.displayOrder) };
    if (!data.title || !data.cycleYear || !data.milestoneType) { setError('Title, cycle/year and milestone type are required.'); return; }
    if (!Number.isInteger(data.displayOrder) || data.displayOrder < 1 || data.displayOrder > 10000) { recordForm.setError('displayOrder', { message: 'Enter an order between 1 and 10000.' }); return; }
    if (data.startDate && data.endDate && data.endDate < data.startDate) { recordForm.setError('endDate', { message: 'End date cannot precede start date.' }); return; }
    if (data.status === 'published') {
      if (data.isDemo) { setError('Demo records cannot be published. Turn off Demo only after replacing every sample detail with verified information.'); return; }
      if (!data.startDate) { recordForm.setError('startDate', { message: 'A real start date is required to publish.' }); setError('Published milestones need a verified date.'); return; }
      if (!data.officialUrl || !/^https:\/\/[^.\s/]+\.[^\s/]+/i.test(data.officialUrl)) { recordForm.setError('officialUrl', { message: 'Enter an official HTTPS source URL.' }); setError('Published milestones need an official HTTPS source URL.'); return; }
    }
    const onSuccess = (saved: Milestone) => { setSelectedId(saved.id); recordForm.reset(saved); success(selectedId ? 'Milestone saved.' : 'Milestone created as a draft.'); };
    if (selectedId) updateMutation.mutate({ id: selectedId, data }, { onSuccess, onError: fail });
    else createMutation.mutate({ data }, { onSuccess, onError: fail });
  };
  const changeStatus = (status: MilestoneInput['status']) => {
    recordForm.handleSubmit(values => saveRecord({ ...values, status }))();
  };
  const remove = () => {
    if (!selected || !window.confirm(`Permanently delete “${selected.title}”? This cannot be undone.`)) return;
    deleteMutation.mutate({ id: selected.id }, { onSuccess: () => { startNew(); success('Milestone deleted.'); }, onError: fail });
  };

  return <div className="mt-10 space-y-6 border-t-2 border-[hsl(var(--admin-border))] pt-9" data-testid="admin-important-dates">
    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--admin-text-muted))]">Exam calendar</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-.04em] text-[hsl(var(--admin-text))]">Important Dates</h2><p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">A separate calendar beneath Latest Exam Updates. Only published, non-demo dates reach families.</p></div>
    {query.isLoading ? <div className="grid gap-5 md:grid-cols-2" role="status" aria-label="Loading important dates editor">{[1, 2].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl bg-[hsl(var(--admin-surface-soft))]" />)}</div> :
      query.isError || !query.data ? <div role="alert" className="rounded-2xl border border-[hsl(var(--destructive)/.35)] p-6" data-testid="error-admin-important-dates"><p className="font-semibold">Could not load Important Dates. Your notice editor remains available.</p><button type="button" onClick={() => query.refetch()} className={`${buttonClass} mt-3 border border-[hsl(var(--admin-border))]`} data-testid="button-retry-admin-important-dates"><RotateCcw size={15} /> Try again</button></div> : <>
        <Form {...settingsForm}><form onSubmit={settingsForm.handleSubmit(saveSettings)}>
          <EditorCard icon={<CalendarDays size={19} />} title="Calendar display" description="Edit the public heading, introduction and fixed exam-tab labels.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field control={settingsForm.control} name="heading" label="Section heading" required />
              <FormField control={settingsForm.control} name="visible" render={({ field }) => <FormItem className="flex items-center gap-3 self-end rounded-xl border border-[hsl(var(--admin-border))] px-4 py-3"><FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-5 w-5 accent-[hsl(var(--admin-primary))]" data-testid="checkbox-important-dates-visible" /></FormControl><FormLabel className="text-sm font-semibold">Show section publicly</FormLabel></FormItem>} />
              <div className="md:col-span-2"><Textarea control={settingsForm.control} name="description" label="Short description" /></div>
              {EXAMS.map(key => <Field key={key} control={settingsForm.control} name={`examLabels.${key}`} label={`${key} tab label`} required />)}
            </div>
            <button type="submit" disabled={busy} className={`${buttonClass} mt-5 bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-on-primary))]`} data-testid="button-save-important-dates-settings"><Save size={15} /> {settingsMutation.isPending ? 'Saving…' : 'Save calendar display'}</button>
          </EditorCard>
        </form></Form>
        <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
          <EditorCard icon={<ShieldCheck size={19} />} title="Milestone register" description="Select a record to edit. Order values control ties on the same date.">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[hsl(var(--admin-surface-soft))] p-3"><span className="text-sm font-bold" data-testid="text-important-dates-count">{records.length} milestone{records.length === 1 ? '' : 's'}</span><button type="button" onClick={startNew} className={`${buttonClass} bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-on-primary))]`} data-testid="button-new-important-date"><Plus size={15} /> New milestone</button></div>
            <div className="mt-4 max-h-[680px] space-y-2 overflow-y-auto" data-testid="list-admin-important-dates">{records.length === 0 ? <div className="rounded-xl border border-dashed border-[hsl(var(--admin-border))] p-6 text-sm leading-6 text-[hsl(var(--admin-text-muted))]" data-testid="empty-admin-important-dates">No milestones yet. Add a draft and verify its date and official source before publishing.</div> : records.map(record => <button type="button" key={record.id} onClick={() => select(record)} className={`w-full rounded-xl border p-4 text-left transition hover:border-[hsl(var(--admin-focus))] ${selectedId === record.id ? 'border-[hsl(var(--admin-focus))] bg-[hsl(var(--admin-focus)/.07)]' : 'border-[hsl(var(--admin-border))]'}`} data-testid={`row-important-date-${record.id}`}><span className="flex flex-wrap items-start justify-between gap-2"><span className="min-w-0 text-sm font-bold text-[hsl(var(--admin-text))]">{record.title}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${record.status === 'published' ? 'bg-emerald-100 text-emerald-900' : record.status === 'archived' ? 'bg-slate-200 text-slate-800' : 'bg-amber-100 text-amber-900'}`} data-testid={`status-important-date-admin-${record.id}`}>{record.status}</span></span><span className="mt-2 block text-xs text-[hsl(var(--admin-text-muted))]">{record.exam} · {record.cycleYear} · {formatMilestoneRange(record.startDate, record.endDate)} · order {record.displayOrder}</span>{record.isDemo && <span className="mt-2 inline-block rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-900" data-testid={`status-important-date-demo-${record.id}`}>Demo · never public</span>}</button>)}</div>
          </EditorCard>
          <EditorCard icon={<CalendarDays size={19} />} title={selectedId ? 'Edit milestone' : 'New milestone'} description="Save drafts freely. Publication requires a real date, non-demo content and an official HTTPS source.">
            <Form {...recordForm}><form onSubmit={recordForm.handleSubmit(saveRecord)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Field control={recordForm.control} name="title" label="Milestone title" required placeholder="e.g. Application window opens" /></div>
                <Choice control={recordForm.control} name="exam" label="Exam" options={EXAMS} />
                <Field control={recordForm.control} name="cycleYear" label="Cycle / year" required placeholder="e.g. 2026" />
                <Field control={recordForm.control} name="milestoneType" label="Milestone type" required placeholder="e.g. Registration" />
                <Field control={recordForm.control} name="displayOrder" label="Display order" required type="number" />
                <Field control={recordForm.control} name="startDate" label="Start / single date" type="date" />
                <Field control={recordForm.control} name="endDate" label="End date (for ranges)" type="date" />
                <div className="sm:col-span-2"><Textarea control={recordForm.control} name="description" label="Context for families" /></div>
                <div className="sm:col-span-2"><Field control={recordForm.control} name="officialUrl" label="Official HTTPS source URL" type="url" placeholder="https://..." /></div>
                <Choice control={recordForm.control} name="eventStatusOverride" label="Date status" options={['automatic', 'postponed', 'cancelled']} />
                <Choice control={recordForm.control} name="status" label="Editorial status" options={['draft', 'published', 'archived']} />
                <FormField control={recordForm.control} name="isDemo" render={({ field }) => <FormItem className="flex items-center gap-3 rounded-xl border border-[hsl(var(--admin-border))] p-3"><FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-5 w-5 accent-[hsl(var(--admin-primary))]" data-testid="checkbox-important-dates-isDemo" /></FormControl><FormLabel className="text-sm font-semibold">Demo / sample record</FormLabel></FormItem>} />
              </div>
              {working.isDemo && <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950" data-testid="status-important-dates-demo-warning">Demo record: never shown publicly. Replace all sample content and turn off Demo before publishing.</p>}
              {selected && <p className="text-xs text-[hsl(var(--admin-text-muted))]" data-testid="text-important-dates-record-meta">Created {new Date(selected.createdAt).toLocaleDateString('en-IN')} · Updated {new Date(selected.updatedAt).toLocaleDateString('en-IN')}{selected.officialUrl && /^https:\/\//i.test(selected.officialUrl) && <a href={selected.officialUrl} target="_blank" rel="noopener noreferrer" className="ml-3 inline-flex items-center gap-1 underline" data-testid="link-admin-important-date-source">Open source <ExternalLink size={12} /></a>}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--admin-border))] pt-5">
                <div className="flex flex-wrap gap-2">{selectedId && <><button type="button" disabled={busy} onClick={() => changeStatus(working.status === 'published' ? 'draft' : 'published')} className={`${buttonClass} border border-[hsl(var(--admin-border))]`} data-testid="button-toggle-important-date-publish"><ShieldCheck size={15} /> {working.status === 'published' ? 'Unpublish' : 'Publish'}</button><button type="button" disabled={busy} onClick={() => changeStatus('archived')} className={`${buttonClass} border border-[hsl(var(--admin-border))]`} data-testid="button-archive-important-date"><Archive size={15} /> Archive</button><button type="button" disabled={busy} onClick={remove} className={`${buttonClass} text-[hsl(var(--destructive))]`} data-testid="button-delete-important-date"><Trash2 size={15} /> Delete</button></>}{!selectedId && <button type="button" onClick={startNew} className={`${buttonClass} border border-[hsl(var(--admin-border))]`} data-testid="button-reset-important-date"><X size={15} /> Clear</button>}</div>
                <button type="submit" disabled={busy} className={`${buttonClass} bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-on-primary))]`} data-testid="button-save-important-date"><Save size={15} /> {createMutation.isPending || updateMutation.isPending ? 'Saving…' : selectedId ? 'Save milestone' : 'Create milestone'}</button>
              </div>
            </form></Form>
          </EditorCard>
        </div>
      </>}
    {error && <p role="alert" className="rounded-xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] p-4 text-sm font-semibold text-[hsl(var(--destructive))]" data-testid="error-important-dates-editor">{error}</p>}
    {feedback && <p role="status" className="rounded-xl border border-emerald-700/25 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900" data-testid="status-important-dates-editor">{feedback}</p>}
  </div>;
}