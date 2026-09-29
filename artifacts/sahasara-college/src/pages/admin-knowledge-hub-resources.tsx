import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, ImagePlus, Pencil, Plus, Save, Trash2, UploadCloud, X } from 'lucide-react';
import {
  getGetAdminKnowledgeHubResourcesQueryKey,
  getGetKnowledgeHubResourceHubPageQueryKey,
  getGetKnowledgeHubResourcesQueryKey,
  useCompleteAdminKnowledgeHubResourceUpload,
  useCreateAdminKnowledgeHubResource,
  useCreateAdminKnowledgeHubResourceCategory,
  useDeleteAdminKnowledgeHubResource,
  useDeleteAdminKnowledgeHubResourceCategory,
  useGetAdminKnowledgeHubResources,
  useRequestAdminKnowledgeHubResourceUploadUrl,
  useUpdateAdminKnowledgeHubResource,
  useUpdateAdminKnowledgeHubResourceCategory,
  useUpdateAdminKnowledgeHubResourceHubPage,
  type KnowledgeHubResourceCategoryInput,
  type KnowledgeHubResourceHubPageInput,
  type KnowledgeHubResourceInput,
  type KnowledgeHubResourceRecord,
  type KnowledgeHubResourceType,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const inputClass = 'h-11 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';
const selectClass = `${inputClass} cursor-pointer`;
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--admin-focus)/.18)] disabled:cursor-not-allowed disabled:opacity-55';
const typeLabels: Record<KnowledgeHubResourceType, string> = {
  notes: 'Notes',
  'previous-year-question-papers': 'Previous-year question papers',
  'sample-papers': 'Sample papers',
  worksheets: 'Worksheets',
  'revision-guides': 'Revision guides',
  other: 'Other',
};

function blankSettings(): KnowledgeHubResourceHubPageInput {
  return {
    heroEyebrow: '',
    heroHeading: '',
    heroDescription: '',
    heroCtaLabel: '',
    heroCtaHref: '#resource-library',
    heroBackgroundImageObjectPath: null,
    heroBackgroundImageAltText: '',
    featuredEyebrow: '',
    libraryEyebrow: '',
    libraryHeading: '',
    libraryDescription: '',
    searchPlaceholder: '',
    emptyStateTitle: '',
    emptyStateDescription: '',
    featuredResourceId: null,
  };
}

function blankCategory(order: number): KnowledgeHubResourceCategoryInput {
  return { name: '', slug: '', displayOrder: order, isVisible: true };
}

function blankResource(categoryId = '', order = 1): KnowledgeHubResourceInput {
  return {
    title: '',
    slug: '',
    categoryId,
    description: '',
    resourceType: 'notes',
    subject: '',
    exam: '',
    classLevel: '',
    academicYear: '',
    language: 'English',
    tags: [],
    pdfObjectPath: '',
    pdfFileName: '',
    coverImageObjectPath: null,
    coverImageAltText: '',
    displayOrder: order,
    status: 'draft',
  };
}

function objectPreviewUrl(objectPath: string | null) {
  if (!objectPath?.startsWith('/objects/uploads/')) return null;
  const assetId = objectPath.split('/').pop();
  return assetId ? `/api/admin/knowledge-hub/resources/assets/${assetId}` : null;
}

function friendlyError(reason: unknown) {
  return reason instanceof Error ? reason.message : 'The change could not be saved.';
}

function resourceToInput(resource: KnowledgeHubResourceRecord): KnowledgeHubResourceInput {
  return {
    title: resource.title,
    slug: resource.slug,
    categoryId: resource.categoryId,
    description: resource.description,
    resourceType: resource.resourceType,
    subject: resource.subject,
    exam: resource.exam,
    classLevel: resource.classLevel,
    academicYear: resource.academicYear,
    language: resource.language,
    tags: resource.tags,
    pdfObjectPath: resource.pdfObjectPath,
    pdfFileName: resource.pdfFileName,
    coverImageObjectPath: resource.coverImageObjectPath,
    coverImageAltText: resource.coverImageAltText,
    displayOrder: resource.displayOrder,
    status: resource.status,
  };
}

function ResourceUploadField({
  label,
  fileName,
  objectPath,
  previewUrl,
  accept,
  uploading,
  onChange,
  hint,
  testId,
}: {
  label: string;
  fileName?: string;
  objectPath: string | null;
  previewUrl?: string | null;
  accept: string;
  uploading: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  hint: string;
  testId: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4" data-testid={`${testId}-field`}>
      {previewUrl && <div className="aspect-[2.1] overflow-hidden rounded-xl bg-[hsl(var(--admin-input-background))]"><img src={previewUrl} alt="" className="h-full w-full object-cover" data-testid={`${testId}-preview`} /></div>}
      <div className="flex flex-wrap items-center gap-3">
        <label className={`${buttonClass} cursor-pointer border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] text-[hsl(var(--admin-text))]`} data-testid={`${testId}-button`}>
          <input type="file" accept={accept} className="sr-only" onChange={onChange} data-testid={`${testId}-input`} />
          <UploadCloud size={16} /> {uploading ? 'Uploading…' : label}
        </label>
        {fileName && <span className="max-w-full truncate text-xs font-semibold text-[hsl(var(--admin-text-muted)/.8)]">{fileName}</span>}
      </div>
      <p className="text-xs leading-5 text-[hsl(var(--admin-text-muted)/.8)]">{hint}</p>
      {objectPath && <p className="truncate font-mono text-[10px] text-[hsl(var(--admin-text-muted)/.64)]" title={objectPath}>Stored object: {objectPath}</p>}
    </div>
  );
}

export default function AdminKnowledgeHubResources() {
  const queryClient = useQueryClient();
  const query = useGetAdminKnowledgeHubResources();
  const updatePage = useUpdateAdminKnowledgeHubResourceHubPage();
  const createResource = useCreateAdminKnowledgeHubResource();
  const updateResource = useUpdateAdminKnowledgeHubResource();
  const deleteResource = useDeleteAdminKnowledgeHubResource();
  const createCategory = useCreateAdminKnowledgeHubResourceCategory();
  const updateCategory = useUpdateAdminKnowledgeHubResourceCategory();
  const deleteCategory = useDeleteAdminKnowledgeHubResourceCategory();
  const requestUpload = useRequestAdminKnowledgeHubResourceUploadUrl();
  const completeUpload = useCompleteAdminKnowledgeHubResourceUpload();
  const [settings, setSettings] = useState<KnowledgeHubResourceHubPageInput>(blankSettings());
  const [categories, setCategories] = useState<(KnowledgeHubResourceCategoryInput & { id?: string; resourceCount?: number; publishedResourceCount?: number })[]>([]);
  const [resources, setResources] = useState<KnowledgeHubResourceRecord[]>([]);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<KnowledgeHubResourceInput>(blankResource());
  const [tagsText, setTagsText] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<KnowledgeHubResourceCategoryInput>(blankCategory(1));
  const [initialized, setInitialized] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<'pdf' | 'cover' | 'hero' | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data || initialized) return;
    const orderedCategories = [...query.data.categories].sort((a, b) => a.displayOrder - b.displayOrder);
    const orderedResources = [...query.data.resources].sort((a, b) => a.displayOrder - b.displayOrder);
    setSettings(query.data.settings);
    setCategories(orderedCategories);
    setResources(orderedResources);
    if (orderedResources[0]) {
      setResourceId(orderedResources[0].id);
      setResourceForm(resourceToInput(orderedResources[0]));
      setTagsText(orderedResources[0].tags.join(', '));
      setCoverPreview(objectPreviewUrl(orderedResources[0].coverImageObjectPath));
    }
    setHeroPreview(objectPreviewUrl(query.data.settings.heroBackgroundImageObjectPath));
    setInitialized(true);
  }, [initialized, query.data]);

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.displayOrder - b.displayOrder), [categories]);
  const sortedResources = useMemo(() => [...resources].sort((a, b) => a.displayOrder - b.displayOrder), [resources]);
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetAdminKnowledgeHubResourcesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubResourceHubPageQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubResourcesQueryKey() });
  };
  const mutationError = (reason: unknown) => { setError(friendlyError(reason)); setNotice(''); };
  const showSuccess = (message: string) => { setNotice(message); setError(''); };

  const selectResource = (resource: KnowledgeHubResourceRecord) => {
    setResourceId(resource.id);
    setResourceForm(resourceToInput(resource));
    setTagsText(resource.tags.join(', '));
    setCoverPreview(objectPreviewUrl(resource.coverImageObjectPath));
    setError('');
    setNotice('');
  };
  const startNewResource = () => {
    setResourceId(null);
    setResourceForm(blankResource(sortedCategories[0]?.id ?? '', sortedResources.length + 1));
    setTagsText('');
    setCoverPreview(null);
    setError('');
    setNotice('');
  };
  const updateResourceField = <K extends keyof KnowledgeHubResourceInput>(key: K, value: KnowledgeHubResourceInput[K]) => setResourceForm((current) => ({ ...current, [key]: value }));

  const uploadAsset = async (file: File, kind: 'pdf' | 'cover', onComplete: (objectPath: string, imageUrl: string | null) => void) => {
    const isPdf = kind === 'pdf';
    const validType = isPdf ? file.type === 'application/pdf' : ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const maxBytes = isPdf ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!validType) throw new Error(isPdf ? 'Choose a PDF file.' : 'Choose a JPEG, PNG, or WebP image.');
    if (file.size > maxBytes) throw new Error(isPdf ? 'PDFs must be 20 MiB or smaller.' : 'Images must be 5 MiB or smaller.');
    const signed = await requestUpload.mutateAsync({ data: { kind, fileName: file.name, size: file.size, contentType: file.type as 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp' } });
    const putResponse = await fetch(signed.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!putResponse.ok) throw new Error('The file could not be uploaded. Please try again.');
    const completed = await completeUpload.mutateAsync({ data: { kind, objectPath: signed.objectPath } });
    onComplete(completed.objectPath, completed.imageUrl);
  };

  const handleResourceFile = (kind: 'pdf' | 'cover', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(kind); setError('');
    uploadAsset(file, kind, (objectPath, imageUrl) => {
      if (kind === 'pdf') updateResourceField('pdfObjectPath', objectPath);
      else { updateResourceField('coverImageObjectPath', objectPath); setCoverPreview(imageUrl || objectPreviewUrl(objectPath)); }
      if (kind === 'pdf') updateResourceField('pdfFileName', file.name);
      showSuccess(`${kind === 'pdf' ? 'PDF' : 'Cover image'} uploaded. Save the resource to keep it.`);
    }).catch(mutationError).finally(() => setUploading(null));
  };

  const handleHeroUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading('hero'); setError('');
    uploadAsset(file, 'cover', (objectPath, imageUrl) => {
      setSettings((current) => ({ ...current, heroBackgroundImageObjectPath: objectPath }));
      setHeroPreview(imageUrl || objectPreviewUrl(objectPath));
      showSuccess('Hero background uploaded. Save page settings to keep it.');
    }).catch(mutationError).finally(() => setUploading(null));
  };

  const saveSettings = (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    const required = [settings.heroEyebrow, settings.heroHeading, settings.heroDescription, settings.heroCtaLabel, settings.heroCtaHref, settings.featuredEyebrow, settings.libraryEyebrow, settings.libraryHeading, settings.libraryDescription, settings.searchPlaceholder, settings.emptyStateTitle, settings.emptyStateDescription];
    if (required.some((value) => !value.trim())) { setError('Complete every required page field before saving.'); return; }
    if (settings.heroBackgroundImageObjectPath && !settings.heroBackgroundImageAltText.trim()) { setError('Add descriptive alt text for the hero background image.'); return; }
    updatePage.mutate({ data: settings }, { onSuccess: () => { invalidateAll(); showSuccess('Resource Hub page settings saved.'); }, onError: mutationError });
  };

  const clearUnavailableFeaturedResource = (resource: KnowledgeHubResourceRecord) => {
    if (settings.featuredResourceId !== resource.id) return;
    const categoryVisible = categories.some((category) => category.id === resource.categoryId && category.isVisible);
    if (resource.status !== 'published' || !categoryVisible) {
      setSettings((current) => current.featuredResourceId === resource.id ? { ...current, featuredResourceId: null } : current);
    }
  };

  const saveCategory = (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    if (!categoryForm.name.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categoryForm.slug) || categoryForm.displayOrder < 1) { setError('Enter a name, a lowercase hyphenated slug, and a positive order.'); return; }
    const done = (saved: { id: string }) => {
      if (categoryId && !categoryForm.isVisible && settings.featuredResourceId && resources.some((item) => item.id === settings.featuredResourceId && item.categoryId === categoryId)) {
        setSettings((current) => current.featuredResourceId === settings.featuredResourceId ? { ...current, featuredResourceId: null } : current);
      }
      setCategories((current) => categoryId ? current.map((item) => item.id === categoryId ? { ...categoryForm, id: saved.id } : item) : [...current, { ...categoryForm, id: saved.id }]);
      setCategoryId(null); setCategoryForm(blankCategory(sortedCategories.length + 1)); invalidateAll(); showSuccess(categoryId ? 'Category updated.' : 'Category created.');
    };
    if (categoryId) updateCategory.mutate({ id: categoryId, data: categoryForm }, { onSuccess: done, onError: mutationError });
    else createCategory.mutate({ data: categoryForm }, { onSuccess: done, onError: mutationError });
  };

  const removeCategory = (id: string) => {
    const category = sortedCategories.find((item) => item.id === id);
    if (!category || !window.confirm(`Delete “${category.name}”? Categories with resources cannot be deleted.`)) return;
    deleteCategory.mutate({ id }, { onSuccess: () => { setCategories((current) => current.filter((item) => item.id !== id)); invalidateAll(); showSuccess('Category deleted.'); }, onError: mutationError });
  };

  const saveResource = (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    if (!resourceForm.title.trim() || !resourceForm.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resourceForm.slug) || !resourceForm.categoryId || !resourceForm.description.trim() || !resourceForm.subject.trim() || !resourceForm.classLevel.trim() || !resourceForm.language.trim() || !resourceForm.pdfObjectPath || !resourceForm.pdfFileName || (resourceForm.coverImageObjectPath && !resourceForm.coverImageAltText.trim()) || resourceForm.displayOrder < 1) { setError('Complete the required resource fields, including a valid uploaded PDF.'); return; }
    const data = { ...resourceForm, tags: tagsText.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 20) };
    const done = (saved: KnowledgeHubResourceRecord) => { clearUnavailableFeaturedResource(saved); setResources((current) => resourceId ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]); setResourceId(saved.id); setResourceForm(resourceToInput(saved)); setTagsText(saved.tags.join(', ')); invalidateAll(); showSuccess(resourceId ? 'Resource updated.' : 'Resource created.'); };
    if (resourceId) updateResource.mutate({ id: resourceId, data }, { onSuccess: done, onError: mutationError });
    else createResource.mutate({ data }, { onSuccess: done, onError: mutationError });
  };

  const removeResource = (id: string) => {
    const resource = sortedResources.find((item) => item.id === id);
    if (!resource || !window.confirm(`Delete “${resource.title}”? This cannot be undone.`)) return;
    deleteResource.mutate({ id }, { onSuccess: () => { if (settings.featuredResourceId === id) setSettings((current) => current.featuredResourceId === id ? { ...current, featuredResourceId: null } : current); const remaining = resources.filter((item) => item.id !== id); setResources(remaining); if (resourceId === id) { const next = remaining.sort((a, b) => a.displayOrder - b.displayOrder)[0]; if (next) selectResource(next); else startNewResource(); } invalidateAll(); showSuccess('Resource deleted.'); }, onError: mutationError });
  };

  const togglePublished = (resource: KnowledgeHubResourceRecord) => {
    const data = resourceToInput(resource);
    data.status = resource.status === 'published' ? 'draft' : 'published';
    updateResource.mutate({ id: resource.id, data }, { onSuccess: (saved) => { clearUnavailableFeaturedResource(saved); setResources((current) => current.map((item) => item.id === saved.id ? saved : item)); if (resourceId === saved.id) setResourceForm(resourceToInput(saved)); invalidateAll(); showSuccess(saved.status === 'published' ? 'Resource published.' : 'Resource unpublished.'); }, onError: mutationError });
  };

  if (query.isLoading) return <div className="p-6 lg:p-10"><EditorSkeleton /></div>;
  if (query.isError) return <div className="p-6 lg:p-10"><LoadError onRetry={() => query.refetch()} /></div>;

  return (
    <EditorFrame eyebrow="Pages / Knowledge Hub / Resources" title="A dependable shelf for study." description="Shape the public Resource Hub, then keep its published library ordered and useful." previewHref="/knowledge-hub/resources">
      <form onSubmit={saveSettings} className="space-y-6">
        <EditorCard icon={<ImagePlus size={19} />} title="Hero and page copy" description="These fields control the introduction visitors see before they search.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="resource-hub-hero-eyebrow" label="Hero eyebrow" value={settings.heroEyebrow} onChange={(event) => setSettings({ ...settings, heroEyebrow: event.target.value })} required data-testid="input-resource-hub-hero-eyebrow" />
            <Field id="resource-hub-hero-cta-label" label="Hero button label" value={settings.heroCtaLabel} onChange={(event) => setSettings({ ...settings, heroCtaLabel: event.target.value })} required data-testid="input-resource-hub-hero-cta-label" />
            <div className="md:col-span-2"><Field id="resource-hub-hero-heading" label="Hero heading" value={settings.heroHeading} onChange={(event) => setSettings({ ...settings, heroHeading: event.target.value })} required data-testid="input-resource-hub-hero-heading" /></div>
            <div className="md:col-span-2"><Area id="resource-hub-hero-description" label="Hero description" value={settings.heroDescription} onChange={(event) => setSettings({ ...settings, heroDescription: event.target.value })} required data-testid="input-resource-hub-hero-description" /></div>
            <Field id="resource-hub-hero-cta-href" label="Hero button link" value={settings.heroCtaHref} onChange={(event) => setSettings({ ...settings, heroCtaHref: event.target.value })} required data-testid="input-resource-hub-hero-cta-href" />
            <Field id="resource-hub-hero-alt" label="Hero background alt text" value={settings.heroBackgroundImageAltText} onChange={(event) => setSettings({ ...settings, heroBackgroundImageAltText: event.target.value })} data-testid="input-resource-hub-hero-alt" />
          </div>
          <div className="mt-6"><ResourceUploadField label="Upload hero background" objectPath={settings.heroBackgroundImageObjectPath} previewUrl={heroPreview} accept="image/jpeg,image/png,image/webp" uploading={uploading === 'hero'} onChange={handleHeroUpload} hint="JPEG, PNG, or WebP · up to 5 MiB. The stored object path is preserved in page settings." testId="upload-resource-hub-hero" /></div>
        </EditorCard>
        <EditorCard title="Featured and library copy" description="Keep the browsing experience direct and easy to scan.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="resource-hub-featured-eyebrow" label="Featured eyebrow" value={settings.featuredEyebrow} onChange={(event) => setSettings({ ...settings, featuredEyebrow: event.target.value })} required data-testid="input-resource-hub-featured-eyebrow" />
            <Field id="resource-hub-library-eyebrow" label="Library eyebrow" value={settings.libraryEyebrow} onChange={(event) => setSettings({ ...settings, libraryEyebrow: event.target.value })} required data-testid="input-resource-hub-library-eyebrow" />
            <Field id="resource-hub-library-heading" label="Library heading" value={settings.libraryHeading} onChange={(event) => setSettings({ ...settings, libraryHeading: event.target.value })} required data-testid="input-resource-hub-library-heading" />
            <Field id="resource-hub-search-placeholder" label="Search placeholder" value={settings.searchPlaceholder} onChange={(event) => setSettings({ ...settings, searchPlaceholder: event.target.value })} required data-testid="input-resource-hub-search-placeholder" />
            <div className="md:col-span-2"><Area id="resource-hub-library-description" label="Library description" value={settings.libraryDescription} onChange={(event) => setSettings({ ...settings, libraryDescription: event.target.value })} required data-testid="input-resource-hub-library-description" /></div>
            <Field id="resource-hub-empty-title" label="Empty-state title" value={settings.emptyStateTitle} onChange={(event) => setSettings({ ...settings, emptyStateTitle: event.target.value })} required data-testid="input-resource-hub-empty-title" />
            <Area id="resource-hub-empty-description" label="Empty-state description" value={settings.emptyStateDescription} onChange={(event) => setSettings({ ...settings, emptyStateDescription: event.target.value })} required data-testid="input-resource-hub-empty-description" />
             <label className="block space-y-2 md:col-span-2"><span className="text-sm font-semibold text-[hsl(var(--admin-text))]">Featured published resource</span><select value={settings.featuredResourceId ?? ''} onChange={(event) => setSettings({ ...settings, featuredResourceId: event.target.value || null })} className={selectClass} data-testid="select-resource-hub-featured"><option value="">No featured resource</option>{sortedResources.filter((resource) => resource.status === 'published' && sortedCategories.some((category) => category.id === resource.categoryId && category.isVisible)).map((resource) => <option key={resource.id} value={resource.id}>{resource.title}</option>)}</select></label>
          </div>
        </EditorCard>
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={updatePage.isPending} testId="button-save-resource-hub-page">Save page settings</SaveButton></div>
      </form>

      <div className="mt-8 grid gap-6 xl:grid-cols-[.76fr_1.24fr]">
        <EditorCard icon={<Layers3Icon />} title="Categories" description="Categories are ordered on the public filter and can only be removed when unused.">
          <form onSubmit={saveCategory} className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="resource-category-name" label="Name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required data-testid="input-resource-category-name" />
              <Field id="resource-category-slug" label="Slug" value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} required data-testid="input-resource-category-slug" />
              <Field id="resource-category-order" label="Display order" type="number" min={1} value={categoryForm.displayOrder} onChange={(event) => setCategoryForm({ ...categoryForm, displayOrder: Number(event.target.value) })} required data-testid="input-resource-category-order" />
              <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold text-[hsl(var(--admin-text))]"><input type="checkbox" checked={categoryForm.isVisible} onChange={(event) => setCategoryForm({ ...categoryForm, isVisible: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--admin-accent))]" data-testid="checkbox-resource-category-visible" /> Visible publicly</label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><button type="submit" className={`${buttonClass} bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-on-primary))]`} disabled={createCategory.isPending || updateCategory.isPending} data-testid="button-save-resource-category"><Save size={15} /> {categoryId ? 'Update category' : 'Add category'}</button>{categoryId && <button type="button" onClick={() => { setCategoryId(null); setCategoryForm(blankCategory(sortedCategories.length + 1)); }} className={`${buttonClass} border border-[hsl(var(--admin-border))]`} data-testid="button-cancel-resource-category"><X size={15} /> Cancel</button>}</div>
          </form>
          <div className="mt-4 space-y-2" data-testid="list-resource-categories">
            {sortedCategories.length === 0 ? <p className="rounded-xl border border-dashed border-[hsl(var(--admin-border))] p-5 text-sm text-[hsl(var(--admin-text-muted))]">No categories yet. Add the first one above.</p> : sortedCategories.map((category, index) => <div key={category.id || category.slug} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--admin-border))] p-3" data-testid={`row-resource-category-${category.id || index}`}><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{category.name}</p><p className="text-xs text-[hsl(var(--admin-text-muted))]">{category.slug} · {category.resourceCount ?? 0} resources</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${category.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-[hsl(var(--muted))] text-[hsl(var(--admin-text-muted))]'}`}>{category.isVisible ? 'Visible' : 'Hidden'}</span><span className="text-xs font-bold text-[hsl(var(--admin-text-muted))]">#{category.displayOrder}</span>{category.id && <><button type="button" onClick={() => { setCategoryId(category.id || null); setCategoryForm({ name: category.name, slug: category.slug, displayOrder: category.displayOrder, isVisible: category.isVisible }); }} className="rounded-lg p-2 hover:bg-[hsl(var(--admin-border)/.25)]" aria-label={`Edit ${category.name}`} data-testid={`button-edit-resource-category-${category.id}`}><Pencil size={15} /></button><button type="button" onClick={() => removeCategory(category.id || '')} className="rounded-lg p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.08)]" aria-label={`Delete ${category.name}`} data-testid={`button-delete-resource-category-${category.id}`}><Trash2 size={15} /></button></>}</div>)}
          </div>
        </EditorCard>

        <EditorCard icon={<FileText size={19} />} title="Resources" description="Create, order, publish, and maintain the PDFs that appear in the public library.">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[hsl(var(--admin-surface-soft))] p-4"><div><p className="text-sm font-bold">{sortedResources.length} resource{sortedResources.length === 1 ? '' : 's'}</p><p className="mt-1 text-xs text-[hsl(var(--admin-text-muted))]">Only published records are visible publicly.</p></div><button type="button" onClick={startNewResource} className={`${buttonClass} bg-[hsl(var(--admin-primary))] text-[hsl(var(--admin-on-primary))]`} data-testid="button-new-resource"><Plus size={16} /> New resource</button></div>
          <div className="mt-4 space-y-2" data-testid="list-resource-records">
            {sortedResources.length === 0 ? <p className="rounded-xl border border-dashed border-[hsl(var(--admin-border))] p-5 text-sm text-[hsl(var(--admin-text-muted))]">No resources have been created.</p> : sortedResources.map((resource) => <div key={resource.id} className={`flex items-center gap-3 rounded-xl border p-3 ${resource.id === resourceId ? 'border-[hsl(var(--admin-focus))] bg-[hsl(var(--admin-focus)/.06)]' : 'border-[hsl(var(--admin-border))]'}`} data-testid={`row-resource-${resource.id}`}><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{resource.title}</p><p className="truncate text-xs text-[hsl(var(--admin-text-muted))]">{resource.categoryName} · {typeLabels[resource.resourceType]} · order {resource.displayOrder}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${resource.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{resource.status}</span><button type="button" onClick={() => togglePublished(resource)} className={`${buttonClass} min-h-8 px-2.5 text-xs ${resource.status === 'published' ? 'text-amber-800' : 'text-emerald-800'}`} data-testid={`button-toggle-resource-status-${resource.id}`}>{resource.status === 'published' ? 'Unpublish' : 'Publish'}</button><button type="button" onClick={() => selectResource(resource)} className="rounded-lg p-2 hover:bg-[hsl(var(--admin-border)/.25)]" aria-label={`Edit ${resource.title}`} data-testid={`button-edit-resource-${resource.id}`}><Pencil size={15} /></button><button type="button" onClick={() => removeResource(resource.id)} className="rounded-lg p-2 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.08)]" aria-label={`Delete ${resource.title}`} data-testid={`button-delete-resource-${resource.id}`}><Trash2 size={15} /></button></div>)}
          </div>
          <form onSubmit={saveResource} className="mt-6 border-t border-[hsl(var(--admin-border))] pt-6">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--admin-accent))]">{resourceId ? 'Editing resource' : 'New resource'}</p><h3 className="mt-1 font-display text-2xl font-semibold">{resourceId ? resourceForm.title || 'Untitled resource' : 'Add a library item'}</h3></div>{resourceId && <button type="button" onClick={startNewResource} className="rounded-lg p-2 hover:bg-[hsl(var(--admin-border)/.25)]" aria-label="Close resource editor" data-testid="button-close-resource-editor"><X size={18} /></button>}</div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field id="resource-title" label="Title" value={resourceForm.title} onChange={(event) => updateResourceField('title', event.target.value)} required data-testid="input-resource-title" />
              <Field id="resource-slug" label="Slug" value={resourceForm.slug} onChange={(event) => updateResourceField('slug', event.target.value)} required data-testid="input-resource-slug" />
              <label className="block space-y-2"><span className="text-sm font-semibold">Category</span><select value={resourceForm.categoryId} onChange={(event) => updateResourceField('categoryId', event.target.value)} className={selectClass} required data-testid="select-resource-edit-category"><option value="">Choose category</option>{sortedCategories.map((item) => <option key={item.id || item.slug} value={item.id}>{item.name}</option>)}</select></label>
              <label className="block space-y-2"><span className="text-sm font-semibold">Resource type</span><select value={resourceForm.resourceType} onChange={(event) => updateResourceField('resourceType', event.target.value as KnowledgeHubResourceType)} className={selectClass} required data-testid="select-resource-edit-type">{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <div className="md:col-span-2"><Area id="resource-description" label="Description" value={resourceForm.description} onChange={(event) => updateResourceField('description', event.target.value)} required data-testid="input-resource-description" /></div>
              <Field id="resource-subject" label="Subject" value={resourceForm.subject} onChange={(event) => updateResourceField('subject', event.target.value)} required data-testid="input-resource-subject" />
              <Field id="resource-exam" label="Exam" value={resourceForm.exam} onChange={(event) => updateResourceField('exam', event.target.value)} data-testid="input-resource-exam" />
              <Field id="resource-class-level" label="Class level" value={resourceForm.classLevel} onChange={(event) => updateResourceField('classLevel', event.target.value)} required data-testid="input-resource-class-level" />
              <Field id="resource-academic-year" label="Academic year" value={resourceForm.academicYear} onChange={(event) => updateResourceField('academicYear', event.target.value)} data-testid="input-resource-academic-year" />
              <Field id="resource-language" label="Language" value={resourceForm.language} onChange={(event) => updateResourceField('language', event.target.value)} required data-testid="input-resource-language" />
              <Field id="resource-order" label="Display order" type="number" min={1} value={resourceForm.displayOrder} onChange={(event) => updateResourceField('displayOrder', Number(event.target.value))} required data-testid="input-resource-order" />
              <Field id="resource-tags" label="Tags" hint="Comma separated" value={tagsText} onChange={(event) => setTagsText(event.target.value)} data-testid="input-resource-tags" />
              <label className="block space-y-2"><span className="text-sm font-semibold">Status</span><select value={resourceForm.status} onChange={(event) => updateResourceField('status', event.target.value as 'draft' | 'published')} className={selectClass} data-testid="select-resource-status"><option value="draft">Draft</option><option value="published">Published</option></select></label>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <ResourceUploadField label="Upload PDF" fileName={resourceForm.pdfFileName} objectPath={resourceForm.pdfObjectPath || null} accept="application/pdf" uploading={uploading === 'pdf'} onChange={(event) => handleResourceFile('pdf', event)} hint="PDF only · up to 20 MiB. Upload first, then save the resource." testId="upload-resource-pdf" />
              <ResourceUploadField label="Upload cover image" objectPath={resourceForm.coverImageObjectPath} previewUrl={coverPreview} accept="image/jpeg,image/png,image/webp" uploading={uploading === 'cover'} onChange={(event) => handleResourceFile('cover', event)} hint="Optional JPEG, PNG, or WebP · up to 5 MiB." testId="upload-resource-cover" />
            </div>
            <div className="mt-4"><Field id="resource-cover-alt" label="Cover image alt text" value={resourceForm.coverImageAltText} onChange={(event) => updateResourceField('coverImageAltText', event.target.value)} required={Boolean(resourceForm.coverImageObjectPath)} data-testid="input-resource-cover-alt" /></div>
            <div className="mt-5 flex justify-end"><SaveButton pending={createResource.isPending || updateResource.isPending} testId="button-save-resource">{resourceId ? 'Save resource' : 'Create resource'}</SaveButton></div>
          </form>
        </EditorCard>
      </div>
    </EditorFrame>
  );
}

function Layers3Icon() {
  return <span className="grid h-5 w-5 place-items-center rounded-md border border-current text-[hsl(var(--admin-accent))]"><span className="h-2.5 w-2.5 border border-current" /></span>;
}