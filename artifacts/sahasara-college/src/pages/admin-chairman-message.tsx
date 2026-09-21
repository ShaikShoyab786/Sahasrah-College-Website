import { useEffect, useState } from 'react';
import { ImagePlus, MessageSquareQuote } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAboutChairmanMessageQueryKey,
  getGetAdminAboutChairmanMessageQueryKey,
  useGetAdminAboutChairmanMessage,
  useUpdateAboutChairmanMessage,
  useUploadAdminImage,
  type AboutChairmanMessageInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, ImageField, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const emptyForm: AboutChairmanMessageInput = {
  eyebrow: "CHAIRMAN'S MESSAGE",
  heading: 'Education is the foundation of every meaningful future.',
  message: '',
  signatureName: 'Sahasara Leadership',
  role: 'Chairman',
  portraitImage: null,
  portraitAltText: '',
  buttonLabel: 'Read the Full Message',
  buttonHref: '#contact',
  buttonVisible: false,
  isVisible: true,
  sortOrder: 3,
};

export default function AdminChairmanMessage() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutChairmanMessage();
  const update = useUpdateAboutChairmanMessage();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<AboutChairmanMessageInput>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (query.data) {
      setForm({
        eyebrow: query.data.eyebrow,
        heading: query.data.heading,
        message: query.data.message,
        signatureName: query.data.signatureName,
        role: query.data.role,
        portraitImage: query.data.portraitImage,
        portraitAltText: query.data.portraitAltText,
        buttonLabel: query.data.buttonLabel,
        buttonHref: query.data.buttonHref,
        buttonVisible: query.data.buttonVisible,
        isVisible: query.data.isVisible,
        sortOrder: query.data.sortOrder,
      });
    }
  }, [query.data]);

  const setField = <K extends keyof AboutChairmanMessageInput>(key: K, value: AboutChairmanMessageInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    upload.mutate({ data: { file, purpose: 'hero' } }, {
      onSuccess: (result) => { setField('portraitImage', result.url); setUploading(false); setNotice('Portrait uploaded. Save this section to publish it.'); },
      onError: () => { setUploading(false); setError('That image could not be uploaded.'); },
    });
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');
    update.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAboutChairmanMessageQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAboutChairmanMessageQueryKey() });
        setNotice(form.isVisible ? 'Chairman’s Message saved and visible on the public page.' : 'Chairman’s Message saved and hidden from the public page.');
      },
      onError: () => setError('We could not save the chairman message. Check the fields and try again.'),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return (
    <EditorFrame eyebrow="Pages / About / Chairman’s Message" title="Share the leadership perspective." description="Give families a direct, human message about the values guiding the college." previewHref="/about#chairman-message">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<MessageSquareQuote size={19} />} title="Message" description="Keep this personal, clear, and grounded in the student experience.">
          <div className="space-y-5">
            <Field id="chairman-eyebrow" label="Eyebrow" value={form.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} required />
            <Field id="chairman-heading" label="Heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required />
            <Area id="chairman-message" label="Message" value={form.message} onChange={(event) => setField('message', event.target.value)} required />
            <div className="grid gap-5 md:grid-cols-2"><Field id="chairman-signature" label="Signature name" value={form.signatureName} onChange={(event) => setField('signatureName', event.target.value)} required /><Field id="chairman-role" label="Role" value={form.role} onChange={(event) => setField('role', event.target.value)} required /></div>
          </div>
        </EditorCard>
        <EditorCard icon={<ImagePlus size={19} />} title="Portrait" description="Add an approved leadership portrait or leave it empty to use the section placeholder.">
          <div className="max-w-md"><ImageField label="Portrait image" image={form.portraitImage} alt={form.portraitAltText} uploading={uploading} onUpload={handleUpload} onUrlChange={(value) => setField('portraitImage', value || null)} onAltChange={(value) => setField('portraitAltText', value)} /></div>
        </EditorCard>
        <EditorCard title="Optional button" description="The message can stand alone. Turn this on only when there is a useful destination.">
          <div className="grid gap-5 md:grid-cols-2"><Field id="chairman-button-label" label="Button label" value={form.buttonLabel} onChange={(event) => setField('buttonLabel', event.target.value)} /><Field id="chairman-button-href" label="Button link" value={form.buttonHref} onChange={(event) => setField('buttonHref', event.target.value)} /></div>
          <label className="mt-5 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.buttonVisible} onChange={(event) => setField('buttonVisible', event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show button below the message</label>
        </EditorCard>
        <VisibilityToggle checked={form.isVisible} onChange={(value) => setField('isVisible', value)} label="Show Chairman’s Message on the public page" />
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-chairman-message">Save Chairman’s Message</SaveButton></div>
      </form>
    </EditorFrame>
  );
}