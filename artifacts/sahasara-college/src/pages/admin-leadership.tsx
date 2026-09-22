import { useEffect, useState } from 'react';
import { ImagePlus, Plus, UsersRound, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAboutLeadershipQueryKey,
  getGetAdminAboutLeadershipQueryKey,
  useGetAdminAboutLeadership,
  useUpdateAboutLeadership,
  useUploadAdminImage,
  type AboutLeadershipInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, ImageField, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const emptyForm: AboutLeadershipInput = {
  heading: 'Our Leadership',
  description: 'Meet the people who help Sahasara stay focused on thoughtful teaching, student care, and meaningful progress.',
  isVisible: true,
  sortOrder: 6,
  members: [
    { portraitImage: null, portraitAltText: 'Portrait placeholder for the Sahasara chairperson', name: 'Chairperson Placeholder', designation: 'Chairperson', qualification: 'Qualification placeholder', biography: '', socialUrl: null, displayOrder: 1, isVisible: true },
    { portraitImage: null, portraitAltText: 'Portrait placeholder for the Sahasara academic director', name: 'Academic Director Placeholder', designation: 'Academic Director', qualification: 'Qualification placeholder', biography: '', socialUrl: null, displayOrder: 2, isVisible: true },
    { portraitImage: null, portraitAltText: 'Portrait placeholder for the Sahasara director', name: 'Director Placeholder', designation: 'Director', qualification: 'Qualification placeholder', biography: '', socialUrl: null, displayOrder: 3, isVisible: true },
    { portraitImage: null, portraitAltText: 'Portrait placeholder for the Sahasara dean', name: 'Dean Placeholder', designation: 'Dean', qualification: 'Qualification placeholder', biography: '', socialUrl: null, displayOrder: 4, isVisible: true },
  ],
};

export default function AdminLeadership() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutLeadership();
  const update = useUpdateAboutLeadership();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<AboutLeadershipInput>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    if (query.data) {
      setForm({
        heading: query.data.heading,
        description: query.data.description,
        isVisible: query.data.isVisible,
        sortOrder: query.data.sortOrder,
        members: query.data.members.map(({ portraitImage, portraitAltText, name, designation, qualification, biography, socialUrl, displayOrder, isVisible }) => ({ portraitImage, portraitAltText, name, designation, qualification, biography, socialUrl, displayOrder, isVisible })),
      });
    }
  }, [query.data]);

  const setField = <K extends keyof AboutLeadershipInput>(key: K, value: AboutLeadershipInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setMember = (index: number, key: keyof AboutLeadershipInput['members'][number], value: string | boolean | number | null) => setForm((current) => ({ ...current, members: current.members.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const moveMember = (index: number, direction: -1 | 1) => setForm((current) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= current.members.length) return current;
    const members = [...current.members];
    [members[index], members[nextIndex]] = [members[nextIndex], members[index]];
    return { ...current, members: members.map((member, itemIndex) => ({ ...member, displayOrder: itemIndex + 1 })) };
  });
  const handleUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(index);
    upload.mutate({ data: { file, purpose: 'hero' } }, {
      onSuccess: (result) => { setMember(index, 'portraitImage', result.url); setUploading(null); setNotice('Portrait uploaded. Save Leadership to publish it.'); },
      onError: () => { setUploading(null); setError('That portrait could not be uploaded.'); },
    });
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');
    update.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAboutLeadershipQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAboutLeadershipQueryKey() });
        setNotice(form.isVisible ? 'Leadership saved and visible on the public page.' : 'Leadership saved and hidden from the public page.');
      },
      onError: () => setError('We could not save Leadership. Check the fields and try again.'),
    });
  };
  const addMember = () => {
    if (form.members.length >= 20) return;
    setForm((current) => ({ ...current, members: [...current.members, { portraitImage: null, portraitAltText: 'Portrait placeholder for a Sahasara leader', name: 'New leader', designation: 'Designation', qualification: 'Qualification', biography: '', socialUrl: null, displayOrder: current.members.length + 1, isVisible: true }] }));
  };
  const removeMember = (index: number) => {
    if (form.members.length <= 1) return;
    setForm((current) => ({ ...current, members: current.members.filter((_, itemIndex) => itemIndex !== index).map((member, itemIndex) => ({ ...member, displayOrder: itemIndex + 1 })) }));
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return (
    <EditorFrame eyebrow="Pages / About / Leadership" title="Introduce the people behind the work." description="Add approved portraits and clear responsibilities without using reference-site people or content." previewHref="/about#leadership">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<UsersRound size={19} />} title="Section introduction" description="This heading and description are shown above the leadership cards.">
          <div className="space-y-5"><Field id="leadership-heading" label="Section heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required /><Area id="leadership-description" label="Section description" value={form.description} onChange={(event) => setField('description', event.target.value)} required /></div>
        </EditorCard>
        <EditorCard icon={<ImagePlus size={19} />} title="Leadership members" description="Portraits use the existing authenticated upload flow. Leave an image empty to show an accessible placeholder.">
          <div className="space-y-6">{form.members.map((member, index) => <div key={`${member.displayOrder}-${index}`} className="rounded-xl bg-[hsl(var(--secondary))] p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Member {index + 1}</p><div className="flex items-center gap-3"><button type="button" onClick={() => moveMember(index, -1)} disabled={index === 0} className="text-xs font-bold disabled:opacity-30">Up</button><button type="button" onClick={() => moveMember(index, 1)} disabled={index === form.members.length - 1} className="text-xs font-bold disabled:opacity-30">Down</button><button type="button" onClick={() => removeMember(index)} disabled={form.members.length <= 1} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--destructive))] disabled:opacity-30"><Trash2 size={14} /> Remove</button></div></div><div className="mt-5"><ImageField label={`${member.name || 'Leadership member'} portrait`} image={member.portraitImage} alt={member.portraitAltText} uploading={uploading === index} onUpload={(event) => handleUpload(index, event)} onUrlChange={(value) => setMember(index, 'portraitImage', value || null)} onAltChange={(value) => setMember(index, 'portraitAltText', value)} /></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field id={`leader-${index}-name`} label="Name" value={member.name} onChange={(event) => setMember(index, 'name', event.target.value)} required /><Field id={`leader-${index}-designation`} label="Designation" value={member.designation} onChange={(event) => setMember(index, 'designation', event.target.value)} required /><Field id={`leader-${index}-qualification`} label="Qualification" value={member.qualification} onChange={(event) => setMember(index, 'qualification', event.target.value)} /><Field id={`leader-${index}-social`} label="Optional social/contact URL" type="url" value={member.socialUrl ?? ''} onChange={(event) => setMember(index, 'socialUrl', event.target.value || null)} /></div><div className="mt-4"><Area id={`leader-${index}-biography`} label="Responsibility description" value={member.biography} onChange={(event) => setMember(index, 'biography', event.target.value)} required /></div><div className="mt-4 grid gap-4 md:grid-cols-[.25fr_1fr]"><Field id={`leader-${index}-order`} label="Order" type="number" min={1} max={20} value={member.displayOrder} onChange={(event) => setMember(index, 'displayOrder', Number(event.target.value))} required /><label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold"><input type="checkbox" checked={member.isVisible} onChange={(event) => setMember(index, 'isVisible', event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show this member</label></div></div>)}<button type="button" onClick={addMember} disabled={form.members.length >= 20} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] disabled:opacity-40"><Plus size={17} /> Add member</button></div>
        </EditorCard>
        <VisibilityToggle checked={form.isVisible} onChange={(value) => setField('isVisible', value)} label="Show Leadership on the public page" />
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-leadership">Save Leadership</SaveButton></div>
      </form>
    </EditorFrame>
  );
}