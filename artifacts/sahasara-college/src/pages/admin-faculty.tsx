import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminFacultyQueryKey,
  getGetFacultyPageQueryKey,
  getGetHomepageFacultyQueryKey,
  useCreateAdminFacultyMember,
  useDeleteAdminFacultyMember,
  useGetAdminFaculty,
  useUpdateAdminFacultyMember,
  useUpdateAdminFacultyOrder,
  useUpdateAdminFacultySettings,
  useUploadAdminImage,
  type AdminFacultyMember,
  type FacultyMemberInput,
  type FacultyPageSettingsInput,
  type FacultySocialLink,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const EMPTY_MEMBER: FacultyMemberInput = {
  imageUrl: null,
  imageAltText: 'Faculty portrait',
  name: '',
  role: '',
  subject: '',
  qualification: '',
  experience: '',
  biography: '',
  socialLinks: [],
  displayOrder: 1,
  isActive: true,
  showInHomePreview: false,
  homePreviewOrder: 1,
};

type AdminFacultyDraft = AdminFacultyMember & { _form: FacultyMemberInput };

function toInput(member: AdminFacultyMember): FacultyMemberInput {
  return {
    imageUrl: member.imageUrl,
    imageAltText: member.imageAltText,
    name: member.name,
    role: member.role,
    subject: member.subject,
    qualification: member.qualification,
    experience: member.experience,
    biography: member.biography,
    socialLinks: member.socialLinks,
    displayOrder: member.displayOrder,
    isActive: member.isActive,
    showInHomePreview: member.showInHomePreview,
    homePreviewOrder: member.homePreviewOrder,
  };
}

function NumberField({
  id,
  label,
  value,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-semibold text-[hsl(var(--foreground))]">
      {label}
      <input
        id={id}
        type="number"
        min={1}
        max={1000}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
        className="mt-2 min-h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/.2)] disabled:cursor-not-allowed disabled:opacity-55"
      />
    </label>
  );
}

function FacultyImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const upload = useUploadAdminImage();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate({ data: { file, purpose: 'faculty' } }, {
      onSuccess: (result) => onUploaded(result.url),
    });
    event.target.value = '';
  };

  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 text-xs font-bold text-[hsl(var(--primary))] transition hover:border-[hsl(var(--accent))]">
      <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleChange} />
      {upload.isPending ? 'Uploading…' : <><ImagePlus size={14} aria-hidden="true" /> Upload image</>}
    </label>
  );
}

function ProfileFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: FacultyMemberInput;
  onChange: (patch: Partial<FacultyMemberInput>) => void;
}) {
  const setSocialLink = (index: number, patch: Partial<FacultySocialLink>) => {
    onChange({
      socialLinks: value.socialLinks.map((link, itemIndex) => itemIndex === index ? { ...link, ...patch } : link),
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id={`${idPrefix}-name`} label="Name" value={value.name} onChange={(event) => onChange({ name: event.target.value })} required />
        <Field id={`${idPrefix}-role`} label="Role" value={value.role} onChange={(event) => onChange({ role: event.target.value })} required />
        <Field id={`${idPrefix}-subject`} label="Subject" value={value.subject} onChange={(event) => onChange({ subject: event.target.value })} />
        <Field id={`${idPrefix}-qualification`} label="Qualification" value={value.qualification} onChange={(event) => onChange({ qualification: event.target.value })} />
        <Field id={`${idPrefix}-experience`} label="Experience" value={value.experience} onChange={(event) => onChange({ experience: event.target.value })} />
        <Field id={`${idPrefix}-image-url`} label="Image URL" value={value.imageUrl ?? ''} onChange={(event) => onChange({ imageUrl: event.target.value || null })} />
        <div className="md:col-span-2">
          <Field id={`${idPrefix}-image-alt`} label="Image alt text" value={value.imageAltText} onChange={(event) => onChange({ imageAltText: event.target.value })} required />
        </div>
        <div className="md:col-span-2">
          <Area id={`${idPrefix}-biography`} label="Biography" value={value.biography} onChange={(event) => onChange({ biography: event.target.value })} />
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-[hsl(var(--primary))]">Social links</h4>
            <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Only secure web links are shown publicly.</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ socialLinks: [...value.socialLinks, { label: '', href: '' }] })}
            disabled={value.socialLinks.length >= 10}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-bold text-[hsl(var(--primary))] disabled:opacity-50"
          >
            <Plus size={14} aria-hidden="true" /> Add link
          </button>
        </div>
        {value.socialLinks.length > 0 && (
          <div className="mt-4 space-y-3">
            {value.socialLinks.map((link, index) => (
              <div key={`${idPrefix}-social-${index}`} className="grid gap-3 sm:grid-cols-[.7fr_1.3fr_auto]">
                <Field label="Label" value={link.label} onChange={(event) => setSocialLink(index, { label: event.target.value })} required />
                <Field label="URL" value={link.href} onChange={(event) => setSocialLink(index, { href: event.target.value })} required />
                <button
                  type="button"
                  aria-label={`Remove social link ${index + 1}`}
                  onClick={() => onChange({ socialLinks: value.socialLinks.filter((_, itemIndex) => itemIndex !== index) })}
                  className="mt-6 grid h-10 w-10 place-items-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-red-300 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminFaculty() {
  const query = useGetAdminFaculty();
  const updateSettings = useUpdateAdminFacultySettings();
  const createMember = useCreateAdminFacultyMember();
  const updateMember = useUpdateAdminFacultyMember();
  const deleteMember = useDeleteAdminFacultyMember();
  const updateOrder = useUpdateAdminFacultyOrder();
  const client = useQueryClient();
  const [settings, setSettings] = useState<FacultyPageSettingsInput>({ eyebrow: '', heading: '', description: '' });
  const [draft, setDraft] = useState<FacultyMemberInput>(EMPTY_MEMBER);
  const [members, setMembers] = useState<AdminFacultyDraft[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.data) return;
    setSettings(query.data.settings);
    setMembers(query.data.members.map((member) => ({ ...member, _form: toInput(member) })));
  }, [query.data]);

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: getGetAdminFacultyQueryKey() });
    void client.invalidateQueries({ queryKey: getGetFacultyPageQueryKey() });
    void client.invalidateQueries({ queryKey: getGetHomepageFacultyQueryKey() });
  };

  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    setError('');
    updateSettings.mutate({ data: settings }, {
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: getGetAdminFacultyQueryKey() });
        void client.invalidateQueries({ queryKey: getGetFacultyPageQueryKey() });
        setNotice('Faculty page introduction saved.');
      },
      onError: () => setError('We could not save the Faculty page introduction.'),
    });
  };

  const saveMember = (member: AdminFacultyDraft) => {
    setNotice('');
    setError('');
    updateMember.mutate({ id: member.id, data: member._form }, {
      onSuccess: () => {
        invalidate();
        setNotice(`${member._form.name || 'Faculty profile'} saved.`);
      },
      onError: () => setError(`We could not save ${member._form.name || 'this faculty profile'}. Check the required fields and social links.`),
    });
  };

  const submitDraft = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    setError('');
    createMember.mutate({ data: draft }, {
      onSuccess: () => {
        invalidate();
        setDraft({ ...EMPTY_MEMBER, displayOrder: members.length + 2, homePreviewOrder: members.length + 2 });
        setNotice('Faculty profile added.');
      },
      onError: () => setError('We could not add the faculty profile. Check the required fields and social links.'),
    });
  };

  const saveOrder = () => {
    setNotice('');
    setError('');
    updateOrder.mutate({
      data: {
        items: members.map(({ id, _form }) => ({
          id,
          displayOrder: _form.displayOrder,
          homePreviewOrder: _form.homePreviewOrder,
        })),
      },
    }, {
      onSuccess: () => {
        invalidate();
        setNotice('Faculty page and Home preview order saved.');
      },
      onError: () => setError('We could not save the order. Use a unique position for each page profile and each Home-selected profile.'),
    });
  };

  const removeMember = (member: AdminFacultyMember) => {
    if (!window.confirm(`Delete ${member.name} from the Faculty collection? This does not change About leadership records.`)) return;
    setNotice('');
    setError('');
    deleteMember.mutate({ id: member.id }, {
      onSuccess: () => {
        invalidate();
        setNotice(`${member.name} deleted from the Faculty collection.`);
      },
      onError: () => setError(`We could not delete ${member.name}.`),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;

  return (
    <EditorFrame
      eyebrow="Pages / Faculty"
      title="Introduce the people who guide learning."
      description="Manage the shared faculty collection used by the public Faculty page and the selected Home preview. Changes here do not edit About leadership records."
      previewHref="/faculty"
    >
      <div className="mt-10 space-y-6">
        <EditorCard title="Faculty page introduction" description="This copy appears above every active profile on /faculty.">
          <form onSubmit={saveSettings} className="space-y-4">
            <Field label="Eyebrow" value={settings.eyebrow} onChange={(event) => setSettings({ ...settings, eyebrow: event.target.value })} required />
            <Field label="Heading" value={settings.heading} onChange={(event) => setSettings({ ...settings, heading: event.target.value })} required />
            <Area label="Description" value={settings.description} onChange={(event) => setSettings({ ...settings, description: event.target.value })} required />
            <div className="flex justify-end"><SaveButton pending={updateSettings.isPending}>Save Faculty page copy</SaveButton></div>
          </form>
        </EditorCard>

        <EditorCard title="Add a faculty profile" description="Profiles added here appear on /faculty when active. Choose Home preview selection separately.">
          <form onSubmit={submitDraft} className="space-y-5">
            <ProfileFields idPrefix="new-faculty" value={draft} onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))} />
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-5">
              <FacultyImageUpload onUploaded={(imageUrl) => setDraft((current) => ({ ...current, imageUrl }))} />
              <button type="submit" disabled={createMember.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-60">
                <Plus size={16} aria-hidden="true" /> {createMember.isPending ? 'Adding…' : 'Add profile'}
              </button>
            </div>
          </form>
        </EditorCard>

        <EditorCard title={`Faculty profiles (${members.length})`} description="Update profile details and visibility here. Full-page order and Home preview order are separate.">
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[hsl(var(--primary))]">Save ordering separately</p>
              <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Profile changes save individually. This saves both order lists and validates duplicate positions.</p>
            </div>
            <button type="button" onClick={saveOrder} disabled={!members.length || updateOrder.isPending} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-60">
              {updateOrder.isPending ? 'Saving order…' : 'Save both order lists'}
            </button>
          </div>

          {members.length ? (
            <div className="space-y-5">
              {members.map((member, index) => (
                <form
                  key={member.id}
                  onSubmit={(event) => { event.preventDefault(); saveMember(member); }}
                  className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 sm:p-6"
                >
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[hsl(var(--primary))]">{member._form.name || `Faculty member ${index + 1}`}</h3>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{member._form.role || 'Faculty profile'}</p>
                    </div>
                    <button type="button" onClick={() => removeMember(member)} disabled={deleteMember.isPending} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
                      <Trash2 size={14} aria-hidden="true" /> Delete profile
                    </button>
                  </div>
                  <ProfileFields
                    idPrefix={`faculty-${member.id}`}
                    value={member._form}
                    onChange={(patch) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, _form: { ...item._form, ...patch } } : item))}
                  />
                  <div className="mt-5 grid gap-4 border-t border-[hsl(var(--border))] pt-5 sm:grid-cols-2">
                    <NumberField
                      id={`faculty-${member.id}-page-order`}
                      label="Faculty page order"
                      value={member._form.displayOrder}
                      onChange={(displayOrder) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, _form: { ...item._form, displayOrder } } : item))}
                    />
                    <NumberField
                      id={`faculty-${member.id}-home-order`}
                      label="Home preview order"
                      value={member._form.homePreviewOrder}
                      disabled={!member._form.showInHomePreview}
                      onChange={(homePreviewOrder) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, _form: { ...item._form, homePreviewOrder } } : item))}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                      <input type="checkbox" checked={member._form.isActive} onChange={(event) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, _form: { ...item._form, isActive: event.target.checked } } : item))} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                      Show on Faculty page
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                      <input type="checkbox" checked={member._form.showInHomePreview} onChange={(event) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, _form: { ...item._form, showInHomePreview: event.target.checked } } : item))} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                      Select for Home preview
                    </label>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-5">
                    <FacultyImageUpload onUploaded={(imageUrl) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, _form: { ...item._form, imageUrl } } : item))} />
                    <button type="submit" disabled={updateMember.isPending} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-60">
                      {updateMember.isPending ? 'Saving…' : 'Save profile'}
                    </button>
                  </div>
                </form>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] px-5 py-10 text-center">
              <p className="font-semibold text-[hsl(var(--primary))]">No profiles in this collection yet.</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Add a profile above to build the Faculty page and Home preview.</p>
            </div>
          )}
        </EditorCard>

        <SaveStatus error={error} notice={notice} />
      </div>
    </EditorFrame>
  );
}