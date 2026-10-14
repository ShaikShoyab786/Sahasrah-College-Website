import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, BookOpen, FileUp, ImagePlus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CourseSlug,
  getGetAdminCoursesQueryKey,
  getGetCourseBySlugQueryKey,
  useGetAdminCourses,
  useRequestCourseCurriculumUploadUrl,
  useUploadAdminImage,
  useUpdateAdminCourse,
  type AdminCourse,
  type CourseHighlight,
  type CourseSyllabusSubject,
  type CourseUpdate,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const COURSE_SLUGS = [CourseSlug.mpc, CourseSlug.bipc, CourseSlug['mpc-iit-jee'], CourseSlug['bipc-neet'], CourseSlug['mpc-eamcet']] as const;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

function toUpdate(course: AdminCourse): CourseUpdate {
  return {
    heroEyebrow: course.heroEyebrow,
    heroTitle: course.heroTitle,
    heroDescription: course.heroDescription,
    durationLabel: course.durationLabel,
    modeLabel: course.modeLabel,
    heroBackgroundImageUrl: course.heroBackgroundImageUrl,
    heroBackgroundOverlay: course.heroBackgroundOverlay,
    primaryActionLabel: course.primaryActionLabel,
    primaryActionUrl: course.primaryActionUrl,
    secondaryActionLabel: 'View Curriculum',
    secondaryActionUrl: '#course-syllabus',
    highlightsEyebrow: course.highlightsEyebrow,
    highlightsHeading: course.highlightsHeading,
    highlightsIntroduction: course.highlightsIntroduction,
    highlights: course.highlights,
    overviewText: course.overviewText,
    programGoals: course.programGoals,
    idealProfileTitle: course.idealProfileTitle,
    idealProfileDescription: course.idealProfileDescription,
    idealProfileIndicators: course.idealProfileIndicators,
    syllabus: course.syllabus,
    curriculumPdfObjectPath: course.curriculumPdfObjectPath,
    curriculumPdfFileName: course.curriculumPdfFileName,
  };
}

function ListEditor({ label, values, onChange, max, placeholder, testId }: { label: string; values: string[]; onChange: (values: string[]) => void; max: number; placeholder: string; testId: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[hsl(var(--admin-text))]">{label}</p>
        <button type="button" onClick={() => onChange([...values, ''])} disabled={values.length >= max} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[hsl(var(--admin-border))] px-3 text-xs font-bold text-[hsl(var(--admin-text))] disabled:opacity-45" data-testid={`button-add-${testId}`}>
          <Plus size={14} aria-hidden="true" /> Add
        </button>
      </div>
      {values.map((value, index) => (
        <div key={`${testId}-${index}`} className="flex items-start gap-2">
          <input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={placeholder} className="min-h-11 flex-1 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-4 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]" data-testid={`input-${testId}-${index}`} />
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} disabled={values.length <= 1} aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--destructive)/.5)] hover:text-[hsl(var(--destructive))] disabled:opacity-40" data-testid={`button-remove-${testId}-${index}`}>
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

function HighlightEditor({
  eyebrow,
  onEyebrowChange,
  heading,
  onHeadingChange,
  introduction,
  onIntroductionChange,
  values,
  onChange,
}: {
  eyebrow: string;
  onEyebrowChange: (eyebrow: string) => void;
  heading: string;
  onHeadingChange: (heading: string) => void;
  introduction: string;
  onIntroductionChange: (introduction: string) => void;
  values: CourseHighlight[];
  onChange: (values: CourseHighlight[]) => void;
}) {
  const orderedValues = [...values].sort((left, right) => left.displayOrder - right.displayOrder);
  const moveHighlight = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= orderedValues.length) return;
    const reordered = [...orderedValues];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    onChange(reordered.map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 })));
  };

  return (
    <div className="space-y-5" data-testid="editor-course-highlights">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="course-highlights-eyebrow" label="Section eyebrow" value={eyebrow} onChange={(event) => onEyebrowChange(event.target.value)} required />
        <Field id="course-highlights-heading" label="Section heading" value={heading} onChange={(event) => onHeadingChange(event.target.value)} required />
      </div>
      <Area id="course-highlights-introduction" label="Introduction" value={introduction} onChange={(event) => onIntroductionChange(event.target.value)} required />
      <div className="space-y-3">
        {orderedValues.map((item, index) => (
          <div key={`highlight-${item.displayOrder}-${index}`} className="rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4" data-testid={`editor-course-highlight-${index}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-[hsl(var(--admin-text))]">Highlight {String(item.displayOrder).padStart(2, '0')}</p>
              <div className="flex items-center gap-2">
                <span className="mr-1 text-xs font-semibold text-[hsl(var(--admin-text-muted))]">Display order</span>
                <button type="button" onClick={() => moveHighlight(index, -1)} disabled={index === 0} aria-label={`Move highlight ${item.displayOrder} up`} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] disabled:opacity-35" data-testid={`button-move-course-highlight-up-${index}`}><ArrowUp size={15} aria-hidden="true" /></button>
                <button type="button" onClick={() => moveHighlight(index, 1)} disabled={index === orderedValues.length - 1} aria-label={`Move highlight ${item.displayOrder} down`} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] disabled:opacity-35" data-testid={`button-move-course-highlight-down-${index}`}><ArrowDown size={15} aria-hidden="true" /></button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field id={`course-highlight-${index}-category`} label="Category label" value={item.category} onChange={(event) => onChange(orderedValues.map((entry, itemIndex) => itemIndex === index ? { ...entry, category: event.target.value } : entry))} required />
              <Field id={`course-highlight-${index}-title`} label="Title" value={item.title} onChange={(event) => onChange(orderedValues.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry))} required />
            </div>
            <div className="mt-4">
              <Area id={`course-highlight-${index}-description`} label="Description" value={item.description} onChange={(event) => onChange(orderedValues.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))} required />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SyllabusEditor({ values, onChange }: { values: CourseSyllabusSubject[]; onChange: (values: CourseSyllabusSubject[]) => void }) {
  const updateSubject = (index: number, patch: Partial<CourseSyllabusSubject>) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-[hsl(var(--admin-text))]">Subject and topic curriculum</p><button type="button" onClick={() => onChange([...values, { subject: '', topics: [''] }])} disabled={values.length >= 8} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[hsl(var(--admin-border))] px-3 text-xs font-bold" data-testid="button-add-syllabus-subject"><Plus size={14} /> Add subject</button></div>
      {values.map((item, index) => <div key={`syllabus-${index}`} className="rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4"><div className="flex items-end gap-3"><Field id={`syllabus-${index}-subject`} label="Subject" value={item.subject} onChange={(event) => updateSubject(index, { subject: event.target.value })} required /><button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} disabled={values.length <= 1} className="mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] disabled:opacity-40" aria-label={`Remove syllabus subject ${index + 1}`} data-testid={`button-remove-syllabus-${index}`}><Trash2 size={15} /></button></div><div className="mt-4 pl-3"><ListEditor label="Topics" values={item.topics} onChange={(topics) => updateSubject(index, { topics })} max={40} placeholder="Topic or unit" testId={`syllabus-${index}-topic`} /></div></div>)}
    </div>
  );
}

export default function AdminCourses() {
  const query = useGetAdminCourses();
  const update = useUpdateAdminCourse();
  const requestUpload = useRequestCourseCurriculumUploadUrl();
  const imageUpload = useUploadAdminImage();
  const client = useQueryClient();
  const [activeSlug, setActiveSlug] = useState<CourseSlug>(CourseSlug.mpc);
  const [forms, setForms] = useState<Partial<Record<CourseSlug, CourseUpdate>>>({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const course = useMemo(() => query.data?.find((item) => item.slug === activeSlug), [query.data, activeSlug]);
  const form = forms[activeSlug];

  useEffect(() => {
    if (!query.data) return;
    setForms(Object.fromEntries(query.data.map((item) => [item.slug, toUpdate(item)])) as Partial<Record<CourseSlug, CourseUpdate>>);
    if (!query.data.some((item) => item.slug === activeSlug)) setActiveSlug(query.data[0]?.slug ?? CourseSlug.mpc);
  }, [query.data, activeSlug]);

  const setForm = (patch: Partial<CourseUpdate>) => setForms((current) => ({ ...current, [activeSlug]: { ...current[activeSlug]!, ...patch } }));

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setNotice('');
    setError('');
    update.mutate({ slug: activeSlug, data: form }, {
      onSuccess: (saved) => {
        setForms((current) => ({ ...current, [activeSlug]: toUpdate(saved) }));
        void client.invalidateQueries({ queryKey: getGetAdminCoursesQueryKey() });
        void client.invalidateQueries({ queryKey: getGetCourseBySlugQueryKey(activeSlug) });
        setNotice(`${saved.name} saved. Public course content is refreshed.`);
      },
      onError: () => setError('We could not save this course. Check that each structured section has at least one complete entry.'),
    });
  };

  const handlePdf = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Choose a PDF file. Other file types are not accepted.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('That PDF is larger than 20 MiB. Choose a smaller file.');
      return;
    }
    setError('');
    setNotice('');
    setUploading(true);
    try {
      const result = await requestUpload.mutateAsync({ slug: activeSlug, data: { fileName: file.name, size: file.size, contentType: 'application/pdf' } });
      const response = await fetch(result.uploadURL, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: file });
      if (!response.ok) throw new Error('The PDF upload failed.');
      setForm({ curriculumPdfObjectPath: result.objectPath, curriculumPdfFileName: file.name });
      setNotice('PDF uploaded. Save the course to attach it to this pathway.');
    } catch {
      setError('The PDF could not be uploaded. The server will verify the PDF signature before it is saved.');
    } finally {
      setUploading(false);
    }
  };

  const handleHeroImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('That image is larger than 5 MiB. Choose a smaller file.');
      return;
    }
    setError('');
    setNotice('');
    imageUpload.mutate({ data: { file, purpose: 'hero' } }, {
      onSuccess: (result) => {
        setForm({ heroBackgroundImageUrl: result.url });
        setNotice('Hero background uploaded. Save the course to publish it.');
      },
      onError: () => setError('The hero background could not be uploaded. Try another image.'),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  if (!query.data?.length || !course || !form) return <LoadError onRetry={() => query.refetch()} />;

  return (
    <EditorFrame eyebrow="Pages / Courses" title="Keep every pathway accurate." description="Edit the five public course pathways, their guidance, and the curriculum file used by students and families." previewHref={`/courses/${activeSlug}`}>
      <div className="mt-10 space-y-6">
        <EditorCard icon={<BookOpen size={19} />} title="Course pathway" description="The course name and slug are fixed. Choose a pathway to edit its published content.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {query.data.map((item) => <button type="button" key={item.slug} onClick={() => { setActiveSlug(item.slug); setNotice(''); setError(''); }} className={`rounded-xl border px-4 py-4 text-left transition ${activeSlug === item.slug ? 'border-[hsl(var(--admin-focus))] bg-[hsl(var(--admin-primary)/.08)]' : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] hover:border-[hsl(var(--admin-focus)/.6)]'}`} data-testid={`button-course-tab-${item.slug}`}><span className="block text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--admin-text-muted))]">{item.slug}</span><span className="mt-2 block text-sm font-bold text-[hsl(var(--admin-text))]">{item.name}</span></button>)}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--admin-text-muted))]">Fixed course name</p><p className="mt-2 font-display text-2xl font-semibold text-[hsl(var(--admin-primary))]" data-testid="text-course-name">{course.name}</p></div><div className="rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--admin-text-muted))]">Fixed slug</p><p className="mt-2 font-mono text-sm font-bold text-[hsl(var(--admin-text))]" data-testid="text-course-slug">{course.slug}</p></div></div>
        </EditorCard>

        <form onSubmit={save} className="space-y-6">
          <div id="admin-courses-hero" className="scroll-mt-24">
          <EditorCard title="Hero and actions" description="The opening copy, course details, and calls to action for this pathway.">
            <div className="space-y-5">
              <Field id="course-hero-eyebrow" label="Eyebrow" value={form.heroEyebrow} onChange={(event) => setForm({ heroEyebrow: event.target.value })} required />
              <Field id="course-hero-title" label="Title" value={form.heroTitle} onChange={(event) => setForm({ heroTitle: event.target.value })} required />
              <Area id="course-hero-description" label="Description" value={form.heroDescription} onChange={(event) => setForm({ heroDescription: event.target.value })} required />
              <div className="grid gap-4 md:grid-cols-2">
                <Field id="course-duration-label" label="Duration" value={form.durationLabel} onChange={(event) => setForm({ durationLabel: event.target.value })} required />
                <Field id="course-mode-label" label="Mode" value={form.modeLabel} onChange={(event) => setForm({ modeLabel: event.target.value })} required />
              </div>
              <div className="space-y-4 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--admin-text))]">Hero background image</p>
                    <p className="mt-1 text-xs leading-5 text-[hsl(var(--admin-text-muted))]">Upload a JPG, PNG, or WebP up to 5 MiB, or enter an existing image URL.</p>
                  </div>
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]">
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleHeroImage} disabled={imageUpload.isPending} className="sr-only" data-testid="input-course-hero-image" />
                    <ImagePlus size={15} aria-hidden="true" />{imageUpload.isPending ? 'Uploading image…' : 'Upload image'}
                  </label>
                </div>
                <Field id="course-hero-background-url" label="Background image URL" value={form.heroBackgroundImageUrl ?? ''} onChange={(event) => setForm({ heroBackgroundImageUrl: event.target.value.trim() || null })} />
                {form.heroBackgroundImageUrl && <div className="relative aspect-[16/6] overflow-hidden rounded-xl bg-[hsl(var(--admin-border))]">
                  <img src={form.heroBackgroundImageUrl} alt="Course hero background preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ backgroundColor: `rgba(7, 25, 31, ${Math.min(80, Math.max(0, form.heroBackgroundOverlay)) / 100})` }} />
                  <button type="button" onClick={() => setForm({ heroBackgroundImageUrl: null })} className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-2 text-xs font-bold text-white" data-testid="button-remove-course-hero-image">Remove image</button>
                </div>}
                <label htmlFor="course-hero-background-overlay" className="block text-sm font-semibold text-[hsl(var(--admin-text))]">
                  Dark readability overlay: {form.heroBackgroundOverlay}%
                  <input id="course-hero-background-overlay" type="range" min={0} max={80} step={1} value={form.heroBackgroundOverlay} onChange={(event) => setForm({ heroBackgroundOverlay: Number(event.target.value) })} className="mt-3 block w-full accent-[hsl(var(--admin-focus))]" data-testid="input-course-hero-overlay" />
                </label>
                <p className="text-xs leading-5 text-[hsl(var(--admin-text-muted))]">The overlay is applied only when a background image is set.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field id="course-primary-label" label="Admissions action label" value={form.primaryActionLabel} onChange={(event) => setForm({ primaryActionLabel: event.target.value })} required />
                <Field id="course-primary-url" label="Admissions action URL" value={form.primaryActionUrl} onChange={(event) => setForm({ primaryActionUrl: event.target.value })} required />
              </div>
              <p className="rounded-xl bg-[hsl(var(--admin-surface-soft))] px-4 py-3 text-xs leading-5 text-[hsl(var(--admin-text-muted))]">The second hero action is fixed to “View Curriculum” and scrolls to this course’s syllabus.</p>
            </div>
          </EditorCard>
          </div>
          <div id="admin-courses-highlights" className="scroll-mt-24">
          <EditorCard title="Quick Course Highlights" description="Edit the public overview, all four highlight entries, and their displayed order.">
            <HighlightEditor
              eyebrow={form.highlightsEyebrow}
              onEyebrowChange={(highlightsEyebrow) => setForm({ highlightsEyebrow })}
              heading={form.highlightsHeading}
              onHeadingChange={(highlightsHeading) => setForm({ highlightsHeading })}
              introduction={form.highlightsIntroduction}
              onIntroductionChange={(highlightsIntroduction) => setForm({ highlightsIntroduction })}
              values={form.highlights}
              onChange={(highlights) => setForm({ highlights })}
            />
          </EditorCard>
          </div>
          <div id="admin-courses-syllabus" className="scroll-mt-24">
          <EditorCard title="Syllabus" description="Edit subject names, topic lists, and the downloadable curriculum PDF for this pathway.">
            <div className="space-y-6" data-testid="editor-course-syllabus">
              <SyllabusEditor values={form.syllabus} onChange={(syllabus) => setForm({ syllabus })} />
              <div className="border-t border-[hsl(var(--admin-border))] pt-6">
                <div className="mb-4">
                  <p className="text-sm font-bold text-[hsl(var(--admin-text))]">Curriculum PDF</p>
                  <p className="mt-1 text-xs leading-5 text-[hsl(var(--admin-text-muted))]">Use a signed upload for a replacement PDF. The object path remains private; previews and downloads use the server-provided URL.</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold text-[hsl(var(--admin-text))]" data-testid="status-course-curriculum">{form.curriculumPdfObjectPath ? `Uploaded PDF: ${form.curriculumPdfFileName || 'Unnamed PDF'}` : course.curriculumPdfIsSample ? 'Using the generated sample curriculum' : 'No uploaded PDF selected'}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--admin-text-muted))]">PDF only, maximum 20 MiB. Upload first, then save the course.</p></div><label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]"><input type="file" accept="application/pdf,.pdf" onChange={handlePdf} disabled={uploading} className="sr-only" data-testid="input-course-curriculum-pdf" /><FileUp size={15} aria-hidden="true" />{uploading ? 'Uploading PDF…' : 'Upload PDF'}</label></div>
                  {course.curriculumDownloadUrl && <a href={course.curriculumDownloadUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-[hsl(var(--admin-primary))] underline-offset-4 hover:underline" data-testid="link-course-curriculum-preview">Preview current curriculum</a>}
                  {form.curriculumPdfObjectPath && !course.curriculumPdfIsSample && <p className="mt-3 text-xs text-[hsl(var(--admin-text-muted))]">The uploaded file will replace the current curriculum after saving.</p>}
                  {form.curriculumPdfObjectPath && <button type="button" onClick={() => { setForm({ curriculumPdfObjectPath: null, curriculumPdfFileName: null }); setNotice('Sample curriculum selected. Save the course to revert.'); }} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--admin-border))] px-3 py-2 text-xs font-bold text-[hsl(var(--admin-text))]" data-testid="button-revert-curriculum"><RotateCcw size={14} /> Revert to generated sample</button>}
                </div>
              </div>
            </div>
          </EditorCard>
          </div>
          <SaveStatus error={error} notice={notice} />
          <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-course">{`Save ${course.name}`}</SaveButton></div>
        </form>
      </div>
    </EditorFrame>
  );
}