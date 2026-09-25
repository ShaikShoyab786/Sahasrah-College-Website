import { ArrowUpRight, GraduationCap } from 'lucide-react';
import { useGetFacultyPage, useGetSiteSettings } from '@workspace/api-client-react';
import { FacultyProfileCard } from '@/components/faculty-profile-card';
import { PublicHeader } from '@/components/public-header';
import { SectionEyebrow } from '@/components/section-eyebrow';
import { SiteMark } from '@/components/site-mark';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

function FacultySkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8 pt-16">
        <div className="h-5 w-32 rounded-full bg-[hsl(var(--muted))]" />
        <div className="h-20 max-w-2xl rounded-2xl bg-[hsl(var(--muted))]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[.82] rounded-[1.5rem] bg-[hsl(var(--muted))]" />)}
        </div>
      </div>
    </div>
  );
}

export default function Faculty() {
  const settingsQuery = useGetSiteSettings();
  const facultyQuery = useGetFacultyPage();
  const settings = settingsQuery.data;
  const page = facultyQuery.data;
  const members = [...(page?.members ?? [])]
    .filter((member) => member.isActive)
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const themeStyle = createPublicThemeStyle(
    settings?.primaryColor || DEFAULT_PRIMARY_COLOR,
    settings?.accentColor || DEFAULT_ACCENT_COLOR,
    settings?.surfaceColor || DEFAULT_SURFACE_COLOR,
  );
  const collegeName = settings?.collegeName || 'Sahsrah Junior College';

  if (settingsQuery.isLoading || facultyQuery.isLoading) return <FacultySkeleton />;

  if (settingsQuery.isError || facultyQuery.isError || !page) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--background))] px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Faculty unavailable</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-[hsl(var(--primary))]">We could not load our faculty profiles.</h1>
          <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again. If the problem continues, contact the college.</p>
          <button
            type="button"
            onClick={() => { void settingsQuery.refetch(); void facultyQuery.refetch(); }}
            className="mt-7 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.35)]"
            data-testid="button-retry-faculty"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={{ collegeName, tagline: settings?.tagline || '', logoUrl: settings?.logoUrl || null }} activePage="faculty" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-20 pt-36 text-[hsl(var(--primary-foreground))] lg:px-10 lg:pb-28">
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-[hsl(var(--accent)/.22)]" />
          <div className="absolute right-12 top-44 h-36 w-36 rounded-full border border-[hsl(var(--accent)/.18)]" />
          <div className="relative mx-auto max-w-7xl">
            <SectionEyebrow className="about-eyebrow section-eyebrow--dark">
              {page.settings.eyebrow || 'Mentors & Guides'}
            </SectionEyebrow>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[.94] tracking-[-.05em] md:text-7xl">
              {page.settings.heading || 'Our Expert Faculty'}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[hsl(var(--primary-foreground)/.7)]">
              {page.settings.description}
            </p>
            <div className="mt-9 flex items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">
              <span className="h-px w-12 bg-[hsl(var(--accent))]" />
              Meet the people behind the progress
            </div>
          </div>
        </section>

        <section className="bg-[hsl(var(--background))] px-6 py-14 lg:px-10 lg:py-20" aria-labelledby="faculty-grid-heading">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">A team for every question</p>
                <h2 id="faculty-grid-heading" className="mt-3 font-display text-3xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))]">
                  Get to know your mentors
                </h2>
              </div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                <GraduationCap size={17} className="text-[hsl(var(--accent-foreground))]" aria-hidden="true" />
                {members.length} {members.length === 1 ? 'faculty member' : 'faculty members'}
              </p>
            </div>

            {members.length ? (
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {members.map((member, index) => (
                  <FacultyProfileCard key={member.id} member={member} index={index} themeStyle={themeStyle} />
                ))}
              </div>
            ) : (
              <div className="mt-9 rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-6 py-16 text-center">
                <p className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Faculty profiles are being prepared.</p>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Please check back soon or talk with admissions.</p>
                <a href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">
                  Talk with admissions <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-[hsl(var(--primary))] px-6 py-10 text-[hsl(var(--primary-foreground))] lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SiteMark name={collegeName} tagline={settings?.tagline || ''} logoUrl={settings?.logoUrl || null} inverse />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--primary-foreground)/.58)]">{settings?.footerText || 'A public college for purposeful beginnings.'}</p>
          </div>
          <a href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--accent))] hover:text-[hsl(var(--primary-foreground))]">
            Talk with admissions <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}