import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FileImage, Layers3, Pencil, Plus, Save, Trash2, UploadCloud, X } from 'lucide-react';
import {
  getGetAdminKnowledgeHubVideoHubQueryKey,
  getGetKnowledgeHubVideoHubPageQueryKey,
  getGetKnowledgeHubVideoHubVideosQueryKey,
  useCompleteAdminKnowledgeHubVideoImageUpload,
  useCreateAdminKnowledgeHubVideo,
  useCreateAdminKnowledgeHubVideoCategory,
  useDeleteAdminKnowledgeHubVideo,
  useDeleteAdminKnowledgeHubVideoCategory,
  useGetAdminKnowledgeHubVideoHub,
  useRequestAdminKnowledgeHubVideoImageUploadUrl,
  useUpdateAdminKnowledgeHubVideo,
  useUpdateAdminKnowledgeHubVideoCategory,
  useUpdateAdminKnowledgeHubVideoHubPage,
  type KnowledgeHubVideoCategoryInput,
  type KnowledgeHubVideoHubPageInput,
  type KnowledgeHubVideoInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const inputClass = 'h-11 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';
const selectClass = `${inputClass} cursor-pointer`;
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--admin-focus)/.18)] disabled:cursor-not-allowed disabled:opacity-55';

function blankSettings(): KnowledgeHubVideoHubPageInput {
  return {
    heroEyebrow: '',
    heroTitle: '',
    heroAccentText: '',
    heroDescription: '',
    heroCtaLabel: '',
    heroBackgroundImageObjectPath: null,
    heroBackgroundImageAltText: '',
    highlights: [{ label: '', description: '' }],
    featuredEyebrow: '',
    libraryEyebrow: '',
    libraryTitle: '',
    libraryDescription: '',
    searchPlaceholder: '',
    emptyStateTitle: '',
    emptyStateDescription: '',
    featuredVideoId: null,
  };
}

function blankCategory(order: number): KnowledgeHubVideoCategoryInput {
  return { name: '', slug: '', icon: 'play-circle', displayOrder: order, isVisible: true };
}

function blankVideo(categoryId = '', order = 1): KnowledgeHubVideoInput {
  return { title: '', slug: '', categoryId, description: '', instructor: '', duration: '', youtubeUrl: '', thumbnailObjectPath: null, thumbnailImageAltText: '', displayOrder: order, status: 'draft' };
}

function youtubeIsValid(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return false;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = url.hostname === 'youtu.be'
      ? pathParts.length === 1 ? pathParts[0] : ''
      : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)
        ? url.pathname === '/watch' ? url.searchParams.get('v') : pathParts.length === 2 && ['shorts', 'embed', 'live', 'v'].includes(pathParts[0]) ? pathParts[1] : ''
        : '';
    return /^[A-Za-z0-9_-]{11}$/.test(id || '');
  } catch {
    return false;
  }
}

function imageUrlForObjectPath(value: string | null) {
  if (!value?.startsWith('/objects/uploads/')) return null;
  const id = value.split('/').pop();
  return id ? `/api/knowledge-hub/video-hub/assets/${id}` : null;
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="border-b border-[hsl(var(--admin-border))] pb-5"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--admin-accent))]">{eyebrow}</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-.04em] text-[hsl(var(--admin-text))]">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--admin-muted))]">{description}</p></div>;
}

function ImageUploadField({ currentUrl, alt, onUploaded, requestUpload, completeUpload }: { currentUrl: string | null; alt: string; onUploaded: (objectPath: string, imageUrl: string) => void; requestUpload: ReturnType<typeof useRequestAdminKnowledgeHubVideoImageUploadUrl>; completeUpload: ReturnType<typeof useCompleteAdminKnowledgeHubVideoImageUpload> }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(currentUrl);
  useEffect(() => { setPreview(currentUrl); }, [currentUrl]);
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage('Choose a JPG, PNG, or WebP image up to 5 MB.');
      return;
    }
    setPending(true); setMessage('');
    try {
      const response = await requestUpload.mutateAsync({ data: { fileName: file.name, size: file.size, contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' } });
      const uploadResponse = await fetch(response.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!uploadResponse.ok) throw new Error('Upload failed');
      const completed = await completeUpload.mutateAsync({ data: { objectPath: response.objectPath } });
      setPreview(completed.imageUrl);
      onUploaded(completed.objectPath, completed.imageUrl);
      setMessage('Image uploaded and ready to save.');
    } catch {
      setMessage('The image could not be uploaded. Try again.');
    } finally {
      setPending(false);
      event.target.value = '';
    }
  };
  return <div className="space-y-3 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4"><div className="aspect-[2.4] overflow-hidden rounded-xl bg-[hsl(var(--admin-input-background))]">{preview ? <img src={preview} alt={alt || 'Video Hub image preview'} className="h-full w-full object-cover" data-testid="img-admin-video-hub-preview" /> : <div className="grid h-full place-items-center text-[hsl(var(--admin-muted))]"><FileImage size={32} strokeWidth={1.2} /></div>}</div><label className={`${buttonClass} w-fit cursor-pointer bg-[hsl(var(--admin-text))] text-[hsl(var(--admin-surface))]`}><UploadCloud size={16} />{pending ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="sr-only" disabled={pending} data-testid="input-upload-video-hub-image" /></label><p className="text-xs text-[hsl(var(--admin-muted))]">{message || 'JPG, PNG, or WebP · maximum 5 MB'}</p></div>;
}

function ErrorPanel({ retry }: { retry: () => void }) {
  return <div className="rounded-2xl border border-[hsl(var(--destructive)/.22)] bg-[hsl(var(--destructive)/.06)] p-7 text-center" role="alert" data-testid="status-admin-video-hub-error"><p className="text-sm font-bold text-[hsl(var(--destructive))]">Video Hub data could not be loaded.</p><button type="button" onClick={retry} className={`${buttonClass} mt-4 bg-[hsl(var(--admin-text))] text-[hsl(var(--admin-surface))]`} data-testid="button-retry-admin-video-hub">Try again</button></div>;
}

export default function AdminKnowledgeHubVideos() {
  const queryClient = useQueryClient();
  const hubQuery = useGetAdminKnowledgeHubVideoHub();
  const updatePage = useUpdateAdminKnowledgeHubVideoHubPage();
  const createVideo = useCreateAdminKnowledgeHubVideo();
  const updateVideo = useUpdateAdminKnowledgeHubVideo();
  const deleteVideo = useDeleteAdminKnowledgeHubVideo();
  const createCategory = useCreateAdminKnowledgeHubVideoCategory();
  const updateCategory = useUpdateAdminKnowledgeHubVideoCategory();
  const deleteCategory = useDeleteAdminKnowledgeHubVideoCategory();
  const requestUpload = useRequestAdminKnowledgeHubVideoImageUploadUrl();
  const completeUpload = useCompleteAdminKnowledgeHubVideoImageUpload();
  const [settings, setSettings] = useState<KnowledgeHubVideoHubPageInput>(blankSettings());
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState<KnowledgeHubVideoInput>(blankVideo());
  const [categoryForm, setCategoryForm] = useState<KnowledgeHubVideoCategoryInput>(blankCategory(1));
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (hubQuery.data && !initialized) {
      setSettings(hubQuery.data.settings);
      setVideoForm(blankVideo(hubQuery.data.categories[0]?.id ?? '', hubQuery.data.videos.length + 1));
      setInitialized(true);
    }
  }, [hubQuery.data, initialized]);

  const categories = useMemo(() => [...(hubQuery.data?.categories ?? [])].sort((a, b) => a.displayOrder - b.displayOrder), [hubQuery.data?.categories]);
  const videos = useMemo(() => [...(hubQuery.data?.videos ?? [])].sort((a, b) => a.displayOrder - b.displayOrder), [hubQuery.data?.videos]);
  const selectedVideo = selectedVideoId ? videos.find((video) => video.id === selectedVideoId) : null;
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetAdminKnowledgeHubVideoHubQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubVideoHubPageQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubVideoHubVideosQueryKey() });
  };
  const mutationError = (reason: unknown) => setError(reason instanceof Error ? reason.message : 'The change could not be saved.');

  const saveSettings = (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    updatePage.mutate({ data: settings }, { onSuccess: () => { invalidateAll(); setNotice('Page settings saved.'); }, onError: mutationError });
  };
  const saveCategory = (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    const done = () => {
      if (editingCategoryId && !categoryForm.isVisible && settings.featuredVideoId && videos.some((video) => video.id === settings.featuredVideoId && video.categoryId === editingCategoryId)) {
        setSettings((current) => ({ ...current, featuredVideoId: null }));
      }
      invalidateAll(); setNotice(editingCategoryId ? 'Category updated.' : 'Category created.'); setCategoryForm(blankCategory(categories.length + 1)); setEditingCategoryId(null);
    };
    if (editingCategoryId) updateCategory.mutate({ id: editingCategoryId, data: categoryForm }, { onSuccess: done, onError: mutationError });
    else createCategory.mutate({ data: categoryForm }, { onSuccess: done, onError: mutationError });
  };
  const saveVideo = (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    if (!youtubeIsValid(videoForm.youtubeUrl)) { setError('Enter a valid YouTube watch or youtu.be URL.'); return; }
    const done = () => {
      const categoryIsVisible = categories.find((category) => category.id === videoForm.categoryId)?.isVisible ?? false;
      if (selectedVideoId && selectedVideoId === settings.featuredVideoId && (videoForm.status !== 'published' || !categoryIsVisible)) {
        setSettings((current) => ({ ...current, featuredVideoId: null }));
      }
      invalidateAll(); setNotice(selectedVideoId ? 'Video updated.' : 'Video created.'); setVideoForm(blankVideo(categories[0]?.id ?? '', videos.length + 1)); setSelectedVideoId(null);
    };
    if (selectedVideoId) updateVideo.mutate({ id: selectedVideoId, data: videoForm }, { onSuccess: done, onError: mutationError });
    else createVideo.mutate({ data: videoForm }, { onSuccess: done, onError: mutationError });
  };
  const editVideo = (id: string) => {
    const video = videos.find((item) => item.id === id);
    if (!video) return;
    setSelectedVideoId(id);
    setVideoForm({ title: video.title, slug: video.slug, categoryId: video.categoryId, description: video.description, instructor: video.instructor, duration: video.duration, youtubeUrl: video.youtubeUrl, thumbnailObjectPath: video.thumbnailObjectPath, thumbnailImageAltText: video.thumbnailImageAltText, displayOrder: video.displayOrder, status: video.status });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };
  const editCategory = (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    setEditingCategoryId(id);
    setCategoryForm({ name: category.name, slug: category.slug, icon: category.icon, displayOrder: category.displayOrder, isVisible: category.isVisible });
  };
  const removeVideo = (id: string) => {
    if (!window.confirm('Delete this video session? This cannot be undone.')) return;
    deleteVideo.mutate({ id }, { onSuccess: () => { invalidateAll(); setNotice('Video deleted.'); if (settings.featuredVideoId === id) setSettings((current) => ({ ...current, featuredVideoId: null })); if (selectedVideoId === id) { setSelectedVideoId(null); setVideoForm(blankVideo(categories[0]?.id ?? '', videos.length)); } }, onError: mutationError });
  };
  const removeCategory = (id: string) => {
    if (!window.confirm('Delete this category? Only categories without videos can be removed.')) return;
    deleteCategory.mutate({ id }, { onSuccess: () => { invalidateAll(); setNotice('Category deleted.'); }, onError: mutationError });
  };

  if (hubQuery.isLoading) return <EditorSkeleton />;
  if (hubQuery.isError || !hubQuery.data) return <EditorFrame eyebrow="Pages / Knowledge Hub / Videos" title="Video Hub" description="Manage the public learning library." previewHref="/knowledge-hub/videos"><ErrorPanel retry={() => hubQuery.refetch()} /></EditorFrame>;

  return (
    <EditorFrame eyebrow="Pages / Knowledge Hub / Videos" title="A library students can return to." description="Edit the Video Hub page, publish real YouTube sessions, and keep the shelf in a clear order." previewHref="/knowledge-hub/videos">
      <div className="mt-8 space-y-7">
        <form onSubmit={saveSettings} className="space-y-6">
          <EditorCard title="Page settings" description="Shape the public introduction, featured session label, search language, and empty state without touching the rest of Knowledge Hub.">
            <SectionTitle eyebrow="Public copy" title="Set the tone before the first play." description="The accent text is shown on its own line in the public hero." />
            <div className="mt-6 grid gap-5 md:grid-cols-2"><Field id="video-hub-hero-eyebrow" label="Hero eyebrow" value={settings.heroEyebrow} onChange={(event) => setSettings({ ...settings, heroEyebrow: event.target.value })} required /><Field id="video-hub-hero-cta" label="Hero CTA label" value={settings.heroCtaLabel} onChange={(event) => setSettings({ ...settings, heroCtaLabel: event.target.value })} required /><Field id="video-hub-hero-title" label="Hero title" value={settings.heroTitle} onChange={(event) => setSettings({ ...settings, heroTitle: event.target.value })} required /><Field id="video-hub-hero-accent" label="Hero accent text" value={settings.heroAccentText} onChange={(event) => setSettings({ ...settings, heroAccentText: event.target.value })} required /></div>
            <div className="mt-5"><Area id="video-hub-hero-description" label="Hero description" value={settings.heroDescription} onChange={(event) => setSettings({ ...settings, heroDescription: event.target.value })} required /></div>
          </EditorCard>
          <EditorCard title="Hero image" description="Upload a wide background image directly to object storage. The file never passes through the application server.">
            <ImageUploadField currentUrl={imageUrlForObjectPath(settings.heroBackgroundImageObjectPath)} alt={settings.heroBackgroundImageAltText} onUploaded={(objectPath) => setSettings({ ...settings, heroBackgroundImageObjectPath: objectPath })} requestUpload={requestUpload} completeUpload={completeUpload} />
            <div className="mt-5"><Field id="video-hub-hero-image-alt" label="Image alt text" value={settings.heroBackgroundImageAltText} onChange={(event) => setSettings({ ...settings, heroBackgroundImageAltText: event.target.value })} required={Boolean(settings.heroBackgroundImageObjectPath)} /></div>
            <p className="mt-3 text-xs text-[hsl(var(--admin-muted))]">The saved object path is kept with the page. Upload a replacement to change the image.</p>
          </EditorCard>
          <EditorCard title="Highlights" description="Short proof points shown beneath the hero CTA. Keep at least one highlight.">
            <div className="space-y-3">{settings.highlights.map((highlight, index) => <div key={`highlight-${index}`} className="grid gap-3 rounded-xl bg-[hsl(var(--admin-surface-soft))] p-4 md:grid-cols-[.7fr_1fr_auto]"><Field id={`video-hub-highlight-label-${index}`} label={`Label ${index + 1}`} value={highlight.label} onChange={(event) => { const highlights = [...settings.highlights]; highlights[index] = { ...highlights[index], label: event.target.value }; setSettings({ ...settings, highlights }); }} required /><Field id={`video-hub-highlight-description-${index}`} label="Description" value={highlight.description} onChange={(event) => { const highlights = [...settings.highlights]; highlights[index] = { ...highlights[index], description: event.target.value }; setSettings({ ...settings, highlights }); }} required /><button type="button" onClick={() => setSettings({ ...settings, highlights: settings.highlights.filter((_, item) => item !== index) })} disabled={settings.highlights.length <= 1} className={`${buttonClass} self-end border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-muted))]`} aria-label={`Remove highlight ${index + 1}`} data-testid={`button-remove-video-hub-highlight-${index}`}><Trash2 size={16} /></button></div>)}</div><button type="button" onClick={() => setSettings({ ...settings, highlights: [...settings.highlights, { label: '', description: '' }] })} disabled={settings.highlights.length >= 6} className={`${buttonClass} mt-4 border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]`} data-testid="button-add-video-hub-highlight"><Plus size={16} /> Add highlight</button>
          </EditorCard>
          <EditorCard title="Featured and library copy" description="These labels frame the featured session and the searchable shelf.">
            <div className="grid gap-5 md:grid-cols-2"><Field id="video-hub-featured-eyebrow" label="Featured eyebrow" value={settings.featuredEyebrow} onChange={(event) => setSettings({ ...settings, featuredEyebrow: event.target.value })} required /><Field id="video-hub-library-eyebrow" label="Library eyebrow" value={settings.libraryEyebrow} onChange={(event) => setSettings({ ...settings, libraryEyebrow: event.target.value })} required /><Field id="video-hub-library-title" label="Library title" value={settings.libraryTitle} onChange={(event) => setSettings({ ...settings, libraryTitle: event.target.value })} required /><Field id="video-hub-search-placeholder" label="Search placeholder" value={settings.searchPlaceholder} onChange={(event) => setSettings({ ...settings, searchPlaceholder: event.target.value })} required /></div><div className="mt-5"><Area id="video-hub-library-description" label="Library description" value={settings.libraryDescription} onChange={(event) => setSettings({ ...settings, libraryDescription: event.target.value })} required /></div>
            <div className="mt-5 grid gap-5 md:grid-cols-2"><Field id="video-hub-empty-title" label="Empty-state title" value={settings.emptyStateTitle} onChange={(event) => setSettings({ ...settings, emptyStateTitle: event.target.value })} required /><Area id="video-hub-empty-description" label="Empty-state description" value={settings.emptyStateDescription} onChange={(event) => setSettings({ ...settings, emptyStateDescription: event.target.value })} required /></div>
            <label className="mt-5 block text-sm font-semibold text-[hsl(var(--admin-text))]">Featured session<select value={settings.featuredVideoId ?? ''} onChange={(event) => setSettings({ ...settings, featuredVideoId: event.target.value || null })} className={`${selectClass} mt-2`} data-testid="select-featured-video"><option value="">No featured session</option>{videos.filter((video) => video.status === 'published' && categories.some((category) => category.id === video.categoryId && category.isVisible)).map((video) => <option key={video.id} value={video.id}>{video.title}</option>)}</select></label>
          </EditorCard>
          <SaveStatus error={error} notice={notice} />
          <div className="flex justify-end"><SaveButton pending={updatePage.isPending} testId="button-save-video-hub-page">Save page settings</SaveButton></div>
        </form>

        <EditorCard title="Categories" description="Control the visible subject filters and their order. Counts come from published sessions.">
          <form onSubmit={saveCategory} className="grid gap-4 rounded-2xl bg-[hsl(var(--admin-surface-soft))] p-5 md:grid-cols-[1fr_1fr_.8fr_.6fr_auto] md:items-end"><Field id="video-category-name" label="Name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required /><Field id="video-category-slug" label="Slug" value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} required /><Field id="video-category-icon" label="Icon name" value={categoryForm.icon} onChange={(event) => setCategoryForm({ ...categoryForm, icon: event.target.value })} required /><Field id="video-category-order" label="Order" type="number" value={categoryForm.displayOrder} onChange={(event) => setCategoryForm({ ...categoryForm, displayOrder: Number(event.target.value) })} required /><div className="flex gap-2"><button type="submit" className={`${buttonClass} bg-[hsl(var(--admin-text))] text-[hsl(var(--admin-surface))]`} data-testid="button-save-video-category"><Save size={15} />{editingCategoryId ? 'Update' : 'Add'}</button>{editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm(blankCategory(categories.length + 1)); }} className={`${buttonClass} border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]`} aria-label="Cancel category edit" data-testid="button-cancel-video-category"><X size={15} /></button>}</div><label className="flex items-center gap-2 text-xs font-semibold md:col-span-2"><input type="checkbox" checked={categoryForm.isVisible} onChange={(event) => setCategoryForm({ ...categoryForm, isVisible: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--admin-accent))]" data-testid="checkbox-video-category-visible" /> Visible on public page</label></form>
          <div className="mt-5 divide-y divide-[hsl(var(--admin-border))]">{categories.length ? categories.map((category) => <div key={category.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between" data-testid={`row-video-category-${category.id}`}><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--admin-accent)/.16)] text-[hsl(var(--admin-accent))]"><Layers3 size={17} /></span><div><p className="font-semibold text-[hsl(var(--admin-text))]">{category.name}</p><p className="text-xs text-[hsl(var(--admin-muted))]">{category.slug} · {category.publishedVideoCount} published · {category.isVisible ? 'Visible' : 'Hidden'}</p></div></div><div className="flex gap-2"><button type="button" onClick={() => editCategory(category.id)} className={`${buttonClass} border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]`} data-testid={`button-edit-video-category-${category.id}`}><Pencil size={14} /> Edit</button><button type="button" onClick={() => removeCategory(category.id)} className={`${buttonClass} border border-[hsl(var(--destructive)/.28)] text-[hsl(var(--destructive))]`} data-testid={`button-delete-video-category-${category.id}`}><Trash2 size={14} /> Delete</button></div></div>) : <p className="py-6 text-sm text-[hsl(var(--admin-muted))]" data-testid="empty-video-categories">No categories yet. Add the first subject above.</p>}</div>
        </EditorCard>

        <EditorCard title="Video sessions" description="Publish sessions from the college YouTube channel. Every link is checked before it can be saved.">
          <form onSubmit={saveVideo} className="space-y-5 rounded-2xl bg-[hsl(var(--admin-surface-soft))] p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--admin-border))] pb-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--admin-accent))]">{selectedVideoId ? 'Editing session' : 'New session'}</p><p className="mt-1 text-sm text-[hsl(var(--admin-muted))]">{selectedVideoId ? selectedVideo?.title : 'Add a published or draft session to the shelf.'}</p></div>{selectedVideoId && <button type="button" onClick={() => { setSelectedVideoId(null); setVideoForm(blankVideo(categories[0]?.id ?? '', videos.length + 1)); }} className={`${buttonClass} border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]`} data-testid="button-cancel-video-edit"><X size={15} /> Cancel edit</button>}</div>
            <div className="grid gap-5 md:grid-cols-2"><Field id="video-title" label="Title" value={videoForm.title} onChange={(event) => setVideoForm({ ...videoForm, title: event.target.value })} required /><Field id="video-slug" label="Slug" value={videoForm.slug} onChange={(event) => setVideoForm({ ...videoForm, slug: event.target.value })} required /><Field id="video-instructor" label="Instructor" value={videoForm.instructor} onChange={(event) => setVideoForm({ ...videoForm, instructor: event.target.value })} required /><Field id="video-duration" label="Duration" placeholder="28:15" value={videoForm.duration} onChange={(event) => setVideoForm({ ...videoForm, duration: event.target.value })} required /><Field id="video-youtube-url" label="YouTube URL" type="url" placeholder="https://www.youtube.com/watch?v=…" value={videoForm.youtubeUrl} onChange={(event) => setVideoForm({ ...videoForm, youtubeUrl: event.target.value })} required /><label className="block text-sm font-semibold text-[hsl(var(--admin-text))]">Category<select value={videoForm.categoryId} onChange={(event) => setVideoForm({ ...videoForm, categoryId: event.target.value })} className={`${selectClass} mt-2`} required data-testid="select-video-category-edit"><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><Field id="video-display-order" label="Display order" type="number" value={videoForm.displayOrder} onChange={(event) => setVideoForm({ ...videoForm, displayOrder: Number(event.target.value) })} required /><label className="block text-sm font-semibold text-[hsl(var(--admin-text))]">Status<select value={videoForm.status} onChange={(event) => setVideoForm({ ...videoForm, status: event.target.value as 'draft' | 'published' })} className={`${selectClass} mt-2`} data-testid="select-video-status"><option value="draft">Draft</option><option value="published">Published</option></select></label></div><Area id="video-description" label="Description" value={videoForm.description} onChange={(event) => setVideoForm({ ...videoForm, description: event.target.value })} required />
            <div className="grid gap-5 md:grid-cols-2"><ImageUploadField currentUrl={imageUrlForObjectPath(videoForm.thumbnailObjectPath)} alt={videoForm.thumbnailImageAltText} onUploaded={(objectPath) => setVideoForm({ ...videoForm, thumbnailObjectPath: objectPath })} requestUpload={requestUpload} completeUpload={completeUpload} /><Field id="video-thumbnail-alt" label="Thumbnail alt text" value={videoForm.thumbnailImageAltText} onChange={(event) => setVideoForm({ ...videoForm, thumbnailImageAltText: event.target.value })} required={Boolean(videoForm.thumbnailObjectPath)} /></div>
            <div className="flex justify-end"><button type="submit" className={`${buttonClass} bg-[hsl(var(--admin-text))] text-[hsl(var(--admin-surface))]`} disabled={createVideo.isPending || updateVideo.isPending} data-testid="button-save-video"><Save size={15} />{selectedVideoId ? 'Update session' : 'Save session'}</button></div>
          </form>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--admin-border))]"><div className="hidden grid-cols-[1fr_1fr_7rem_7rem_auto] gap-4 bg-[hsl(var(--admin-surface-soft))] px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--admin-muted))] md:grid"><span>Session</span><span>Category</span><span>Status</span><span>Order</span><span /></div>{videos.length ? videos.map((video) => <div key={video.id} className="grid gap-3 border-t border-[hsl(var(--admin-border))] px-4 py-4 md:grid-cols-[1fr_1fr_7rem_7rem_auto] md:items-center" data-testid={`row-video-${video.id}`}><div className="min-w-0"><p className="truncate font-semibold text-[hsl(var(--admin-text))]">{video.title}</p><p className="mt-1 truncate text-xs text-[hsl(var(--admin-muted))]">{video.instructor} · {video.duration}</p></div><span className="text-sm text-[hsl(var(--admin-muted))]">{video.categoryName}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${video.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{video.status}</span><span className="text-sm text-[hsl(var(--admin-muted))]">#{video.displayOrder}</span><div className="flex gap-2"><button type="button" onClick={() => editVideo(video.id)} className={`${buttonClass} border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]`} data-testid={`button-edit-video-${video.id}`}><Pencil size={14} /> Edit</button><button type="button" onClick={() => removeVideo(video.id)} className={`${buttonClass} border border-[hsl(var(--destructive)/.28)] text-[hsl(var(--destructive))]`} data-testid={`button-delete-video-${video.id}`}><Trash2 size={14} /><span className="sr-only">Delete</span></button></div></div>) : <p className="p-6 text-sm text-[hsl(var(--admin-muted))]" data-testid="empty-video-sessions">No sessions yet. Add a YouTube session above.</p>}</div>
        </EditorCard>
      </div>
    </EditorFrame>
  );
}