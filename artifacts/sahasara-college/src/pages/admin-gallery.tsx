import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetAdminGalleryQueryKey, getGetGalleryPageQueryKey, getGetHomepageGalleryQueryKey, useCreateAdminGalleryItem, useDeleteAdminGalleryItem, useGetAdminGallery, useUpdateAdminGalleryItem, useUpdateAdminGalleryOrder, useUpdateAdminGallerySettings, useUploadAdminImage, type GalleryItem, type GalleryItemInput, type GalleryItemInputCategory } from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const CATEGORIES: GalleryItemInputCategory[] = ['Campus', 'Classrooms', 'Sports', 'Labs', 'Library', 'Achievements', 'Events'];
const emptyItem: GalleryItemInput = { imageUrl: null, imageAltText: '', title: '', description: null, category: 'Campus', locationLabel: null, displayOrder: 1, isPublished: false, showInHomePreview: false, showOnCourses: false, homePreviewOrder: 1 };
type EditableItem = GalleryItemInput & { id: string };

function toInput(item: GalleryItem): EditableItem { return { id: item.id, imageUrl: item.imageUrl, imageAltText: item.imageAltText, title: item.title, description: item.description, category: item.category, locationLabel: item.locationLabel, displayOrder: item.displayOrder, isPublished: item.isPublished, showInHomePreview: item.showInHomePreview, showOnCourses: item.showOnCourses, homePreviewOrder: item.homePreviewOrder }; }

function UploadField({ onUploaded }: { onUploaded: (url: string) => void }) {
  const upload = useUploadAdminImage();
  const onChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) upload.mutate({ data: { file, purpose: 'gallery' } }, { onSuccess: (result) => onUploaded(result.url) }); };
  return <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-bold"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onChange} />{upload.isPending ? 'Uploading…' : <><ImagePlus size={14} /> Upload image</>}</label>;
}

export default function AdminGallery() {
  const client = useQueryClient();
  const query = useGetAdminGallery();
  const saveSettings = useUpdateAdminGallerySettings();
  const createItem = useCreateAdminGalleryItem();
  const updateItem = useUpdateAdminGalleryItem();
  const deleteItem = useDeleteAdminGalleryItem();
  const updateOrder = useUpdateAdminGalleryOrder();
  const [settings, setSettings] = useState({ eyebrow: 'Campus Gallery', heading: 'Life at Sahasrah College', description: '' });
  const [items, setItems] = useState<EditableItem[]>([]);
  const [newItem, setNewItem] = useState<GalleryItemInput>({ ...emptyItem });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (query.data) { setSettings(query.data.settings); setItems(query.data.items.slice().sort((a, b) => a.displayOrder - b.displayOrder).map(toInput)); } }, [query.data]);
  const invalidate = () => { client.invalidateQueries({ queryKey: getGetAdminGalleryQueryKey() }); client.invalidateQueries({ queryKey: getGetGalleryPageQueryKey() }); client.invalidateQueries({ queryKey: getGetHomepageGalleryQueryKey() }); };
  const feedback = (message: string) => { setNotice(message); setError(''); };
  const fail = (message: string) => { setError(message); setNotice(''); };
  const savePageSettings = (event: FormEvent) => { event.preventDefault(); if (!settings.eyebrow.trim() || !settings.heading.trim()) { fail('Add an eyebrow and heading before saving.'); return; } saveSettings.mutate({ data: settings }, { onSuccess: () => { invalidate(); feedback('Gallery page settings saved.'); }, onError: () => fail('Gallery page settings could not be saved.') }); };
  const saveItem = (item: EditableItem) => { if (!item.title.trim() || !item.imageAltText.trim()) { fail('Each item needs a title and readable alt text.'); return; } if (item.isPublished && !item.imageUrl) { fail('Published gallery items need an image. Keep this item as a draft until it has one.'); return; } const { id, ...data } = item; updateItem.mutate({ id, data }, { onSuccess: (saved) => { setItems((current) => current.map((entry) => entry.id === id ? toInput(saved) : entry)); invalidate(); feedback(`“${saved.title}” saved.`); }, onError: () => fail('This gallery item could not be saved.') }); };
  const addItem = (event: FormEvent) => { event.preventDefault(); if (!newItem.title.trim() || !newItem.imageAltText.trim()) { fail('Add a title and readable alt text before creating an item.'); return; } if (newItem.isPublished && !newItem.imageUrl) { fail('Published gallery items need an image. Keep this item as a draft until it has one.'); return; } createItem.mutate({ data: { ...newItem, displayOrder: items.length + 1, homePreviewOrder: items.filter((item) => item.showInHomePreview).length + 1 } }, { onSuccess: (created) => { setItems((current) => [...current, toInput(created)]); setNewItem({ ...emptyItem, displayOrder: items.length + 2, homePreviewOrder: items.length + 2 }); invalidate(); feedback('Gallery item added.'); }, onError: () => fail('The gallery item could not be added.') }); };
  const removeItem = (item: EditableItem) => { if (!window.confirm(`Delete “${item.title || 'this gallery item'}”? This cannot be undone.`)) return; deleteItem.mutate({ id: item.id }, { onSuccess: () => { setItems((current) => current.filter((entry) => entry.id !== item.id).map((entry, index) => ({ ...entry, displayOrder: index + 1 }))); invalidate(); feedback('Gallery item deleted.'); }, onError: () => fail('The gallery item could not be deleted.') }); };
  const moveItem = (index: number, direction: -1 | 1) => { const next = [...items]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setItems(next.map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 }))); };
  const saveOrder = () => { updateOrder.mutate({ data: { items: items.map((item) => ({ id: item.id, displayOrder: item.displayOrder, homePreviewOrder: item.homePreviewOrder })) } }, { onSuccess: () => { invalidate(); feedback('Gallery and Home preview order saved.'); }, onError: () => fail('The gallery order could not be saved.') }); };
  const patchNew = (patch: Partial<GalleryItemInput>) => setNewItem((current) => ({ ...current, ...patch }));
  const patchItem = (id: string, patch: Partial<EditableItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Gallery" title="Keep the campus window honest." description="Manage the public gallery and the small set of moments selected for the Home preview. Drafts can stay image-free until they are ready." previewHref="/gallery">
    <div className="mt-10 space-y-6">
      <form onSubmit={savePageSettings}><EditorCard title="Gallery page introduction" description="This copy belongs to the public Gallery page, not the Home preview."><div className="space-y-4"><Field id="gallery-settings-eyebrow" label="Eyebrow" value={settings.eyebrow} onChange={(event) => setSettings({ ...settings, eyebrow: event.target.value })} required /><Field id="gallery-settings-heading" label="Heading" value={settings.heading} onChange={(event) => setSettings({ ...settings, heading: event.target.value })} required /><Area id="gallery-settings-description" label="Description" value={settings.description} onChange={(event) => setSettings({ ...settings, description: event.target.value })} /><div className="flex justify-end"><SaveButton pending={saveSettings.isPending}>Save page introduction</SaveButton></div></div></EditorCard></form>
       <EditorCard title="Add a gallery item" description="Use the shared upload flow. Imported images are never copied into this collection.">
         <form onSubmit={addItem} className="space-y-4">
           <div className="grid gap-4 md:grid-cols-2">
             <Field id="new-gallery-title" label="Title" value={newItem.title} onChange={(event) => patchNew({ title: event.target.value })} required />
             <Field id="new-gallery-alt" label="Image alt text" value={newItem.imageAltText} onChange={(event) => patchNew({ imageAltText: event.target.value })} required />
             <Field id="new-gallery-location" label="Location label" value={newItem.locationLabel || ''} onChange={(event) => patchNew({ locationLabel: event.target.value || null })} />
             <label className="space-y-2 text-sm font-semibold">
               <span>Category</span>
               <select value={newItem.category} onChange={(event) => patchNew({ category: event.target.value as GalleryItemInputCategory })} className="h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3">
                 {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
               </select>
             </label>
           </div>
           <Area id="new-gallery-description" label="Description" value={newItem.description || ''} onChange={(event) => patchNew({ description: event.target.value || null })} />
           <div className="flex flex-wrap items-center gap-4">
             <UploadField onUploaded={(url) => patchNew({ imageUrl: url })} />
             <label className="flex items-center gap-2 text-sm font-semibold">
               <input type="checkbox" checked={newItem.isPublished} onChange={(event) => patchNew({ isPublished: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" />
               Publish item
             </label>
             <label className="flex items-center gap-2 text-sm font-semibold">
               <input type="checkbox" checked={newItem.showOnCourses} onChange={(event) => patchNew({ showOnCourses: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" data-testid="checkbox-new-gallery-show-on-courses" />
               Show on Courses page
             </label>
             <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-add-gallery-item"><Plus size={16} /> Add item</button>
           </div>
         </form>
       </EditorCard>
       <EditorCard title="Gallery collection" description="The full-page order is the order visitors see. Home and Courses selections are independent.">
         <div className="space-y-5">
           {items.length ? items.map((item, index) => (
             <article key={item.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5" data-testid={`card-admin-gallery-${item.id}`}>
               <div className="flex flex-wrap items-start justify-between gap-4">
                 <div className="flex items-center gap-3">
                   <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[hsl(var(--primary))]">
                     {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={18} className="text-[hsl(var(--accent))]" />}
                   </div>
                   <div>
                     <p className="text-xs font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Item {index + 1} · {item.category}</p>
                     <h3 className="mt-1 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.title || 'Untitled draft'}</h3>
                   </div>
                 </div>
                 <div className="flex items-center gap-1">
                   <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} aria-label="Move item up" className="rounded-lg p-2 disabled:opacity-25" data-testid={`button-move-gallery-up-${item.id}`}><ArrowUp size={16} /></button>
                   <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} aria-label="Move item down" className="rounded-lg p-2 disabled:opacity-25" data-testid={`button-move-gallery-down-${item.id}`}><ArrowDown size={16} /></button>
                   <button type="button" onClick={() => removeItem(item)} aria-label={`Delete ${item.title}`} className="rounded-lg p-2 text-[hsl(var(--destructive))]" data-testid={`button-delete-gallery-${item.id}`}><Trash2 size={16} /></button>
                 </div>
               </div>
               <div className="mt-5 grid gap-4 md:grid-cols-2">
                 <Field id={`gallery-title-${item.id}`} label="Title" value={item.title} onChange={(event) => patchItem(item.id, { title: event.target.value })} required />
                 <Field id={`gallery-alt-${item.id}`} label="Image alt text" value={item.imageAltText} onChange={(event) => patchItem(item.id, { imageAltText: event.target.value })} required />
                 <Field id={`gallery-location-${item.id}`} label="Location label" value={item.locationLabel || ''} onChange={(event) => patchItem(item.id, { locationLabel: event.target.value || null })} />
                 <label className="space-y-2 text-sm font-semibold">
                   <span>Category</span>
                   <select value={item.category} onChange={(event) => patchItem(item.id, { category: event.target.value as GalleryItemInputCategory })} className="h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3">
                     {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
                   </select>
                 </label>
                 <Field id={`gallery-order-${item.id}`} type="number" min={1} label="Full-page order" value={item.displayOrder} onChange={(event) => patchItem(item.id, { displayOrder: Number(event.target.value) })} />
                 <Field id={`gallery-home-order-${item.id}`} type="number" min={1} label="Home preview order" value={item.homePreviewOrder} onChange={(event) => patchItem(item.id, { homePreviewOrder: Number(event.target.value) })} />
                 <div className="md:col-span-2">
                   <Area id={`gallery-description-${item.id}`} label="Description" value={item.description || ''} onChange={(event) => patchItem(item.id, { description: event.target.value || null })} />
                 </div>
               </div>
               <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                 <div className="flex flex-wrap items-center gap-4">
                   <UploadField onUploaded={(url) => patchItem(item.id, { imageUrl: url })} />
                   <label className="flex items-center gap-2 text-sm font-semibold">
                     <input type="checkbox" checked={item.isPublished} onChange={(event) => patchItem(item.id, { isPublished: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                     Published
                   </label>
                   <label className="flex items-center gap-2 text-sm font-semibold">
                     <input type="checkbox" checked={item.showInHomePreview} onChange={(event) => patchItem(item.id, { showInHomePreview: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                     Show on Home
                   </label>
                   <label className="flex items-center gap-2 text-sm font-semibold">
                     <input type="checkbox" checked={item.showOnCourses} onChange={(event) => patchItem(item.id, { showOnCourses: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" data-testid={`checkbox-gallery-show-on-courses-${item.id}`} />
                     Show on Courses page
                   </label>
                 </div>
                 <button type="button" onClick={() => saveItem(item)} className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))]" data-testid={`button-save-gallery-${item.id}`}><Save size={15} /> Save item</button>
               </div>
             </article>
           )) : (
             <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] px-5 py-12 text-center text-sm text-[hsl(var(--muted-foreground))]">No gallery items yet. Add the first campus moment above.</div>
           )}
         </div>
         <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
           <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">Save order after moving items or changing either order field.</p>
           <button type="button" onClick={saveOrder} disabled={!items.length || updateOrder.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-60" data-testid="button-save-gallery-order"><Save size={15} />{updateOrder.isPending ? 'Saving order…' : 'Save order'}</button>
         </div>
       </EditorCard>
      <SaveStatus error={error} notice={notice} />
    </div>
  </EditorFrame>;
}