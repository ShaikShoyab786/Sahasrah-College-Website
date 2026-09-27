import { ArrowRight, BookOpen, Phone } from 'lucide-react';
import { getGetCoursesQueryKey, useGetCourses, useGetSiteSettings } from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { CourseEmptyState, CourseErrorState, CourseLoadingState } from '@/components/course-experience';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';
import { Link } from 'wouter';

export default function Courses() {
  const settingsQuery = useGetSiteSettings();
  const coursesQuery = useGetCourses({ query: { queryKey: getGetCoursesQueryKey() } });
  const settings = settingsQuery.data;
  const courses = [...(coursesQuery.data ?? [])].sort((left, right) => left.displayOrder - right.displayOrder);
  const publicSettings = settings ?? {
    collegeName: 'Sahsrah Junior College',
    tagline: 'Your College Tagline',
    logoUrl: null,
    email: 'admissions@sahsrah.edu',
    phone: '+91 40 2458 0176',
    footerText: 'A public junior college for curious minds and purposeful lives.',
  };
  const themeStyle = createPublicThemeStyle(settings?.primaryColor || DEFAULT_PRIMARY_COLOR, settings?.accentColor || DEFAULT_ACCENT_COLOR, settings?.surfaceColor || DEFAULT_SURFACE_COLOR);

  if (settingsQuery.isLoading || coursesQuery.isLoading) return <CourseLoadingState label="Loading courses" />;
  if (settingsQuery.isError || coursesQuery.isError) return <CourseErrorState onRetry={() => { void settingsQuery.refetch(); void coursesQuery.refetch(); }} />;
  if (!courses.length) return <><PublicHeader settings={publicSettings} activePage="courses" /><CourseEmptyState /><PublicFooter settings={publicSettings} /></>;

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={publicSettings} activePage="courses" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-20 pt-36 text-[hsl(var(--primary-foreground))] lg:px-10 lg:pb-28 lg:pt-48">
          <div className="absolute -right-24 top-20 h-80 w-80 rounded-full border border-[hsl(var(--accent)/.2)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1fr_.42fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.24em] text-[hsl(var(--accent))]">Courses at Sahsrah</p>
              <h1 className="mt-6 max-w-4xl font-display text-6xl font-semibold leading-[.9] tracking-[-.06em] md:text-8xl" data-testid="text-courses-heading">Find the path that fits.</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 md:text-lg" data-testid="text-courses-description">Five regular pathways, clearly explained for students and families. Start with your subjects, then see the support, people, and curriculum behind each choice.</p>
            </div>
            <div className="border-l border-white/15 pl-7">
              <BookOpen className="text-[hsl(var(--accent))]" size={25} aria-hidden="true" />
              <p className="mt-5 font-display text-3xl font-semibold leading-tight">A considered beginning matters.</p>
              <p className="mt-3 text-sm leading-6 text-white/60">Compare the regular pathways without the noise of entrance-focused options.</p>
            </div>
          </div>
        </section>
        <section className="px-6 py-16 lg:px-10 lg:py-24" aria-labelledby="regular-pathways-heading">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-7 md:flex-row md:items-end md:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Regular pathways</p><h2 id="regular-pathways-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))] md:text-5xl">Choose with context.</h2></div>
              <p className="max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{courses.length} pathways with clear subject direction and a supportive college experience.</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-testid="list-course-pathways">
              {courses.map((course, index) => (
                <Link href={`/courses/${course.slug}`} key={course.slug} className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.7)] hover:shadow-xl ${index === 0 ? 'lg:row-span-2 lg:min-h-[665px] lg:justify-end' : ''}`} data-testid={`card-course-${course.slug}`}>
                  <div className="absolute right-7 top-7 grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] transition group-hover:bg-[hsl(var(--accent))]"><ArrowRight size={18} aria-hidden="true" /></div>
                  <span className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{course.heroEyebrow}</span>
                  <h3 className="mt-8 max-w-xs font-display text-4xl font-semibold leading-[.94] tracking-[-.05em] text-[hsl(var(--primary))]">{course.name}</h3>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-[hsl(var(--muted-foreground))]">{course.heroDescription}</p>
                  <span className="mt-auto pt-9 text-sm font-bold text-[hsl(var(--primary))]">Explore pathway <ArrowRight size={15} className="ml-1 inline transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-[hsl(var(--secondary))] px-6 py-14 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="flex items-start gap-4"><Phone size={22} className="mt-1 shrink-0 text-[hsl(var(--accent-foreground))]" aria-hidden="true" /><div><p className="font-display text-3xl font-semibold text-[hsl(var(--primary))]">Still comparing?</p><p className="mt-2 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">Admissions can talk through subjects, goals, and the day-to-day experience before you decide.</p></div></div>
            <Link href="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="link-courses-admissions">Talk with admissions <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>
      </main>
      <PublicFooter settings={publicSettings} />
    </div>
  );
}