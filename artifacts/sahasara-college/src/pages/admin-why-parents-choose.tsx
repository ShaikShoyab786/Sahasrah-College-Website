import { useEffect, useState } from 'react';
import { ListChecks, Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAboutWhyParentsChooseQueryKey,
  getGetAdminAboutWhyParentsChooseQueryKey,
  useGetAdminAboutWhyParentsChoose,
  useUpdateAboutWhyParentsChoose,
  type AboutWhyParentsChooseInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus, VisibilityToggle } from '@/pages/admin-about-hero';

const emptyForm: AboutWhyParentsChooseInput = {
  eyebrow: 'WHY SAHSRAH',
  heading: 'Why Parents Choose Sahsrah',
  description: 'A focused, supportive approach that helps students build strong foundations and steady momentum.',
  isVisible: true,
  sortOrder: 5,
  benefits: [
    { icon: 'users', title: 'Experienced Faculty', description: '', displayOrder: 1, isVisible: true },
    { icon: 'graduation-cap', title: 'Strong Academic Preparation', description: '', displayOrder: 2, isVisible: true },
    { icon: 'book-open', title: 'Concept-Based Learning', description: '', displayOrder: 3, isVisible: true },
    { icon: 'check-circle', title: 'Regular Tests and Practice', description: '', displayOrder: 4, isVisible: true },
    { icon: 'heart-handshake', title: 'Personalized Mentorship', description: '', displayOrder: 5, isVisible: true },
    { icon: 'badge-check', title: 'A Commitment to Student Progress', description: '', displayOrder: 6, isVisible: true },
  ],
};

export default function AdminWhyParentsChoose() {
  const queryClient = useQueryClient();
  const query = useGetAdminAboutWhyParentsChoose();
  const update = useUpdateAboutWhyParentsChoose();
  const [form, setForm] = useState<AboutWhyParentsChooseInput>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.data) {
      setForm({
        eyebrow: query.data.eyebrow,
        heading: query.data.heading,
        description: query.data.description,
        isVisible: query.data.isVisible,
        sortOrder: query.data.sortOrder,
        benefits: query.data.benefits.map(({ icon, title, description, displayOrder, isVisible }) => ({ icon, title, description, displayOrder, isVisible })),
      });
    }
  }, [query.data]);

  const setField = <K extends keyof AboutWhyParentsChooseInput>(key: K, value: AboutWhyParentsChooseInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setBenefit = (index: number, key: keyof AboutWhyParentsChooseInput['benefits'][number], value: string | boolean | number) => setForm((current) => ({ ...current, benefits: current.benefits.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const moveBenefit = (index: number, direction: -1 | 1) => setForm((current) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= current.benefits.length) return current;
    const benefits = [...current.benefits];
    [benefits[index], benefits[nextIndex]] = [benefits[nextIndex], benefits[index]];
    return { ...current, benefits: benefits.map((benefit, itemIndex) => ({ ...benefit, displayOrder: itemIndex + 1 })) };
  });
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');
    update.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAboutWhyParentsChooseQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAboutWhyParentsChooseQueryKey() });
        setNotice(form.isVisible ? 'Why Parents Choose saved and visible on the public page.' : 'Why Parents Choose saved and hidden from the public page.');
      },
      onError: () => setError('We could not save Why Parents Choose. Check the fields and try again.'),
    });
  };
  const addBenefit = () => {
    if (form.benefits.length >= 20) return;
    setForm((current) => ({ ...current, benefits: [...current.benefits, { icon: 'sparkles', title: 'New benefit', description: '', displayOrder: current.benefits.length + 1, isVisible: true }] }));
  };
  const removeBenefit = (index: number) => {
    if (form.benefits.length <= 1) return;
    setForm((current) => ({ ...current, benefits: current.benefits.filter((_, itemIndex) => itemIndex !== index).map((benefit, itemIndex) => ({ ...benefit, displayOrder: itemIndex + 1 })) }));
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return (
    <EditorFrame eyebrow="Pages / About / Why Parents Choose" title="Show what support feels like." description="Keep the six family-facing reasons clear, editable, and connected to the Sahsrah experience." previewHref="/about#why-parents-choose">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<ListChecks size={19} />} title="Section introduction" description="This heading is shown above the benefits grid.">
          <div className="space-y-5"><Field id="parents-eyebrow" label="Eyebrow" value={form.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} required /><Field id="parents-heading" label="Section heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required /><Area id="parents-description" label="Section description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></div>
        </EditorCard>
        <EditorCard title="Benefit items" description="Use Lucide icon names such as users, graduation-cap, book-open, check-circle, heart-handshake, or badge-check.">
          <div className="space-y-4">{form.benefits.map((benefit, index) => <div key={`${benefit.displayOrder}-${index}`} className="rounded-xl bg-[hsl(var(--secondary))] p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Benefit {index + 1}</p><div className="flex items-center gap-3"><button type="button" onClick={() => moveBenefit(index, -1)} disabled={index === 0} className="text-xs font-bold disabled:opacity-30">Up</button><button type="button" onClick={() => moveBenefit(index, 1)} disabled={index === form.benefits.length - 1} className="text-xs font-bold disabled:opacity-30">Down</button><button type="button" onClick={() => removeBenefit(index)} disabled={form.benefits.length <= 1} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--destructive))] disabled:opacity-30"><Trash2 size={14} /> Remove</button></div></div><div className="mt-4 grid gap-4 md:grid-cols-[.7fr_1fr_.25fr]"><Field id={`benefit-${index}-icon`} label="Icon name" value={benefit.icon} onChange={(event) => setBenefit(index, 'icon', event.target.value)} required /><Field id={`benefit-${index}-title`} label="Title" value={benefit.title} onChange={(event) => setBenefit(index, 'title', event.target.value)} required /><Field id={`benefit-${index}-order`} label="Order" type="number" min={1} max={20} value={benefit.displayOrder} onChange={(event) => setBenefit(index, 'displayOrder', Number(event.target.value))} required /></div><div className="mt-4"><Area id={`benefit-${index}-description`} label="Optional short description" value={benefit.description} onChange={(event) => setBenefit(index, 'description', event.target.value)} /></div><label className="mt-4 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={benefit.isVisible} onChange={(event) => setBenefit(index, 'isVisible', event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Show this benefit</label></div>)}<button type="button" onClick={addBenefit} disabled={form.benefits.length >= 20} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] disabled:opacity-40"><Plus size={17} /> Add benefit</button></div>
        </EditorCard>
        <VisibilityToggle checked={form.isVisible} onChange={(value) => setField('isVisible', value)} label="Show Why Parents Choose on the public page" />
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-why-parents-choose">Save Why Parents Choose</SaveButton></div>
      </form>
    </EditorFrame>
  );
}