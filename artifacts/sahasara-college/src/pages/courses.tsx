import { ArrowRight, BookOpen, CalendarDays, ChartNoAxesColumnIncreasing, Clock3, GraduationCap, Phone, UsersRound } from 'lucide-react';
import { useGetAllCoursesPage, useGetCourses, useGetSiteSettings } from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { CourseEmptyState, CourseErrorState, CourseLoadingState } from '@/components/course-experience';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';
import { Link } from 'wouter';

const featureIcons = [BookOpen, UsersRound, ChartNoAxesColumnIncreasing];
const benefitIcons = [UsersRound, GraduationCap, BookOpen, Phone];

function displayDate(value: string) {
  if (!value) return 'Date to be announced';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(date);
}

function displayTime(value: string) {
  if (!value) return '';
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(2000, 0, 1, hour, minute));
}

export default function Courses() {
  const settingsQuery = useGetSiteSettings();
  const pageQuery = useGetAllCoursesPage();
  const coursesQuery = useGetCourses();
  const siteSettings = settingsQuery.data;
  const page = pageQuery.data;
  const publicSettings = siteSettings ?? {
    collegeName: 'Sahsrah Junior College',
    tagline: 'Your College Tagline',
    logoUrl: null,
    email: 'admissions@sahsrah.edu',
    phone: '+91 40 2458 0176',
    footerText: 'A public junior college for curious minds and purposeful lives.',
  };
  const themeStyle = createPublicThemeStyle(
    siteSettings?.primaryColor || DEFAULT_PRIMARY_COLOR,
    siteSettings?.accentColor || DEFAULT_ACCENT_COLOR,
    siteSettings?.surfaceColor || DEFAULT_SURFACE_COLOR,
  );

  if (settingsQuery.isLoading || pageQuery.isLoading || coursesQuery.isLoading) return <CourseLoadingState label="Loading courses" />;
  if (settingsQuery.isError || pageQuery.isError || coursesQuery.isError) {
    return <CourseErrorState onRetry={() => { void settingsQuery.refetch(); void pageQuery.refetch(); void coursesQuery.refetch(); }} />;
  }
  if (!page || !coursesQuery.data?.length) {
    return <><PublicHeader settings={publicSettings} activePage="courses" /><CourseEmptyState /><PublicFooter settings={publicSettings} /></>;
  }

  const coursesBySlug = new Map(coursesQuery.data.map((course) => [course.slug, course]));
  const placements = [...page.coursePlacements].filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const selectedCourses = placements.flatMap((item) => {
    const course = coursesBySlug.get(item.courseSlug);
    return course ? [course] : [];
  });
  const featuredCourse = selectedCourses.find((course) => course.slug === page.featuredCourseSlug) ?? selectedCourses[0];
  const standardCourses = selectedCourses.filter((course) => course.slug !== featuredCourse?.slug);

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <PublicHeader settings={publicSettings} activePage="courses" />
      <main>
        <section className="relative isolate overflow-hidden bg-[hsl(var(--background))] px-6 pb-12 pt-32 text-[hsl(var(--primary))] sm:pt-36 lg:px-10 lg:pb-16 lg:pt-40" aria-labelledby="all-courses-hero-heading" data-testid="section-all-courses-hero">
          {page.heroBackgroundImageUrl && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(page.heroBackgroundImageUrl)})` }} aria-hidden="true" />}
          <div className="absolute inset-0 bg-[hsl(var(--background))]" style={{ opacity: page.heroBackgroundOverlay / 100 }} aria-hidden="true" />
          <div className="absolute -left-48 top-28 h-96 w-96 rounded-full border border-[hsl(var(--accent)/.18)]" aria-hidden="true" />
          <div className="absolute -right-24 -top-24 h-[34rem] w-[34rem] rounded-full border border-[hsl(var(--accent)/.16)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,.8fr)]">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{page.heroEyebrow}</span>
              <h1 id="all-courses-hero-heading" className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-6xl md:text-7xl">
                {page.heroTitle.trim().split(/\s+/).map((word, index, words) => <span key={`${word}-${index}`} className={index === words.length - 1 ? 'text-[hsl(var(--accent))]' : ''}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base sm:leading-8">{page.heroDescription}</p>
              <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                {page.heroFeatures.map((feature, index) => {
                  const Icon = featureIcons[index % featureIcons.length];
                  return <div key={feature.id} className="flex items-start gap-3 rounded-2xl bg-[hsl(var(--background)/.76)] p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><Icon size={17} aria-hidden="true" /></span><span><span className="block text-xs font-bold text-[hsl(var(--primary))]">{feature.title}</span><span className="mt-1 block text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{feature.description}</span></span></div>;
                })}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#all-courses-grid" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))]" data-testid="link-all-courses-explore">Explore All Courses <ArrowRight size={16} aria-hidden="true" /></a>
                <a href="#all-courses-grid" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/.8)] px-5 text-sm font-bold text-[hsl(var(--primary))] transition hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]" data-testid="link-all-courses-compare"><ChartNoAxesColumnIncreasing size={16} aria-hidden="true" /> Compare Pathways</a>
              </div>
            </div>
            <aside className="relative hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] p-6 shadow-xl backdrop-blur sm:block lg:ml-auto lg:max-w-sm" aria-label="Course guidance">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><BookOpen size={20} aria-hidden="true" /></span>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{page.heroCalloutTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{page.heroCalloutDescription}</p>
              <span aria-hidden="true" className="absolute -left-px bottom-6 top-6 w-1 rounded-r-full bg-[hsl(var(--accent))]" />
            </aside>
          </div>
        </section>

        <section id="all-courses-grid" className="scroll-mt-24 px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="all-courses-heading" data-testid="section-all-courses-grid">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex flex-col gap-3 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div><span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Regular Pathways</span><h2 id="all-courses-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl">Choose with context.</h2></div>
              <p className="max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{selectedCourses.length} pathways with clear subject direction and a supportive college experience.</p>
            </header>
            {featuredCourse ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]" data-testid="list-course-pathways">
                <Link href={`/courses/${featuredCourse.slug}`} className="group relative flex min-h-[31rem] flex-col overflow-hidden rounded-3xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--card))] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-8 lg:row-span-2" data-testid={`card-course-featured-${featuredCourse.slug}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,hsl(var(--accent)/.12),transparent_45%),linear-gradient(to_top,hsl(var(--card)),hsl(var(--card)/.88))]" aria-hidden="true" />
                  <div className="relative flex h-full flex-col">
                    <span className="inline-flex w-fit rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{featuredCourse.heroEyebrow}</span>
                    <span className="mt-5 grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><BookOpen size={20} aria-hidden="true" /></span>
                    <h3 className="mt-4 max-w-md font-display text-4xl font-semibold leading-[.98] tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl">{featuredCourse.name}</h3>
                    <p className="mt-4 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{featuredCourse.heroDescription}</p>
                    <span className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-bold text-[hsl(var(--primary))]">Explore pathway <ArrowRight size={16} aria-hidden="true" /></span>
                  </div>
                </Link>
                <div className="grid gap-4 sm:grid-cols-2">
                  {standardCourses.map((course, index) => (
                    <Link href={`/courses/${course.slug}`} key={course.slug} className="group relative flex min-h-[15rem] flex-col overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[hsl(var(--accent)/.45)] hover:shadow-lg sm:p-6" data-testid={`card-course-${course.slug}`}>
                      <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] transition group-hover:bg-[hsl(var(--accent))] group-hover:text-[hsl(var(--accent-foreground))]"><ArrowRight size={16} aria-hidden="true" /></span>
                      <span className="inline-flex w-fit max-w-[calc(100%-3rem)] rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">{course.heroEyebrow}</span>
                      <span className="mt-4 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]">{index % 2 === 0 ? <GraduationCap size={19} aria-hidden="true" /> : <BookOpen size={19} aria-hidden="true" />}</span>
                      <h3 className="mt-3 max-w-[calc(100%-1.5rem)] font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{course.name}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{course.heroDescription}</p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-bold text-[hsl(var(--primary))]">Explore pathway <ArrowRight size={14} aria-hidden="true" /></span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : <p className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Course pathways are being prepared.</p>}
          </div>
        </section>

        <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.55)] px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="batch-schedule-heading" data-testid="section-batch-schedule">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 text-center"><span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Batch Details &amp; Schedule</span><h2 id="batch-schedule-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl">Plan your next step.</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Important dates and a typical day at Sahsrah Junior College.</p></header>
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm sm:p-7" aria-labelledby="upcoming-batches-heading">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><CalendarDays size={20} aria-hidden="true" /></span><div><h3 id="upcoming-batches-heading" className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Upcoming Batches</h3><p className="text-xs text-[hsl(var(--muted-foreground))]">Start your journey with the right batch.</p></div></div>
                <div className="mt-5 space-y-3">
                  {page.batches.length ? page.batches.slice().sort((a, b) => a.displayOrder - b.displayOrder).map((batch) => (
                    <div key={batch.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2"><p className="font-bold text-[hsl(var(--primary))]">{batch.batchName}</p>{batch.admissionsStatus && <span className="rounded-full bg-[hsl(var(--accent)/.1)] px-3 py-1 text-[10px] font-bold text-[hsl(var(--primary))]">{batch.admissionsStatus}</span>}</div>
                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><p className="flex items-start gap-2 text-[hsl(var(--muted-foreground))]"><CalendarDays size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Start date<br /><strong className="text-[hsl(var(--primary))]">{displayDate(batch.startDate)}</strong></span></p><p className="flex items-start gap-2 text-[hsl(var(--muted-foreground))]"><GraduationCap size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Target exam<br /><strong className="text-[hsl(var(--primary))]">{batch.targetExam}</strong></span></p></div>
                    </div>
                  )) : <p className="rounded-2xl bg-[hsl(var(--background))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Batch dates will be shared by admissions.</p>}
                </div>
              </article>
              <article className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm sm:p-7" aria-labelledby="daily-schedule-heading">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><Clock3 size={20} aria-hidden="true" /></span><div><h3 id="daily-schedule-heading" className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Daily Schedule</h3><p className="text-xs text-[hsl(var(--muted-foreground))]">A balanced day for learning, practice, and growth.</p></div></div>
                <ol className="mt-5 space-y-2">
                  {page.schedule.length ? page.schedule.slice().sort((a, b) => a.displayOrder - b.displayOrder).map((item) => {
                    const time = [displayTime(item.startTime), displayTime(item.endTime)].filter(Boolean).join(' – ');
                    return <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--background))] p-3"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" /><span className="min-w-0 flex-1 text-sm font-semibold text-[hsl(var(--primary))]">{item.activity}</span>{time && <time className="shrink-0 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-[10px] font-bold text-[hsl(var(--primary))]">{time}</time>}</li>;
                  }) : <li className="rounded-2xl bg-[hsl(var(--background))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">The daily schedule will be shared by admissions.</li>}
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="all-courses-cta-heading" data-testid="section-all-courses-cta">
          <div className="mx-auto grid max-w-7xl gap-7 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm sm:p-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{page.ctaEyebrow}</span>
              <h2 id="all-courses-cta-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl">{page.ctaHeading}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{page.ctaDescription}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {page.ctaBenefits.map((benefit, index) => {
                  const Icon = benefitIcons[index % benefitIcons.length];
                  return <li key={benefit.id} className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><Icon size={16} aria-hidden="true" /></span><span><strong className="block text-[10px] font-bold text-[hsl(var(--primary))]">{benefit.title}</strong><span className="text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{benefit.description}</span></span></li>;
                })}
              </ul>
            </div>
            <div className="border-t border-[hsl(var(--border))] pt-5 text-center lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))]" data-testid="link-all-courses-admissions">{page.ctaButtonLabel} <ArrowRight size={16} aria-hidden="true" /></Link>
              <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">Get guidance from our admissions team.</p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter settings={publicSettings} />
    </div>
  );
}