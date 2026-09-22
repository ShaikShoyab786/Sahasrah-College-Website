import { useEffect, useState } from 'react';
import { BookOpenCheck, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAboutGuidingPrinciplesQueryKey,
  getGetAdminAboutGuidingPrinciplesQueryKey,
  useGetAdminAboutGuidingPrinciples,
  useUpdateAboutGuidingPrinciples,
  type AboutGuidingPrinciplesInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const emptyForm: AboutGuidingPrinciplesInput = {
  heading: 'Our Guiding Principles',
  description: 'The principles that shape how Sahasara teaches, supports, and prepares every student.',
  visionIcon: 'eye',
  visionTitle: 'Our Vision',
  visionDescription: '',
  missionIcon: 'target',
  missionTitle: 'Our Mission',
  missionDescription: '',
  valuesIcon: 'star',
  valuesTitle: 'Our Values',
  isVisible: true,
  sortOrder: 4,
  values: [
    { value: 'Integrity in all we do', displayOrder: 1, isVisible: true },
    { value: 'Excellence in education', displayOrder: 2, isVisible: true },
    { value: 'Care for every student', displayOrder: 3, isVisible: true },
    { value: 'Commitment to progress', displayOrder: 4, isVisible: true },
  ],
};

export default function AdminGuidingPrinciples() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutGuidingPrinciples();
  const update = useUpdateAboutGuidingPrinciples();
  const [form, setForm] = useState<AboutGuidingPrinciplesInput>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.data) {
      setForm({
        heading: query.data.heading,
        description: query.data.description,
        visionIcon: query.data.visionIcon,
        visionTitle: query.data.visionTitle,
        visionDescription: query.data.visionDescription,
        missionIcon: query.data.missionIcon,
        missionTitle: query.data.missionTitle,
        missionDescription: query.data.missionDescription,
        valuesIcon: query.data.valuesIcon,
        valuesTitle: query.data.valuesTitle,
        isVisible: query.data.isVisible,
        sortOrder: query.data.sortOrder,
        values: query.data.values.map(({ value, displayOrder, isVisible }) => ({ value, displayOrder, isVisible })),
      });
    }
  }, [query.data]);

  const setField = <K extends keyof AboutGuidingPrinciplesInput>(key: K, value: AboutGuidingPrinciplesInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setValue = (index: number, key: keyof AboutGuidingPrinciplesInput['values'][number], value: string | boolean | number) => setForm((current) => ({ ...current, values: current.values.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const moveValue = (index: number, direction: -1 | 1) => setForm((current) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= current.values.length) return current;
    const values = [...current.values];
    [values[index], values[nextIndex]] = [values[nextIndex], values[index]];
    return { ...current, values: values.map((value, itemIndex) => ({ ...value, displayOrder: itemIndex + 1 })) };
  });
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');
    update.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAboutGuidingPrinciplesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAboutGuidingPrinciplesQueryKey() });
        setNotice(form.isVisible ? 'Guiding Principles saved and visible on the public page.' : 'Guiding Principles saved and hidden from the public page.');
      },
      onError: () => setError('We could not save Guiding Principles. Check the fields and try again.'),
    });
  };
  const addValue = () => {
    if (form.values.length >= 20) return;
    setForm((current) => ({ ...current, values: [...current.values, { value: 'New principle', displayOrder: current.values.length + 1, isVisible: true }] }));
  };
  const removeValue = (index: number) => {
    if (form.values.length <= 1) return;
    setForm((current) => ({ ...current, values: current.values.filter((_, itemIndex) => itemIndex !== index).map((value, itemIndex) => ({ ...value, displayOrder: itemIndex + 1 })) }));
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return (
    <EditorFrame eyebrow="Pages / About / Guiding Principles" title="Make the college’s principles clear." description="Shape the vision, mission, and values families should feel throughout the Sahasara experience." previewHref="/about#guiding-principles">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<BookOpenCheck size={19} />} title="Section introduction" description="The heading and supporting text above the three principle cards.">
          <div className="space-y-5"><Field id="principles-heading" label="Section heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required /><Area id="principles-description" label="Section description" value={form.description} onChange={(event) => setField('description', event.target.value)} required /></div>
        </EditorCard>
        <EditorCard title="Vision and mission" description="Choose a Lucide icon name such as eye, target, star, sparkles, or shield.">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Vision card</p><Field id="vision-icon" label="Icon name" value={form.visionIcon} onChange={(event) => setField('visionIcon', event.target.value)} required /><Field id="vision-title" label="Title" value={form.visionTitle} onChange={(event) => setField('visionTitle', event.target.value)} required /><Area id="vision-description" label="Description" value={form.visionDescription} onChange={(event) => setField('visionDescription', event.target.value)} required /></div>
            <div className="space-y-4 rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Mission card</p><Field id="mission-icon" label="Icon name" value={form.missionIcon} onChange={(event) => setField('missionIcon', event.target.value)} required /><Field id="mission-title" label="Title" value={form.missionTitle} onChange={(event) => setField('missionTitle', event.target.value)} required /><Area id="mission-description" label="Description" value={form.missionDescription} onChange={(event) => setField('missionDescription', event.target.value)} required /></div>
          </div>
        </EditorCard>
        <EditorCard title="Values card" description="Add, edit, remove, reorder, or hide values without hardcoding the list.">
          <div className="space-y-4"><div className="grid gap-5 md:grid-cols-[1fr_.7fr]"><Field id="values-icon" label="Icon name" value={form.valuesIcon} onChange={(event) => setField('valuesIcon', event.target.value)} required /><Field id="values-title" label="Title" value={form.valuesTitle} onChange={(event) => setField('valuesTitle', event.target.value)} required /></div>{form.values.map((item, index) => <div key={`${item.displayOrder}-${index}`} className="rounded-xl bg-[hsl(var(--secondary))] p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Value {index + 1}</p><div className="flex items-center gap-3"><button type="button" onClick={() => moveValue(index, -1)} disabled={index === 0} className="text-xs font-bold disabled:opacity-30">Up</button><button type="button" onClick={() => moveValue(index, 1)} disabled={index === form.values.length - 1} className="text-xs font-bold disabled:opacity-30">Down</button><button type="button" onClick={() => removeValue(index)} disabled={form.values.length <= 1} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--destructive))] disabled:opacity-30"><Trash2 size={14} /> Remove</button></div></div><div className="mt-4 grid gap-4 md:grid-cols-[1fr_.25fr]"><Field id={`principle-value-${index}`} label="Value" value={item.value} onChange={(event) => setValue(index, 'value', event.target.value)} required /><Field id={`principle-value-order-${index}`} label="Order" type="number" min={1} max={20} value={item.displayOrder} onChange={(event) => setValue(index, 'displayOrder', Number(event.target.value))} required /></div><label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={item.isVisible} onChange={(event) => setValue(index, 'isVisible', event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show this value</label></div>)}<button type="button" onClick={addValue} disabled={form.values.length >= 20} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] disabled:opacity-40"><Plus size={17} /> Add value</button></div>
        </EditorCard>
        <VisibilityToggle checked={form.isVisible} onChange={(value) => setField('isVisible', value)} label="Show Guiding Principles on the public page" />
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-guiding-principles">Save Guiding Principles</SaveButton></div>
      </form>
    </EditorFrame>
  );
}