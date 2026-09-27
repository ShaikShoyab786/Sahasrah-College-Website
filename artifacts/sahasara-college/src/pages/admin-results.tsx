import { useEffect, useState, type ChangeEvent } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { ArrowDown, ArrowUp, ArrowUpRight, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetAdminHomepageResultsQueryKey, getGetAdminResultsLibraryQueryKey, getGetHomepageResultsQueryKey, getGetResultsPageQueryKey, useGetAdminResultsLibrary, useUpdateAdminResultsLibrary, useUploadAdminImage, type AdminResultsLibraryInput, type HomepageResultInput, type ResultCategory, type ResultStatisticInput } from '@workspace/api-client-react';
import { Area, Field } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const emptyResult: HomepageResultInput = { studentImageUrl: null, studentImageAltText: 'Student achievement portrait', studentName: '', examCourse: '', score: '', achievement: '', resultLabel: '', examName: null, category: 'OTHER', year: null, institution: null, course: null, accentColor: null, displayOrder: 1, isPublished: false, showInHomePreview: false, homePreviewOrder: 1 };
const emptyStatistic: ResultStatisticInput = { label: '', value: '', supportingText: null, displayOrder: 1, isPublished: false, showInHomePreview: false, homePreviewOrder: 1 };
const emptyForm: AdminResultsLibraryInput = { settings: { eyebrow: 'Student outcomes', heading: 'Results worth sharing.', description: '', configuredYear: null, isVisible: true, ctaHeading: 'Your next chapter starts here.', ctaDescription: 'Connect with our team to learn about admissions and next steps.', ctaPrimaryLabel: 'Enquire Now', ctaSecondaryLabel: 'Contact Us', ctaPrimaryHref: '/contact', ctaSecondaryHref: '/contact', ctaIsVisible: true }, results: [], statistics: [] };
const categories: ResultCategory[] = ['INTERMEDIATE', 'JEE_MAIN', 'NEET', 'EAMCET', 'OTHER'];

function NumberField({ label, value, onChange, id }: { label: string; value: number; onChange: (value: number) => void; id: string }) {
  return <label htmlFor={id} className="block space-y-2 text-sm font-semibold"><span>{label}</span><input id={id} type="number" min={1} value={value} onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))} className="h-11 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm outline-none focus:border-[hsl(var(--admin-focus))]" /></label>;
}

function Upload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const upload = useUploadAdminImage();
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate({ data: { file, purpose: 'result' } }, { onSuccess: (result) => onUploaded(result.url) });
    event.target.value = '';
  };
  return <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-3 text-xs font-bold"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={change} />{upload.isPending ? 'Uploading…' : <><ImagePlus size={14} /> Upload student image</>}</label>;
}

function ResultFields({ index, existingId }: { index: number; existingId?: string }) {
  const { register, setValue, watch } = useFormContext<AdminResultsLibraryInput>();
  const image = watch(`results.${index}.studentImageUrl`);
  return <div className="mt-5 grid gap-4 md:grid-cols-2">
    <Field id={`result-${index}-name`} label="Student display name" {...register(`results.${index}.studentName`, { required: true })} placeholder="Use an anonymous display name when needed" />
    <Field id={`result-${index}-exam-course`} label="Exam / course" {...register(`results.${index}.examCourse`)} />
    <Field id={`result-${index}-score`} label="Score" {...register(`results.${index}.score`)} />
    <Field id={`result-${index}-achievement`} label="Achievement" {...register(`results.${index}.achievement`, { required: true })} />
    <Field id={`result-${index}-label`} label="Result label" {...register(`results.${index}.resultLabel`)} />
    <label className="block space-y-2 text-sm font-semibold">Category<select {...register(`results.${index}.category`)} className="h-12 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm">{categories.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}</select></label>
    <Field id={`result-${index}-exam-name`} label="Exam name" {...register(`results.${index}.examName`)} />
    <Field id={`result-${index}-year`} label="Year" {...register(`results.${index}.year`)} />
    <Field id={`result-${index}-institution`} label="Institution" {...register(`results.${index}.institution`)} />
    <Field id={`result-${index}-course`} label="Course" {...register(`results.${index}.course`)} />
    <Field id={`result-${index}-accent`} label="Accent colour" {...register(`results.${index}.accentColor`)} placeholder="#CE0B11" />
    <Field id={`result-${index}-image-url`} label="Image URL" value={image ?? ''} onChange={(event) => setValue(`results.${index}.studentImageUrl`, event.target.value || null)} />
    <Field id={`result-${index}-alt`} label="Image alt text" {...register(`results.${index}.studentImageAltText`)} />
    <div className="flex flex-wrap items-center gap-4 md:col-span-2"><Upload onUploaded={(url) => setValue(`results.${index}.studentImageUrl`, url)} /><span className="text-xs text-[hsl(var(--admin-text-muted))]">{existingId ? 'Saved record' : 'New record'}</span></div>
  </div>;
}

function ResultsEditor() {
  const { control, register, setValue, watch } = useFormContext<AdminResultsLibraryInput>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'results' });
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const values = watch('results');
  return <EditorCard title={`Student results (${fields.length})`} description="Verified achievement records for current and former students. These records are separate from alumni experiences; new results start unpublished.">
    {fields.length ? <div className="space-y-5">{fields.map((field, index) => { const item = values[index]; return <div key={field.id} className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--admin-text-muted))]">Result {index + 1}</p><h3 className="mt-2 font-display text-2xl font-semibold text-[hsl(var(--admin-text))]">{item?.studentName || 'Untitled result'}</h3></div><div className="flex items-center gap-1"><button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} className="rounded-lg p-2 disabled:opacity-25" aria-label="Move result up" data-testid={`button-move-result-up-${field.id}`}><ArrowUp size={15} /></button><button type="button" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} className="rounded-lg p-2 disabled:opacity-25" aria-label="Move result down" data-testid={`button-move-result-down-${field.id}`}><ArrowDown size={15} /></button><button type="button" onClick={() => item?.id ? setConfirmIndex(index) : remove(index)} className="rounded-lg p-2 text-[hsl(var(--destructive))]" aria-label="Remove result" data-testid={`button-remove-result-${field.id}`}><Trash2 size={15} /></button></div></div>
      <ResultFields index={index} existingId={item?.id} /><div className="mt-5 grid gap-4 border-t border-[hsl(var(--admin-border))] pt-5 sm:grid-cols-2"><NumberField id={`result-${index}-order`} label="Results page order" value={item?.displayOrder || index + 1} onChange={(value) => setValue(`results.${index}.displayOrder`, value)} /><NumberField id={`result-${index}-home-order`} label="Home preview order" value={item?.homePreviewOrder || index + 1} onChange={(value) => setValue(`results.${index}.homePreviewOrder`, value)} /></div><div className="mt-4 flex flex-wrap gap-5 text-sm font-semibold"><label className="flex items-center gap-2"><input type="checkbox" {...register(`results.${index}.isPublished`)} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" /> Publish on Results page</label><label className="flex items-center gap-2"><input type="checkbox" {...register(`results.${index}.showInHomePreview`)} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" /> Feature on Home</label></div>
    </div>; })}</div> : <div className="rounded-2xl border border-dashed border-[hsl(var(--admin-border))] px-5 py-12 text-center text-sm text-[hsl(var(--admin-text-muted))]">No student records yet. Add the first outcome below.</div>}
    <button type="button" onClick={() => append({ ...emptyResult, displayOrder: fields.length + 1, homePreviewOrder: fields.length + 1 })} data-testid="button-add-result" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-sm font-bold"><Plus size={16} /> Add student result</button>
    {confirmIndex !== null && <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--primary)/.45)] p-5" role="presentation"><div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl"><h2 className="font-display text-3xl font-semibold text-[hsl(var(--primary))]">Remove this saved result?</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">This will remove the record from the shared library after you save the library.</p><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setConfirmIndex(null)} className="rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold" data-testid="button-cancel-remove-result">Keep record</button><button type="button" onClick={() => { remove(confirmIndex); setConfirmIndex(null); }} className="rounded-xl bg-[hsl(var(--destructive))] px-4 py-2.5 text-sm font-bold text-white" data-testid="button-confirm-remove-result">Remove result</button></div></div></div>}
  </EditorCard>;
}

function StatisticsEditor() {
  const { control, register, setValue, watch } = useFormContext<AdminResultsLibraryInput>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'statistics' });
  const values = watch('statistics');
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  return <EditorCard title={`Results statistics (${fields.length})`} description="Only published statistics can appear on Results or be selected for the Home preview."><div className="space-y-4">{fields.map((field, index) => <div key={field.id} className="rounded-2xl bg-[hsl(var(--admin-surface))] p-5"><div className="flex justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.16em]">Statistic {index + 1}</p><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move statistic up" className="rounded-lg p-2 disabled:opacity-25"><ArrowUp size={15} /></button><button type="button" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} aria-label="Move statistic down" className="rounded-lg p-2 disabled:opacity-25"><ArrowDown size={15} /></button><button type="button" onClick={() => setConfirmIndex(index)} aria-label="Remove statistic" data-testid={`button-remove-statistic-${field.id}`} className="rounded-lg p-2 text-[hsl(var(--destructive))]"><Trash2 size={15} /></button></div></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field id={`stat-${index}-label`} label="Label" {...register(`statistics.${index}.label`, { required: true })} /><Field id={`stat-${index}-value`} label="Value (including suffix)" {...register(`statistics.${index}.value`, { required: true })} placeholder="Enter supplied value" /><Field id={`stat-${index}-supporting`} label="Supporting text" {...register(`statistics.${index}.supportingText`)} /><NumberField id={`stat-${index}-order`} label="Results page order" value={values[index]?.displayOrder || index + 1} onChange={(value) => setValue(`statistics.${index}.displayOrder`, value)} /><NumberField id={`stat-${index}-home-order`} label="Home preview order" value={values[index]?.homePreviewOrder || index + 1} onChange={(value) => setValue(`statistics.${index}.homePreviewOrder`, value)} /></div><div className="mt-4 flex flex-wrap gap-5 text-sm font-semibold"><label className="flex items-center gap-2"><input type="checkbox" {...register(`statistics.${index}.isPublished`)} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" /> Publish statistic</label><label className="flex items-center gap-2"><input type="checkbox" {...register(`statistics.${index}.showInHomePreview`)} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" /> Feature on Home</label></div></div>)}</div><button type="button" onClick={() => append({ ...emptyStatistic, displayOrder: fields.length + 1, homePreviewOrder: fields.length + 1 })} data-testid="button-add-statistic" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-sm font-bold"><Plus size={16} /> Add statistic</button>
    {confirmIndex !== null && <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--primary)/.45)] p-5" role="presentation"><div role="alertdialog" aria-modal="true" aria-labelledby="remove-statistic-title" className="w-full max-w-md rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl"><h2 id="remove-statistic-title" className="font-display text-3xl font-semibold text-[hsl(var(--primary))]">Remove this statistic?</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">“{values[confirmIndex]?.label || 'This statistic'}” will be removed from the shared library when you save.</p><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setConfirmIndex(null)} className="rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold" data-testid="button-cancel-remove-statistic">Keep statistic</button><button type="button" onClick={() => { remove(confirmIndex); setConfirmIndex(null); }} className="rounded-xl bg-[hsl(var(--destructive))] px-4 py-2.5 text-sm font-bold text-white" data-testid="button-confirm-remove-statistic">Remove statistic</button></div></div></div>}
  </EditorCard>;
}

function getResultsSaveError(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      return data.error;
    }
  }
  return 'We could not save the Results library. Check the highlighted requirements and try again.';
}

export default function AdminResults() {
  const query = useGetAdminResultsLibrary();
  const update = useUpdateAdminResultsLibrary();
  const client = useQueryClient();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const form = useForm<AdminResultsLibraryInput>({ defaultValues: emptyForm });
  useEffect(() => {
    if (!query.data) return;
    form.reset({ settings: query.data.settings, results: query.data.results.map(({ id, ...item }) => ({ ...item, id })), statistics: query.data.statistics.map(({ id, ...item }) => ({ ...item, id })) });
  }, [form, query.data]);
  const save = form.handleSubmit((data) => {
    setNotice(''); setError('');
    const normalized: AdminResultsLibraryInput = {
      settings: data.settings,
      results: data.results.map((item, index) => {
        // Drop fields from older student-result payloads; legacy testimonial migration belongs in the separate alumni collection.
        const record = Object.fromEntries(Object.entries(item).filter(([key]) => !['story', 'storyIsPublished', 'storyOrder'].includes(key))) as HomepageResultInput;
        return { ...record, displayOrder: index + 1, homePreviewOrder: item.homePreviewOrder || index + 1, studentImageUrl: item.studentImageUrl || null, examName: item.examName || null, year: item.year || null, institution: item.institution || null, course: item.course || null, accentColor: item.accentColor || null };
      }),
      statistics: data.statistics.map((item, index) => ({ ...item, displayOrder: index + 1, homePreviewOrder: item.homePreviewOrder || index + 1, supportingText: item.supportingText || null })),
    };
    update.mutate({ data: normalized }, { onSuccess: () => { void client.invalidateQueries({ queryKey: getGetAdminResultsLibraryQueryKey() }); void client.invalidateQueries({ queryKey: getGetResultsPageQueryKey() }); void client.invalidateQueries({ queryKey: getGetHomepageResultsQueryKey() }); void client.invalidateQueries({ queryKey: getGetAdminHomepageResultsQueryKey() }); setNotice('Results library saved.'); }, onError: (mutationError) => setError(getResultsSaveError(mutationError)) });
  }, () => {
    setNotice('');
    setError('Complete the required fields. Both CTA destinations must lead to /contact.');
  });
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Results" title="One library for every outcome." description="Publish verified student achievements, curate the Home preview, and keep the public Results page grounded in the shared library." previewHref="/results"><FormProvider {...form}><div className="mt-10 space-y-6">
    <EditorCard title="Results page introduction" description="Set the copy families see above the published record."><div className="grid gap-4 md:grid-cols-2"><Field id="results-settings-eyebrow" label="Eyebrow" {...form.register('settings.eyebrow', { required: true })} /><Field id="results-settings-heading" label="Heading" {...form.register('settings.heading', { required: true })} /><div className="md:col-span-2"><Area id="results-settings-description" label="Description" {...form.register('settings.description', { required: true })} /></div><Field id="results-settings-year" label="Configured year (optional)" {...form.register('settings.configuredYear')} placeholder="2025" /><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" {...form.register('settings.isVisible')} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" /> Show the public Results page</label></div></EditorCard>
      <ResultsEditor /><StatisticsEditor />
     <EditorCard title="Testimonials (shared with Home)" description="The Home page and Results page use the same published testimonial records and ordering. Manage them in the existing Home Testimonials editor.">
       <a href="/admin/pages/home/testimonials" data-testid="link-manage-shared-testimonials" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--admin-primary))] px-4 text-sm font-bold text-[hsl(var(--admin-on-primary))] transition hover:-translate-y-0.5">
         Manage shared testimonials <ArrowUpRight size={15} aria-hidden="true" />
       </a>
     </EditorCard>
    <EditorCard title="Results contact call to action" description="Edit the closing invitation. Both buttons must lead to the site's Contact page; optional query strings or anchors are allowed.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><Field id="results-cta-heading" label="CTA heading" {...form.register('settings.ctaHeading', { required: true })} /></div>
        <div className="md:col-span-2"><Area id="results-cta-description" label="Supporting copy" {...form.register('settings.ctaDescription', { required: true })} /></div>
        <Field id="results-cta-primary-label" label="First button label" {...form.register('settings.ctaPrimaryLabel', { required: true })} />
        <Field id="results-cta-primary-href" label="First button Contact destination" {...form.register('settings.ctaPrimaryHref', { required: true, pattern: /^\/contact(?:[?#].*)?$/ })} placeholder="/contact" />
        <Field id="results-cta-secondary-label" label="Second button label" {...form.register('settings.ctaSecondaryLabel', { required: true })} />
        <Field id="results-cta-secondary-href" label="Second button Contact destination" {...form.register('settings.ctaSecondaryHref', { required: true, pattern: /^\/contact(?:[?#].*)?$/ })} placeholder="/contact" />
        <label className="flex items-center gap-3 text-sm font-semibold md:col-span-2"><input type="checkbox" {...form.register('settings.ctaIsVisible')} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" /> Show the contact call to action on Results</label>
      </div>
    </EditorCard>
     <SaveStatus error={error} notice={notice} /><div className="flex justify-end"><button type="button" onClick={() => void save()} disabled={update.isPending} data-testid="button-save-results-library" className="inline-flex h-11 items-center justify-center rounded-xl bg-[hsl(var(--admin-primary))] px-5 text-sm font-bold text-[hsl(var(--admin-on-primary))] shadow-sm transition hover:-translate-y-0.5 hover:bg-[hsl(var(--admin-primary)/.9)] disabled:cursor-not-allowed disabled:opacity-60">{update.isPending ? 'Saving changes…' : 'Save Results library'}</button></div>
   </div></FormProvider></EditorFrame>;
}