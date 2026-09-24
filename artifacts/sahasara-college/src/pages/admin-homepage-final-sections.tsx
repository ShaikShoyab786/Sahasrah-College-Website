import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminHomepageAdmissionsFaqQueryKey,
  getGetAdminHomepageFinalCtaQueryKey,
  getGetAdminHomepageKnowledgeHubQueryKey,
  getGetHomepageAdmissionsFaqQueryKey,
  getGetHomepageFinalCtaQueryKey,
  getGetHomepageKnowledgeHubQueryKey,
  useGetAdminHomepageAdmissionsFaq,
  useGetAdminHomepageFinalCta,
  useGetAdminHomepageKnowledgeHub,
  useUpdateHomepageAdmissionsFaq,
  useUpdateHomepageFinalCta,
  useUpdateHomepageKnowledgeHub,
  useUploadAdminImage,
  type HomepageAdmissionsFaqInput,
  type HomepageFinalCtaInput,
  type HomepageKnowledgeHubInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, ImageField, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const knowledgeDefaults: HomepageKnowledgeHubInput = {
  eyebrow: 'Knowledge Hub',
  heading: 'Your Digital Learning Library',
  description: 'Study materials, expert guidance, exam updates, and practical resources for JEE and NEET aspirants.',
  buttonLabel: 'View All Resources',
  buttonHref: '/#home-knowledge-hub',
  isVisible: true,
  sortOrder: 11,
  resources: [
    { title: 'Complete Target JEE Question Bank', description: '5,000+ handpicked questions with weightage analysis, difficulty ratings, and detailed solutions.', category: 'Featured', thumbnailUrl: null, thumbnailAltText: 'Open study book and notes for JEE preparation', icon: 'file-text', fileSize: '8.4 MB', downloadCount: 5200, updatedLabel: 'Updated Jun 2026', resourceUrl: '/#home-knowledge-hub', isFeatured: true, isActive: true, displayOrder: 1 },
    { title: 'Complete Physics Mechanics Master Notes', description: 'Concept-first notes covering kinematics, laws of motion, and rotational dynamics.', category: 'Physics', thumbnailUrl: null, thumbnailAltText: 'Physics resource document icon', icon: 'file-text', fileSize: '4.2 MB', downloadCount: 12500, updatedLabel: 'Updated Oct 2023', resourceUrl: '/#home-knowledge-hub', isFeatured: false, isActive: true, displayOrder: 2 },
    { title: 'Organic Chemistry Reaction Mechanisms', description: 'Visual guidance to the reaction mechanisms required for NEET and JEE Advanced.', category: 'Chemistry', thumbnailUrl: null, thumbnailAltText: 'Chemistry resource document icon', icon: 'file-text', fileSize: '3.8 MB', downloadCount: 8300, updatedLabel: 'Updated Nov 2023', resourceUrl: '/#home-knowledge-hub', isFeatured: false, isActive: true, displayOrder: 3 },
  ],
};

const faqDefaults: HomepageAdmissionsFaqInput = {
  eyebrow: 'Admissions FAQ',
  heading: 'Common Questions, Clear Answers',
  description: 'Everything you need to know about joining Sahsrah Junior College.',
  ctaLabel: 'Still have a question? Talk to admissions',
  ctaHref: '/contact',
  isVisible: true,
  sortOrder: 12,
  questions: [
    { question: 'Why should I choose Sahsrah over other junior colleges?', answer: 'We combine focused concept learning with personal mentorship, regular feedback, and a supportive environment that helps students build confidence without losing sight of their goals.', displayOrder: 1, isVisible: true },
    { question: 'Do you offer integrated coaching for IIT-JEE and NEET?', answer: 'Yes. Our MPC and BiPC pathways include integrated preparation, guided practice, regular tests, and subject support for ambitious IIT-JEE and NEET goals.', displayOrder: 2, isVisible: true },
    { question: 'What is the student-to-teacher ratio?', answer: 'We keep groups focused so teachers can notice individual progress, answer questions, and give students useful feedback throughout the academic year.', displayOrder: 3, isVisible: true },
  ],
};

const ctaDefaults: HomepageFinalCtaInput = {
  eyebrow: 'Join Sahsrah College',
  heading: 'Seats Are Limited. Admissions Are Open.',
  supportingText: 'Give your child the advantage of personal mentorship from experienced faculty and integrated IIT-JEE and NEET preparation. Limited admission availability for the new academic year.',
  applyButtonLabel: 'Apply Now',
  applyButtonHref: '/contact',
  phoneButtonLabel: 'Call Admission Office',
  phoneNumber: '',
  backgroundImage: null,
  backgroundImageAltText: 'Students walking across a college campus',
  backgroundOverlay: true,
  isVisible: true,
  sortOrder: 13,
};

function reorder<T extends { displayOrder: number }>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return items;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 }));
}

function Actions({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (direction: -1 | 1) => void; onRemove: () => void }) {
  return <div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-lg p-2 disabled:opacity-25" aria-label="Move item up"><ArrowUp size={15} /></button><button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="rounded-lg p-2 disabled:opacity-25" aria-label="Move item down"><ArrowDown size={15} /></button><button type="button" disabled={count <= 1} onClick={onRemove} className="rounded-lg p-2 text-[hsl(var(--destructive))] disabled:opacity-25" aria-label="Delete item"><Trash2 size={15} /></button></div>;
}

function useFeedback() {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  return { notice, error, setNotice, setError, clear: () => { setNotice(''); setError(''); } };
}

function UploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const upload = useUploadAdminImage();
  const handle = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) upload.mutate({ data: { file, purpose: 'knowledge' } }, { onSuccess: (result) => onUploaded(result.url) });
  };
  return <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 text-xs font-bold"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handle} />{upload.isPending ? 'Uploading…' : <><ImagePlus size={14} /> Upload thumbnail</>}</label>;
}

export function AdminHomepageKnowledgeHub() {
  const query = useGetAdminHomepageKnowledgeHub();
  const update = useUpdateHomepageKnowledgeHub();
  const client = useQueryClient();
  const feedback = useFeedback();
  const [form, setForm] = useState(knowledgeDefaults);
   useEffect(() => { if (query.data) setForm({ eyebrow: query.data.eyebrow, heading: query.data.heading, description: query.data.description, buttonLabel: query.data.buttonLabel, buttonHref: query.data.buttonHref, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder, resources: query.data.resources.map(({ id: _id, ...item }) => item) }); }, [query.data]);
  const setResource = (index: number, patch: Partial<HomepageKnowledgeHubInput['resources'][number]>) => setForm((current) => ({ ...current, resources: current.resources.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const submit = (event: FormEvent) => { event.preventDefault(); feedback.clear(); update.mutate({ data: form }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetAdminHomepageKnowledgeHubQueryKey() }); client.invalidateQueries({ queryKey: getGetHomepageKnowledgeHubQueryKey() }); feedback.setNotice('Knowledge Hub preview saved.'); }, onError: () => feedback.setError('We could not save the Knowledge Hub preview. Check links and ordering.') }); };
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Home / Knowledge Hub" title="Give families a useful first look." description="Manage a compact resource preview without building the full Knowledge Hub page or a fake search experience." previewHref="/#home-knowledge-hub"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard title="Section introduction" description="This copy appears above the resource preview and category controls."><div className="space-y-4"><Field label="Eyebrow" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} required /><Field label="Heading" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} required /><Area label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><Field label="Section CTA label" value={form.buttonLabel} onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })} required /><Field label="Section CTA link" value={form.buttonHref} onChange={(e) => setForm({ ...form, buttonHref: e.target.value })} required /></div></EditorCard><EditorCard title="Preview resources" description="Use real configured links. The first featured item gets the larger card; only one featured item is selected in this editor."><div className="space-y-5">{form.resources.map((item, index) => <div key={index} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex justify-between"><p className="text-xs font-bold uppercase tracking-[.16em]">Resource {index + 1}</p><Actions index={index} count={form.resources.length} onMove={(direction) => setForm({ ...form, resources: reorder(form.resources, index, direction) })} onRemove={() => setForm({ ...form, resources: form.resources.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })) })} /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Title" value={item.title} onChange={(e) => setResource(index, { title: e.target.value })} required /><Field label="Category" value={item.category} onChange={(e) => setResource(index, { category: e.target.value })} required /><Area label="Description" value={item.description} onChange={(e) => setResource(index, { description: e.target.value })} required /><Field label="Resource link" value={item.resourceUrl} onChange={(e) => setResource(index, { resourceUrl: e.target.value })} placeholder="/#home-knowledge-hub or https://…" required /><Field label="Thumbnail URL" value={item.thumbnailUrl ?? ''} onChange={(e) => setResource(index, { thumbnailUrl: e.target.value || null })} /><Field label="Thumbnail alt text" value={item.thumbnailAltText} onChange={(e) => setResource(index, { thumbnailAltText: e.target.value })} required /><Field label="File size" value={item.fileSize ?? ''} onChange={(e) => setResource(index, { fileSize: e.target.value || null })} /><Field label="Download count" type="number" min={0} value={item.downloadCount ?? ''} onChange={(e) => setResource(index, { downloadCount: e.target.value === '' ? null : Number(e.target.value) })} /><Field label="Updated label" value={item.updatedLabel ?? ''} onChange={(e) => setResource(index, { updatedLabel: e.target.value || null })} /><Field label="Icon name" value={item.icon ?? ''} onChange={(e) => setResource(index, { icon: e.target.value || null })} /></div><div className="mt-4 flex flex-wrap items-center gap-5"><UploadButton onUploaded={(url) => setResource(index, { thumbnailUrl: url })} /><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isFeatured} onChange={(e) => setForm({ ...form, resources: form.resources.map((entry, itemIndex) => ({ ...entry, isFeatured: itemIndex === index ? e.target.checked : false })) })} className="accent-[hsl(var(--accent))]" /> Featured resource</label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isActive} onChange={(e) => setResource(index, { isActive: e.target.checked })} className="accent-[hsl(var(--accent))]" /> Show resource</label></div></div>)}</div><button type="button" onClick={() => setForm({ ...form, resources: [...form.resources, { ...knowledgeDefaults.resources[0], title: '', description: '', isFeatured: false, displayOrder: form.resources.length + 1 }] })} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add resource</button></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show Knowledge Hub preview on the public homepage" /><SaveStatus error={feedback.error} notice={feedback.notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Knowledge Hub</SaveButton></div></form></EditorFrame>;
}

export function AdminHomepageAdmissionsFaq() {
  const query = useGetAdminHomepageAdmissionsFaq();
  const update = useUpdateHomepageAdmissionsFaq();
  const client = useQueryClient();
  const feedback = useFeedback();
  const [form, setForm] = useState(faqDefaults);
   useEffect(() => { if (query.data) setForm({ eyebrow: query.data.eyebrow, heading: query.data.heading, description: query.data.description, ctaLabel: query.data.ctaLabel, ctaHref: query.data.ctaHref, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder, questions: query.data.questions.map(({ id: _id, ...item }) => item) }); }, [query.data]);
  const setQuestion = (index: number, patch: Partial<HomepageAdmissionsFaqInput['questions'][number]>) => setForm((current) => ({ ...current, questions: current.questions.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const submit = (event: FormEvent) => { event.preventDefault(); feedback.clear(); update.mutate({ data: form }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetAdminHomepageAdmissionsFaqQueryKey() }); client.invalidateQueries({ queryKey: getGetHomepageAdmissionsFaqQueryKey() }); feedback.setNotice('Admissions FAQ saved.'); }, onError: () => feedback.setError('We could not save the FAQ. Every visible question needs an answer.') }); };
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Home / Admissions FAQ" title="Answer the questions families ask first." description="This is a Home-only FAQ collection. It stays independent from the completed About FAQ page." previewHref="/#home-admissions-faq"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard title="Section introduction" description="Keep the preview clear and shorter than the full About FAQ page."><div className="space-y-4"><Field label="Eyebrow" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} required /><Field label="Heading" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} required /><Area label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><Field label="CTA label" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} required /><Field label="CTA link" value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} required /></div></EditorCard><EditorCard title="Questions and answers" description="Reorder, hide, or remove questions. Empty questions and answers cannot be published."><div className="space-y-5">{form.questions.map((item, index) => <div key={index} className="rounded-2xl bg-[hsl(var(--secondary))] p-5"><div className="flex justify-between"><p className="text-xs font-bold uppercase tracking-[.16em]">Question {index + 1}</p><Actions index={index} count={form.questions.length} onMove={(direction) => setForm({ ...form, questions: reorder(form.questions, index, direction) })} onRemove={() => setForm({ ...form, questions: form.questions.filter((_, itemIndex) => itemIndex !== index).map((entry, itemIndex) => ({ ...entry, displayOrder: itemIndex + 1 })) })} /></div><div className="mt-4 space-y-4"><Field label="Question" value={item.question} onChange={(e) => setQuestion(index, { question: e.target.value })} required /><Area label="Answer" value={item.answer} onChange={(e) => setQuestion(index, { answer: e.target.value })} required /><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isVisible} onChange={(e) => setQuestion(index, { isVisible: e.target.checked })} className="accent-[hsl(var(--accent))]" /> Show question</label></div></div>)}</div><button type="button" onClick={() => setForm({ ...form, questions: [...form.questions, { ...faqDefaults.questions[0], question: '', answer: '', displayOrder: form.questions.length + 1 }] })} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add question</button></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show Admissions FAQ on the public homepage" /><SaveStatus error={feedback.error} notice={feedback.notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Admissions FAQ</SaveButton></div></form></EditorFrame>;
}

export function AdminHomepageFinalCta() {
  const query = useGetAdminHomepageFinalCta();
  const update = useUpdateHomepageFinalCta();
  const client = useQueryClient();
  const feedback = useFeedback();
  const [form, setForm] = useState(ctaDefaults);
  const [uploading, setUploading] = useState(false);
  const upload = useUploadAdminImage();
  useEffect(() => { if (query.data) setForm({ eyebrow: query.data.eyebrow, heading: query.data.heading, supportingText: query.data.supportingText, applyButtonLabel: query.data.applyButtonLabel, applyButtonHref: query.data.applyButtonHref, phoneButtonLabel: query.data.phoneButtonLabel, phoneNumber: query.data.phoneNumber, backgroundImage: query.data.backgroundImage, backgroundImageAltText: query.data.backgroundImageAltText, backgroundOverlay: query.data.backgroundOverlay, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder }); }, [query.data]);
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setUploading(true); upload.mutate({ data: { file, purpose: 'cta' } }, { onSuccess: (result) => { setForm({ ...form, backgroundImage: result.url }); setUploading(false); }, onError: () => setUploading(false) }); };
  const submit = (event: FormEvent) => { event.preventDefault(); feedback.clear(); update.mutate({ data: form }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetAdminHomepageFinalCtaQueryKey() }); client.invalidateQueries({ queryKey: getGetHomepageFinalCtaQueryKey() }); feedback.setNotice('Final admission CTA saved.'); }, onError: () => feedback.setError('We could not save the final CTA. Check the application link and phone number.') }); };
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Home / Final Admission CTA" title="Make the next step clear." description="Keep one decisive application action and one configured phone action at the end of the homepage." previewHref="/#home-final-cta"><form onSubmit={submit} className="mt-10 space-y-6"><EditorCard title="CTA copy" description="Use specific, calm urgency. The Apply link must point to a valid configured route."><div className="space-y-4"><Field label="Eyebrow" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} required /><Field label="Heading" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} required /><Area label="Supporting text" value={form.supportingText} onChange={(e) => setForm({ ...form, supportingText: e.target.value })} required /></div></EditorCard><EditorCard title="Actions" description="Leave the phone number blank to use the number in Site Settings."><div className="grid gap-4 md:grid-cols-2"><Field label="Apply button label" value={form.applyButtonLabel} onChange={(e) => setForm({ ...form, applyButtonLabel: e.target.value })} required /><Field label="Apply link" value={form.applyButtonHref} onChange={(e) => setForm({ ...form, applyButtonHref: e.target.value })} placeholder="/#contact" required /><Field label="Phone button label" value={form.phoneButtonLabel} onChange={(e) => setForm({ ...form, phoneButtonLabel: e.target.value })} required /><Field label="Phone number override" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="Leave blank to use Site Settings" /></div></EditorCard><EditorCard title="Optional background image" description="Use a warm campus image with a descriptive alt text."><ImageField label="Background image" image={form.backgroundImage} alt={form.backgroundImageAltText} uploading={uploading} onUpload={handleUpload} onUrlChange={(value) => setForm({ ...form, backgroundImage: value || null })} onAltChange={(value) => setForm({ ...form, backgroundImageAltText: value })} /><label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.backgroundOverlay} onChange={(e) => setForm({ ...form, backgroundOverlay: e.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Use readable overlay</label></EditorCard><VisibilityToggle checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} label="Show final admission CTA on the public homepage" /><SaveStatus error={feedback.error} notice={feedback.notice} /><div className="flex justify-end"><SaveButton pending={update.isPending}>Save Final CTA</SaveButton></div></form></EditorFrame>;
}