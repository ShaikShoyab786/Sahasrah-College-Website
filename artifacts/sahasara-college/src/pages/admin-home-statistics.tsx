import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getGetAdminHomepageStatisticsQueryKey, getGetHomepageStatisticsQueryKey, useGetAdminHomepageStatistics, useUpdateHomepageStatistics, type HomepageStatisticsInput } from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

type CopyForm = Pick<HomepageStatisticsInput, 'eyebrow' | 'heading' | 'description' | 'isVisible' | 'sortOrder'>;

export default function AdminHomeStatistics() {
  const query = useGetAdminHomepageStatistics();
  const update = useUpdateHomepageStatistics();
  const client = useQueryClient();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const form = useForm<CopyForm>({ defaultValues: { eyebrow: '', heading: '', description: '', isVisible: true, sortOrder: 4 } });
  useEffect(() => {
    if (!query.data) return;
    form.reset({ eyebrow: query.data.eyebrow, heading: query.data.heading, description: query.data.description, isVisible: query.data.isVisible, sortOrder: query.data.sortOrder });
  }, [form, query.data]);
  const save = form.handleSubmit((data) => {
    if (!query.data) return;
    setNotice('');
    setError('');
    update.mutate({ data }, {
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: getGetAdminHomepageStatisticsQueryKey() });
        void client.invalidateQueries({ queryKey: getGetHomepageStatisticsQueryKey() });
        setNotice('Home Statistics copy saved.');
      },
      onError: () => setError('We could not save the Home Statistics copy.'),
    });
  });
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return <EditorFrame eyebrow="Pages / Home / Statistics" title="Frame the outcomes with the right words." description="Edit the Home Statistics introduction and visibility here. The values shown in this block come only from published ResultStatistic records selected for Home." previewHref="/#home-statistics"><form onSubmit={save} className="mt-10 space-y-6">
    <EditorCard title="Section copy" description="Keep the copy-only settings in place while the shared Results library owns every value."><div className="grid gap-4 md:grid-cols-2"><Field id="home-statistics-eyebrow" label="Eyebrow" {...form.register('eyebrow', { required: true })} /><Field id="home-statistics-heading" label="Heading" {...form.register('heading', { required: true })} /><div className="md:col-span-2"><Area id="home-statistics-description" label="Description" {...form.register('description', { required: true })} /></div></div></EditorCard>
    <div className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-[hsl(var(--primary))]">Values live in Results</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Publish, edit, reorder, and select Home statistics from the shared library.</p></div><Link href="/admin/pages/results" data-testid="link-manage-results-from-statistics" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))]">Manage Results</Link></div>
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><input type="checkbox" {...form.register('isVisible')} className="mt-1 h-5 w-5 accent-[hsl(var(--accent))]" /><span><span className="block text-sm font-bold">Show Home Statistics section</span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">If no approved records are selected, Home will show a neutral empty state instead of fallback numbers.</span></span></label>
    <SaveStatus error={error} notice={notice} /><div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-home-statistics-copy">Save Statistics copy</SaveButton></div>
  </form></EditorFrame>;
}