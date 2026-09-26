import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminHomepageAchievementRibbonQueryKey,
  getGetAdminHomepagePreviewCopyQueryKey,
  getGetAdminHomepageResultsQueryKey,
  getGetAdminHomepageTestimonialsQueryKey,
  getGetHomepageAchievementRibbonQueryKey,
  getGetHomepageGalleryQueryKey,
  getGetHomepagePreviewCopyQueryKey,
  getGetHomepageResultsQueryKey,
  getGetHomepageTestimonialsQueryKey,
  useGetAdminHomepageAchievementRibbon,
  useGetAdminHomepagePreviewCopy,
  useGetAdminHomepageResults,
  useGetAdminHomepageTestimonials,
  useUpdateHomepageAchievementRibbon,
  useUpdateHomepagePreviewCopy,
  useUpdateHomepageResults,
  useUpdateHomepageTestimonials,
  useUploadAdminImage,
  type HomepageAchievementRibbonInput,
  type HomepageResultsInput,
  type HomepageTestimonialsInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const ribbonDefaults: HomepageAchievementRibbonInput = {
  isVisible: true, sortOrder: 7,
  phrases: [
    { phrase: 'Best NEET Preparation', displayOrder: 1, isActive: true, accentColor: '#D6AD59', separatorStyle: 'star' },
    { phrase: 'Excellence', displayOrder: 2, isActive: true, accentColor: '#FFFFFF', separatorStyle: 'dot' },
    { phrase: 'Discipline', displayOrder: 3, isActive: true, accentColor: '#75C7B5', separatorStyle: 'star' },
    { phrase: 'Dedication', displayOrder: 4, isActive: true, accentColor: '#FFFFFF', separatorStyle: 'dot' },
  ],
};

const testimonialDefaults: HomepageTestimonialsInput = {
  eyebrow: 'What Parents & Students Say', heading: 'Real Stories of Success', description: 'Real stories from the KVR Junior College family.', isVisible: true, sortOrder: 8,
  testimonials: [
    { rating: 5, quote: 'The regular feedback and personal attention gave our daughter the confidence to keep improving without feeling overwhelmed.', personName: 'Mrs. Lakshmi Rao', role: 'Parent', courseAchievement: 'BiPC · NEET 2025', avatarImageUrl: null, avatarAltText: 'Parent from the KVR college community', accentColor: '#D6AD59', displayOrder: 1, isActive: true },
    { rating: 5, quote: 'Every subject became clearer because our teachers made time for questions. I learned how to prepare with a steady routine.', personName: 'Rohan Mehta', role: 'Student', courseAchievement: 'MPC · IIT-JEE 2025', avatarImageUrl: null, avatarAltText: 'Student from the KVR college community', accentColor: '#2E8C7B', displayOrder: 2, isActive: true },
    { rating: 5, quote: 'We chose KVR for the combination of discipline and care. The transition to junior college felt structured and genuinely supportive.', personName: 'Mr. Anil Kumar', role: 'Parent', courseAchievement: 'MPC · EAMCET 2025', avatarImageUrl: null, avatarAltText: 'Parent from the KVR college community', accentColor: '#17365D', displayOrder: 3, isActive: true },
  ],
};

type HomepageFacultyMemberInput = {
  imageUrl: string | null;
  imageAltText: string;
  name: string;
  role: string;
  subject: string;
  experience: string | null;
  profileUrl: string | null;
  displayOrder: number;
  isActive: boolean;
};

const facultyDefaults: HomepageFacultyMemberInput[] = [
  { imageUrl: null, imageAltText: 'KVR faculty member', name: 'Dr. Ananya Rao', role: 'Senior Faculty', subject: 'Physics', experience: '15+ years', profileUrl: null, displayOrder: 1, isActive: true },
  { imageUrl: null, imageAltText: 'KVR faculty member', name: 'Prof. Vikram Shah', role: 'Academic Mentor', subject: 'Mathematics', experience: '12+ years', profileUrl: null, displayOrder: 2, isActive: true },
  { imageUrl: null, imageAltText: 'KVR faculty member', name: 'Dr. Meera Nair', role: 'Senior Faculty', subject: 'Biology', experience: '14+ years', profileUrl: null, displayOrder: 3, isActive: true },
];

type LegacyGalleryDraft = {
  id?: string;
  imageUrl: string | null;
  imageAltText: string;
  title: string;
  category: string;
  description: string;
  locationLabel: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};
const galleryDefaults: LegacyGalleryDraft[] = [
  { imageUrl: null, imageAltText: 'Bright KVR college classroom', title: 'Learning spaces with purpose', category: 'Campus Feature', description: 'Comfortable classrooms designed for focused daily learning.', locationLabel: 'Academic Block', displayOrder: 1, isFeatured: true, isActive: true },
  { imageUrl: null, imageAltText: 'Students working in a KVR science laboratory', title: 'Curiosity in practice', category: 'Labs', description: 'Practical experiences that help concepts become clearer.', locationLabel: 'Science Labs', displayOrder: 2, isFeatured: true, isActive: true },
  { imageUrl: null, imageAltText: 'Quiet KVR library and study area', title: 'Room to read and grow', category: 'Library', description: 'Calm spaces for revision, reading, and independent discovery.', locationLabel: 'Central Library', displayOrder: 3, isFeatured: true, isActive: true },
];

function reorder<T extends { displayOrder: number }>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items]; const target = index + direction;
  if (target < 0 || target >= next.length) return items;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 }));
}

function Actions({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-lg p-2 disabled:opacity-25" aria-label="Move item up"><ArrowUp size={15} /></button><button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="rounded-lg p-2 disabled:opacity-25" aria-label="Move item down"><ArrowDown size={15} /></button><button type="button" disabled={count <= 1} onClick={onRemove} className="rounded-lg p-2 text-[hsl(var(--destructive))] disabled:opacity-25" aria-label="Delete item"><Trash2 size={15} /></button></div>;
}

function useFeedback() {
  const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  return { notice, error, setNotice, setError, clear: () => { setNotice(''); setError(''); } };
}

function UploadButton({ purpose, onUploaded }: { purpose: 'result' | 'testimonial' | 'faculty' | 'gallery'; onUploaded: (url: string) => void }) {
  const upload = useUploadAdminImage();
  const handle = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) upload.mutate({ data: { file, purpose } }, { onSuccess: (result) => onUploaded(result.url) }); };
  return <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 text-xs font-bold"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handle} />{upload.isPending ? 'Uploading…' : <><ImagePlus size={14} /> Upload image</>}</label>;
}

export function AdminHomepageAchievementRibbon() {
  const query = useGetAdminHomepageAchievementRibbon(); const update = useUpdateHomepageAchievementRibbon(); const client = useQueryClient(); const feedback = useFeedback(); const [form, setForm] = useState(ribbonDefaults);
  useEffect(() => { if (query.data) setForm({ isVisible: query.data.isVisible, sortOrder: query.data.sortOrder, phrases: query.data.phrases.map(({ id: _id, ...item }) => item) }); }, [query.data]);
  const submit = (event: FormEvent) => { event.preventDefault(); feedback.clear(); update.mutate({ data: form }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetAdminHomepageAchievementRibbonQueryKey() }); client.invalidateQueries({ queryKey: getGetHomepageAchievementRibbonQueryKey() }); feedback.setNotice('Achievement ribbon saved.'); }, onError: () => feedback.setError('We could not save the achievement ribbon.') }); };
  if (query.isLoading) return <EditorSkeleton />; if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Home / Achievement Ribbon" title="Keep the momentum moving." description="Edit the short achievement phrases that travel across the homepage between sections." previewHref="/#home-results"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard title="Ribbon phrases" description="Short phrases work best. The ribbon pauses when a visitor hovers or focuses it."><div className="space-y-4">{form.phrases.map((item, index) => <div key={index} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex justify-between"><p className="text-xs font-bold uppercase tracking-[.16em]">Phrase {index + 1}</p><Actions index={index} count={form.phrases.length} onMove={(direction) => setForm({ ...form, phrases: reorder(form.phrases, index, direction) })} onRemove={() => setForm({ ...form, phrases: form.phrases.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })) })} /></div><div className="mt-4 grid gap-4 md:grid-cols-3"><Field label="Phrase" value={item.phrase} onChange={(e) => setForm({ ...form, phrases: form.phrases.map((phrase, phraseIndex) => phraseIndex === index ? { ...phrase, phrase: e.target.value } : phrase) })} required /><Field label="Accent colour" value={item.accentColor ?? ''} onChange={(e) => setForm({ ...form, phrases: form.phrases.map((phrase, phraseIndex) => phraseIndex === index ? { ...phrase, accentColor: e.target.value || null } : phrase) })} /><Field label="Separator" value={item.separatorStyle ?? ''} onChange={(e) => setForm({ ...form, phrases: form.phrases.map((phrase, phraseIndex) => phraseIndex === index ? { ...phrase, separatorStyle: e.target.value || null } : phrase) })} /></div><label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isActive} onChange={(e) => setForm({ ...form, phrases: form.phrases.map((phrase, phraseIndex) => phraseIndex === index ? { ...phrase, isActive: e.target.checked } : phrase) })} className="accent-[hsl(var(--accent))]" /> Show phrase</label></div>)}</div><button type="button" onClick={() => setForm({ ...form, phrases: [...form.phrases, { ...ribbonDefaults.phrases[0], phrase: '', displayOrder: form.phrases.length + 1 }] })} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add phrase</button></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show achievement ribbon on the public homepage" /><SaveStatus error={feedback.error} notice={feedback.notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Ribbon</SaveButton></div></form></EditorFrame>;
}

export function AdminHomepageTestimonials() {
  const query = useGetAdminHomepageTestimonials(); const update = useUpdateHomepageTestimonials(); const client = useQueryClient(); const feedback = useFeedback(); const [form, setForm] = useState(testimonialDefaults);
  useEffect(() => { if (query.data) setForm({ eyebrow: query.data.eyebrow, heading: query.data.heading, description: query.data.description, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder, testimonials: query.data.testimonials.map(({ id: _id, ...item }) => item) }); }, [query.data]);
  const setItem = (index: number, patch: Partial<HomepageTestimonialsInput['testimonials'][number]>) => setForm((current) => ({ ...current, testimonials: current.testimonials.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const submit = (event: FormEvent) => { event.preventDefault(); feedback.clear(); update.mutate({ data: form }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetAdminHomepageTestimonialsQueryKey() }); client.invalidateQueries({ queryKey: getGetHomepageTestimonialsQueryKey() }); feedback.setNotice('Testimonials saved.'); }, onError: () => feedback.setError('We could not save the testimonials. Check the fields and ordering.') }); };
  if (query.isLoading) return <EditorSkeleton />; if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Home / Testimonials" title="Let the community speak." description="Manage the short, honest stories shown in the homepage success section." previewHref="/#home-testimonials"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard title="Section introduction" description="Set the heading and context for the story cards."><div className="space-y-4"><Field label="Eyebrow" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} required /><Field label="Heading" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} required /><Area label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div></EditorCard><EditorCard title="Stories" description="Keep each quote specific, short, and attributed to a real member of the community."><div className="space-y-5">{form.testimonials.map((item, index) => <div key={index} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex justify-between"><p className="text-xs font-bold uppercase tracking-[.16em]">Story {index + 1}</p><Actions index={index} count={form.testimonials.length} onMove={(direction) => setForm({ ...form, testimonials: reorder(form.testimonials, index, direction) })} onRemove={() => setForm({ ...form, testimonials: form.testimonials.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })) })} /></div><div className="mt-4 space-y-4"><Area label="Quote" value={item.quote} onChange={(e) => setItem(index, { quote: e.target.value })} required /><div className="grid gap-4 md:grid-cols-2"><Field label="Person name" value={item.personName} onChange={(e) => setItem(index, { personName: e.target.value })} required /><Field label="Role" value={item.role} onChange={(e) => setItem(index, { role: e.target.value })} required /><Field label="Course / achievement" value={item.courseAchievement} onChange={(e) => setItem(index, { courseAchievement: e.target.value })} required /><Field label="Rating (1–5)" type="number" min={1} max={5} value={item.rating} onChange={(e) => setItem(index, { rating: Number(e.target.value) })} required /><Field label="Avatar URL" value={item.avatarImageUrl ?? ''} onChange={(e) => setItem(index, { avatarImageUrl: e.target.value || null })} /><Field label="Avatar alt text" value={item.avatarAltText} onChange={(e) => setItem(index, { avatarAltText: e.target.value })} required /></div><div className="flex items-center justify-between gap-3"><UploadButton purpose="testimonial" onUploaded={(url) => setItem(index, { avatarImageUrl: url })} /><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isActive} onChange={(e) => setItem(index, { isActive: e.target.checked })} className="accent-[hsl(var(--accent))]" /> Show story</label></div></div></div>)}</div><button type="button" onClick={() => setForm({ ...form, testimonials: [...form.testimonials, { ...testimonialDefaults.testimonials[0], quote: '', personName: '', displayOrder: form.testimonials.length + 1 }] })} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add story</button></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show Testimonials on the public homepage" /><SaveStatus error={feedback.error} notice={feedback.notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Testimonials</SaveButton></div></form></EditorFrame>;
}

function SectionCopyFields({ kind, eyebrow, heading, description, buttonLabel, buttonHref, onEyebrowChange, onHeadingChange, onDescriptionChange, onButtonLabelChange, onButtonHrefChange, onSave, pending }: {
  kind: 'faculty' | 'gallery';
  eyebrow: string;
  heading: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
  onEyebrowChange: (value: string) => void;
  onHeadingChange: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  onButtonLabelChange?: (value: string) => void;
  onButtonHrefChange?: (value: string) => void;
  onSave: () => void;
  pending: boolean;
}) {
  const label = kind === 'faculty' ? 'Faculty' : 'Gallery';
  return <EditorCard title="Section introduction" description={`Set the Home-only copy above the ${label.toLowerCase()} cards.`}><div className="space-y-4"><Field id={`home-${kind}-eyebrow`} label="Eyebrow" value={eyebrow} onChange={(event) => onEyebrowChange(event.target.value)} required /><Field id={`home-${kind}-heading`} label="Heading" value={heading} onChange={(event) => onHeadingChange(event.target.value)} required /><Area id={`home-${kind}-description`} label="Description" value={description ?? ''} onChange={(event) => onDescriptionChange?.(event.target.value)} required /><Field id={`home-${kind}-button-label`} label="CTA label" value={buttonLabel ?? ''} onChange={(event) => onButtonLabelChange?.(event.target.value)} required /><Field id={`home-${kind}-button-href`} label="CTA link" value={buttonHref ?? ''} onChange={(event) => onButtonHrefChange?.(event.target.value)} required /><div className="flex justify-end"><button type="button" disabled={pending} onClick={onSave} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Saving…' : `Save ${label} copy`}</button></div></div></EditorCard>;
}

function SharedPreviewEditor({ kind }: { kind: 'faculty' | 'gallery' }) {
  const faculty = kind === 'faculty';
  const facultyQuery: { data: Array<{ id: string } & HomepageFacultyMemberInput> | null; isLoading: boolean; isError: boolean; refetch: () => Promise<void> } = { data: null, isLoading: false, isError: false, refetch: async () => undefined }; const galleryQuery: { data: LegacyGalleryDraft[] | null; isLoading: boolean; isError: boolean; refetch: () => Promise<void> } = { data: null, isLoading: false, isError: false, refetch: async () => undefined };
  const copyQuery = useGetAdminHomepagePreviewCopy();
  const updateFaculty = { isPending: false, mutate: (..._args: unknown[]) => undefined }; const updateGallery = { isPending: false, mutate: (..._args: unknown[]) => undefined };
  const copyUpdate = useUpdateHomepagePreviewCopy();
  const client = useQueryClient(); const feedback = useFeedback();
  const [facultyForm, setFacultyForm] = useState(facultyDefaults); const [galleryForm, setGalleryForm] = useState<LegacyGalleryDraft[]>(galleryDefaults);
  const [copyForm, setCopyForm] = useState({ eyebrow: '', heading: '', description: '', buttonLabel: '', buttonHref: '' });
  useEffect(() => { if (facultyQuery.data) setFacultyForm(facultyQuery.data.map(({ id: _id, ...item }) => item)); }, [facultyQuery.data]);
  useEffect(() => { if (galleryQuery.data) setGalleryForm(galleryQuery.data.map(({ id: _id, ...item }) => item)); }, [galleryQuery.data]);
   useEffect(() => { if (copyQuery.data) setCopyForm(faculty ? { eyebrow: copyQuery.data.facultyEyebrow, heading: copyQuery.data.facultyHeading, description: copyQuery.data.facultyDescription, buttonLabel: copyQuery.data.facultyButtonLabel, buttonHref: copyQuery.data.facultyButtonHref } : { eyebrow: copyQuery.data.galleryEyebrow, heading: copyQuery.data.galleryHeading, description: copyQuery.data.galleryDescription, buttonLabel: copyQuery.data.galleryButtonLabel, buttonHref: copyQuery.data.galleryButtonHref }); }, [copyQuery.data, faculty]);
  const loading = (faculty ? facultyQuery.isLoading : galleryQuery.isLoading) || copyQuery.isLoading;
  const failed = (faculty ? facultyQuery.isError && !facultyQuery.data : galleryQuery.isError && !galleryQuery.data) || (copyQuery.isError && !copyQuery.data);
  const saveCopy = () => { if (!copyForm.eyebrow.trim() || !copyForm.heading.trim() || !copyForm.description.trim() || !copyForm.buttonLabel.trim() || !copyForm.buttonHref.trim()) { feedback.setError('Complete the section copy and CTA fields before saving.'); return; } feedback.clear(); const data = faculty ? { facultyEyebrow: copyForm.eyebrow, facultyHeading: copyForm.heading, facultyDescription: copyForm.description, facultyButtonLabel: copyForm.buttonLabel, facultyButtonHref: copyForm.buttonHref } : { galleryEyebrow: copyForm.eyebrow, galleryHeading: copyForm.heading, galleryDescription: copyForm.description, galleryButtonLabel: copyForm.buttonLabel, galleryButtonHref: copyForm.buttonHref }; copyUpdate.mutate({ data }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetAdminHomepagePreviewCopyQueryKey() }); client.invalidateQueries({ queryKey: getGetHomepagePreviewCopyQueryKey() }); feedback.setNotice(faculty ? 'Faculty section copy saved.' : 'Gallery section copy saved.'); }, onError: () => feedback.setError(faculty ? 'We could not save the faculty section copy.' : 'We could not save the gallery section copy.') }); };
  const submit = (event: FormEvent) => { event.preventDefault(); feedback.clear(); if (faculty) updateFaculty.mutate({ data: facultyForm }, { onSuccess: () => { feedback.setNotice('Faculty preview saved.'); }, onError: () => feedback.setError('We could not save the faculty preview.') }); else updateGallery.mutate({ data: galleryForm }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetHomepageGalleryQueryKey() }); feedback.setNotice('Gallery preview saved.'); }, onError: () => feedback.setError('We could not save the gallery preview.') }); };
  if (loading) return <EditorSkeleton />; if (failed) return <LoadError onRetry={() => { if (faculty) void facultyQuery.refetch(); else void galleryQuery.refetch(); void copyQuery.refetch(); }} />;
  if (faculty) return <EditorFrame eyebrow="Pages / Home / Faculty" title="Put the right guides in view." description="The preview reuses the people already managed in About / Leadership, with Home-specific visibility and profile details." previewHref="/#home-faculty"><form onSubmit={submit} className="mt-10 space-y-6"><SectionCopyFields kind="faculty" eyebrow={copyForm.eyebrow} heading={copyForm.heading} description={copyForm.description} buttonLabel={copyForm.buttonLabel} buttonHref={copyForm.buttonHref} onEyebrowChange={(value) => setCopyForm({ ...copyForm, eyebrow: value })} onHeadingChange={(value) => setCopyForm({ ...copyForm, heading: value })} onDescriptionChange={(value) => setCopyForm({ ...copyForm, description: value })} onButtonLabelChange={(value) => setCopyForm({ ...copyForm, buttonLabel: value })} onButtonHrefChange={(value) => setCopyForm({ ...copyForm, buttonHref: value })} onSave={saveCopy} pending={copyUpdate.isPending} /><EditorCard title="Faculty preview cards" description="Changes here update the shared About leadership record without duplicating people or images."><div className="space-y-5">{facultyForm.map((item, index) => <div key={index} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex justify-between"><p className="text-xs font-bold uppercase tracking-[.16em]">Faculty member {index + 1}</p><Actions index={index} count={facultyForm.length} onMove={(direction) => setFacultyForm(reorder(facultyForm, index, direction))} onRemove={() => setFacultyForm(facultyForm.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })))} /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Name" value={item.name} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: e.target.value } : entry))} required /><Field label="Role" value={item.role} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, role: e.target.value } : entry))} required /><Field label="Subject" value={item.subject} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, subject: e.target.value } : entry))} required /><Field label="Experience" value={item.experience ?? ''} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, experience: e.target.value || null } : entry))} /><Field label="Image URL" value={item.imageUrl ?? ''} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageUrl: e.target.value || null } : entry))} /><Field label="Image alt text" value={item.imageAltText} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageAltText: e.target.value } : entry))} required /><Field label="Profile URL" value={item.profileUrl ?? ''} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, profileUrl: e.target.value || null } : entry))} /></div><div className="mt-4 flex items-center justify-between gap-3"><UploadButton purpose="faculty" onUploaded={(url) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageUrl: url } : entry))} /><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isActive} onChange={(e) => setFacultyForm(facultyForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, isActive: e.target.checked } : entry))} className="accent-[hsl(var(--accent))]" /> Show on Home</label></div></div>)}</div><button type="button" onClick={() => setFacultyForm([...facultyForm, { ...facultyDefaults[0], name: '', displayOrder: facultyForm.length + 1 }])} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add faculty member</button></EditorCard><SaveStatus error={feedback.error} notice={feedback.notice} /><div className="flex justify-end"><SaveButton pending={updateFaculty.isPending}>Save Faculty Preview</SaveButton></div></form></EditorFrame>;
  return <EditorFrame eyebrow="Pages / Home / Gallery" title="Choose the moments families see." description="The preview reuses the images already managed in About / Campus Highlights, with Home-specific featured and active controls." previewHref="/#home-gallery"><form onSubmit={submit} className="mt-10 space-y-6"><SectionCopyFields kind="gallery" eyebrow={copyForm.eyebrow} heading={copyForm.heading} description={copyForm.description} buttonLabel={copyForm.buttonLabel} buttonHref={copyForm.buttonHref} onEyebrowChange={(value) => setCopyForm({ ...copyForm, eyebrow: value })} onHeadingChange={(value) => setCopyForm({ ...copyForm, heading: value })} onDescriptionChange={(value) => setCopyForm({ ...copyForm, description: value })} onButtonLabelChange={(value) => setCopyForm({ ...copyForm, buttonLabel: value })} onButtonHrefChange={(value) => setCopyForm({ ...copyForm, buttonHref: value })} onSave={saveCopy} pending={copyUpdate.isPending} /><EditorCard title="Gallery preview cards" description="Feature up to three campus moments on the homepage."><div className="space-y-5">{galleryForm.map((item, index) => <div key={index} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex justify-between"><p className="text-xs font-bold uppercase tracking-[.16em]">Gallery item {index + 1}</p><Actions index={index} count={galleryForm.length} onMove={(direction) => setGalleryForm(reorder(galleryForm, index, direction))} onRemove={() => setGalleryForm(galleryForm.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })))} /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Title" value={item.title} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: e.target.value } : entry))} required /><Field label="Category" value={item.category} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, category: e.target.value } : entry))} required /><Field label="Location" value={item.locationLabel ?? ''} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, locationLabel: e.target.value || null } : entry))} /><Field label="Image URL" value={item.imageUrl ?? ''} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageUrl: e.target.value || null } : entry))} /><Field label="Image alt text" value={item.imageAltText} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageAltText: e.target.value } : entry))} required /><Area label="Description" value={item.description} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, description: e.target.value } : entry))} required /></div><div className="mt-4 flex flex-wrap items-center gap-5"><UploadButton purpose="gallery" onUploaded={(url) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, imageUrl: url } : entry))} /><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isFeatured} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, isFeatured: e.target.checked } : entry))} className="accent-[hsl(var(--accent))]" /> Feature on Home</label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isActive} onChange={(e) => setGalleryForm(galleryForm.map((entry, entryIndex) => entryIndex === index ? { ...entry, isActive: e.target.checked } : entry))} className="accent-[hsl(var(--accent))]" /> Show item</label></div></div>)}</div><button type="button" onClick={() => setGalleryForm([...galleryForm, { ...galleryDefaults[0], title: '', displayOrder: galleryForm.length + 1 }])} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add gallery item</button></EditorCard><SaveStatus error={feedback.error} notice={feedback.notice} /><div className="flex justify-end"><SaveButton pending={updateGallery.isPending}>Save Gallery Preview</SaveButton></div></form></EditorFrame>;
}

export function AdminHomepageFaculty() {
  const copyQuery = useGetAdminHomepagePreviewCopy();
  const copyUpdate = useUpdateHomepagePreviewCopy();
  const client = useQueryClient();
  const feedback = useFeedback();
  const [copyForm, setCopyForm] = useState({ eyebrow: '', heading: '', description: '', buttonLabel: '' });

  useEffect(() => {
    if (copyQuery.data) setCopyForm({
      eyebrow: copyQuery.data.facultyEyebrow,
      heading: copyQuery.data.facultyHeading,
      description: copyQuery.data.facultyDescription,
      buttonLabel: copyQuery.data.facultyButtonLabel,
    });
  }, [copyQuery.data]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    feedback.clear();
    if (![copyForm.eyebrow, copyForm.heading, copyForm.description, copyForm.buttonLabel].every((value) => value.trim())) {
      feedback.setError('Complete each Home Faculty copy field before saving.');
      return;
    }
    copyUpdate.mutate({
      data: {
        facultyEyebrow: copyForm.eyebrow,
        facultyHeading: copyForm.heading,
        facultyDescription: copyForm.description,
        facultyButtonLabel: copyForm.buttonLabel,
        facultyButtonHref: '/faculty',
      },
    }, {
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: getGetAdminHomepagePreviewCopyQueryKey() });
        void client.invalidateQueries({ queryKey: getGetHomepagePreviewCopyQueryKey() });
        feedback.setNotice('Home Faculty copy saved.');
      },
      onError: () => feedback.setError('We could not save the Home Faculty copy.'),
    });
  };

  if (copyQuery.isLoading) return <EditorSkeleton />;
  if (copyQuery.isError && !copyQuery.data) return <LoadError onRetry={() => copyQuery.refetch()} />;

  return (
    <EditorFrame
      eyebrow="Pages / Home / Faculty"
      title="Introduce the faculty preview."
      description="Edit only the copy shown above the selected faculty profiles. Profile details, photos, visibility, and ordering are managed on the Faculty page."
      previewHref="/#home-faculty"
    >
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard title="Home section copy" description="The More Faculty button always links to /faculty.">
          <div className="space-y-4">
            <Field label="Eyebrow" value={copyForm.eyebrow} onChange={(event) => setCopyForm({ ...copyForm, eyebrow: event.target.value })} required />
            <Field label="Heading" value={copyForm.heading} onChange={(event) => setCopyForm({ ...copyForm, heading: event.target.value })} required />
            <Area label="Description" value={copyForm.description} onChange={(event) => setCopyForm({ ...copyForm, description: event.target.value })} required />
            <Field label="Button label" value={copyForm.buttonLabel} onChange={(event) => setCopyForm({ ...copyForm, buttonLabel: event.target.value })} required />
          </div>
        </EditorCard>

        <EditorCard title="Faculty profiles" description="Manage the shared profiles used by both the public Faculty page and the Home preview.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              Select which active profiles appear on Home, update photos, and set separate orders in the Faculty editor.
            </p>
            <a
              href="/admin/pages/faculty"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5"
              data-testid="link-manage-faculty"
            >
              Manage Faculty
            </a>
          </div>
        </EditorCard>

        <SaveStatus error={feedback.error} notice={feedback.notice} />
        <div className="flex justify-end">
          <SaveButton pending={copyUpdate.isPending}>Save Home Faculty copy</SaveButton>
        </div>
      </form>
    </EditorFrame>
  );
}
export function AdminHomepageGallery() {
  const copyQuery = useGetAdminHomepagePreviewCopy();
  const copyUpdate = useUpdateHomepagePreviewCopy();
  const client = useQueryClient();
  const feedback = useFeedback();
  const [copyForm, setCopyForm] = useState({ eyebrow: '', heading: '', description: '', buttonLabel: '', buttonHref: '' });
  useEffect(() => {
    if (copyQuery.data) setCopyForm({
      eyebrow: copyQuery.data.galleryEyebrow,
      heading: copyQuery.data.galleryHeading,
      description: copyQuery.data.galleryDescription,
      buttonLabel: copyQuery.data.galleryButtonLabel,
      buttonHref: copyQuery.data.galleryButtonHref || '/gallery',
    });
  }, [copyQuery.data]);
  const saveCopy = () => {
    if (!copyForm.eyebrow.trim() || !copyForm.heading.trim() || !copyForm.description.trim() || !copyForm.buttonLabel.trim() || !copyForm.buttonHref.trim()) {
      feedback.setError('Complete the Home Gallery copy and CTA fields before saving.');
      return;
    }
    feedback.clear();
    copyUpdate.mutate({ data: { galleryEyebrow: copyForm.eyebrow, galleryHeading: copyForm.heading, galleryDescription: copyForm.description, galleryButtonLabel: copyForm.buttonLabel, galleryButtonHref: copyForm.buttonHref } }, {
      onSuccess: () => {
        client.invalidateQueries({ queryKey: getGetAdminHomepagePreviewCopyQueryKey() });
        client.invalidateQueries({ queryKey: getGetHomepagePreviewCopyQueryKey() });
        feedback.setNotice('Home Gallery copy saved.');
      },
      onError: () => feedback.setError('We could not save the Home Gallery copy.'),
    });
  };
  if (copyQuery.isLoading) return <EditorSkeleton />;
  if (copyQuery.isError && !copyQuery.data) return <LoadError onRetry={() => copyQuery.refetch()} />;
  return <EditorFrame eyebrow="Pages / Home / Gallery Preview" title="Invite families into campus life." description="Keep the Home preview copy focused. Gallery images live in one shared collection so there is only one place to review them." previewHref="/#home-gallery"><div className="mt-10 space-y-6"><SectionCopyFields kind="gallery" eyebrow={copyForm.eyebrow} heading={copyForm.heading} description={copyForm.description} buttonLabel={copyForm.buttonLabel} buttonHref={copyForm.buttonHref} onEyebrowChange={(value) => setCopyForm({ ...copyForm, eyebrow: value })} onHeadingChange={(value) => setCopyForm({ ...copyForm, heading: value })} onDescriptionChange={(value) => setCopyForm({ ...copyForm, description: value })} onButtonLabelChange={(value) => setCopyForm({ ...copyForm, buttonLabel: value })} onButtonHrefChange={(value) => setCopyForm({ ...copyForm, buttonHref: value })} onSave={saveCopy} pending={copyUpdate.isPending} /><div className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-[hsl(var(--primary))]">Home preview images</p><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Gallery images are managed in Pages → Gallery.</p></div><a href="/admin/pages/gallery" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="link-manage-gallery-items">Manage Gallery Items</a></div><SaveStatus error={feedback.error} notice={feedback.notice} /></div></EditorFrame>;
}