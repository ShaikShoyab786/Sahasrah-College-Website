import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminAllCoursesPageQueryKey,
  getGetAllCoursesPageQueryKey,
  useGetAdminAllCoursesPage,
  useGetAdminCourses,
  useUpdateAllCoursesPage,
  useUploadAdminImage,
  type AllCoursesPageSettings,
} from '@workspace/api-client-react';
import { EditorCard, EditorFrame, LoadError, SaveStatus } from '@/pages/admin-about-hero';
import { SaveButton } from '@/components/form-fields';

const inputClass = 'mt-1 min-h-11 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';
const areaClass = 'mt-1 min-h-24 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';

function TextInput({ id, label, value, onChange, type = 'text', required = true, maxLength }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: 'text' | 'date' | 'time'; required?: boolean; maxLength?: number }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-[hsl(var(--admin-text))]">{label}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={maxLength} className={inputClass} /></label>;
}

function TextArea({ id, label, value, onChange, maxLength }: { id: string; label: string; value: string; onChange: (value: string) => void; maxLength?: number }) {
  return <label htmlFor={id} className="block text-sm font-semibold text-[hsl(var(--admin-text))]">{label}<textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} required maxLength={maxLength} className={areaClass} /></label>;
}

export default function AdminAllCourses() {
  const queryClient = useQueryClient();
  const query = useGetAdminAllCoursesPage();
  const coursesQuery = useGetAdminCourses();
  const update = useUpdateAllCoursesPage();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<AllCoursesPageSettings | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const setField = <K extends keyof AllCoursesPageSettings>(key: K, value: AllCoursesPageSettings[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  const uploadHeroImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    upload.mutate({ data: { file, purpose: 'hero' } }, {
      onSuccess: (result) => {
        setField('heroBackgroundImageUrl', result.url);
        setNotice('Image uploaded. Save to publish it on the page.');
      },
      onError: () => setError('The image could not be uploaded. Please try again.'),
    });
    event.target.value = '';
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setNotice('');
    setError('');
    const data = {
      ...form,
      coursePlacements: form.coursePlacements.slice().sort((a, b) => a.displayOrder - b.displayOrder).map((item, index) => ({ ...item, displayOrder: index + 1 })),
      batches: form.batches.map((item, index) => ({ ...item, displayOrder: index + 1 })),
      schedule: form.schedule.map((item, index) => ({ ...item, displayOrder: index + 1 })),
    };
    update.mutate({ data }, {
      onSuccess: (saved) => {
        setForm(saved);
        queryClient.setQueryData(getGetAdminAllCoursesPageQueryKey(), saved);
        queryClient.setQueryData(getGetAllCoursesPageQueryKey(), saved);
        setNotice('All Courses page saved.');
      },
      onError: () => setError('We could not save the All Courses page. Check the highlighted values and try again.'),
    });
  };

  if (query.isLoading || coursesQuery.isLoading) return <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-8 text-sm text-[hsl(var(--admin-text-muted))]" role="status">Loading All Courses settings…</div>;
  if (query.isError && !query.data) return <LoadError onRetry={() => { void query.refetch(); void coursesQuery.refetch(); }} />;
  if (coursesQuery.isError && !coursesQuery.data) return <LoadError onRetry={() => { void query.refetch(); void coursesQuery.refetch(); }} />;
  if (!form) return <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-8 text-sm text-[hsl(var(--admin-text-muted))]" role="status">Preparing All Courses settings…</div>;

  const sortedPlacements = [...form.coursePlacements].sort((a, b) => a.displayOrder - b.displayOrder);
  const courseNames = new Map((coursesQuery.data ?? []).map((course) => [course.slug, course.name]));
  const visiblePlacements = sortedPlacements.filter((item) => item.isVisible);
  const moveCourse = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= sortedPlacements.length) return;
    const reordered = [...sortedPlacements];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    setField('coursePlacements', reordered.map((item, position) => ({ ...item, displayOrder: position + 1 })));
  };
  const toggleCourse = (courseSlug: string, checked: boolean) => {
    if (!checked && visiblePlacements.length <= 1) return;
    const coursePlacements = form.coursePlacements.map((item) => item.courseSlug === courseSlug ? { ...item, isVisible: checked } : item);
    const featuredCourseSlug = !checked && form.featuredCourseSlug === courseSlug
      ? coursePlacements.find((item) => item.isVisible)?.courseSlug ?? form.featuredCourseSlug
      : form.featuredCourseSlug;
    setForm((current) => current ? { ...current, coursePlacements, featuredCourseSlug } : current);
  };
  const updateFeature = (index: number, key: 'title' | 'description', value: string) => setField('heroFeatures', form.heroFeatures.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const updateBenefit = (index: number, key: 'title' | 'description', value: string) => setField('ctaBenefits', form.ctaBenefits.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const updateBatch = (index: number, key: 'batchName' | 'startDate' | 'targetExam' | 'admissionsStatus', value: string) => setField('batches', form.batches.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const updateSchedule = (index: number, key: 'activity' | 'startTime' | 'endTime', value: string) => setField('schedule', form.schedule.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));

  return (
    <EditorFrame eyebrow="Pages / Courses / All Courses" title="Manage the All Courses page." description="Edit the public pathway overview, batch information, daily schedule, and admissions CTA." previewHref="/courses">
      <form onSubmit={save} className="mt-8 space-y-5">
        <EditorCard title="Hero" description="Set the introduction, supporting points, and subtle background image.">
          <div className="space-y-4">
            <TextInput id="all-courses-hero-eyebrow" label="Eyebrow" value={form.heroEyebrow} maxLength={100} onChange={(value) => setField('heroEyebrow', value)} />
            <TextInput id="all-courses-hero-title" label="Headline" value={form.heroTitle} maxLength={180} onChange={(value) => setField('heroTitle', value)} />
            <TextArea id="all-courses-hero-description" label="Introduction" value={form.heroDescription} maxLength={600} onChange={(value) => setField('heroDescription', value)} />
            <div className="grid gap-4 sm:grid-cols-2"><TextInput id="all-courses-callout-title" label="Side callout title" value={form.heroCalloutTitle} maxLength={140} onChange={(value) => setField('heroCalloutTitle', value)} /><TextArea id="all-courses-callout-description" label="Side callout text" value={form.heroCalloutDescription} maxLength={240} onChange={(value) => setField('heroCalloutDescription', value)} /></div>
            <div className="grid gap-4 md:grid-cols-3">
              {form.heroFeatures.map((feature, index) => <div key={feature.id} className="rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Feature {index + 1}</p><div className="space-y-3"><TextInput id={`all-courses-feature-${index}-title`} label="Title" value={feature.title} maxLength={100} onChange={(value) => updateFeature(index, 'title', value)} /><TextInput id={`all-courses-feature-${index}-description`} label="Description" value={feature.description} maxLength={180} onChange={(value) => updateFeature(index, 'description', value)} /></div></div>)}
            </div>
            <div className="rounded-xl border border-[hsl(var(--admin-border))] p-4">
              <p className="text-sm font-bold text-[hsl(var(--admin-text))]">Background image</p>
              <p className="mt-1 text-xs text-[hsl(var(--admin-text-muted))]">Upload a wide image. The overlay keeps the hero text readable.</p>
              {form.heroBackgroundImageUrl && <img src={form.heroBackgroundImageUrl} alt="Current All Courses hero background" className="mt-3 max-h-48 w-full rounded-xl object-cover" />}
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadHeroImage} disabled={upload.isPending} className="sr-only" data-testid="input-all-courses-hero-image" /><ImagePlus size={15} aria-hidden="true" />{upload.isPending ? 'Uploading…' : 'Upload image'}</label>
                {form.heroBackgroundImageUrl && <button type="button" onClick={() => setField('heroBackgroundImageUrl', null)} className="inline-flex min-h-10 items-center rounded-xl border border-[hsl(var(--admin-border))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]">Remove image</button>}
              </div>
              <label htmlFor="all-courses-hero-overlay" className="mt-4 block text-sm font-semibold text-[hsl(var(--admin-text))]">Light overlay: {form.heroBackgroundOverlay}%<input id="all-courses-hero-overlay" type="range" min={0} max={90} step={1} value={form.heroBackgroundOverlay} onChange={(event) => setField('heroBackgroundOverlay', Number(event.target.value))} className="mt-2 block w-full accent-[hsl(var(--admin-focus))]" /></label>
            </div>
          </div>
        </EditorCard>

        <EditorCard title="Course cards" description="Choose the featured course, show or hide existing pathways, and set their order. Course details remain managed in the Courses editor.">
          <div className="mb-4 max-w-sm"><label htmlFor="all-courses-featured-course" className="block text-sm font-semibold text-[hsl(var(--admin-text))]">Featured course<select id="all-courses-featured-course" value={form.featuredCourseSlug} onChange={(event) => setField('featuredCourseSlug', event.target.value as AllCoursesPageSettings['featuredCourseSlug'])} className={inputClass}>{visiblePlacements.map((item) => <option key={item.courseSlug} value={item.courseSlug}>{courseNames.get(item.courseSlug) ?? item.courseSlug}</option>)}</select></label></div>
          <div className="space-y-2">
            {sortedPlacements.map((item, index) => (
              <div key={item.courseSlug} className="flex flex-wrap items-center gap-3 rounded-xl bg-[hsl(var(--admin-surface-soft))] p-3">
                <div className="flex gap-1"><button type="button" onClick={() => moveCourse(index, -1)} disabled={index === 0} aria-label={`Move ${courseNames.get(item.courseSlug) ?? item.courseSlug} up`} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--admin-border))] disabled:opacity-40"><ArrowUp size={15} /></button><button type="button" onClick={() => moveCourse(index, 1)} disabled={index === sortedPlacements.length - 1} aria-label={`Move ${courseNames.get(item.courseSlug) ?? item.courseSlug} down`} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--admin-border))] disabled:opacity-40"><ArrowDown size={15} /></button></div>
                <span className="min-w-40 flex-1 text-sm font-bold text-[hsl(var(--admin-text))]">{courseNames.get(item.courseSlug) ?? item.courseSlug}</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--admin-text))]"><input type="checkbox" checked={item.isVisible} onChange={(event) => toggleCourse(item.courseSlug, event.target.checked)} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" /> Show on page</label>
                {form.featuredCourseSlug === item.courseSlug && <span className="rounded-full bg-[hsl(var(--admin-primary)/.1)] px-3 py-1 text-[10px] font-bold text-[hsl(var(--admin-primary))]">Featured</span>}
              </div>
            ))}
          </div>
        </EditorCard>

        <EditorCard title="Upcoming batches" description="Enter real batch dates and admissions status. Empty entries are not published until saved.">
          <div className="space-y-4">
            {form.batches.map((batch, index) => <div key={batch.id} className="rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4">
              <div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold text-[hsl(var(--admin-text))]">Batch {index + 1}</p><button type="button" onClick={() => setField('batches', form.batches.filter((item) => item.id !== batch.id))} aria-label={`Remove batch ${index + 1}`} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--destructive))]"><Trash2 size={15} /></button></div>
              <div className="grid gap-3 sm:grid-cols-2"><TextInput id={`batch-name-${index}`} label="Batch name" value={batch.batchName} maxLength={120} onChange={(value) => updateBatch(index, 'batchName', value)} /><TextInput id={`batch-date-${index}`} label="Start date" type="date" required={false} value={batch.startDate} onChange={(value) => updateBatch(index, 'startDate', value)} /><TextInput id={`batch-exam-${index}`} label="Target exam" value={batch.targetExam} maxLength={120} onChange={(value) => updateBatch(index, 'targetExam', value)} /><TextInput id={`batch-status-${index}`} label="Admissions status" required={false} value={batch.admissionsStatus} maxLength={80} onChange={(value) => updateBatch(index, 'admissionsStatus', value)} /></div>
            </div>)}
            <button type="button" onClick={() => setField('batches', [...form.batches, { id: crypto.randomUUID(), displayOrder: form.batches.length + 1, batchName: '', startDate: '', targetExam: '', admissionsStatus: '' }])} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]"><Plus size={15} /> Add batch</button>
          </div>
        </EditorCard>

        <EditorCard title="Daily schedule" description="Add the activities and times currently used by the college.">
          <div className="space-y-4">
            {form.schedule.map((item, index) => <div key={item.id} className="flex flex-wrap items-end gap-3 rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4">
              <div className="min-w-48 flex-1"><TextInput id={`schedule-activity-${index}`} label="Activity" value={item.activity} maxLength={140} onChange={(value) => updateSchedule(index, 'activity', value)} /></div>
              <div className="w-36"><TextInput id={`schedule-start-${index}`} label="Start time" type="time" required={false} value={item.startTime} onChange={(value) => updateSchedule(index, 'startTime', value)} /></div>
              <div className="w-36"><TextInput id={`schedule-end-${index}`} label="End time" type="time" required={false} value={item.endTime} onChange={(value) => updateSchedule(index, 'endTime', value)} /></div>
              <button type="button" onClick={() => setField('schedule', form.schedule.filter((entry) => entry.id !== item.id))} aria-label={`Remove schedule item ${index + 1}`} className="grid h-10 w-10 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--destructive))]"><Trash2 size={15} /></button>
            </div>)}
            <button type="button" onClick={() => setField('schedule', [...form.schedule, { id: crypto.randomUUID(), displayOrder: form.schedule.length + 1, activity: '', startTime: '', endTime: '' }])} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]"><Plus size={15} /> Add schedule item</button>
          </div>
        </EditorCard>

        <EditorCard title="Final admissions CTA" description="The button stays connected to the existing Contact page.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2"><TextInput id="all-courses-cta-eyebrow" label="Eyebrow" value={form.ctaEyebrow} maxLength={100} onChange={(value) => setField('ctaEyebrow', value)} /><TextInput id="all-courses-cta-heading" label="Heading" value={form.ctaHeading} maxLength={180} onChange={(value) => setField('ctaHeading', value)} /><TextInput id="all-courses-cta-button" label="Button label" value={form.ctaButtonLabel} maxLength={100} onChange={(value) => setField('ctaButtonLabel', value)} /></div>
            <TextArea id="all-courses-cta-description" label="Supporting text" value={form.ctaDescription} maxLength={600} onChange={(value) => setField('ctaDescription', value)} />
            <div className="grid gap-4 md:grid-cols-2">{form.ctaBenefits.map((benefit, index) => <div key={benefit.id} className="rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Benefit {index + 1}</p><div className="space-y-3"><TextInput id={`cta-benefit-${index}-title`} label="Title" value={benefit.title} maxLength={100} onChange={(value) => updateBenefit(index, 'title', value)} /><TextInput id={`cta-benefit-${index}-description`} label="Description" value={benefit.description} maxLength={180} onChange={(value) => updateBenefit(index, 'description', value)} /></div></div>)}</div>
          </div>
        </EditorCard>
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-all-courses">Save All Courses page</SaveButton></div>
      </form>
    </EditorFrame>
  );
}