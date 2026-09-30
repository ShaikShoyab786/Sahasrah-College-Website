import { Archive, CalendarDays, ExternalLink, FileText, ImagePlus, MessageCircle, Pencil, Plus, Save, ShieldCheck, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type Control } from 'react-hook-form';
import {
  getGetAdminKnowledgeHubExamUpdatesQueryKey,
  getGetKnowledgeHubExamUpdatesPageQueryKey,
  useCreateAdminKnowledgeHubExamUpdate,
  useDeleteAdminKnowledgeHubExamUpdate,
  useGetAdminKnowledgeHubExamUpdates,
  useUpdateAdminKnowledgeHubExamUpdate,
  useUpdateAdminKnowledgeHubExamUpdatesPage,
  useUploadAdminImage,
  type KnowledgeHubExamUpdate,
  type KnowledgeHubExamUpdateInput,
  type KnowledgeHubExamUpdatesPageInput,
} from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';
import { AdminImportantDates } from '@/components/admin-important-dates';

const inputClass = 'h-11 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm text-[hsl(var(--admin-text))] outline-none transition focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';
const textareaClass = 'min-h-28 w-full resize-y rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 py-3 text-sm leading-6 text-[hsl(var(--admin-text))] outline-none transition focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--admin-focus)/.18)] disabled:cursor-not-allowed disabled:opacity-55';

function blankSettings(): KnowledgeHubExamUpdatesPageInput {
  return {
    heroEyebrow: 'EXAM UPDATES',
    heroHeadline: 'Stay ahead with the latest exam updates.',
    heroDescription: 'Find timely notices and official information for JEE, NEET, Intermediate, EAMCET, and more.',
    heroBackgroundImageUrl: '/exam-updates-hero.jpg',
    heroBackgroundImageAltText: 'Study desk with books and an exam calendar',
    searchPlaceholder: 'Search exam updates, notifications, dates…',
    searchButtonLabel: 'Search',
    latestEyebrow: 'OFFICIAL NOTICES',
    latestHeading: 'Latest Exam Updates',
    latestDescription: 'Official notifications, important notices, and key announcements.',
    ctaHeading: 'Need Guidance for Your Exam Preparation?',
    ctaDescription: 'Our academic counsellors can help with exam strategies, important dates, and preparation guidance.',
    ctaButtonLabel: 'Talk to an Academic Counsellor',
    ctaButtonHref: '/contact',
    ctaBackgroundImageUrl: '/exam-counselling-cta.jpg',
    ctaVisible: true,
    examFilters: ['JEE', 'NEET', 'Intermediate', 'EAMCET', 'Other Exams'],
  };
}

function isSafeDestination(value: string) {
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function blankUpdate(order = 1): KnowledgeHubExamUpdateInput {
  return {
    title: '',
    exam: '',
    updateType: 'General notice',
    label: 'Notice',
    summary: '',
    fullNotice: '',
    publishedAt: null,
    officialUrl: '',
    keywords: [],
    status: 'draft',
    isPinned: false,
    displayOrder: order,
  };
}

function toLocalDateTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toFormUpdate(update: KnowledgeHubExamUpdate): KnowledgeHubExamUpdateInput {
  return { ...update, publishedAt: toLocalDateTime(update.publishedAt) };
}

function errorMessage(reason: unknown) {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'object' && reason !== null && 'error' in reason) return String((reason as { error: unknown }).error);
  return 'The change could not be saved. Check the fields and try again.';
}

function isDemoRecord(update: Pick<KnowledgeHubExamUpdateInput, 'title' | 'label' | 'summary'>) {
  return /\bdemo\b/i.test(`${update.title} ${update.label} ${update.summary}`);
}

function TextField({ control, name, label, required = false, ...props }: { control: Control<any>; name: string; label: string; required?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField control={control} name={name} rules={required ? { required: `${label} is required.` } : undefined} render={({ field }) => (
      <FormItem>
        <FormLabel className="text-sm font-semibold text-[hsl(var(--admin-text))]">{label}</FormLabel>
        <FormControl><input {...props} {...field} value={field.value ?? ''} className={inputClass} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

function TextAreaField({ control, name, label, required = false, ...props }: { control: Control<any>; name: string; label: string; required?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FormField control={control} name={name} rules={required ? { required: `${label} is required.` } : undefined} render={({ field }) => (
      <FormItem>
        <FormLabel className="text-sm font-semibold text-[hsl(var(--admin-text))]">{label}</FormLabel>
        <FormControl><textarea {...props} {...field} value={field.value ?? ''} className={textareaClass} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

function StatusBadge({ status }: { status: KnowledgeHubExamUpdate['status'] }) {
  const palette = status === 'published'
    ? 'bg-emerald-100 text-emerald-800'
    : status === 'archived'
      ? 'bg-slate-200 text-slate-700'
      : 'bg-amber-100 text-amber-800';
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${palette}`}>{status}</span>;
}

export default function AdminKnowledgeHubExamUpdates() {
  const queryClient = useQueryClient();
  const query = useGetAdminKnowledgeHubExamUpdates();
  const updatePage = useUpdateAdminKnowledgeHubExamUpdatesPage();
  const uploadImage = useUploadAdminImage();
  const createUpdate = useCreateAdminKnowledgeHubExamUpdate();
  const updateUpdate = useUpdateAdminKnowledgeHubExamUpdate();
  const deleteUpdate = useDeleteAdminKnowledgeHubExamUpdate();
  const settingsForm = useForm<KnowledgeHubExamUpdatesPageInput>({ defaultValues: blankSettings() });
  const recordForm = useForm<KnowledgeHubExamUpdateInput>({ defaultValues: blankUpdate() });
  const initialized = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const records = useMemo(
    () => [...(query.data?.updates ?? [])].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || a.displayOrder - b.displayOrder),
    [query.data?.updates],
  );
  const selectedRecord = records.find((item) => item.id === selectedId);
  const filters = settingsForm.watch('examFilters') ?? [];
  const ctaImage = settingsForm.watch('ctaBackgroundImageUrl');
  const ctaVisible = settingsForm.watch('ctaVisible');
  const recordValues = recordForm.watch();

  useEffect(() => {
    if (!query.data || initialized.current) return;
    settingsForm.reset({ ...blankSettings(), ...query.data.settings });
    const first = [...query.data.updates].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || a.displayOrder - b.displayOrder)[0];
    if (first) {
      setSelectedId(first.id);
      recordForm.reset(toFormUpdate(first));
    }
    initialized.current = true;
  }, [query.data, recordForm, settingsForm]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetAdminKnowledgeHubExamUpdatesQueryKey() });
  };
  const showError = (reason: unknown) => { setError(errorMessage(reason)); setNotice(''); };
  const showNotice = (message: string) => { setNotice(message); setError(''); };

  const saveSettings = (values: KnowledgeHubExamUpdatesPageInput) => {
    setError('');
    setNotice('');
    const next = {
      ...values,
      heroBackgroundImageUrl: values.heroBackgroundImageUrl?.trim() || null,
      ctaHeading: values.ctaHeading?.trim() || '',
      ctaDescription: values.ctaDescription?.trim() || '',
      ctaButtonLabel: values.ctaButtonLabel?.trim() || '',
      ctaButtonHref: values.ctaButtonHref?.trim() || '',
      ctaBackgroundImageUrl: values.ctaBackgroundImageUrl?.trim() || null,
      examFilters: values.examFilters.map((item) => item.trim()).filter(Boolean),
    };
    if (!next.examFilters.length) {
      settingsForm.setError('examFilters.0' as any, { message: 'Add at least one exam filter.' });
      return;
    }
    if (next.heroBackgroundImageUrl && !next.heroBackgroundImageAltText.trim()) {
      setError('Add alt text for the hero background image.');
      return;
    }
    for (const field of ['ctaHeading', 'ctaDescription', 'ctaButtonLabel'] as const) {
      if (!next[field]) {
        settingsForm.setError(field, { message: 'This field cannot be blank.' });
        setError('Complete the counsellor invitation before saving.');
        return;
      }
    }
    if (!isSafeDestination(next.ctaButtonHref)) {
      settingsForm.setError('ctaButtonHref', { message: 'Use a site path starting with / or a valid HTTPS URL.' });
      setError('Enter a safe destination for the counselling button.');
      return;
    }
    if (next.ctaBackgroundImageUrl && !isSafeDestination(next.ctaBackgroundImageUrl)) {
      settingsForm.setError('ctaBackgroundImageUrl', { message: 'Use a site path starting with / or a valid HTTPS image URL.' });
      setError('Enter a safe image URL or remove the image.');
      return;
    }
    updatePage.mutate({ data: next }, {
      onSuccess: (saved) => {
        settingsForm.reset(saved);
        invalidate();
        void queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubExamUpdatesPageQueryKey() });
        showNotice('Exam Updates page settings saved.');
      },
      onError: showError,
    });
  };

  const uploadCtaImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      setNotice('');
      return;
    }
    setError('');
    setNotice('');
    uploadImage.mutate({ data: { file, purpose: 'cta' } }, {
      onSuccess: ({ url }) => {
        settingsForm.setValue('ctaBackgroundImageUrl', url, { shouldDirty: true, shouldValidate: true });
        showNotice('Image uploaded. Save page settings to publish this replacement.');
      },
      onError: (reason) => showError(reason),
    });
  };

  const selectRecord = (record: KnowledgeHubExamUpdate) => {
    setSelectedId(record.id);
    recordForm.reset(toFormUpdate(record));
    setError('');
    setNotice('');
  };

  const startNewRecord = () => {
    setSelectedId(null);
    recordForm.reset(blankUpdate(records.length + 1));
    setError('');
    setNotice('');
  };

  const saveRecordValues = (values: KnowledgeHubExamUpdateInput) => {
    setError('');
    setNotice('');
    const officialUrl = values.officialUrl.trim();
    if (values.status === 'published' && !/^https:\/\//i.test(officialUrl)) {
      recordForm.setError('officialUrl', { message: 'Published notices require an HTTPS official URL.' });
      return;
    }
    if (values.status === 'published' && !values.publishedAt) {
      recordForm.setError('publishedAt', { message: 'Published notices require a publication date.' });
      return;
    }
    const publishedAt = values.publishedAt ? (() => {
      const date = new Date(values.publishedAt as string);
      return Number.isNaN(date.getTime()) ? values.publishedAt : date.toISOString();
    })() : null;
    const data: KnowledgeHubExamUpdateInput = {
      ...values,
      title: values.title.trim(),
      exam: values.exam.trim(),
      updateType: values.updateType.trim(),
      label: values.label.trim(),
      summary: values.summary.trim(),
      fullNotice: values.fullNotice.trim(),
      officialUrl,
      publishedAt,
      keywords: values.keywords.map((keyword) => keyword.trim()).filter(Boolean).slice(0, 30),
      displayOrder: Number(values.displayOrder),
    };
    const onSuccess = (saved: KnowledgeHubExamUpdate) => {
      setSelectedId(saved.id);
      recordForm.reset(toFormUpdate(saved));
      invalidate();
      showNotice(selectedId ? 'Exam notice updated.' : 'Exam notice created as a draft.');
    };
    if (selectedId) updateUpdate.mutate({ id: selectedId, data }, { onSuccess, onError: showError });
    else createUpdate.mutate({ data }, { onSuccess, onError: showError });
  };

  const requestSave = (status?: KnowledgeHubExamUpdateInput['status']) => {
    if (status) {
      recordForm.handleSubmit((values) => saveRecordValues({ ...values, status }))();
      return;
    }
    recordForm.handleSubmit(saveRecordValues)();
  };

  const removeRecord = () => {
    if (!selectedRecord || !window.confirm(`Delete “${selectedRecord.title}”? This cannot be undone.`)) return;
    deleteUpdate.mutate({ id: selectedRecord.id }, {
      onSuccess: () => {
        setSelectedId(null);
        recordForm.reset(blankUpdate(records.length || 1));
        invalidate();
        showNotice('Exam notice deleted.');
      },
      onError: showError,
    });
  };

  if (query.isLoading) return <div className="p-6 lg:p-10"><EditorSkeleton /></div>;
  if (query.isError || !query.data) return <div className="p-6 lg:p-10"><LoadError onRetry={() => query.refetch()} /></div>;

  return (
    <EditorFrame eyebrow="Pages / Knowledge Hub / Exam Updates" title="Keep the exam desk exact." description="Edit the public desk, then keep every notice traceable to its official source." previewHref="/knowledge-hub/exam-updates">
      <Form {...settingsForm}>
        <form onSubmit={settingsForm.handleSubmit(saveSettings)} className="mt-8 space-y-6">
          <EditorCard icon={<ImagePlus size={19} />} title="Hero and search" description="Set the high-contrast introduction students see before they search.">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField control={settingsForm.control} name="heroEyebrow" label="Hero eyebrow" required data-testid="input-exam-updates-hero-eyebrow" />
              <TextField control={settingsForm.control} name="searchButtonLabel" label="Search button label" required data-testid="input-exam-updates-search-button-label" />
              <div className="md:col-span-2"><TextField control={settingsForm.control} name="heroHeadline" label="Hero headline" required data-testid="input-exam-updates-hero-headline" /></div>
              <div className="md:col-span-2"><TextAreaField control={settingsForm.control} name="heroDescription" label="Hero description" required data-testid="input-exam-updates-hero-description" /></div>
              <TextField control={settingsForm.control} name="heroBackgroundImageUrl" label="Background image URL" placeholder="/exam-updates-hero.jpg" data-testid="input-exam-updates-hero-background-url" />
              <TextField control={settingsForm.control} name="heroBackgroundImageAltText" label="Background image alt text" data-testid="input-exam-updates-hero-background-alt" />
              <div className="md:col-span-2">
                <TextField control={settingsForm.control} name="searchPlaceholder" label="Search placeholder" required data-testid="input-exam-updates-search-placeholder" />
              </div>
            </div>
          </EditorCard>

          <EditorCard icon={<FileText size={19} />} title="Latest section and exam filters" description="These labels control the first scan of the published notice list.">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField control={settingsForm.control} name="latestEyebrow" label="Latest eyebrow" required data-testid="input-exam-updates-latest-eyebrow" />
              <TextField control={settingsForm.control} name="latestHeading" label="Latest heading" required data-testid="input-exam-updates-latest-heading" />
              <div className="md:col-span-2"><TextAreaField control={settingsForm.control} name="latestDescription" label="Latest description" required data-testid="input-exam-updates-latest-description" /></div>
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-end justify-between gap-3">
                  <div><p className="text-sm font-semibold text-[hsl(var(--admin-text))]">Exam filter labels</p><p className="mt-1 text-xs text-[hsl(var(--admin-text-muted)/.76)]">Visitors can use these labels to narrow the official notice list.</p></div>
                  <button type="button" onClick={() => settingsForm.setValue('examFilters', [...filters, ''])} className={`${buttonClass} border border-[hsl(var(--admin-border))]`} data-testid="button-add-exam-filter"><Plus size={15} /> Add filter</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {filters.map((_, index) => (
                    <div key={`filter-${index}`} className="flex items-start gap-2">
                      <FormField control={settingsForm.control} name={`examFilters.${index}` as any} render={({ field }) => (
                        <FormItem className="min-w-0 flex-1">
                          <FormLabel className="text-xs font-semibold text-[hsl(var(--admin-text-muted))]">Filter {index + 1}</FormLabel>
                          <FormControl><input {...field} value={field.value ?? ''} className={inputClass} data-testid={`input-exam-filter-${index}`} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <button type="button" onClick={() => settingsForm.setValue('examFilters', filters.filter((_, itemIndex) => itemIndex !== index))} className="mt-7 rounded-lg p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.08)]" aria-label={`Remove filter ${index + 1}`} data-testid={`button-remove-exam-filter-${index}`}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </EditorCard>
          <EditorCard icon={<MessageCircle size={19} />} title="Exam preparation invitation" description="A final conversation after the notices and important dates, not another announcement.">
            <div className="space-y-6">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4">
                <input type="checkbox" checked={Boolean(ctaVisible)} onChange={(event) => settingsForm.setValue('ctaVisible', event.target.checked, { shouldDirty: true })} className="mt-0.5 h-4 w-4 accent-[hsl(var(--admin-focus))]" data-testid="checkbox-exam-cta-visible" />
                <span><span className="block text-sm font-bold text-[hsl(var(--admin-text))]">Show counselling invitation</span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--admin-text-muted))]">When off, the public page ends after Important Dates.</span></span>
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><TextField control={settingsForm.control} name="ctaHeading" label="Invitation heading" required maxLength={180} data-testid="input-exam-cta-heading" /></div>
                <div className="md:col-span-2"><TextAreaField control={settingsForm.control} name="ctaDescription" label="Supporting description" required maxLength={700} data-testid="input-exam-cta-description" /></div>
                <TextField control={settingsForm.control} name="ctaButtonLabel" label="Button label" required maxLength={80} data-testid="input-exam-cta-button-label" />
                <TextField control={settingsForm.control} name="ctaButtonHref" label="Button destination" required maxLength={1000} placeholder="/contact" data-testid="input-exam-cta-button-href" />
              </div>
              <p className="-mt-3 text-xs leading-5 text-[hsl(var(--admin-text-muted))]">Link to a real site path (such as /contact) or an HTTPS page.</p>
              <div className="overflow-hidden rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))]">
                <div className="relative aspect-[2.4/1] min-h-40 bg-[#211f1b]">
                  {ctaImage ? <img src={ctaImage} alt="Counselling CTA background preview" className="h-full w-full object-cover" data-testid="img-exam-cta-preview" /> : <div className="grid h-full place-items-center px-5 text-center text-sm text-[#f1e9df]">No image selected. The public invitation will use a dark, readable background.</div>}
                  {ctaImage && <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#161715]/85 via-[#161715]/50 to-transparent" aria-hidden="true" />}
                  <span className="pointer-events-none absolute bottom-5 left-5 max-w-[70%] font-display text-xl font-semibold text-[#fff9ef] sm:text-2xl">{settingsForm.watch('ctaHeading')}</span>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className={`${buttonClass} cursor-pointer border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] text-[hsl(var(--admin-text))] ${uploadImage.isPending ? 'pointer-events-none opacity-55' : ''}`}>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadCtaImage} disabled={uploadImage.isPending} className="sr-only" data-testid="input-exam-cta-image-upload" />
                      <ImagePlus size={16} /> {uploadImage.isPending ? 'Uploading image…' : ctaImage ? 'Replace image' : 'Upload image'}
                    </label>
                    {ctaImage && <button type="button" onClick={() => { settingsForm.setValue('ctaBackgroundImageUrl', null, { shouldDirty: true }); showNotice('Image removed from the form. Save page settings to publish the change.'); }} className={`${buttonClass} text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-border)/.4)]`} data-testid="button-remove-exam-cta-image"><X size={16} /> Remove image</button>}
                  </div>
                  <TextField control={settingsForm.control} name="ctaBackgroundImageUrl" label="Background image URL (optional)" maxLength={1000} placeholder="/exam-counselling-cta.jpg" data-testid="input-exam-cta-image-url" />
                  <p className="text-xs leading-5 text-[hsl(var(--admin-text-muted))]">Upload a new image or paste an image URL. Save page settings to make it live.</p>
                </div>
              </div>
            </div>
          </EditorCard>
          <SaveStatus error={error} notice={notice} />
          <div className="flex justify-end"><SaveButton pending={updatePage.isPending || uploadImage.isPending} testId="button-save-exam-updates-page">Save page settings</SaveButton></div>
        </form>
      </Form>

      <div className="mt-8 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
        <EditorCard icon={<ShieldCheck size={19} />} title="Notice register" description="Drafts stay private. Published records must carry a date and an HTTPS official source.">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[hsl(var(--admin-surface-soft))] p-4">
            <div><p className="text-sm font-bold">{records.length} notice{records.length === 1 ? '' : 's'}</p><p className="mt-1 text-xs text-[hsl(var(--admin-text-muted))]">Ordered by display priority.</p></div>
            <button type="button" onClick={startNewRecord} className={`${buttonClass} bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-on-primary))]`} data-testid="button-new-exam-update"><Plus size={16} /> New notice</button>
          </div>
          <div className="mt-4 space-y-2" data-testid="list-exam-updates">
            {records.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--admin-border))] p-6 text-center text-sm text-[hsl(var(--admin-text-muted))]" data-testid="empty-admin-exam-updates">No notices yet. Add the first draft above.</div>
            ) : records.map((record) => (
              <button type="button" key={record.id} onClick={() => selectRecord(record)} className={`w-full rounded-xl border p-4 text-left transition ${selectedId === record.id ? 'border-[hsl(var(--admin-focus))] bg-[hsl(var(--admin-focus)/.08)]' : 'border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-focus)/.55)]'}`} data-testid={`row-exam-update-${record.id}`}>
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-[hsl(var(--admin-text))]">{record.title || 'Untitled notice'}</p><p className="mt-1 truncate text-xs text-[hsl(var(--admin-text-muted))]">{record.exam || 'No exam'} · order {record.displayOrder}</p></div><StatusBadge status={record.status} /></div>
                {isDemoRecord(record) && <span className="mt-3 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-amber-800">Demo sample</span>}
              </button>
            ))}
          </div>
        </EditorCard>

        <EditorCard icon={<Pencil size={19} />} title={selectedId ? 'Edit notice' : 'New draft notice'} description="Keep the full notice here for the editorial record; the public card carries its concise summary.">
          <Form {...recordForm}>
            <form onSubmit={recordForm.handleSubmit(saveRecordValues)} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><TextField control={recordForm.control} name="title" label="Title" required data-testid="input-exam-update-title" /></div>
                <TextField control={recordForm.control} name="exam" label="Exam" required data-testid="input-exam-update-exam" />
                <TextField control={recordForm.control} name="updateType" label="Update type" required data-testid="input-exam-update-type" />
                <TextField control={recordForm.control} name="label" label="Label" required data-testid="input-exam-update-label" />
                <TextField control={recordForm.control} name="displayOrder" label="Display order" type="number" min={1} required data-testid="input-exam-update-order" />
                <div className="md:col-span-2"><TextAreaField control={recordForm.control} name="summary" label="Summary" required data-testid="input-exam-update-summary" /></div>
                <div className="md:col-span-2"><TextAreaField control={recordForm.control} name="fullNotice" label="Full notice" required data-testid="input-exam-update-full-notice" /></div>
                <TextField control={recordForm.control} name="officialUrl" label="Official HTTPS URL" placeholder="https://official-exam-board.example/notice" data-testid="input-exam-update-official-url" />
                <FormField control={recordForm.control} name="publishedAt" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold text-[hsl(var(--admin-text))]">Publication date</FormLabel><FormControl><input type="datetime-local" {...field} value={field.value ?? ''} className={inputClass} data-testid="input-exam-update-published-at" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={recordForm.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold text-[hsl(var(--admin-text))]">Status</FormLabel><FormControl><select {...field} className={`${inputClass} cursor-pointer`} data-testid="select-exam-update-status"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={recordForm.control} name="keywords" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold text-[hsl(var(--admin-text))]">Keywords</FormLabel><FormControl><textarea value={(field.value ?? []).join(', ')} onChange={(event) => field.onChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} className={textareaClass} placeholder="hall ticket, schedule, application" data-testid="input-exam-update-keywords" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={recordForm.control} name="isPinned" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 self-end rounded-xl border border-[hsl(var(--admin-border))] p-3"><FormControl><input type="checkbox" checked={Boolean(field.value)} onChange={field.onChange} className="h-4 w-4 accent-[hsl(var(--admin-accent))]" data-testid="checkbox-exam-update-pinned" /></FormControl><FormLabel className="text-sm font-semibold text-[hsl(var(--admin-text))]">Pin this notice</FormLabel></FormItem>
                )} />
              </div>

              {selectedRecord && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[hsl(var(--admin-surface-soft))] p-3 text-xs text-[hsl(var(--admin-text-muted))]" data-testid="text-exam-update-record-meta">
                  <CalendarDays size={14} /> Created {new Date(selectedRecord.createdAt).toLocaleDateString('en-IN')} <span>·</span> Updated {new Date(selectedRecord.updatedAt).toLocaleDateString('en-IN')}
                  {selectedRecord.officialUrl && <a href={selectedRecord.officialUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 font-bold text-[hsl(var(--admin-primary))]" data-testid="link-preview-exam-update-source">Source <ExternalLink size={13} /></a>}
                </div>
              )}

              {isDemoRecord(recordValues) && <p className="rounded-xl border border-amber-700/20 bg-amber-50 px-4 py-3 text-sm text-amber-900" data-testid="status-exam-update-demo">Demo sample: you can publish it after adding a publication date and a valid HTTPS official-source link.</p>}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--admin-border))] pt-5">
                <div className="flex flex-wrap gap-2">
                  {selectedId && <button type="button" onClick={() => requestSave(recordForm.getValues('status') === 'published' ? 'draft' : 'published')} className={`${buttonClass} border border-[hsl(var(--admin-border))]`} disabled={updateUpdate.isPending} data-testid="button-toggle-exam-update-publish">{recordForm.getValues('status') === 'published' ? 'Unpublish' : 'Publish'} <ShieldCheck size={15} /></button>}
                  {selectedId && <button type="button" onClick={() => requestSave('archived')} className={`${buttonClass} border border-[hsl(var(--admin-border))]`} disabled={updateUpdate.isPending} data-testid="button-archive-exam-update"><Archive size={15} /> Archive</button>}
                  {selectedId && <button type="button" onClick={removeRecord} className={`${buttonClass} text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.08)]`} disabled={deleteUpdate.isPending} data-testid="button-delete-exam-update"><Trash2 size={15} /> Delete</button>}
                </div>
                <button type="submit" className={`${buttonClass} bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-on-primary))]`} disabled={createUpdate.isPending || updateUpdate.isPending} data-testid="button-save-exam-update"><Save size={15} /> {createUpdate.isPending || updateUpdate.isPending ? 'Saving…' : selectedId ? 'Save notice' : 'Create draft'}</button>
              </div>
            </form>
          </Form>
        </EditorCard>
      </div>
      <AdminImportantDates />
    </EditorFrame>
  );
}