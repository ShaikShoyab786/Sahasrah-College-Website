import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Images,
  MessageSquareQuote,
  Settings2,
  UsersRound,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'wouter';
import { useGetHomepageHero, useGetSiteSettings } from '@workspace/api-client-react';

type OverviewAction = {
  id: string;
  title: string;
  action: string;
  href: string;
  icon: LucideIcon;
};

type OverviewActionGroup = {
  id: string;
  title: string;
  description: string;
  actions: OverviewAction[];
  className?: string;
  gridClassName?: string;
};

const actionGroups: OverviewActionGroup[] = [
  {
    id: 'knowledge-hub',
    title: 'Knowledge Hub',
    description: 'Create and update learning content.',
    className: 'xl:col-span-7',
    gridClassName: 'sm:grid-cols-2',
    actions: [
      { id: 'articles', title: 'Articles', action: 'Post an article', href: '/admin/pages/knowledge-hub/articles', icon: BookOpen },
      { id: 'videos', title: 'Video Hub', action: 'Add a video', href: '/admin/pages/knowledge-hub/videos', icon: Video },
      { id: 'resources', title: 'Study Resources', action: 'Upload a resource', href: '/admin/pages/knowledge-hub/resources', icon: FileText },
      { id: 'exam-updates', title: 'Exam Updates', action: 'Manage exam updates', href: '/admin/pages/knowledge-hub/exam-updates', icon: CalendarDays },
    ],
  },
  {
    id: 'courses',
    title: 'Courses',
    description: 'Keep course pathway information current.',
    className: 'xl:col-span-5',
    actions: [
      { id: 'courses', title: 'Courses', action: 'Manage courses', href: '/admin/pages/courses', icon: GraduationCap },
    ],
  },
  {
    id: 'website-content',
    title: 'Website Content',
    description: 'Update the stories and imagery visitors see.',
    className: 'xl:col-span-12',
    gridClassName: 'sm:grid-cols-2 xl:grid-cols-3',
    actions: [
      { id: 'gallery', title: 'Gallery', action: 'Add images', href: '/admin/pages/gallery', icon: Images },
      { id: 'faculty', title: 'Faculty', action: 'Add faculty', href: '/admin/pages/faculty', icon: UsersRound },
      { id: 'testimonials', title: 'Testimonials', action: 'Add a testimonial', href: '/admin/pages/home/testimonials', icon: MessageSquareQuote },
    ],
  },
];

export default function AdminOverview() {
  const settings = useGetSiteSettings();
  const hero = useGetHomepageHero();
  const homepageReady = hero.data?.length === 3;

  return (
    <div className="animate-rise space-y-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--admin-text-muted))]">College control room</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-.04em] text-[hsl(var(--admin-text))] sm:text-5xl" data-testid="text-dashboard-heading">
            Website Overview
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--admin-text-muted))]">
            Manage your website’s key content and settings from one place.
          </p>
        </div>
        <span
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--admin-text))]"
          data-testid="status-dashboard-live"
        >
          <span className={`h-2 w-2 rounded-full ${homepageReady ? 'bg-emerald-600' : 'bg-amber-500'}`} aria-hidden="true" />
          {homepageReady ? 'Homepage published' : 'Homepage draft'}
        </span>
      </header>

      <section
        aria-labelledby="overview-site-identity-heading"
        className="flex flex-col gap-5 rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
        data-testid="card-overview-site-identity"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--admin-primary)/.08)] text-[hsl(var(--admin-primary))]">
            <Settings2 size={21} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="overview-site-identity-heading" className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--admin-text-muted))]">
              Site Identity
            </h2>
            <p className="mt-2 font-display text-xl font-semibold leading-tight text-[hsl(var(--admin-text))]" data-testid="text-current-college-name">
              {settings.data?.collegeName || 'Sahsrah Junior College'}
            </p>
            <p className="mt-1 text-sm leading-6 text-[hsl(var(--admin-text-muted))]">
              {settings.data?.tagline || 'Your tagline will appear here.'}
            </p>
            <p className="mt-2 text-xs leading-5 text-[hsl(var(--admin-text-muted))]">
              Update the name, contact details, logo, and social profiles shown across your website.
            </p>
          </div>
        </div>
        <Link
          href="/admin/site-settings"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--admin-primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--admin-on-primary))] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-focus))] focus-visible:ring-offset-2"
          data-testid="link-edit-settings"
        >
          Edit Site Identity
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section aria-labelledby="overview-quick-actions-heading" className="space-y-5" data-testid="section-overview-quick-actions">
        <div>
          <h2 id="overview-quick-actions-heading" className="font-display text-2xl font-semibold tracking-tight text-[hsl(var(--admin-text))]">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm leading-6 text-[hsl(var(--admin-text-muted))]">
            Open the editor for the content you want to update.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-12">
          {actionGroups.map((group) => (
            <section
              key={group.id}
              aria-labelledby={`overview-group-${group.id}`}
              className={`rounded-2xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-5 shadow-sm sm:p-6 ${group.className ?? ''}`}
              data-testid={`overview-group-${group.id}`}
            >
              <div className="mb-4">
                <h3 id={`overview-group-${group.id}`} className="text-base font-bold text-[hsl(var(--admin-text))]">
                  {group.title}
                </h3>
                <p className="mt-1 text-sm leading-5 text-[hsl(var(--admin-text-muted))]">{group.description}</p>
              </div>
              <div className={`grid gap-3 ${group.gridClassName ?? ''}`}>
                {group.actions.map((action) => (
                  <QuickActionLink key={action.id} action={action} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickActionLink({ action }: { action: OverviewAction }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      aria-label={`${action.title}: ${action.action}`}
      className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-background))] p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--admin-focus)/.7)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-focus))] focus-visible:ring-offset-2 sm:p-4"
      data-testid={`link-overview-${action.id}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[hsl(var(--admin-primary)/.08)] text-[hsl(var(--admin-primary))] transition-colors group-hover:bg-[hsl(var(--admin-primary))] group-hover:text-[hsl(var(--admin-on-primary))]">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[hsl(var(--admin-text))]">{action.title}</span>
        <span className="mt-1 block text-xs font-medium leading-5 text-[hsl(var(--admin-text-muted))]">{action.action}</span>
      </span>
      <ArrowUpRight size={16} className="shrink-0 text-[hsl(var(--admin-text-muted))] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--admin-primary))]" aria-hidden="true" />
    </Link>
  );
}