import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, BookOpen, ImagePlus, Link2, Plus, Save, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminKnowledgeHubMegaMenuQueryKey,
  getGetKnowledgeHubMegaMenuQueryKey,
  useGetAdminKnowledgeHubMegaMenu,
  useUpdateKnowledgeHubMegaMenu,
  useUploadAdminImage,
  type KnowledgeHubMegaMenu,
  type KnowledgeHubMenuCategory,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const categoryOrder: KnowledgeHubMenuCategory[] = ['articles', 'video-hub', 'study-resources', 'exam-updates'];
const categoryLabels: Record<KnowledgeHubMenuCategory, string> = {
  articles: 'Articles',
  'video-hub': 'Video Hub',
  'study-resources': 'Study Resources',
  'exam-updates': 'Exam Updates',
};

const defaultDescriptions: Record<KnowledgeHubMenuCategory, string> = {
  articles: 'In-depth study strategies, subject guides, exam tips and more.',
  'video-hub': 'Watch expert lectures, motivational sessions and concept videos.',
  'study-resources': 'Notes, PDFs, formulas, previous papers and important downloads.',
  'exam-updates': 'Latest notifications, exam dates, results and important announcements.',
};

function reorder<T extends { displayOrder: number }>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next.map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 }));
}

function cloneContent(content: KnowledgeHubMegaMenu): KnowledgeHubMegaMenu {
  const byCategory = new Map(content.cards.map((card) => [card.category, card]));
  return {
    panel: { ...content.panel },
    cards: categoryOrder.map((category, index) => {
      const card = byCategory.get(category);
      return {
        id: category,
        category,
        description: card?.description || defaultDescriptions[category],
        ctaLabel: card?.ctaLabel || `Explore ${categoryLabels[category]}`,
        displayOrder: index + 1,
        isVisible: card?.isVisible ?? true,
      };
    }).sort((a, b) => a.displayOrder - b.displayOrder).map((card, index) => ({ ...card, displayOrder: index + 1 })),
    trendingItems: [...content.trendingItems].sort((a, b) => a.displayOrder - b.displayOrder).map((item, index) => ({ ...item, displayOrder: index + 1 })),
  };
}

function VisibilityField({ id, checked, label, onChange }: { id: string; checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return <label htmlFor={id} className="flex min-h-11 items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm font-semibold"><input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />{label}</label>;
}

function ItemActions({ index, count, label, onMove, onRemove }: { index: number; count: number; label: string; onMove: (direction: -1 | 1) => void; onRemove?: () => void }) {
  return <div className="flex items-center gap-1"><button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--border))] disabled:opacity-40" data-testid={`button-move-up-${index}`}><ArrowUp size={16} /></button><button type="button" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--border))] disabled:opacity-40" data-testid={`button-move-down-${index}`}><ArrowDown size={16} /></button>{onRemove && <button type="button" aria-label={`Remove ${label}`} onClick={onRemove} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50" data-testid={`button-remove-${index}`}><Trash2 size={16} /></button>}</div>;
}

function ImageControl({ panel, uploading, onChange, onUpload }: { panel: KnowledgeHubMegaMenu['panel']; uploading: boolean; onChange: (patch: Partial<KnowledgeHubMegaMenu['panel']>) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">Panel image</p><label htmlFor="knowledge-panel-upload" className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-bold hover:border-[hsl(var(--accent))]"><ImagePlus size={15} aria-hidden="true" />{uploading ? 'Uploading…' : 'Upload image'}<input id="knowledge-panel-upload" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={onUpload} className="sr-only" /></label></div>{panel.imageUrl && <img src={panel.imageUrl} alt={panel.imageAltText} className="mt-3 h-36 w-full rounded-xl object-cover" data-testid="img-admin-knowledge-panel" />}<div className="mt-4 space-y-4"><Field id="knowledge-panel-url" label="Image URL" value={panel.imageUrl ?? ''} onChange={(event) => onChange({ imageUrl: event.target.value.trim() || null })} /><Field id="knowledge-panel-alt" label="Image alt text" value={panel.imageAltText} onChange={(event) => onChange({ imageAltText: event.target.value })} required={Boolean(panel.imageUrl)} /></div></div>;
}

export default function AdminKnowledgeHubMegaMenu() {
  const queryClient = useQueryClient();
  const query = useGetAdminKnowledgeHubMegaMenu();
  const update = useUpdateKnowledgeHubMegaMenu();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<KnowledgeHubMegaMenu | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (query.data) setForm(cloneContent(query.data));
  }, [query.data]);

  const setField = <K extends keyof KnowledgeHubMegaMenu>(key: K, value: KnowledgeHubMegaMenu[K]) => setForm((current) => current ? { ...current, [key]: value } : current);
  const setPanel = (patch: Partial<KnowledgeHubMegaMenu['panel']>) => setForm((current) => current ? { ...current, panel: { ...current.panel, ...patch } } : current);
  const setCard = (index: number, patch: Partial<KnowledgeHubMegaMenu['cards'][number]>) => setForm((current) => current ? { ...current, cards: current.cards.map((card, itemIndex) => itemIndex === index ? { ...card, ...patch } : card) } : current);
  const setTrending = (index: number, patch: Partial<KnowledgeHubMegaMenu['trendingItems'][number]>) => setForm((current) => current ? { ...current, trendingItems: current.trendingItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : current);

  const uploadPanelImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Choose an image smaller than 8 MB.');
      return;
    }
    setError('');
    setNotice('');
    setUploading(true);
    upload.mutate({ data: { file, purpose: 'hero' } }, {
      onSuccess: (result) => { setPanel({ imageUrl: result.url }); setUploading(false); setNotice('Image uploaded. Save the menu to publish it.'); },
      onError: () => { setUploading(false); setError('That image could not be uploaded. Please try again.'); },
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setNotice('');
    setError('');
    const payload: KnowledgeHubMegaMenu = {
      ...form,
      cards: form.cards.map((card, index) => ({ ...card, id: card.category, displayOrder: index + 1 })),
      trendingItems: form.trendingItems.map((item, index) => ({ ...item, displayOrder: index + 1, href: item.href?.trim() || null })),
    };
    update.mutate({ data: payload }, {
      onSuccess: (saved) => {
        const next = cloneContent(saved);
        setForm(next);
        queryClient.setQueryData(getGetAdminKnowledgeHubMegaMenuQueryKey(), next);
        queryClient.setQueryData(getGetKnowledgeHubMegaMenuQueryKey(), next);
        setNotice('Knowledge Hub menu saved and visible on the website.');
      },
      onError: () => setError('We could not save the menu. Check the copy, image alt text, and trending links.'),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !form) return <LoadError onRetry={() => query.refetch()} />;
  if (!form) return <LoadError onRetry={() => query.refetch()} />;

  const moveCard = (index: number, direction: -1 | 1) => setField('cards', reorder(form.cards, index, direction));
  const moveTrending = (index: number, direction: -1 | 1) => setField('trendingItems', reorder(form.trendingItems, index, direction));
  const addTrending = () => setField('trendingItems', [...form.trendingItems, { id: crypto.randomUUID(), title: '', href: null, displayOrder: form.trendingItems.length + 1, isVisible: false }]);

  return (
    <EditorFrame eyebrow="Mega Menus / Knowledge Hub" title="Shape the Knowledge Hub menu." description="Keep the four learning pathways clear, current, and useful for students and families." previewHref="/knowledge-hub">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<BookOpen size={19} />} title="Branded panel" description="The fixed right-hand panel introduces the Knowledge Hub and links to its landing page.">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field id="knowledge-panel-eyebrow" label="Eyebrow" value={form.panel.eyebrow} onChange={(event) => setPanel({ eyebrow: event.target.value })} required />
            <Field id="knowledge-panel-title" label="Title" value={form.panel.title} onChange={(event) => setPanel({ title: event.target.value })} required />
            <Area id="knowledge-panel-description" label="Description" value={form.panel.description} onChange={(event) => setPanel({ description: event.target.value })} required />
            <Field id="knowledge-panel-cta" label="CTA label" value={form.panel.ctaLabel} onChange={(event) => setPanel({ ctaLabel: event.target.value })} required />
            <div className="lg:col-span-2"><ImageControl panel={form.panel} uploading={uploading} onChange={setPanel} onUpload={uploadPanelImage} /></div>
          </div>
        </EditorCard>

        <EditorCard icon={<BookOpen size={19} />} title="Four category cards" description="Category identity and IDs are fixed. Edit the supporting copy, order, CTA labels, and visibility.">
          <div className="space-y-4">
            {form.cards.map((card, index) => <section key={card.category} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold">{categoryLabels[card.category]}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Fixed category ID: {card.category}</p></div><ItemActions index={index} count={form.cards.length} label={categoryLabels[card.category]} onMove={(direction) => moveCard(index, direction)} /></div><div className="grid gap-5 md:grid-cols-2"><Area id={`knowledge-card-${card.category}-description`} label="Description" value={card.description} onChange={(event) => setCard(index, { description: event.target.value })} required /><Field id={`knowledge-card-${card.category}-cta`} label="CTA label" value={card.ctaLabel} onChange={(event) => setCard(index, { ctaLabel: event.target.value })} required /><VisibilityField id={`knowledge-card-${card.category}-visible`} checked={card.isVisible} label="Show this category card" onChange={(value) => setCard(index, { isVisible: value })} /></div></section>)}
          </div>
        </EditorCard>

        <EditorCard icon={<Link2 size={19} />} title="Trending now" description="Add timely academic pointers. Items without an href remain visible as plain text, never as broken links.">
          <div className="space-y-4">
            {form.trendingItems.map((item, index) => <section key={item.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold">Trending item {index + 1}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Saved order {item.displayOrder}</p></div><ItemActions index={index} count={form.trendingItems.length} label={item.title || `item ${index + 1}`} onMove={(direction) => moveTrending(index, direction)} onRemove={() => setField('trendingItems', form.trendingItems.filter((_, itemIndex) => itemIndex !== index).map((entry, entryIndex) => ({ ...entry, displayOrder: entryIndex + 1 })))} /></div><div className="grid gap-5 md:grid-cols-3"><Field id={`knowledge-trending-${item.id}-title`} label="Title" value={item.title} onChange={(event) => setTrending(index, { title: event.target.value })} required /><Field id={`knowledge-trending-${item.id}-href`} label="Optional link" value={item.href ?? ''} onChange={(event) => setTrending(index, { href: event.target.value.trim() || null })} placeholder="/knowledge-hub#..." /><VisibilityField id={`knowledge-trending-${item.id}-visible`} checked={item.isVisible} label="Show this item" onChange={(value) => setTrending(index, { isVisible: value })} /></div></section>)}
            <button type="button" onClick={addTrending} disabled={form.trendingItems.length >= 12} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] px-4 text-sm font-bold hover:border-[hsl(var(--accent))] disabled:opacity-50" data-testid="button-add-knowledge-trending"><Plus size={17} /> Add trending item</button>
          </div>
        </EditorCard>

        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end border-t border-[hsl(var(--border))] pt-5"><button type="submit" disabled={update.isPending || uploading} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[hsl(var(--admin-accent))] px-6 text-sm font-bold text-[hsl(var(--admin-on-accent))] shadow-sm transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" data-testid="button-save-knowledge-hub-mega-menu"><Save size={17} aria-hidden="true" />{update.isPending ? 'Saving menu…' : 'Save Knowledge Hub Menu'}</button></div>
      </form>
    </EditorFrame>
  );
}