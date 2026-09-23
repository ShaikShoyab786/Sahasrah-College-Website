import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, BarChart3, Building2, ImagePlus, MessageCircleQuestion, Megaphone, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAboutAchievementsQueryKey,
  getGetAboutAdmissionCtaQueryKey,
  getGetAboutCampusHighlightsQueryKey,
  getGetAboutFaqQueryKey,
  getGetAdminAboutAchievementsQueryKey,
  getGetAdminAboutAdmissionCtaQueryKey,
  getGetAdminAboutCampusHighlightsQueryKey,
  getGetAdminAboutFaqQueryKey,
  useGetAdminAboutAchievements,
  useGetAdminAboutAdmissionCta,
  useGetAdminAboutCampusHighlights,
  useGetAdminAboutFaq,
  useUpdateAboutAchievements,
  useUpdateAboutAdmissionCta,
  useUpdateAboutCampusHighlights,
  useUpdateAboutFaq,
  useUploadAdminImage,
  type AboutAchievementStatisticInput,
  type AboutAchievementsInput,
  type AboutAdmissionCtaInput,
  type AboutCampusHighlightInput,
  type AboutCampusHighlightsInput,
  type AboutFaqInput,
  type AboutFaqItemInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, ImageField, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const campusDefaults: AboutCampusHighlightsInput = {
  heading: 'Our Campus Highlights',
  description: 'Thoughtfully designed spaces that help students learn, practice, recharge, and grow with confidence.',
  isVisible: true,
  sortOrder: 7,
  highlights: [
    { imageUrl: null, imageAltText: 'Bright college classroom', icon: 'building-2', title: 'AC Classrooms', description: 'Comfortable, focused classrooms that keep attention on learning.', displayOrder: 1, isVisible: true },
  ],
};

const achievementDefaults: AboutAchievementsInput = {
  heading: 'Progress You Can Measure',
  description: 'A few of the outcomes that reflect our shared commitment to steady, meaningful progress.',
  isVisible: true,
  sortOrder: 8,
  statistics: [
    { numericTarget: 30, suffix: '+', icon: 'calendar-days', label: 'Years of Excellence', displayOrder: 1, isVisible: true },
    { numericTarget: 5000, suffix: '+', icon: 'users', label: 'Students Mentored', displayOrder: 2, isVisible: true },
  ],
};

const faqDefaults: AboutFaqInput = {
  heading: 'Frequently Asked Questions',
  description: 'Helpful answers for families planning the next step in their student’s journey.',
  isVisible: true,
  sortOrder: 9,
  questions: [
    { question: 'Which programs are available?', answer: 'Our admissions team can help you compare current MPC, BiPC, IIT-JEE, and NEET integrated programs.', displayOrder: 1, isVisible: true },
  ],
};

const ctaDefaults: AboutAdmissionCtaInput = {
  heading: 'Begin Your Journey Towards Success with Sahsrah Junior College',
  supportingText: 'Admissions for 2026–27 are now open. Limited seats are available for MPC, BiPC, IIT-JEE, and NEET integrated programs.',
  applyButtonLabel: 'Apply Now',
  applyButtonHref: '/contact',
  campusVisitButtonLabel: 'Book Campus Visit',
  campusVisitButtonHref: '/contact',
  prospectusButtonLabel: 'Download Prospectus',
  prospectusButtonHref: '/contact',
  backgroundImage: null,
  backgroundImageAltText: 'Students walking across a college campus',
  counselorButtonLabel: 'Talk to Admission Counselor',
  counselorButtonHref: '/contact',
  admissionPhone: '',
  workingHours: 'Monday–Saturday, 9:00–16:30',
  isVisible: true,
  sortOrder: 10,
};

function reorder<T extends { displayOrder: number }>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return items;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 }));
}

function ListActions({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return <div className="flex items-center gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))] disabled:opacity-30" aria-label="Move item up"><ArrowUp size={16} /></button><button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))] disabled:opacity-30" aria-label="Move item down"><ArrowDown size={16} /></button><button type="button" onClick={onRemove} className="rounded-lg p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.08)]" aria-label="Delete item"><Trash2 size={16} /></button></div>;
}

export function AdminAboutCampusHighlights() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutCampusHighlights();
  const update = useUpdateAboutCampusHighlights();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState(campusDefaults);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<number | null>(null);
  useEffect(() => { if (query.data) setForm({ heading: query.data.heading, description: query.data.description, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder, highlights: query.data.highlights.map(({ imageUrl, imageAltText, icon, title, description, displayOrder, isVisible }) => ({ imageUrl, imageAltText, icon, title, description, displayOrder, isVisible })) }); }, [query.data]);
  const setItem = (index: number, patch: Partial<AboutCampusHighlightInput>) => setForm((current) => ({ ...current, highlights: current.highlights.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const handleUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setUploading(index); upload.mutate({ data: { file, purpose: 'campus' } }, { onSuccess: (result) => { setItem(index, { imageUrl: result.url }); setUploading(null); setNotice('Image uploaded. Save this section to publish it.'); }, onError: () => { setUploading(null); setError('That image could not be uploaded.'); } }); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setNotice(''); setError(''); update.mutate({ data: form }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminAboutCampusHighlightsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAboutCampusHighlightsQueryKey() }); setNotice(form.isVisible ? 'Campus Highlights saved and visible.' : 'Campus Highlights saved and hidden.'); }, onError: () => setError('We could not save Campus Highlights. Check titles, descriptions, and ordering.') }); };
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / About / Campus Highlights" title="Show the spaces where learning happens." description="Manage the campus places and facilities families can explore on the public About page." previewHref="/about#campus-highlights"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard icon={<Building2 size={19} />} title="Section introduction" description="Keep the introduction concise and welcoming."><div className="space-y-5"><Field id="campus-heading" label="Heading" value={form.heading} onChange={(event) => setForm({ ...form, heading: event.target.value })} required /><Area id="campus-description" label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></div></EditorCard><EditorCard icon={<ImagePlus size={19} />} title="Highlights" description="Add, remove, reorder, and publish individual campus highlights."><div className="space-y-5">{form.highlights.map((item, index) => <div key={`${item.title}-${index}`} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Highlight {index + 1}</p><ListActions index={index} count={form.highlights.length} onMove={(direction) => setForm({ ...form, highlights: reorder(form.highlights, index, direction) })} onRemove={() => setForm({ ...form, highlights: form.highlights.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })) })} /></div><div className="mt-4 grid gap-5 md:grid-cols-2"><div className="space-y-4"><Field id={`campus-title-${index}`} label="Title" value={item.title} onChange={(event) => setItem(index, { title: event.target.value })} required /><Area id={`campus-description-${index}`} label="Short description" value={item.description} onChange={(event) => setItem(index, { description: event.target.value })} required /><div className="grid gap-4 sm:grid-cols-2"><Field id={`campus-icon-${index}`} label="Icon name" value={item.icon ?? ''} onChange={(event) => setItem(index, { icon: event.target.value || null })} hint="Lucide name" /><Field id={`campus-alt-${index}`} label="Alt text" value={item.imageAltText} onChange={(event) => setItem(index, { imageAltText: event.target.value })} required /></div><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={item.isVisible} onChange={(event) => setItem(index, { isVisible: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show highlight</label></div><div className="space-y-4"><div className="aspect-[1.55] overflow-hidden rounded-xl bg-[hsl(var(--card))]">{item.imageUrl ? <img src={item.imageUrl} alt={item.imageAltText || 'Highlight preview'} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-[hsl(var(--muted-foreground))]">No image yet</div>}</div><label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(event) => handleUpload(index, event)} />{uploading === index ? 'Uploading…' : 'Upload campus image'}</label><Field id={`campus-url-${index}`} label="Image URL" value={item.imageUrl ?? ''} onChange={(event) => setItem(index, { imageUrl: event.target.value || null })} placeholder="/api/uploads/…" /></div></div></div>)}</div><button type="button" onClick={() => setForm({ ...form, highlights: [...form.highlights, { imageUrl: null, imageAltText: '', icon: 'sparkles', title: '', description: '', displayOrder: form.highlights.length + 1, isVisible: true }] })} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--background))]"><Plus size={16} /> Add highlight</button></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show Campus Highlights on the public page" /><SaveStatus error={error} notice={notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Campus Highlights</SaveButton></div></form></EditorFrame>;
}

export function AdminAboutAchievements() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutAchievements();
  const update = useUpdateAboutAchievements();
  const [form, setForm] = useState(achievementDefaults);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (query.data) setForm({ heading: query.data.heading, description: query.data.description, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder, statistics: query.data.statistics.map(({ numericTarget, suffix, icon, label, displayOrder, isVisible }) => ({ numericTarget, suffix, icon, label, displayOrder, isVisible })) }); }, [query.data]);
  const setItem = (index: number, patch: Partial<AboutAchievementStatisticInput>) => setForm((current) => ({ ...current, statistics: current.statistics.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setNotice(''); setError(''); update.mutate({ data: form }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminAboutAchievementsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAboutAchievementsQueryKey() }); setNotice(form.isVisible ? 'Achievement Statistics saved and visible.' : 'Achievement Statistics saved and hidden.'); }, onError: () => setError('We could not save the statistics. Use non-negative numeric targets and unique ordering.') }); };
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / About / Achievement Statistics" title="Make progress easy to see." description="Manage the numeric targets and labels that animate in the About page impact band." previewHref="/about#achievement-statistics"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard icon={<BarChart3 size={19} />} title="Section introduction" description="The heading and description sit above the animated figures."><div className="space-y-5"><Field id="achievement-heading" label="Heading" value={form.heading} onChange={(event) => setForm({ ...form, heading: event.target.value })} required /><Area id="achievement-description" label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></div></EditorCard><EditorCard title="Statistics" description="Numeric target and suffix are stored separately so the public count-up remains safe."><div className="space-y-4">{form.statistics.map((item, index) => <div key={`${item.label}-${index}`} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Statistic {index + 1}</p><ListActions index={index} count={form.statistics.length} onMove={(direction) => setForm({ ...form, statistics: reorder(form.statistics, index, direction) })} onRemove={() => setForm({ ...form, statistics: form.statistics.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })) })} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field id={`achievement-target-${index}`} label="Numeric target" type="number" min="0" value={item.numericTarget} onChange={(event) => setItem(index, { numericTarget: Number(event.target.value) })} required /><Field id={`achievement-suffix-${index}`} label="Suffix" value={item.suffix} onChange={(event) => setItem(index, { suffix: event.target.value })} placeholder="+ or %" /><Field id={`achievement-label-${index}`} label="Label" value={item.label} onChange={(event) => setItem(index, { label: event.target.value })} required /><Field id={`achievement-icon-${index}`} label="Icon name" value={item.icon ?? ''} onChange={(event) => setItem(index, { icon: event.target.value || null })} hint="Lucide name" /></div><label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={item.isVisible} onChange={(event) => setItem(index, { isVisible: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show statistic</label></div>)}</div><button type="button" onClick={() => setForm({ ...form, statistics: [...form.statistics, { numericTarget: 0, suffix: '+', icon: 'sparkles', label: '', displayOrder: form.statistics.length + 1, isVisible: true }] })} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--background))]"><Plus size={16} /> Add statistic</button></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show Achievement Statistics on the public page" /><SaveStatus error={error} notice={notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Achievement Statistics</SaveButton></div></form></EditorFrame>;
}

export function AdminAboutFaq() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutFaq();
  const update = useUpdateAboutFaq();
  const [form, setForm] = useState(faqDefaults);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (query.data) setForm({ heading: query.data.heading, description: query.data.description, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder, questions: query.data.questions.map(({ question, answer, displayOrder, isVisible }) => ({ question, answer, displayOrder, isVisible })) }); }, [query.data]);
  const setItem = (index: number, patch: Partial<AboutFaqItemInput>) => setForm((current) => ({ ...current, questions: current.questions.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setNotice(''); setError(''); update.mutate({ data: form }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminAboutFaqQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAboutFaqQueryKey() }); setNotice(form.isVisible ? 'FAQs saved and visible.' : 'FAQs saved and hidden.'); }, onError: () => setError('We could not save the FAQs. Questions and answers cannot be blank.') }); };
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / About / Frequently Asked Questions" title="Answer the questions families ask." description="Keep the public accordion accurate, useful, and easy for prospective families to scan." previewHref="/about#faq"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard icon={<MessageCircleQuestion size={19} />} title="Section introduction" description="Set the heading and short context above the FAQ list."><div className="space-y-5"><Field id="faq-heading" label="Heading" value={form.heading} onChange={(event) => setForm({ ...form, heading: event.target.value })} required /><Area id="faq-description" label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></div></EditorCard><EditorCard title="Questions and answers" description="Add, remove, reorder, or temporarily hide individual questions."><div className="space-y-4">{form.questions.map((item, index) => <div key={`${item.question}-${index}`} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Question {index + 1}</p><ListActions index={index} count={form.questions.length} onMove={(direction) => setForm({ ...form, questions: reorder(form.questions, index, direction) })} onRemove={() => setForm({ ...form, questions: form.questions.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })) })} /></div><div className="mt-4 space-y-4"><Field id={`faq-question-${index}`} label="Question" value={item.question} onChange={(event) => setItem(index, { question: event.target.value })} required /><Area id={`faq-answer-${index}`} label="Answer" value={item.answer} onChange={(event) => setItem(index, { answer: event.target.value })} required /><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={item.isVisible} onChange={(event) => setItem(index, { isVisible: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Publish question</label></div></div>)}</div><button type="button" onClick={() => setForm({ ...form, questions: [...form.questions, { question: '', answer: '', displayOrder: form.questions.length + 1, isVisible: true }] })} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--background))]"><Plus size={16} /> Add FAQ</button></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show Frequently Asked Questions on the public page" /><SaveStatus error={error} notice={notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save FAQs</SaveButton></div></form></EditorFrame>;
}

export function AdminAboutAdmissionCta() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutAdmissionCta();
  const update = useUpdateAboutAdmissionCta();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState(ctaDefaults);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  useEffect(() => { if (query.data) setForm({ heading: query.data.heading, supportingText: query.data.supportingText, applyButtonLabel: query.data.applyButtonLabel, applyButtonHref: query.data.applyButtonHref, campusVisitButtonLabel: query.data.campusVisitButtonLabel, campusVisitButtonHref: query.data.campusVisitButtonHref, prospectusButtonLabel: query.data.prospectusButtonLabel, prospectusButtonHref: query.data.prospectusButtonHref, backgroundImage: query.data.backgroundImage, backgroundImageAltText: query.data.backgroundImageAltText, counselorButtonLabel: query.data.counselorButtonLabel, counselorButtonHref: query.data.counselorButtonHref, admissionPhone: query.data.admissionPhone, workingHours: query.data.workingHours, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder }); }, [query.data]);
  const setField = <K extends keyof AboutAdmissionCtaInput>(key: K, value: AboutAdmissionCtaInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setUploading(true); upload.mutate({ data: { file, purpose: 'cta' } }, { onSuccess: (result) => { setField('backgroundImage', result.url); setUploading(false); setNotice('CTA background uploaded. Save this section to publish it.'); }, onError: () => { setUploading(false); setError('That image could not be uploaded.'); } }); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setNotice(''); setError(''); update.mutate({ data: form }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminAboutAdmissionCtaQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAboutAdmissionCtaQueryKey() }); setNotice(form.isVisible ? 'Admission CTA and help details saved and visible.' : 'Admission CTA saved and hidden.'); }, onError: () => setError('We could not save the Admission CTA. Check button labels, links, and contact fields.') }); };
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / About / Admission CTA" title="Make the next step clear." description="Manage the final admission prompt and the counselor details shown beside the public FAQs." previewHref="/about#admission-cta"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard icon={<Megaphone size={19} />} title="CTA copy" description="Use direct, reassuring language for families who are ready to talk."><div className="space-y-5"><Field id="cta-heading" label="CTA heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required /><Area id="cta-supporting-text" label="Supporting text" value={form.supportingText} onChange={(event) => setField('supportingText', event.target.value)} required /></div></EditorCard><EditorCard icon={<ImagePlus size={19} />} title="CTA background image" description="Upload an image or provide a valid existing image URL."><ImageField label="CTA background" image={form.backgroundImage} alt={form.backgroundImageAltText} uploading={uploading} onUpload={handleUpload} onUrlChange={(value) => setField('backgroundImage', value || null)} onAltChange={(value) => setField('backgroundImageAltText', value)} /></EditorCard><EditorCard title="Action buttons" description="Use existing admission, contact, campus visit, or configured download destinations."><div className="grid gap-5 md:grid-cols-3"><div className="space-y-4 rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Apply</p><Field id="cta-apply-label" label="Label" value={form.applyButtonLabel} onChange={(event) => setField('applyButtonLabel', event.target.value)} required /><Field id="cta-apply-href" label="Link" value={form.applyButtonHref} onChange={(event) => setField('applyButtonHref', event.target.value)} required /></div><div className="space-y-4 rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Campus visit</p><Field id="cta-visit-label" label="Label" value={form.campusVisitButtonLabel} onChange={(event) => setField('campusVisitButtonLabel', event.target.value)} required /><Field id="cta-visit-href" label="Link" value={form.campusVisitButtonHref} onChange={(event) => setField('campusVisitButtonHref', event.target.value)} required /></div><div className="space-y-4 rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Prospectus</p><Field id="cta-prospectus-label" label="Label" value={form.prospectusButtonLabel} onChange={(event) => setField('prospectusButtonLabel', event.target.value)} required /><Field id="cta-prospectus-href" label="Link" value={form.prospectusButtonHref} onChange={(event) => setField('prospectusButtonHref', event.target.value)} required /></div></div></EditorCard><EditorCard title="Admission help card" description="These details appear next to the FAQ accordion. Keep phone and working hours current."><div className="grid gap-5 md:grid-cols-2"><Field id="cta-counselor-label" label="Counselor button label" value={form.counselorButtonLabel} onChange={(event) => setField('counselorButtonLabel', event.target.value)} required /><Field id="cta-counselor-href" label="Counselor link" value={form.counselorButtonHref} onChange={(event) => setField('counselorButtonHref', event.target.value)} required /><Field id="cta-admission-phone" label="Admission phone" value={form.admissionPhone} onChange={(event) => setField('admissionPhone', event.target.value)} hint="Leave blank to use Site identity phone" /><Field id="cta-working-hours" label="Working hours" value={form.workingHours} onChange={(event) => setField('workingHours', event.target.value)} required /></div></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setField('isVisible', value)} label="Show the final Admission CTA on the public page" /><SaveStatus error={error} notice={notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Admission CTA</SaveButton></div></form></EditorFrame>;
}