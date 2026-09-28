import { ArrowRight, BookOpen, ChevronDown, Download, GraduationCap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CallbackPopupSettings, CourseMentor, CourseReason, CourseSyllabusSubject, PublicCourse } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { CallbackPopupForm } from '@/components/callback-popup';
import './course-why.css';

export function CourseLoadingState({ label = 'Loading course information' }: { label?: string }) {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 py-20 lg:px-10" aria-label={label} data-testid="status-courses-loading">
      <div className="h-5 w-36 rounded-full bg-[hsl(var(--muted))]" />
      <div className="mt-6 h-16 max-w-2xl rounded-2xl bg-[hsl(var(--muted))]" />
      <div className="mt-5 h-5 max-w-xl rounded-full bg-[hsl(var(--muted))]" />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-36 rounded-3xl bg-[hsl(var(--muted))]" />)}
      </div>
    </div>
  );
}

export function CourseErrorState({ onRetry, label = 'Courses unavailable' }: { onRetry: () => void; label?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10" data-testid="status-courses-error">
      <div className="max-w-lg rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{label}</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-[hsl(var(--primary))]">We could not load the course guide.</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please try again, or speak directly with our admissions team.</p>
        <button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]" data-testid="button-retry-courses">
          Try again <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function CourseEmptyState({ detail = false }: { detail?: boolean }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10" data-testid={detail ? 'status-course-empty' : 'status-courses-empty'}>
      <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-6 py-16 text-center">
        <BookOpen className="mx-auto text-[hsl(var(--accent-foreground))]" size={28} aria-hidden="true" />
        <h1 className="mt-5 font-display text-3xl font-semibold text-[hsl(var(--primary))]">Course information is being prepared.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">Please check back shortly or talk with admissions for a current course guide.</p>
      </div>
    </div>
  );
}

export function CourseEyebrow({
  label,
  tone = 'light',
  className = '',
  testId,
}: {
  label: string;
  tone?: 'light' | 'dark';
  className?: string;
  testId?: string;
}) {
  const toneClass = tone === 'dark'
    ? 'border-[hsl(var(--accent)/.45)] bg-[hsl(var(--background)/.96)] text-[hsl(var(--primary))] shadow-sm'
    : 'border-[hsl(var(--accent)/.32)] bg-[hsl(var(--accent)/.08)] text-[hsl(var(--primary))]';

  return (
    <span className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] ${toneClass} ${className}`} data-testid={testId}>
      <span aria-hidden="true" className="h-px w-3 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

const courseInterestBySlug: Record<string, string> = {
  mpc: 'MPC',
  bipc: 'BiPC',
  'mpc-iit-jee': 'MPC + IIT-JEE',
  'bipc-neet': 'BiPC + NEET',
  'mpc-eamcet': 'MPC + EAMCET',
};

export function CourseHero({
  course,
  enquirySettings,
  enquirySettingsLoading,
  enquirySettingsError,
  onRetryEnquirySettings,
}: {
  course: PublicCourse;
  enquirySettings?: CallbackPopupSettings;
  enquirySettingsLoading: boolean;
  enquirySettingsError: boolean;
  onRetryEnquirySettings: () => void;
}) {
  const imageUrl = course.heroBackgroundImageUrl;
  const hasImage = Boolean(imageUrl);
  const preferredCourse = courseInterestBySlug[course.slug] ?? course.name;
  const secondaryActionUrl = course.secondaryActionLabel?.trim().toLowerCase() === 'view curriculum'
    ? '#course-syllabus'
    : course.secondaryActionUrl;
  const initialCourse = enquirySettings?.courseOptions.find(
    (option) => option.trim().toLowerCase() === preferredCourse.toLowerCase(),
  ) ?? '';

  return (
    <section className={`relative isolate overflow-hidden px-6 pb-12 pt-32 lg:px-10 lg:pb-16 lg:pt-44 ${hasImage ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'}`} aria-label={`${course.name} course introduction`} data-testid="section-course-hero">
      {imageUrl && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(imageUrl)})` }} aria-hidden="true" />}
      {hasImage
        ? <div className="absolute inset-0" style={{ backgroundColor: `rgba(7, 25, 31, ${Math.min(80, Math.max(0, course.heroBackgroundOverlay)) / 100})` }} aria-hidden="true" />
        : <div className="pointer-events-none absolute -right-28 -top-24 h-[26rem] w-[26rem] rounded-full border border-[hsl(var(--primary)/.08)]" aria-hidden="true" />}
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.85fr)] lg:gap-12">
        <div className="py-2 lg:py-8">
          <CourseEyebrow label={course.heroEyebrow} tone={hasImage ? 'dark' : 'light'} testId="text-course-hero-eyebrow" />
          <h1 className={`mt-6 max-w-4xl font-display text-4xl font-semibold leading-[.98] tracking-[-.045em] sm:text-5xl md:text-6xl ${hasImage ? 'text-white' : 'text-[hsl(var(--primary))]'}`} data-testid="text-course-hero-title">{course.heroTitle}</h1>
          <p className={`mt-6 max-w-2xl text-base leading-7 md:text-lg md:leading-8 ${hasImage ? 'text-white/85' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="text-course-hero-description">{course.heroDescription}</p>
          <div className="mt-6 flex flex-wrap gap-2.5" aria-label="Course format">
            <span className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${hasImage ? 'border-white/25 bg-white/10 text-white' : 'border-[hsl(var(--border))] bg-[hsl(var(--background)/.85)] text-[hsl(var(--foreground))]'}`} data-testid="text-course-duration">Duration: {course.durationLabel}</span>
            <span className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${hasImage ? 'border-white/25 bg-white/10 text-white' : 'border-[hsl(var(--border))] bg-[hsl(var(--background)/.85)] text-[hsl(var(--foreground))]'}`} data-testid="text-course-mode">Mode: {course.modeLabel}</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {course.primaryActionLabel && course.primaryActionUrl && <a href={course.primaryActionUrl} className="group inline-flex min-h-12 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2" data-testid="link-course-primary-action">{course.primaryActionLabel}<ArrowRight size={17} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></a>}
            {course.secondaryActionLabel && secondaryActionUrl && <a href={secondaryActionUrl} className={`inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 ${hasImage ? 'border-white/40 text-white hover:bg-white/10' : 'border-[hsl(var(--border))] bg-[hsl(var(--background)/.75)] text-[hsl(var(--primary))] hover:border-[hsl(var(--accent))]'}`} data-testid="link-course-secondary-action">{course.secondaryActionLabel}</a>}
          </div>
        </div>
        <aside className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-[hsl(var(--card-foreground))] shadow-xl sm:p-7" aria-labelledby="course-enquiry-heading">
           <CourseEyebrow label="Course enquiry" testId="text-course-enquiry-eyebrow" />
          <h2 id="course-enquiry-heading" className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-.03em] text-[hsl(var(--primary))] sm:text-3xl">{enquirySettings?.callbackPopupHeading ?? 'Contact admissions'}</h2>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{enquirySettings?.callbackPopupDescription ?? 'Share your details and the admissions team will get in touch.'}</p>
          <div className="mt-5">
            {enquirySettingsLoading && <p className="rounded-xl bg-[hsl(var(--secondary))] px-4 py-5 text-sm text-[hsl(var(--muted-foreground))]" role="status">Loading the enquiry form…</p>}
            {enquirySettingsError && <div className="space-y-3 rounded-xl bg-[hsl(var(--secondary))] p-4 text-sm text-[hsl(var(--muted-foreground))]" role="alert"><p>The enquiry form is temporarily unavailable.</p><div className="flex flex-wrap gap-3"><button type="button" onClick={onRetryEnquirySettings} className="font-bold text-[hsl(var(--primary))] underline underline-offset-4">Try again</button><Link href="/contact" className="font-bold text-[hsl(var(--primary))] underline underline-offset-4">Contact admissions</Link></div></div>}
            {!enquirySettingsLoading && !enquirySettingsError && enquirySettings && (enquirySettings.callbackPopupEnabled
              ? <CallbackPopupForm settings={enquirySettings} initialCourse={initialCourse} variant="inline" />
              : <p className="rounded-xl bg-[hsl(var(--secondary))] p-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Online callback requests are currently unavailable. <Link href="/contact" className="font-bold text-[hsl(var(--primary))] underline underline-offset-4">Contact admissions</Link>.</p>)}
          </div>
        </aside>
      </div>
    </section>
  );
}

function HighlightHeading({ heading }: { heading: string }) {
  const index = heading.toLowerCase().lastIndexOf('highlights');
  if (index < 0) return <>{heading}</>;
  const wordEnd = index + 'highlights'.length;
  return <>{heading.slice(0, index)}<span className="text-[hsl(var(--accent))]">{heading.slice(index, wordEnd)}</span>{heading.slice(wordEnd)}</>;
}

export function HighlightsSection({
  eyebrow,
  heading,
  introduction,
  highlights,
}: {
  eyebrow: string;
  heading: string;
  introduction: string;
  highlights: PublicCourse['highlights'];
}) {
  const orderedHighlights = [...highlights].sort((left, right) => left.displayOrder - right.displayOrder);

  return (
    <section id="course-highlights" className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-16 lg:px-10 lg:py-20" aria-labelledby="course-highlights-heading" data-testid="section-course-highlights">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <CourseEyebrow label={eyebrow} className="mx-auto" testId="text-course-highlights-eyebrow" />
          <h2 id="course-highlights-heading" className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-.035em] text-[hsl(var(--primary))] sm:text-4xl md:text-5xl" data-testid="heading-course-highlights">
            <HighlightHeading heading={heading} />
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base" data-testid="text-course-highlights-introduction">{introduction}</p>
        </header>
        <ol className="relative mt-10 grid min-w-0 grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-5 lg:mt-14 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-0" aria-label="Quick course highlights" data-testid="list-course-highlights">
          <span aria-hidden="true" className="pointer-events-none absolute bottom-6 left-[.625rem] top-6 w-px bg-[hsl(var(--accent)/.28)] sm:hidden" />
          <span aria-hidden="true" className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[6.125rem] hidden h-px bg-[hsl(var(--accent)/.28)] lg:block" />
          {orderedHighlights.map((item, index) => (
            <li key={`${item.displayOrder}-${item.title}`} className="group relative grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-stretch sm:block" data-testid={`card-course-highlight-${index}`}>
              <div className="relative pr-2 sm:mx-auto sm:h-28 sm:w-full sm:pr-0">
                <span aria-hidden="true" className="block pt-3 text-right font-display text-4xl font-semibold leading-none text-[hsl(var(--primary)/.12)] sm:absolute sm:inset-x-0 sm:top-0 sm:pt-0 sm:text-center sm:text-7xl">
                  {String(item.displayOrder).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="absolute left-[.25rem] top-6 z-10 h-3 w-3 rounded-full border-2 border-[hsl(var(--accent))] bg-[hsl(var(--background))] shadow-[0_0_0_4px_hsl(var(--background))] sm:left-1/2 sm:top-auto sm:bottom-2 sm:-translate-x-1/2" />
              </div>
              <article className={`relative flex min-h-[15.5rem] min-w-0 flex-col rounded-2xl border border-[hsl(var(--primary)/.07)] p-5 shadow-sm transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg motion-reduce:transition-none sm:p-6 ${index % 2 === 0 ? 'bg-sky-50 dark:bg-sky-950/25' : 'bg-rose-50 dark:bg-rose-950/25'}`}>
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">{item.category}</p>
                <span aria-hidden="true" className="mt-3 h-0.5 w-8 rounded-full bg-[hsl(var(--accent))]" />
                <h3 className="mt-4 break-words font-display text-xl font-semibold leading-tight text-[hsl(var(--primary))] sm:text-[1.35rem]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WhyChooseHeading({ heading }: { heading: string }) {
  const emphasized = heading.match(/student\.?/i);
  if (!emphasized) return <>{heading}</>;
  const start = heading.toLowerCase().indexOf(emphasized[0].toLowerCase());
  return <>{heading.slice(0, start)}<span className="text-[hsl(var(--destructive))]">{emphasized[0]}</span>{heading.slice(start + emphasized[0].length)}</>;
}

export function WhyChooseSection({ heading, introduction, reasons }: { heading: string; introduction: string; reasons: CourseReason[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setHasEntered(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setHasEntered(true);
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const cardColors = ['course-why-card--blue', 'course-why-card--rose', 'course-why-card--mint'];
  const numberColors = ['text-sky-700/15 dark:text-sky-300/20', 'text-rose-700/15 dark:text-rose-300/20', 'text-emerald-700/15 dark:text-emerald-300/20'];

  return (
    <section ref={sectionRef} data-revealed={hasEntered} className="bg-[hsl(var(--background))] px-6 py-16 lg:px-10 lg:py-24" aria-labelledby="why-course-heading" data-testid="section-course-why-choose">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-4xl">
          <CourseEyebrow label="Why choose this pathway" testId="text-course-why-eyebrow" />
          <h2 id="why-course-heading" className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl md:text-6xl">
            <WhyChooseHeading heading={heading} />
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">{introduction}</p>
        </header>
        <ol className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Why choose this pathway">
          {reasons.slice(0, 3).map((reason, index) => (
            <li key={`${reason.title}-${index}`} className="min-w-0">
              <article
                className={`course-why-card ${cardColors[index]} min-h-[15rem] rounded-2xl p-6 shadow-sm sm:p-7`}
                style={{ animationDelay: `${index * 180}ms` }}
                data-testid={`card-course-reason-${index}`}
              >
                <div className="relative z-10">
                  <span aria-hidden="true" className={`block font-display text-6xl font-semibold leading-none sm:text-7xl ${numberColors[index]}`}>{String(index + 1).padStart(2, '0')}</span>
                  <span aria-hidden="true" className="mt-3 block h-[3px] w-8 rounded-full bg-[hsl(var(--destructive))]" />
                  <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-[hsl(var(--primary))] sm:text-2xl">{reason.title}</h3>
                  <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[hsl(var(--muted-foreground))]">{reason.description}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function MentorsSection({ mentors }: { mentors: CourseMentor[] }) {
  const visibleMentors = mentors.filter((mentor) => (
    mentor.name.trim().length > 0 && !/\b(?:placeholder|sample|tbd)\b/i.test(mentor.name)
  ));

  return (
    <section className="bg-[hsl(var(--background))] px-6 py-16 lg:px-10 lg:py-24" aria-labelledby="course-mentors-heading" data-testid="section-course-faculty">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <CourseEyebrow label="Meet our faculty" testId="text-course-faculty-eyebrow" />
            <h2 id="course-mentors-heading" className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl md:text-6xl">
              Meet the subject <span className="text-[hsl(var(--destructive))]">mentors.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
              Learn from experienced educators who guide, support, and inspire students through every step of their journey.
            </p>
          </div>
          <Link href="/faculty" className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-sm font-bold text-[hsl(var(--primary))] transition hover:text-[hsl(var(--accent-foreground))] sm:self-auto" data-testid="link-course-all-faculty">Meet all faculty <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        {visibleMentors.length ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:mt-12">
            {visibleMentors.map((mentor, index) => {
              const experience = mentor.experience.trim();
              const qualification = mentor.qualification.trim();
              const initials = mentor.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
              const tint = index % 2 === 0 ? 'bg-sky-50/70 dark:bg-sky-950/20' : 'bg-rose-50/65 dark:bg-rose-950/20';
              return (
                <article key={mentor.id} className={`relative overflow-hidden rounded-2xl border border-[hsl(var(--primary)/.09)] ${tint} shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none`} data-testid={`card-course-mentor-${mentor.id}`}>
                  <span aria-hidden="true" className="pointer-events-none absolute right-5 top-3 font-display text-6xl font-semibold leading-none text-[hsl(var(--accent)/.24)] sm:text-7xl">{String(index + 1).padStart(2, '0')}</span>
                  <div className="flex min-h-36 items-center gap-4 p-5 pr-20 sm:gap-5 sm:p-6 sm:pr-24">
                    {mentor.imageUrl
                      ? <img src={mentor.imageUrl} alt={mentor.imageAltText || `${mentor.name} portrait`} className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" data-testid={`img-course-mentor-${mentor.id}`} />
                      : <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))] font-display text-3xl font-semibold text-[hsl(var(--accent))] sm:h-28 sm:w-28" aria-label={`${mentor.name} initials portrait`}>{initials}</div>}
                    <div className="min-w-0">
                      <h3 className="break-words font-display text-xl font-semibold leading-tight text-[hsl(var(--primary))] sm:text-2xl">{mentor.name}</h3>
                      {qualification && <p className="mt-2 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{qualification}</p>}
                      {mentor.teachingSubjects.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label={`${mentor.name} teaching subjects`}>{mentor.teachingSubjects.map((subject) => <span key={subject} className="rounded-full bg-[hsl(var(--accent)/.11)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--primary))]" data-testid={`tag-course-mentor-subject-${mentor.id}-${subject}`}>{subject}</span>)}</div>}
                    </div>
                  </div>
                  {mentor.biography.trim() && <p className="border-t border-[hsl(var(--primary)/.1)] px-5 py-4 text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:px-6" data-testid={`text-course-mentor-bio-${mentor.id}`}>{mentor.biography}</p>}
                  {experience && <div className="border-t border-[hsl(var(--primary)/.1)] px-5 py-3.5 sm:px-6">
                    <p className="font-display text-lg font-semibold text-[hsl(var(--primary))]">{experience}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Experience</p>
                  </div>}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-6 py-14 text-center" data-testid="status-course-mentors-empty">
            <GraduationCap className="mx-auto text-[hsl(var(--accent-foreground))]" size={28} aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-semibold text-[hsl(var(--primary))]">Subject mentors are being matched.</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Our admissions team can answer questions in the meantime.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function CurriculumSection({ syllabus, fileName, isSample, downloadUrl }: { syllabus: CourseSyllabusSubject[]; fileName: string | null; isSample: boolean; downloadUrl: string }) {
  const [openSubject, setOpenSubject] = useState<string | null>(syllabus[0]?.subject ?? null);
  return (
    <section id="course-syllabus" className="scroll-mt-28 bg-[hsl(var(--background))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="course-curriculum-heading" data-testid="section-course-syllabus">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.42fr] lg:gap-20">
        <div>
          <CourseEyebrow label="Curriculum" testId="text-course-syllabus-eyebrow" />
          <h2 id="course-curriculum-heading" className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">The subjects, laid out clearly.</h2>
          {syllabus.length ? <div className="mt-10 divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]" data-testid="list-course-curriculum">{syllabus.map((item, index) => {
            const open = openSubject === item.subject;
            const panelId = `course-subject-panel-${index}`;
            return <div key={`${item.subject}-${index}`} data-testid={`accordion-course-subject-${index}`}>
              <button type="button" className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent))]" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenSubject(open ? null : item.subject)} data-testid={`button-course-subject-${index}`}>
                <span className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.subject}</span>
                <ChevronDown size={20} className={`shrink-0 text-[hsl(var(--accent-foreground))] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <div id={panelId} hidden={!open} className="pb-5 pr-8" role="region" aria-labelledby={`button-course-subject-${index}`}>
                <ul className="space-y-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.topics.map((topic, topicIndex) => <li key={`${topic}-${topicIndex}`} className="flex gap-3" data-testid={`text-course-topic-${index}-${topicIndex}`}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />{topic}</li>)}</ul>
              </div>
            </div>;
          })}</div> : <div className="mt-10 rounded-2xl border border-dashed border-[hsl(var(--border))] p-6 text-sm text-[hsl(var(--muted-foreground))]" data-testid="status-course-curriculum-empty">Subject topics are being prepared.</div>}
        </div>
        <aside className="h-fit rounded-3xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] shadow-lg lg:sticky lg:top-8" data-testid="card-course-curriculum-download">
          <Download className="text-[hsl(var(--accent))]" size={24} aria-hidden="true" />
          <h3 className="mt-5 font-display text-3xl font-semibold">Take the curriculum with you.</h3>
          <p className="mt-3 text-sm leading-6 text-white/65">{fileName || 'Course curriculum PDF'}</p>
          {isSample && <p className="mt-4 rounded-xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.12)] px-4 py-3 text-xs font-semibold leading-5 text-[hsl(var(--accent))]" data-testid="status-course-curriculum-sample">This is a replaceable sample curriculum PDF.</p>}
          {downloadUrl ? <a href={downloadUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5" data-testid="link-course-curriculum-download">Download curriculum <Download size={16} aria-hidden="true" /></a> : <span className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-white/15 px-5 py-3.5 text-sm font-bold text-white/55" data-testid="status-course-curriculum-unavailable">Curriculum download unavailable</span>}
        </aside>
      </div>
    </section>
  );
}
