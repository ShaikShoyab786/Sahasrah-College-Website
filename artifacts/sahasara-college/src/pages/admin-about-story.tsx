import { useEffect, useState } from 'react';
import { ArrowUpRight, ImagePlus, Plus, Route, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAboutStoryQueryKey,
  getGetAdminAboutStoryQueryKey,
  useGetAdminAboutStory,
  useUpdateAboutStory,
  useUploadAdminImage,
  type AboutStoryInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, ImageField, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const emptyForm: AboutStoryInput = {
  eyebrow: 'OUR STORY',
  heading: 'A Journey Built on Learning and Purpose',
  description: '',
  buttonLabel: 'Explore Our Journey',
  buttonHref: '#our-story-timeline',
  mainImage: null,
  mainImageAltText: '',
  secondaryImage: null,
  secondaryImageAltText: '',
  thirdImage: null,
  thirdImageAltText: '',
  isVisible: true,
  sortOrder: 2,
  timelineItems: [
    { period: '20XX', title: 'The Beginning', description: '', displayOrder: 1, isVisible: true },
    { period: '20XX', title: 'Growing Horizons', description: '', displayOrder: 2, isVisible: true },
    { period: 'Today', title: 'Looking Ahead', description: '', displayOrder: 3, isVisible: true },
  ],
};

export default function AdminAboutStory() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutStory();
  const update = useUpdateAboutStory();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<AboutStoryInput>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<'mainImage' | 'secondaryImage' | 'thirdImage' | null>(null);

  useEffect(() => {
    if (query.data) {
      setForm({
        eyebrow: query.data.eyebrow,
        heading: query.data.heading,
        description: query.data.description,
        buttonLabel: query.data.buttonLabel,
        buttonHref: query.data.buttonHref,
        mainImage: query.data.mainImage,
        mainImageAltText: query.data.mainImageAltText,
        secondaryImage: query.data.secondaryImage,
        secondaryImageAltText: query.data.secondaryImageAltText,
        thirdImage: query.data.thirdImage,
        thirdImageAltText: query.data.thirdImageAltText,
        isVisible: query.data.isVisible,
        sortOrder: query.data.sortOrder,
        timelineItems: query.data.timelineItems.map(({ period, title, description, displayOrder, isVisible }) => ({ period, title, description, displayOrder, isVisible })),
      });
    }
  }, [query.data]);

  const setField = <K extends keyof AboutStoryInput>(key: K, value: AboutStoryInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setTimeline = (index: number, key: keyof AboutStoryInput['timelineItems'][number], value: string | boolean | number) => setForm((current) => ({ ...current, timelineItems: current.timelineItems.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const handleUpload = (field: 'mainImage' | 'secondaryImage' | 'thirdImage', event: React.ChangeEvent<HTMLInputElement>) => {
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
        queryClient.invalidateQueries({ queryKey: getGetAdminAboutStoryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAboutStoryQueryKey() });
        setNotice(form.isVisible ? 'Our Story saved and visible on the public page.' : 'Our Story saved and hidden from the public page.');
      },
      onError: () => setError('We could not save Our Story. Check the fields and try again.'),
    });
  };
  const addTimeline = () => {
    const nextOrder = form.timelineItems.length ? Math.max(...form.timelineItems.map((item) => item.displayOrder)) + 1 : 1;
    if (form.timelineItems.length >= 12) return;
    setForm((current) => ({ ...current, timelineItems: [...current.timelineItems, { period: '20XX', title: 'New milestone', description: '', displayOrder: nextOrder, isVisible: true }] }));
  };
  const removeTimeline = (index: number) => {
    if (form.timelineItems.length <= 1) return;
    setForm((current) => ({ ...current, timelineItems: current.timelineItems.filter((_, itemIndex) => itemIndex !== index) }));
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return (
    <EditorFrame eyebrow="Pages / About / Our Story" title="Show how the journey has grown." description="Tell the college story with a concise introduction, visual rhythm, and an editable timeline." previewHref="/about#our-story">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<Route size={19} />} title="Story introduction" description="This content anchors the Our Story section before the timeline begins.">
          <div className="space-y-5">
            <Field id="story-eyebrow" label="Eyebrow" value={form.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} required />
            <Field id="story-heading" label="Heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required />
            <Area id="story-description" label="Description" value={form.description} onChange={(event) => setField('description', event.target.value)} required />
            <div className="grid gap-5 md:grid-cols-2"><Field id="story-button-label" label="Button label" value={form.buttonLabel} onChange={(event) => setField('buttonLabel', event.target.value)} /><Field id="story-button-href" label="Button link" value={form.buttonHref} onChange={(event) => setField('buttonHref', event.target.value)} /></div>
          </div>
        </EditorCard>
        <EditorCard icon={<ImagePlus size={19} />} title="Story collage" description="Three independent images create the layered story visual on the public page.">
          <div className="grid gap-6 lg:grid-cols-3">
            <ImageField label="Main story image" image={form.mainImage} alt={form.mainImageAltText} uploading={uploading === 'mainImage'} onUpload={(event) => handleUpload('mainImage', event)} onUrlChange={(value) => setField('mainImage', value || null)} onAltChange={(value) => setField('mainImageAltText', value)} />
            <ImageField label="Secondary story image" image={form.secondaryImage} alt={form.secondaryImageAltText} uploading={uploading === 'secondaryImage'} onUpload={(event) => handleUpload('secondaryImage', event)} onUrlChange={(value) => setField('secondaryImage', value || null)} onAltChange={(value) => setField('secondaryImageAltText', value)} />
            <ImageField label="Third story image" image={form.thirdImage} alt={form.thirdImageAltText} uploading={uploading === 'thirdImage'} onUpload={(event) => handleUpload('thirdImage', event)} onUrlChange={(value) => setField('thirdImage', value || null)} onAltChange={(value) => setField('thirdImageAltText', value)} />
          </div>
        </EditorCard>
        <EditorCard title="Timeline" description="Add, edit, hide, or remove milestones. They are saved together with the story section.">
          <div className="space-y-4">
            {form.timelineItems.map((item, index) => <div key={`${item.displayOrder}-${index}`} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5"><div className="flex items-start justify-between gap-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Milestone {index + 1}</p><button type="button" onClick={() => removeTimeline(index)} disabled={form.timelineItems.length <= 1} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--destructive))] disabled:opacity-40"><Trash2 size={14} /> Remove</button></div><div className="mt-4 grid gap-4 md:grid-cols-[.3fr_1fr_.25fr]"><Field id={`timeline-${index}-period`} label="Period" value={item.period} onChange={(event) => setTimeline(index, 'period', event.target.value)} required /><Field id={`timeline-${index}-title`} label="Title" value={item.title} onChange={(event) => setTimeline(index, 'title', event.target.value)} required /><Field id={`timeline-${index}-order`} label="Order" type="number" min={1} max={12} value={item.displayOrder} onChange={(event) => setTimeline(index, 'displayOrder', Number(event.target.value))} required /></div><div className="mt-4"><Area id={`timeline-${index}-description`} label="Description" value={item.description} onChange={(event) => setTimeline(index, 'description', event.target.value)} required /></div><label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={item.isVisible} onChange={(event) => setTimeline(index, 'isVisible', event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show this milestone</label></div>)}
            <button type="button" onClick={addTimeline} disabled={form.timelineItems.length >= 12} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] disabled:opacity-40"><Plus size={17} /> Add timeline milestone</button>
          </div>
        </EditorCard>
        <VisibilityToggle checked={form.isVisible} onChange={(value) => setField('isVisible', value)} label="Show Our Story on the public page" />
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-about-story">Save Our Story</SaveButton></div>
      </form>
    </EditorFrame>
  );
}