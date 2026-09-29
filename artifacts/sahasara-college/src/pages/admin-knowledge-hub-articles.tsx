import { BookOpen, Eye, EyeOff, ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminKnowledgeHubArticlesQueryKey,
  getGetKnowledgeHubArticleBySlugQueryKey,
  getGetKnowledgeHubArticlesPageQueryKey,
  getGetKnowledgeHubArticlesQueryKey,
  useCreateAdminKnowledgeHubArticle,
  useCreateAdminKnowledgeHubArticleCategory,
  useDeleteAdminKnowledgeHubArticle,
  useDeleteAdminKnowledgeHubArticleCategory,
  useGetAdminKnowledgeHubArticles,
  useUpdateAdminKnowledgeHubArticle,
  useUpdateAdminKnowledgeHubArticleCategory,
  useUpdateAdminKnowledgeHubArticlesPage,
  useUploadAdminImage,
  type KnowledgeHubArticle,
  type KnowledgeHubArticleCategoryInput,
  type KnowledgeHubArticleInput,
  type KnowledgeHubArticlesPageInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const inputClass = 'h-11 w-full rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))] focus:ring-4 focus:ring-[hsl(var(--admin-focus)/.16)]';
const selectClass = `${inputClass} cursor-pointer`;

function emptyPage(): KnowledgeHubArticlesPageInput {
  return {
    heroEyebrow: 'SAHSRAH KNOWLEDGE HUB',
    heroTitle: 'Clearer answers for the road ahead.',
    heroAccentText: 'road ahead.',
    heroDescription: 'Practical guidance for students and families, gathered in one thoughtful place.',
    articlesMetricLabel: 'published articles',
    expertsMetricTitle: 'Faculty-led',
    expertsMetricDescription: 'Guidance shaped by people who know the journey.',
    heroCtaLabel: 'Browse articles',
    heroCtaHref: '#articles',
    heroImageUrl: null,
    heroImageAltText: '',
    featuredEyebrow: 'Editor’s pick',
    articlesEyebrow: 'The article shelf',
    articlesHeading: 'Guidance for the questions that matter.',
    articlesDescription: 'Search clear, considered notes on study, admissions, and student life.',
    searchPlaceholder: 'Search articles by title or topic',
    topicPanelVisible: true,
    topicPanelTitle: 'Looking for a subject pathway?',
    topicPanelDescription: 'Explore the academic routes available at Sahsrah Junior College.',
    topicPanelCtaLabel: 'Explore courses',
    topicPanelHref: '/courses',
    updatesPanelVisible: true,
    updatesPanelTitle: 'Need a direct answer?',
    updatesPanelDescription: 'Our admissions team can help you find the right next step.',
    updatesPanelCtaLabel: 'Contact admissions',
    updatesPanelHref: '/contact',
    featuredArticleId: null,
  };
}

function emptyArticle(categoryId = ''): KnowledgeHubArticleInput {
  return { title: '', slug: '', categoryId, excerpt: '', body: '', coverImageUrl: null, coverImageAltText: '', author: '', readTimeMinutes: 5, status: 'draft' };
}

function emptyCategory(displayOrder: number): KnowledgeHubArticleCategoryInput {
  return { name: '', slug: '', icon: 'book-open', displayOrder, isVisible: true };
}

function AdminImageField({ image, alt, uploading, onUpload, onUrlChange, onAltChange }: { image: string | null; alt: string; uploading: boolean; onUpload: (event: ChangeEvent<HTMLInputElement>) => void; onUrlChange: (value: string | null) => void; onAltChange: (value: string) => void }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4">
      <div className="aspect-[2.2] overflow-hidden rounded-xl bg-[hsl(var(--admin-input-background))]">{image ? <img src={image} alt={alt || 'Knowledge Hub hero preview'} className="h-full w-full object-cover" data-testid="img-admin-knowledge-hero-preview" /> : <div className="grid h-full place-items-center text-sm text-[hsl(var(--admin-text-muted))]">No hero image selected</div>}</div>
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onUpload} data-testid="input-admin-knowledge-hero-upload" /><ImagePlus size={15} />{uploading ? 'Uploading…' : 'Upload image'}</label>
      <Field id="admin-knowledge-hero-url" label="Image URL" value={image ?? ''} onChange={(event) => onUrlChange(event.target.value || null)} placeholder="https://…" />
      <Field id="admin-knowledge-hero-alt" label="Alt text" value={alt} onChange={(event) => onAltChange(event.target.value)} required />
    </div>
  );
}

function Toggle({ checked, label, onChange, testId }: { checked: boolean; label: string; onChange: (value: boolean) => void; testId: string }) {
  return <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[hsl(var(--admin-text))]"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" data-testid={testId} />{checked ? <Eye size={15} /> : <EyeOff size={15} />}{label}</label>;
}

function ArticleEditor({ value, categories, editing, pending, uploading, onChange, onUpload, onSave, onCancel }: { value: KnowledgeHubArticleInput; categories: { id: string; name: string }[]; editing: boolean; pending: boolean; uploading: boolean; onChange: <K extends keyof KnowledgeHubArticleInput>(key: K, next: KnowledgeHubArticleInput[K]) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void; onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSave} className="space-y-5" data-testid="form-admin-knowledge-article">
      <div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{editing ? 'Edit article' : 'New article'}</h3><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Save as a draft while it is taking shape, or publish when it is ready for families.</p></div><button type="button" onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]" aria-label="Close article editor" data-testid="button-close-knowledge-article-editor"><X size={16} /></button></div>
      <div className="grid gap-4 md:grid-cols-2"><Field id="admin-article-title" label="Title" value={value.title} maxLength={180} onChange={(event) => onChange('title', event.target.value)} required /><Field id="admin-article-slug" label="Slug" value={value.slug} maxLength={180} onChange={(event) => onChange('slug', event.target.value)} required /><label className="block space-y-2 text-sm font-semibold text-[hsl(var(--admin-text))]" htmlFor="admin-article-category">Category<select id="admin-article-category" value={value.categoryId} onChange={(event) => onChange('categoryId', event.target.value)} className={selectClass} required><option value="">Choose a category</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="block space-y-2 text-sm font-semibold text-[hsl(var(--admin-text))]" htmlFor="admin-article-status">Status<select id="admin-article-status" value={value.status} onChange={(event) => onChange('status', event.target.value as KnowledgeHubArticleInput['status'])} className={selectClass} data-testid="select-admin-article-status"><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
      <Area id="admin-article-excerpt" label="Excerpt" value={value.excerpt} maxLength={500} onChange={(event) => onChange('excerpt', event.target.value)} required />
      <Area id="admin-article-body" label="Article body" value={value.body} maxLength={50000} onChange={(event) => onChange('body', event.target.value)} required />
      <div className="grid gap-4 md:grid-cols-[1fr_13rem]"><Field id="admin-article-author" label="Author" value={value.author} maxLength={120} onChange={(event) => onChange('author', event.target.value)} required /><label className="block space-y-2 text-sm font-semibold text-[hsl(var(--admin-text))]" htmlFor="admin-article-read-time">Read time (minutes)<input id="admin-article-read-time" type="number" min={1} max={240} value={value.readTimeMinutes} onChange={(event) => onChange('readTimeMinutes', Number(event.target.value))} className={inputClass} required /></label></div>
      <div className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4"><p className="mb-3 text-sm font-bold text-[hsl(var(--admin-text))]">Cover image</p><AdminImageField image={value.coverImageUrl} alt={value.coverImageAltText} uploading={uploading} onUpload={onUpload} onUrlChange={(next) => onChange('coverImageUrl', next)} onAltChange={(next) => onChange('coverImageAltText', next)} /></div>
      <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-sm font-bold text-[hsl(var(--admin-text))]" data-testid="button-cancel-knowledge-article">Cancel</button><button type="submit" disabled={pending || uploading || !categories.length} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--admin-primary))] px-5 text-sm font-bold text-[hsl(var(--admin-on-primary))] disabled:opacity-60" data-testid="button-save-knowledge-article"><Save size={15} />{pending ? 'Saving article…' : editing ? 'Save article' : 'Create article'}</button></div>
    </form>
  );
}

function CategoryEditor({ value, editing, pending, onChange, onSave, onCancel }: { value: KnowledgeHubArticleCategoryInput; editing: boolean; pending: boolean; onChange: <K extends keyof KnowledgeHubArticleCategoryInput>(key: K, next: KnowledgeHubArticleCategoryInput[K]) => void; onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form onSubmit={onSave} className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4" data-testid="form-admin-knowledge-category"><div className="grid gap-3 sm:grid-cols-2"><Field id="admin-category-name" label="Name" value={value.name} maxLength={80} onChange={(event) => onChange('name', event.target.value)} required /><Field id="admin-category-slug" label="Slug" value={value.slug} maxLength={100} onChange={(event) => onChange('slug', event.target.value)} required /><Field id="admin-category-icon" label="Icon name" value={value.icon} maxLength={50} onChange={(event) => onChange('icon', event.target.value)} required /><label className="block space-y-2 text-sm font-semibold text-[hsl(var(--admin-text))]" htmlFor="admin-category-order">Display order<input id="admin-category-order" type="number" min={1} value={value.displayOrder} onChange={(event) => onChange('displayOrder', Number(event.target.value))} className={inputClass} required /></label></div><div className="mt-4 flex items-center justify-between gap-3"><Toggle checked={value.isVisible} label="Visible to readers" onChange={(next) => onChange('isVisible', next)} testId="checkbox-admin-category-visible" /><div className="flex gap-2"><button type="button" onClick={onCancel} className="min-h-10 rounded-xl border border-[hsl(var(--admin-border))] px-3 text-xs font-bold" data-testid="button-cancel-knowledge-category">Cancel</button><button type="submit" disabled={pending} className="min-h-10 rounded-xl bg-[hsl(var(--admin-primary))] px-4 text-xs font-bold text-[hsl(var(--admin-on-primary))] disabled:opacity-60" data-testid="button-save-knowledge-category">{pending ? 'Saving…' : editing ? 'Save category' : 'Create category'}</button></div></div></form>;
}

export default function AdminKnowledgeHubArticles() {
  const queryClient = useQueryClient();
  const query = useGetAdminKnowledgeHubArticles();
  const pageUpdate = useUpdateAdminKnowledgeHubArticlesPage();
  const articleCreate = useCreateAdminKnowledgeHubArticle();
  const articleUpdate = useUpdateAdminKnowledgeHubArticle();
  const articleDelete = useDeleteAdminKnowledgeHubArticle();
  const categoryCreate = useCreateAdminKnowledgeHubArticleCategory();
  const categoryUpdate = useUpdateAdminKnowledgeHubArticleCategory();
  const categoryDelete = useDeleteAdminKnowledgeHubArticleCategory();
  const upload = useUploadAdminImage();
  const [page, setPage] = useState<KnowledgeHubArticlesPageInput>(emptyPage());
  const [articleForm, setArticleForm] = useState<KnowledgeHubArticleInput | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<KnowledgeHubArticleCategoryInput | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'hero' | 'article' | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (query.data) setPage(query.data.settings); }, [query.data]);
  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: getGetAdminKnowledgeHubArticlesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubArticlesPageQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubArticlesQueryKey() });
  };
  const updatePageField = <K extends keyof KnowledgeHubArticlesPageInput>(key: K, value: KnowledgeHubArticlesPageInput[K]) => setPage((current) => ({ ...current, [key]: value }));
  const updateArticleField = <K extends keyof KnowledgeHubArticleInput>(key: K, value: KnowledgeHubArticleInput[K]) => setArticleForm((current) => current ? { ...current, [key]: value } : current);
  const updateCategoryField = <K extends keyof KnowledgeHubArticleCategoryInput>(key: K, value: KnowledgeHubArticleCategoryInput[K]) => setCategoryForm((current) => current ? { ...current, [key]: value } : current);

  const savePage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setNotice('');
    pageUpdate.mutate({ data: page }, { onSuccess: (saved) => { setPage(saved); invalidateAll(); setNotice('Knowledge Hub page settings saved.'); }, onError: () => setError('The page settings could not be saved. Check the fields and try again.') });
  };
  const uploadImage = (event: ChangeEvent<HTMLInputElement>, target: 'hero' | 'article') => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(target); setError('');
    upload.mutate({ data: { file, purpose: 'knowledge' } }, { onSuccess: (result) => { if (target === 'hero') updatePageField('heroImageUrl', result.url); else updateArticleField('coverImageUrl', result.url); setNotice('Image uploaded. Save the related content to publish it.'); setUploading(null); }, onError: () => { setError('The image could not be uploaded. Please try again.'); setUploading(null); } });
    event.target.value = '';
  };
  const startNewArticle = () => { if (!query.data?.categories.length) { setError('Create a category before adding an article.'); return; } setError(''); setNotice(''); setEditingArticleId(null); setArticleForm(emptyArticle(query.data.categories[0].id)); };
  const editArticle = (article: KnowledgeHubArticle) => { setEditingArticleId(article.id); setArticleForm({ title: article.title, slug: article.slug, categoryId: article.categoryId, excerpt: article.excerpt, body: article.body, coverImageUrl: article.coverImageUrl, coverImageAltText: article.coverImageAltText, author: article.author, readTimeMinutes: article.readTimeMinutes, status: article.status }); setNotice(''); setError(''); };
  const saveArticle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!articleForm) return; setError(''); setNotice('');
    const onSuccess = () => { setArticleForm(null); setEditingArticleId(null); invalidateAll(); void queryClient.invalidateQueries({ queryKey: getGetKnowledgeHubArticleBySlugQueryKey(articleForm.slug) }); setNotice(editingArticleId ? 'Article updated.' : 'Article created.'); };
    const onError = () => setError('The article could not be saved. Check the title, slug, category, and body.');
    if (editingArticleId) articleUpdate.mutate({ id: editingArticleId, data: articleForm }, { onSuccess, onError }); else articleCreate.mutate({ data: articleForm }, { onSuccess, onError });
  };
  const removeArticle = (article: KnowledgeHubArticle) => {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setError(''); articleDelete.mutate({ id: article.id }, { onSuccess: () => { if (page.featuredArticleId === article.id) { const nextPage = { ...page, featuredArticleId: null }; setPage(nextPage); pageUpdate.mutate({ data: nextPage }, { onError: () => setError('The article was deleted, but the featured article setting could not be cleared.') }); } invalidateAll(); setNotice('Article deleted.'); }, onError: () => setError('The article could not be deleted.') });
  };
  const saveCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!categoryForm) return; setError(''); setNotice('');
    const onSuccess = () => { setCategoryForm(null); setEditingCategoryId(null); invalidateAll(); setNotice(editingCategoryId ? 'Category updated.' : 'Category created.'); };
    const onError = () => setError('The category could not be saved. Slugs must be lowercase and use hyphens.');
    if (editingCategoryId) categoryUpdate.mutate({ id: editingCategoryId, data: categoryForm }, { onSuccess, onError }); else categoryCreate.mutate({ data: categoryForm }, { onSuccess, onError });
  };
  const removeCategory = (id: string, name: string) => {
    if (!window.confirm(`Delete “${name}”? Only unused categories can be deleted.`)) return;
    categoryDelete.mutate({ id }, { onSuccess: () => { invalidateAll(); setNotice('Category deleted.'); }, onError: () => setError('This category could not be deleted. It may still be assigned to an article.') });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => { void query.refetch(); }} />;
  if (!query.data) return <LoadError onRetry={() => { void query.refetch(); }} />;
  const categories = query.data.categories;
  const articles = query.data.articles;
  const categoriesForEditor = categories.map((item) => ({ id: item.id, name: item.name }));
  const savingArticle = articleCreate.isPending || articleUpdate.isPending;
  const savingCategory = categoryCreate.isPending || categoryUpdate.isPending;

  return (
    <EditorFrame eyebrow="Pages / Knowledge Hub / Articles" title="Make good guidance easier to find." description="Shape the public Articles page, then keep its published and draft library in one place." previewHref="/knowledge-hub/articles">
      <form onSubmit={savePage} className="mt-8 space-y-6" data-testid="form-admin-knowledge-page">
        <EditorCard icon={<BookOpen size={19} />} title="Page introduction" description="These settings control the public hero, featured story, and article shelf.">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2"><Field id="admin-kh-hero-eyebrow" label="Hero eyebrow" value={page.heroEyebrow} onChange={(event) => updatePageField('heroEyebrow', event.target.value)} required /><Field id="admin-kh-hero-title" label="Hero title" value={page.heroTitle} onChange={(event) => updatePageField('heroTitle', event.target.value)} required /><Field id="admin-kh-hero-accent" label="Hero accent text" value={page.heroAccentText} onChange={(event) => updatePageField('heroAccentText', event.target.value)} required /><Field id="admin-kh-hero-cta" label="Hero button label" value={page.heroCtaLabel} onChange={(event) => updatePageField('heroCtaLabel', event.target.value)} required /><Field id="admin-kh-hero-href" label="Hero button link" value={page.heroCtaHref} onChange={(event) => updatePageField('heroCtaHref', event.target.value)} required /></div>
            <Area id="admin-kh-hero-description" label="Hero description" value={page.heroDescription} onChange={(event) => updatePageField('heroDescription', event.target.value)} required />
            <AdminImageField image={page.heroImageUrl} alt={page.heroImageAltText} uploading={uploading === 'hero'} onUpload={(event) => uploadImage(event, 'hero')} onUrlChange={(value) => updatePageField('heroImageUrl', value)} onAltChange={(value) => updatePageField('heroImageAltText', value)} />
            <div className="grid gap-4 md:grid-cols-3"><Field id="admin-kh-metric-label" label="Article metric label" value={page.articlesMetricLabel} onChange={(event) => updatePageField('articlesMetricLabel', event.target.value)} required /><Field id="admin-kh-experts-title" label="Expert metric title" value={page.expertsMetricTitle} onChange={(event) => updatePageField('expertsMetricTitle', event.target.value)} required /><Field id="admin-kh-experts-description" label="Expert metric description" value={page.expertsMetricDescription} onChange={(event) => updatePageField('expertsMetricDescription', event.target.value)} required /></div>
          </div>
        </EditorCard>
        <EditorCard title="Featured and article shelf" description="Choose a published article for the feature, then tune the library heading and search prompt.">
          <div className="space-y-5"><label className="block space-y-2 text-sm font-semibold text-[hsl(var(--admin-text))]" htmlFor="admin-kh-featured">Featured article<select id="admin-kh-featured" value={page.featuredArticleId ?? ''} onChange={(event) => updatePageField('featuredArticleId', event.target.value || null)} className={selectClass} data-testid="select-admin-knowledge-featured"><option value="">No featured article</option>{articles.filter((item) => item.status === 'published').map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><div className="grid gap-4 md:grid-cols-2"><Field id="admin-kh-featured-eyebrow" label="Featured eyebrow" value={page.featuredEyebrow} onChange={(event) => updatePageField('featuredEyebrow', event.target.value)} required /><Field id="admin-kh-articles-eyebrow" label="Articles eyebrow" value={page.articlesEyebrow} onChange={(event) => updatePageField('articlesEyebrow', event.target.value)} required /><Field id="admin-kh-articles-heading" label="Articles heading" value={page.articlesHeading} onChange={(event) => updatePageField('articlesHeading', event.target.value)} required /><Field id="admin-kh-search-placeholder" label="Search placeholder" value={page.searchPlaceholder} onChange={(event) => updatePageField('searchPlaceholder', event.target.value)} required /></div><Area id="admin-kh-articles-description" label="Articles description" value={page.articlesDescription} onChange={(event) => updatePageField('articlesDescription', event.target.value)} required /></div>
        </EditorCard>
        <EditorCard title="Support panels" description="Show or hide the two calls to action beneath the article library.">
          <div className="grid gap-5 md:grid-cols-2">{(['topic', 'updates'] as const).map((kind) => { const prefix = kind === 'topic' ? 'topicPanel' : 'updatesPanel'; const title = kind === 'topic' ? 'Topic panel' : 'Updates panel'; return <div key={kind} className="rounded-2xl bg-[hsl(var(--admin-surface-soft))] p-5"><div className="flex items-center justify-between"><p className="text-sm font-bold text-[hsl(var(--admin-text))]">{title}</p><Toggle checked={page[`${prefix}Visible`]} label="Visible" onChange={(next) => updatePageField(`${prefix}Visible`, next)} testId={`checkbox-admin-knowledge-${kind}-visible`} /></div><div className="mt-4 space-y-4"><Field id={`admin-kh-${kind}-title`} label="Title" value={page[`${prefix}Title`]} onChange={(event) => updatePageField(`${prefix}Title`, event.target.value)} required /><Area id={`admin-kh-${kind}-description`} label="Description" value={page[`${prefix}Description`]} onChange={(event) => updatePageField(`${prefix}Description`, event.target.value)} required /><Field id={`admin-kh-${kind}-label`} label="Button label" value={page[`${prefix}CtaLabel`]} onChange={(event) => updatePageField(`${prefix}CtaLabel`, event.target.value)} required /><Field id={`admin-kh-${kind}-href`} label="Button link" value={page[`${prefix}Href`]} onChange={(event) => updatePageField(`${prefix}Href`, event.target.value)} required /></div></div>; })}</div>
        </EditorCard>
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={pageUpdate.isPending} testId="button-save-admin-knowledge-page">Save page settings</SaveButton></div>
      </form>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <EditorCard title="Article library" description="Draft, publish, edit, or remove the real article records returned by the admin API.">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[hsl(var(--admin-text-muted))]">{articles.length} {articles.length === 1 ? 'article' : 'articles'} in the library</p><button type="button" onClick={startNewArticle} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[hsl(var(--admin-primary))] px-4 text-xs font-bold text-[hsl(var(--admin-on-primary))]" data-testid="button-add-knowledge-article"><Plus size={15} /> Add article</button></div>
          {articleForm && <div className="mt-6 rounded-2xl border border-[hsl(var(--admin-focus)/.35)] bg-[hsl(var(--admin-input-background))] p-5"><ArticleEditor value={articleForm} categories={categoriesForEditor} editing={Boolean(editingArticleId)} pending={savingArticle} uploading={uploading === 'article'} onChange={updateArticleField} onUpload={(event) => uploadImage(event, 'article')} onSave={saveArticle} onCancel={() => setArticleForm(null)} /></div>}
          {articles.length === 0 && !articleForm ? <div className="mt-5 rounded-2xl border border-dashed border-[hsl(var(--admin-border))] p-8 text-center" data-testid="empty-admin-knowledge-articles"><BookOpen size={26} className="mx-auto text-[hsl(var(--admin-text-muted))]" /><p className="mt-3 font-display text-2xl font-semibold text-[hsl(var(--admin-text))]">No articles yet.</p><p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">Create a draft to start building the public Knowledge Hub.</p></div> : <div className="mt-5 space-y-3">{articles.map((article) => <div key={article.id} className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-soft))] p-4 sm:flex-row sm:items-center" data-testid={`row-admin-knowledge-article-${article.id}`}><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${article.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]'}`}>{article.status}</span><span className="text-xs font-semibold text-[hsl(var(--admin-text-muted))]">{article.categoryName}</span></div><p className="mt-2 truncate text-sm font-bold text-[hsl(var(--admin-text))]" data-testid={`text-admin-knowledge-article-title-${article.id}`}>{article.title}</p><p className="mt-1 text-xs text-[hsl(var(--admin-text-muted))]">{article.readTimeMinutes} min read · /{article.slug}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => editArticle(article)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[hsl(var(--admin-border))] px-3 text-xs font-bold text-[hsl(var(--admin-text))]" data-testid={`button-edit-knowledge-article-${article.id}`}><Pencil size={14} /> Edit</button><button type="button" onClick={() => removeArticle(article)} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--destructive))]" aria-label={`Delete ${article.title}`} data-testid={`button-delete-knowledge-article-${article.id}`}><Trash2 size={14} /></button></div></div>)}</div>}
        </EditorCard>

        <EditorCard title="Categories" description="Keep the topic filter useful. Categories with assigned articles cannot be deleted.">
          {categoryForm ? <CategoryEditor value={categoryForm} editing={Boolean(editingCategoryId)} pending={savingCategory} onChange={updateCategoryField} onSave={saveCategory} onCancel={() => setCategoryForm(null)} /> : <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm(emptyCategory(categories.length + 1)); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-xs font-bold text-[hsl(var(--admin-text))]" data-testid="button-add-knowledge-category"><Plus size={15} /> Add category</button>}
          {categories.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[hsl(var(--admin-border))] p-6 text-center text-sm text-[hsl(var(--admin-text-muted))]" data-testid="empty-admin-knowledge-categories">No categories yet. Add one before creating an article.</div> : <div className="mt-5 space-y-2">{categories.map((category) => <div key={category.id} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--admin-border))] p-3" data-testid={`row-admin-knowledge-category-${category.id}`}><span className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--admin-primary)/.08)] text-[hsl(var(--admin-primary))]"><BookOpen size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[hsl(var(--admin-text))]">{category.name}</p><p className="text-xs text-[hsl(var(--admin-text-muted))]">{category.publishedArticleCount} published · {category.isVisible ? 'visible' : 'hidden'}</p></div><button type="button" onClick={() => { setEditingCategoryId(category.id); setCategoryForm({ name: category.name, slug: category.slug, icon: category.icon, displayOrder: category.displayOrder, isVisible: category.isVisible }); }} className="grid h-8 w-8 place-items-center rounded-lg border border-[hsl(var(--admin-border))]" aria-label={`Edit ${category.name}`} data-testid={`button-edit-knowledge-category-${category.id}`}><Pencil size={14} /></button><button type="button" onClick={() => removeCategory(category.id, category.name)} className="grid h-8 w-8 place-items-center rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--destructive))]" aria-label={`Delete ${category.name}`} data-testid={`button-delete-knowledge-category-${category.id}`}><Trash2 size={14} /></button></div>)}</div>}
        </EditorCard>
      </div>
    </EditorFrame>
  );
}