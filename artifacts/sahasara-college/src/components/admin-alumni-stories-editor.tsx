import { useEffect, useState, type ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import {
  getGetAdminAlumniSuccessStoriesQueryKey,
  getGetResultsPageQueryKey,
  useGetAdminAlumniSuccessStories,
  useUpdateAdminAlumniSuccessStories,
  useUploadAdminImage,
  type AdminAlumniSuccessStory,
  type AlumniSuccessStoryInput,
} from '@workspace/api-client-react';
import { Area, Field } from '@/components/form-fields';
import { EditorCard, EditorSkeleton } from '@/pages/admin-about-hero';

function storyCanPublish(story: Pick<AdminAlumniSuccessStory, 'displayName' | 'story' | 'portraitUrl' | 'portraitAltText'>) {
  return Boolean(story.displayName.trim() && story.story.trim() && (!story.portraitUrl || story.portraitAltText?.trim()));
}

function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') return data.error;
  }
  return 'Alumni stories could not be saved. Please try again.';
}

export function AlumniStoriesEditor() {
  const query = useGetAdminAlumniSuccessStories();
  const update = useUpdateAdminAlumniSuccessStories();
  const upload = useUploadAdminImage();
  const client = useQueryClient();
  const [stories, setStories] = useState<AdminAlumniSuccessStory[]>([]);
  const [revision, setRevision] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [revisionConflict, setRevisionConflict] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data || dirty) return;
    setStories([...query.data.alumniStories].sort((a, b) => a.displayOrder - b.displayOrder));
    setRevision(query.data.revision);
  }, [dirty, query.data]);

  const changeStory = (id: string | undefined, index: number, patch: Partial<AdminAlumniSuccessStory>) => {
    setStories((current) => current.map((story, storyIndex) =>
      (id ? story.id === id : storyIndex === index) ? { ...story, ...patch } : story,
    ));
    setDirty(true);
    setNotice('');
    setError('');
  };

  const addStory = () => {
    setStories((current) => [...current, {
      id: `draft-${Date.now()}`,
      displayName: '',
      portraitUrl: null,
      portraitAltText: null,
      passingYear: null,
      course: null,
      currentOutcome: null,
      story: '',
      isPublished: false,
      displayOrder: current.length + 1,
      importedFromResultId: null,
    }]);
    setDirty(true);
    setNotice('');
  };

  const moveStory = (index: number, direction: -1 | 1) => {
    setStories((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((story, order) => ({ ...story, displayOrder: order + 1 }));
    });
    setDirty(true);
    setNotice('');
  };

  const setPublished = (index: number, story: AdminAlumniSuccessStory, checked: boolean) => {
    if (checked && !storyCanPublish(story)) {
      setError('To publish, add a display name and story. Portraits also need descriptive alt text.');
      setNotice('');
      return;
    }
    changeStory(story.id, index, { isPublished: checked });
  };

  const saveStories = () => {
    if (revision === null) {
      setError('Alumni stories have not finished loading. Please wait and try again.');
      setNotice('');
      return;
    }
    if (stories.some((story) => story.isPublished && !storyCanPublish(story))) {
      setError('A published story needs a display name and story. Any portrait needs descriptive alt text.');
      setNotice('');
      return;
    }
    setNotice('');
    setError('');
    const expectedRevision = revision;
    const alumniStories: AlumniSuccessStoryInput[] = [...stories].sort((a, b) => a.displayOrder - b.displayOrder).map((story, index) => ({
      ...(story.id && !story.id.startsWith('draft-') ? { id: story.id } : {}),
      displayName: story.displayName.trim(),
      portraitUrl: story.portraitUrl?.trim() || null,
      portraitAltText: story.portraitUrl?.trim() ? story.portraitAltText?.trim() || null : null,
      passingYear: story.passingYear?.trim() || null,
      course: story.course?.trim() || null,
      currentOutcome: story.currentOutcome?.trim() || null,
      story: story.story,
      isPublished: story.isPublished,
      displayOrder: index + 1,
    }));
    update.mutate({ data: { expectedRevision, alumniStories } }, {
      onSuccess: (result) => {
        setStories(result.alumniStories);
        setRevision(result.revision);
        setDirty(false);
        setRevisionConflict(false);
        client.setQueryData(getGetAdminAlumniSuccessStoriesQueryKey(), result);
        setNotice('Alumni stories saved independently from student results.');
        void client.invalidateQueries({ queryKey: getGetResultsPageQueryKey() });
      },
      onError: (mutationError) => {
        const status = mutationError && typeof mutationError === 'object' && 'status' in mutationError
          ? (mutationError as { status?: unknown }).status
          : undefined;
        if (status === 409) {
          setRevisionConflict(true);
          setError('');
          setNotice('');
          return;
        }
        setError(errorMessage(mutationError));
      },
    });
  };

  const uploadPortrait = (event: ChangeEvent<HTMLInputElement>, index: number, story: AdminAlumniSuccessStory) => {
    const file = event.target.files?.[0];
    if (file) upload.mutate({ data: { file, purpose: 'result' } }, {
      onSuccess: (result) => changeStory(story.id, index, { portraitUrl: result.url }),
      onError: () => setError('Portrait upload failed. Try another image.'),
    });
    event.target.value = '';
  };

  if (query.isLoading) return <EditorCard title="Alumni success stories" description="Manage alumni experiences separately from student achievement records."><EditorSkeleton /></EditorCard>;
  if (query.isError && !query.data) return <EditorCard title="Alumni success stories" description="Manage alumni experiences separately from student achievement records."><div className="rounded-2xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] p-6"><p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Alumni stories could not load.</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Your Results library is still independent. Check the connection and retry.</p><button type="button" onClick={() => void query.refetch()} className="mt-5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-alumni-stories">Try again</button></div></EditorCard>;

  return (
    <EditorCard
      title={`Alumni success stories (${stories.length})`}
      description="A separate editorial collection for former students' approved experiences. Drafts may be incomplete; nothing is published until reviewed and approved here."
    >
      <div className="space-y-5">
        {stories.length ? stories.map((story, index) => (
          <article key={story.id} className="rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-4 sm:p-5" data-testid={`card-alumni-story-${story.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--admin-text-muted))]">Alumni story · position {index + 1}</p>
                <h3 className="mt-1 break-words font-display text-xl font-semibold text-[hsl(var(--admin-text))]">{story.displayName.trim() || 'Untitled draft'}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" disabled={index === 0} onClick={() => moveStory(index, -1)} className="rounded-lg p-2 disabled:opacity-25" aria-label={`Move ${story.displayName || 'story'} up`} data-testid={`button-move-alumni-up-${story.id}`}><ArrowUp size={15} /></button>
                <button type="button" disabled={index === stories.length - 1} onClick={() => moveStory(index, 1)} className="rounded-lg p-2 disabled:opacity-25" aria-label={`Move ${story.displayName || 'story'} down`} data-testid={`button-move-alumni-down-${story.id}`}><ArrowDown size={15} /></button>
                <button type="button" onClick={() => setConfirmDelete(story.id)} className="rounded-lg p-2 text-[hsl(var(--destructive))]" aria-label={`Delete ${story.displayName || 'story'}`} data-testid={`button-delete-alumni-${story.id}`}><Trash2 size={15} /></button>
              </div>
            </div>

            {story.importedFromResultId && (
              <p className="mt-4 rounded-xl border border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.12)] px-4 py-3 text-sm font-semibold leading-6 text-[hsl(var(--foreground))]" data-testid={`warning-imported-alumni-${story.id}`}>
                Imported from student result for review — confirm alumni status before publishing
              </p>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field id={`alumni-${index}-name`} label="Alumni display name" value={story.displayName} onChange={(event) => changeStory(story.id, index, { displayName: event.target.value })} placeholder="Name to show publicly" data-testid={`input-alumni-name-${story.id}`} />
              <Field id={`alumni-${index}-year`} label="Passing year / batch" value={story.passingYear ?? ''} onChange={(event) => changeStory(story.id, index, { passingYear: event.target.value || null })} placeholder="For example, 2021 batch" data-testid={`input-alumni-year-${story.id}`} />
              <Field id={`alumni-${index}-course`} label="Course / stream" value={story.course ?? ''} onChange={(event) => changeStory(story.id, index, { course: event.target.value || null })} data-testid={`input-alumni-course-${story.id}`} />
              <Field id={`alumni-${index}-outcome`} label="Current college, career or outcome" value={story.currentOutcome ?? ''} onChange={(event) => changeStory(story.id, index, { currentOutcome: event.target.value || null })} data-testid={`input-alumni-outcome-${story.id}`} />
              <Field id={`alumni-${index}-portrait-url`} label="Portrait URL (optional)" value={story.portraitUrl ?? ''} onChange={(event) => changeStory(story.id, index, { portraitUrl: event.target.value || null, portraitAltText: event.target.value ? story.portraitAltText : null })} placeholder="Paste image URL or upload" data-testid={`input-alumni-portrait-url-${story.id}`} />
              <Field id={`alumni-${index}-portrait-alt`} label="Portrait alt text" value={story.portraitAltText ?? ''} onChange={(event) => changeStory(story.id, index, { portraitAltText: event.target.value || null })} placeholder={story.portraitUrl ? 'Describe the person in the portrait' : 'Only needed when a portrait is added'} data-testid={`input-alumni-portrait-alt-${story.id}`} />
              <div className="md:col-span-2">
                <Area id={`alumni-${index}-story`} label="Approved testimonial / story" value={story.story} onChange={(event) => changeStory(story.id, index, { story: event.target.value })} data-testid={`input-alumni-story-${story.id}`} />
              </div>
              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-3 text-xs font-bold" data-testid={`upload-alumni-portrait-${story.id}`}>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => uploadPortrait(event, index, story)} />
                  {upload.isPending ? 'Uploading…' : <><ImagePlus size={14} /> Upload portrait</>}
                </label>
                {story.portraitUrl && <img src={story.portraitUrl} alt={story.portraitAltText || ''} className="h-12 w-12 rounded-full border border-[hsl(var(--admin-border))] object-cover" />}
                <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={story.isPublished} onChange={(event) => setPublished(index, story, event.target.checked)} className="h-4 w-4 accent-[hsl(var(--admin-focus))]" data-testid={`checkbox-publish-alumni-${story.id}`} />
                  Publish this alumni story
                </label>
                <label htmlFor={`alumni-${index}-order`} className="ml-auto flex items-center gap-2 text-xs font-bold text-[hsl(var(--admin-text-muted))]">
                  Carousel order
                  <input id={`alumni-${index}-order`} type="number" min={1} max={100} value={story.displayOrder || index + 1} onChange={(event) => changeStory(story.id, index, { displayOrder: Math.max(1, Number(event.target.value) || 1) })} className="h-10 w-20 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] px-3 text-sm text-[hsl(var(--admin-text))] outline-none focus:border-[hsl(var(--admin-focus))]" data-testid={`input-alumni-order-${story.id}`} />
                </label>
              </div>
            </div>
          </article>
        )) : (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--admin-border))] px-5 py-10 text-center">
            <p className="font-display text-2xl font-semibold text-[hsl(var(--admin-text))]">No alumni experiences yet</p>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--admin-text-muted))]">Add a story only after an alumnus has approved their words for publication.</p>
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={addStory} data-testid="button-add-alumni-story" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-[hsl(var(--admin-border))] px-4 text-sm font-bold"><Plus size={16} /> Add alumni story</button>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {notice && <p role="status" className="text-sm font-semibold text-[hsl(var(--admin-text))]" data-testid="status-alumni-save">{notice}</p>}
          {revisionConflict && <p role="alert" className="max-w-md text-sm font-semibold leading-6 text-[hsl(var(--destructive))]" data-testid="error-alumni-revision-conflict">Another editor saved alumni stories first (revision conflict). Your unsaved edits are preserved here. Reload this page to fetch the latest revision before continuing; reloading will discard these local edits.</p>}
          {!revisionConflict && error && <p role="alert" className="max-w-md text-sm font-semibold text-[hsl(var(--destructive))]" data-testid="error-alumni-save">{error}</p>}
          <button type="button" onClick={saveStories} disabled={update.isPending} data-testid="button-save-alumni-stories" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
            {update.isPending ? 'Saving alumni stories…' : 'Save alumni stories'}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[hsl(var(--primary)/.48)] p-5" role="presentation">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-alumni-title" className="w-full max-w-md rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl">
            <h2 id="delete-alumni-title" className="font-display text-3xl font-semibold text-[hsl(var(--primary))]">Delete this alumni story?</h2>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">This removes the story from the editorial collection when you save. Student achievement records are unaffected.</p>
            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold" data-testid="button-cancel-delete-alumni">Keep story</button>
              <button type="button" onClick={() => { setStories((current) => current.filter((story) => story.id !== confirmDelete).map((story, index) => ({ ...story, displayOrder: index + 1 }))); setDirty(true); setConfirmDelete(null); setNotice(''); setError(''); }} className="rounded-xl bg-[hsl(var(--destructive))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--destructive-foreground))]" data-testid="button-confirm-delete-alumni">Delete story</button>
            </div>
          </div>
        </div>
      )}
    </EditorCard>
  );
}