import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getGetAdminHomepageResultsQueryKey, getGetHomepageResultsQueryKey, useGetAdminHomepageResults, useUpdateHomepageResults, type HomepageResultsInput } from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const defaults: HomepageResultsInput = {
  eyebrow: '',
  heading: '',
  description: '',
  viewAllButtonLabel: 'View complete merit list',
  isVisible: true,
  sortOrder: 6,
};

export default function AdminHomeResults() {
  const query = useGetAdminHomepageResults();
  const update = useUpdateHomepageResults();
  const client = useQueryClient();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const form = useForm<HomepageResultsInput>({ defaultValues: defaults });
  useEffect(() => {
    if (!query.data) return;
    form.reset({
      eyebrow: query.data.eyebrow,
      heading: query.data.heading,
      description: query.data.description,
      viewAllButtonLabel: query.data.viewAllButtonLabel,
      isVisible: query.data.isVisible,
      sortOrder: query.data.sortOrder,
    });
  }, [form, query.data]);
  const save = form.handleSubmit((data) => {
    setNotice('');
    setError('');
    update.mutate({ data: { ...data, viewAllButtonLabel: data.viewAllButtonLabel || 'View complete merit list' } }, {
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: getGetAdminHomepageResultsQueryKey() });
        void client.invalidateQueries({ queryKey: getGetHomepageResultsQueryKey() });
        setNotice('Home Results copy saved.');
      },
      onError: () => setError('We could not save the Home Results copy.'),
    });
  });
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return (
    <EditorFrame eyebrow="Pages / Home / Results" title="Give the outcomes a clear introduction." description="This editor controls Home copy only. Student records, publication, and Home selection are managed in the shared Results library." previewHref="/#home-results">
      <form onSubmit={save} className="mt-10 space-y-6">
        <EditorCard title="Home section copy" description="The preview is populated only by published records selected in the Results library.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="home-results-eyebrow" label="Eyebrow" {...form.register('eyebrow', { required: true })} />
            <Field id="home-results-heading" label="Heading" {...form.register('heading', { required: true })} />
            <div className="md:col-span-2"><Area id="home-results-description" label="Description" {...form.register('description', { required: true })} /></div>
            <Field id="home-results-button-label" label="View all button label" {...form.register('viewAllButtonLabel', { required: true })} />
            <p className="rounded-xl bg-[hsl(var(--secondary))] px-4 py-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">The Home button always links to <strong className="text-[hsl(var(--primary))]">/results</strong> so families reach the complete published list.</p>
          </div>
        </EditorCard>
        <div className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold text-[hsl(var(--primary))]">Manage the shared collection</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Add records, publish outcomes, and choose Home cards from one place.</p></div>
          <Link href="/admin/pages/results" data-testid="link-manage-results" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))]">Manage Results</Link>
        </div>
        <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><input type="checkbox" {...form.register('isVisible')} className="mt-1 h-5 w-5 accent-[hsl(var(--accent))]" /><span><span className="block text-sm font-bold">Show Results preview on Home</span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">This changes visibility of the copy section; it never publishes a student record.</span></span></label>
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-home-results-copy">Save Home copy</SaveButton></div>
      </form>
    </EditorFrame>
  );
}