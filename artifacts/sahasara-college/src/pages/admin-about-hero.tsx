import { useEffect, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, ImagePlus, LayoutPanelTop } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAboutHeroQueryKey,
  getGetAdminAboutHeroQueryKey,
  useGetAdminAboutHero,
  useUpdateAboutHero,
  useUploadAdminImage,
  type AboutHeroInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';

const emptyForm: AboutHeroInput = {
  eyebrow: 'ABOUT SAHSRAH',
  heading: 'Growing with Purpose, Learning for Tomorrow.',
  description: '',
  mainImageUrl: null,
  mainImageAltText: '',
  floatingLabel: 'Admissions Open',
  floatingAcademicYear: '2026–27',
  floatingAvailabilityText: 'Limited Seats Available',
  floatingSupportingText: '',
  floatingImageUrl: null,
  floatingImageAltText: '',
  primaryButtonLabel: 'Apply for Admission',
  primaryButtonUrl: '/contact',
  primaryButtonVisible: true,
  secondaryButtonLabel: 'Schedule a Campus Visit',
  secondaryButtonUrl: '/contact',
  secondaryButtonVisible: true,
  isVisible: true,
  sortOrder: 1,
  stats: [
    { value: '30+', label: 'Years of Excellence', icon: null, displayOrder: 1, isVisible: true },
    { value: '5000+', label: 'Students Guided', icon: null, displayOrder: 2, isVisible: true },
    { value: '100+', label: 'Academic Achievements', icon: null, displayOrder: 3, isVisible: true },
    { value: '500+', label: 'Successful Admissions', icon: null, displayOrder: 4, isVisible: true },
  ],
};

export default function AdminAboutHero() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutHero();
  const update = useUpdateAboutHero();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<AboutHeroInput>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<'mainImageUrl' | 'floatingImageUrl' | null>(null);

  useEffect(() => {
    if (query.data) {
      setForm({
        eyebrow: query.data.eyebrow,
        heading: query.data.heading,
        description: query.data.description,
        mainImageUrl: query.data.mainImageUrl,
        mainImageAltText: query.data.mainImageAltText,
        floatingLabel: query.data.floatingLabel,
        floatingAcademicYear: query.data.floatingAcademicYear,
        floatingAvailabilityText: query.data.floatingAvailabilityText,
        floatingSupportingText: query.data.floatingSupportingText,
        floatingImageUrl: query.data.floatingImageUrl,
        floatingImageAltText: query.data.floatingImageAltText,
        primaryButtonLabel: query.data.primaryButtonLabel,
        primaryButtonUrl: query.data.primaryButtonUrl,
        primaryButtonVisible: query.data.primaryButtonVisible,
        secondaryButtonLabel: query.data.secondaryButtonLabel,
        secondaryButtonUrl: query.data.secondaryButtonUrl,
        secondaryButtonVisible: query.data.secondaryButtonVisible,
        isVisible: query.data.isVisible,
        sortOrder: query.data.sortOrder,
        stats: query.data.stats.map(({ value, label, icon, displayOrder, isVisible }) => ({ value, label, icon, displayOrder, isVisible })),
      });
    }
  }, [query.data]);

  const setField = <K extends keyof AboutHeroInput>(key: K, value: AboutHeroInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setStat = (index: number, key: keyof AboutHeroInput['stats'][number], value: string | boolean | number | null) => setForm((current) => ({ ...current, stats: current.stats.map((stat, statIndex) => statIndex === index ? { ...stat, [key]: value } : stat) }));

  const handleUpload = (field: 'mainImageUrl' | 'floatingImageUrl', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(field);
    upload.mutate({ data: { file, purpose: 'hero' } }, {
      onSuccess: (result) => { setField(field, result.url); setUploading(null); setNotice('Image uploaded. Save this section to publish it.'); },
      onError: () => { setUploading(null); setError('That image could not be uploaded.'); },
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');
    update.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAboutHeroQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAboutHeroQueryKey() });
        setNotice(form.isVisible ? 'About Hero saved and visible on the public page.' : 'About Hero saved and hidden from the public page.');
      },
      onError: () => setError('We could not save About Hero. Check the fields and try again.'),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;

  return (
    <EditorFrame eyebrow="Pages / About / About Hero" title="Set the tone for the About page." description="Introduce Sahsrah with a clear, welcoming first impression and editable proof points." previewHref="/about">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<LayoutPanelTop size={19} />} title="Introduction" description="The first words visitors read after choosing to learn more about Sahsrah.">
          <div className="space-y-5">
            <Field id="about-hero-eyebrow" label="Eyebrow" value={form.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} required />
            <Field id="about-hero-heading" label="Heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required />
            <Area id="about-hero-description" label="Description" value={form.description} onChange={(event) => setField('description', event.target.value)} required />
          </div>
        </EditorCard>

        <EditorCard icon={<ImagePlus size={19} />} title="Hero imagery" description="Use a welcoming classroom or campus image. The upload uses the existing image storage flow.">
          <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr]">
            <ImageField label="Main image" image={form.mainImageUrl} alt={form.mainImageAltText} uploading={uploading === 'mainImageUrl'} onUpload={(event) => handleUpload('mainImageUrl', event)} onUrlChange={(value) => setField('mainImageUrl', value || null)} onAltChange={(value) => setField('mainImageAltText', value)} />
            <ImageField label="Optional floating image" image={form.floatingImageUrl} alt={form.floatingImageAltText} uploading={uploading === 'floatingImageUrl'} onUpload={(event) => handleUpload('floatingImageUrl', event)} onUrlChange={(value) => setField('floatingImageUrl', value || null)} onAltChange={(value) => setField('floatingImageAltText', value)} />
          </div>
        </EditorCard>

        <EditorCard title="Admissions card" description="This small card floats over the hero image on the public page.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="about-hero-floating-label" label="Small label" value={form.floatingLabel} onChange={(event) => setField('floatingLabel', event.target.value)} required />
            <Field id="about-hero-floating-year" label="Academic year" value={form.floatingAcademicYear} onChange={(event) => setField('floatingAcademicYear', event.target.value)} required />
            <Field id="about-hero-floating-availability" label="Availability text" value={form.floatingAvailabilityText} onChange={(event) => setField('floatingAvailabilityText', event.target.value)} required />
            <Field id="about-hero-floating-supporting" label="Supporting text" value={form.floatingSupportingText} onChange={(event) => setField('floatingSupportingText', event.target.value)} required />
          </div>
        </EditorCard>

        <EditorCard title="Statistics" description="Four editable proof points displayed beneath the introduction.">
          <div className="grid gap-5 md:grid-cols-2">
            {form.stats.map((stat, index) => <div key={stat.displayOrder} className="rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Statistic {index + 1}</p><div className="space-y-4"><Field id={`about-stat-${index}-value`} label="Value" value={stat.value} onChange={(event) => setStat(index, 'value', event.target.value)} required /><Field id={`about-stat-${index}-label`} label="Label" value={stat.label} onChange={(event) => setStat(index, 'label', event.target.value)} required /><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={stat.isVisible} onChange={(event) => setStat(index, 'isVisible', event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show statistic</label></div></div>)}
          </div>
        </EditorCard>

        <EditorCard title="Call-to-action buttons" description="Each button can be hidden independently when its destination is not ready.">
          <div className="grid gap-5 md:grid-cols-2">
            <ButtonEditor title="Primary button" label={form.primaryButtonLabel} href={form.primaryButtonUrl} visible={form.primaryButtonVisible} onLabel={(value) => setField('primaryButtonLabel', value)} onHref={(value) => setField('primaryButtonUrl', value)} onVisible={(value) => setField('primaryButtonVisible', value)} />
            <ButtonEditor title="Secondary button" label={form.secondaryButtonLabel} href={form.secondaryButtonUrl} visible={form.secondaryButtonVisible} onLabel={(value) => setField('secondaryButtonLabel', value)} onHref={(value) => setField('secondaryButtonUrl', value)} onVisible={(value) => setField('secondaryButtonVisible', value)} />
          </div>
        </EditorCard>

        <VisibilityToggle checked={form.isVisible} onChange={(value) => setField('isVisible', value)} label="Show About Hero on the public page" />
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-about-hero">Save About Hero</SaveButton></div>
      </form>
    </EditorFrame>
  );
}

export function EditorFrame({ eyebrow, title, description, previewHref, children }: { eyebrow: string; title: string; description: string; previewHref: string; children: React.ReactNode }) {
  return <div className="animate-rise max-w-5xl"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{eyebrow}</p><h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))]">{title}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p></div><a href={previewHref} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))]">Preview page <ArrowUpRight size={16} /></a></div>{children}</div>;
}

export function EditorCard({ icon, title, description, children }: { icon?: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><div className="flex items-start gap-3"><div className="mt-0.5 text-[hsl(var(--accent-foreground))]">{icon}</div><div><h2 className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{title}</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p></div></div><div className="mt-7">{children}</div></section>;
}

export function ImageField({ label, image, alt, uploading, onUpload, onUrlChange, onAltChange }: { label: string; image: string | null; alt: string; uploading: boolean; onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; onUrlChange: (value: string) => void; onAltChange: (value: string) => void }) {
  return <div className="space-y-4 rounded-xl bg-[hsl(var(--secondary))] p-5"><div className="aspect-[1.45] overflow-hidden rounded-xl bg-[hsl(var(--card))]">{image ? <img src={image} alt={alt || `${label} preview`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-[hsl(var(--muted-foreground))]">No image yet</div>}</div><label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onUpload} />{uploading ? 'Uploading…' : `Upload ${label.toLowerCase()}`}</label><Field id={`${label.replaceAll(' ', '-').toLowerCase()}-url`} label="Image URL" value={image ?? ''} onChange={(event) => onUrlChange(event.target.value)} placeholder="https://…" /><Field id={`${label.replaceAll(' ', '-').toLowerCase()}-alt`} label="Alt text" value={alt} onChange={(event) => onAltChange(event.target.value)} required /></div>;
}

function ButtonEditor({ title, label, href, visible, onLabel, onHref, onVisible }: { title: string; label: string; href: string; visible: boolean; onLabel: (value: string) => void; onHref: (value: string) => void; onVisible: (value: boolean) => void }) {
  return <div className="rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">{title}</p><div className="space-y-4"><Field id={`${title}-label`} label="Label" value={label} onChange={(event) => onLabel(event.target.value)} required /><Field id={`${title}-href`} label="Link" value={href} onChange={(event) => onHref(event.target.value)} required /><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={visible} onChange={(event) => onVisible(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show button</label></div></div>;
}

export function VisibilityToggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-[hsl(var(--accent))]" /><span><span className="flex items-center gap-2 text-sm font-bold">{checked ? <Eye size={17} /> : <EyeOff size={17} />}{label}</span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">Turn this off while preparing content. Saved values remain available in the editor.</span></span></label>;
}

export function SaveStatus({ error, notice }: { error: string; notice: string }) {
  return <>{error && <p className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">{error}</p>}{notice && <p className="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}</>;
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-2xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] p-8"><h2 className="font-display text-3xl font-semibold">This section could not load.</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Check your connection and try again.</p><button onClick={onRetry} className="mt-6 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]">Try again</button></div>;
}

export function EditorSkeleton() {
  return <div className="animate-pulse space-y-6"><div className="h-36 max-w-xl rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-[700px] rounded-2xl bg-[hsl(var(--muted))]" /></div>;
}