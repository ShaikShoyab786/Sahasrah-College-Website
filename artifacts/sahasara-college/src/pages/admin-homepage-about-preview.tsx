import { useEffect, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, ImagePlus, LayoutPanelTop } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminHomepageAboutPreviewQueryKey,
  getGetHomepageAboutPreviewQueryKey,
  useGetAdminHomepageAboutPreview,
  useUpdateHomepageAboutPreview,
  useUploadAdminImage,
  type HomepageAboutPreviewInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';

const emptyForm: HomepageAboutPreviewInput = {
  eyebrow: '',
  heading: '',
  description: '',
  body: '',
  calloutLabel: 'Learning with purpose',
  buttonLabel: 'Explore Our Philosophy',
  buttonHref: '/about',
  primaryImage: null,
  primaryImageAltText: '',
  secondaryImage: null,
  secondaryImageAltText: '',
  isVisible: true,
  sortOrder: 2,
};

export default function AdminHomepageAboutPreview() {
  const queryClient = useQueryClient();
  const query = useGetAdminHomepageAboutPreview();
  const update = useUpdateHomepageAboutPreview();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<HomepageAboutPreviewInput>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploadingField, setUploadingField] = useState<'primaryImage' | 'secondaryImage' | null>(null);

  useEffect(() => {
    if (query.data) {
      setForm({
        eyebrow: query.data.eyebrow,
        heading: query.data.heading,
        description: query.data.description,
        body: query.data.body,
        calloutLabel: query.data.calloutLabel,
        buttonLabel: query.data.buttonLabel,
        buttonHref: query.data.buttonHref,
        primaryImage: query.data.primaryImage,
        primaryImageAltText: query.data.primaryImageAltText,
        secondaryImage: query.data.secondaryImage,
        secondaryImageAltText: query.data.secondaryImageAltText,
        isVisible: query.data.isVisible,
        sortOrder: query.data.sortOrder,
      });
    }
  }, [query.data]);

  const setField = <K extends keyof HomepageAboutPreviewInput>(key: K, value: HomepageAboutPreviewInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleUpload = (field: 'primaryImage' | 'secondaryImage', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    upload.mutate(
      { data: { file, purpose: 'hero' } },
      {
        onSuccess: (result) => {
          setField(field, result.url);
          setNotice(`${field === 'primaryImage' ? 'Primary' : 'Secondary'} image uploaded. Save this section to publish it.`);
          setUploadingField(null);
        },
        onError: () => {
          setError('That image could not be uploaded. Try another file.');
          setUploadingField(null);
        },
      },
    );
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');
    update.mutate(
      { data: form },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminHomepageAboutPreviewQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetHomepageAboutPreviewQueryKey() });
          setNotice(form.isVisible ? 'About Preview saved and visible on the homepage.' : 'About Preview saved and hidden from the homepage.');
        },
        onError: () => setError('We could not save About Preview. Please check the fields and try again.'),
      },
    );
  };

  if (query.isLoading) return <div className="animate-pulse space-y-6"><div className="h-36 max-w-xl rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-[700px] rounded-2xl bg-[hsl(var(--muted))]" /></div>;
  if (query.isError && !query.data) return <div className="rounded-2xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] p-8"><h2 className="font-display text-3xl font-semibold">About Preview could not load.</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Check your connection and try once more.</p><button onClick={() => query.refetch()} className="mt-6 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-about-preview">Try again</button></div>;

  return (
    <div className="animate-rise max-w-5xl">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Pages / Home / About Preview</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))]" data-testid="text-about-preview-editor-title">Introduce the Sahsrah way.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">Shape the first story visitors read after the hero. This content stays separate from the future full About page.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-preview-about">Preview live site <ArrowUpRight size={16} /></a>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-6">
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8">
            <SectionTitle icon={<LayoutPanelTop size={19} />} title="The story" description="A concise introduction for families learning what makes Sahsrah different." />
          <div className="mt-7 space-y-5">
            <Field id="about-eyebrow" label="Eyebrow" value={form.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} required placeholder="About Sahsrah" />
            <Field id="about-heading" label="Heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required placeholder="Building Strong Foundations for a Brighter Future" />
            <Area id="about-description" label="Introductory description" value={form.description} onChange={(event) => setField('description', event.target.value)} required placeholder="A short introduction to the college's approach." />
            <Area id="about-body" label="Supporting paragraph" value={form.body} onChange={(event) => setField('body', event.target.value)} required placeholder="Add a little more context about the student experience." />
            <Field id="about-callout-label" label="Image callout label" value={form.calloutLabel} onChange={(event) => setField('calloutLabel', event.target.value)} required placeholder="Learning with purpose" />
          </div>
        </section>

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8">
          <SectionTitle icon={<ImagePlus size={19} />} title="The images" description="Replace the placeholders with wide, welcoming campus or student photography." />
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <ImageField field="primaryImage" image={form.primaryImage} alt={form.primaryImageAltText} onAltChange={(value) => setField('primaryImageAltText', value)} onUrlChange={(value) => setField('primaryImage', value || null)} onUpload={(event) => handleUpload('primaryImage', event)} uploading={uploadingField === 'primaryImage'} />
            <ImageField field="secondaryImage" image={form.secondaryImage} alt={form.secondaryImageAltText} onAltChange={(value) => setField('secondaryImageAltText', value)} onUrlChange={(value) => setField('secondaryImage', value || null)} onUpload={(event) => handleUpload('secondaryImage', event)} uploading={uploadingField === 'secondaryImage'} />
          </div>
        </section>

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8">
          <SectionTitle title="The invitation" description="Give interested families a clear next step." />
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Field id="about-button-label" label="Button label" value={form.buttonLabel} onChange={(event) => setField('buttonLabel', event.target.value)} required placeholder="Explore Our Philosophy" />
            <Field id="about-button-href" label="Button link" value={form.buttonHref} onChange={(event) => setField('buttonHref', event.target.value)} required placeholder="/about" />
          </div>
        </section>

        <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <input type="checkbox" checked={form.isVisible} onChange={(event) => setField('isVisible', event.target.checked)} className="mt-1 h-5 w-5 accent-[hsl(var(--accent))]" data-testid="input-about-preview-visible" />
          <span>
            <span className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">{form.isVisible ? <Eye size={17} /> : <EyeOff size={17} />} Show About Preview on the public homepage</span>
            <span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">Turn this off while preparing content. The saved values remain available here.</span>
          </span>
        </label>

        {error && <p className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" data-testid="status-about-preview-error">{error}</p>}
        {notice && <p className="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" data-testid="status-about-preview-success">{notice}</p>}
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-about-preview">Save About Preview</SaveButton></div>
      </form>
    </div>
  );
}

function SectionTitle({ icon, title, description }: { icon?: React.ReactNode; title: string; description: string }) {
  return <div className="flex items-start gap-3"><div className="mt-0.5 text-[hsl(var(--accent-foreground))]">{icon}</div><div><h2 className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{title}</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p></div></div>;
}

function ImageField({ field, image, alt, onAltChange, onUrlChange, onUpload, uploading }: { field: 'primaryImage' | 'secondaryImage'; image: string | null; alt: string; onAltChange: (value: string) => void; onUrlChange: (value: string) => void; onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; uploading: boolean }) {
  const label = field === 'primaryImage' ? 'Primary image' : 'Secondary image';
  return <div className="space-y-4 rounded-xl bg-[hsl(var(--secondary))] p-5">
    <div className="aspect-[1.35] overflow-hidden rounded-xl bg-[hsl(var(--card))]">{image ? <img src={image} alt={alt || `${label} preview`} className="h-full w-full object-cover" data-testid={`img-admin-${field}`} /> : <div className="grid h-full place-items-center text-sm text-[hsl(var(--muted-foreground))]">No image yet</div>}</div>
    <label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))]"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onUpload} />{uploading ? 'Uploading…' : `Upload ${label.toLowerCase()}`}</label>
    <Field id={`about-${field}-url`} label="Image URL" value={image ?? ''} onChange={(event) => onUrlChange(event.target.value)} placeholder="https://…" />
    <Field id={`about-${field}-alt`} label="Alt text" value={alt} onChange={(event) => onAltChange(event.target.value)} required placeholder="Students learning together" />
  </div>;
}