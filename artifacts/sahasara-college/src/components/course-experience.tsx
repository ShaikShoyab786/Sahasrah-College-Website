import { ArrowRight, BookOpen, ChevronDown, Download, FileText, GraduationCap, Layers3, RefreshCw, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CallbackPopupSettings, CourseMentor, CourseReason, CourseSyllabusSubject, PublicCourse } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { CallbackPopupForm } from '@/components/callback-popup';
import { CourseMentorCarousel } from '@/components/course-mentor-carousel';
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
    <section className={`relative isolate overflow-hidden border-b border-[hsl(var(--border))] px-6 pb-10 pt-32 lg:px-10 lg:pb-12 lg:pt-44 ${hasImage ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'}`} aria-label={`${course.name} course introduction`} data-testid="section-course-hero">
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
            {course.primaryActionLabel && course.primaryActionUrl && <a href={course.primaryActionUrl} className="group inline-flex min-h-12 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))]" data-testid="link-course-primary-action">{course.primaryActionLabel}<ArrowRight size={17} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></a>}
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
    <section id="course-highlights" className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="course-highlights-heading" data-testid="section-course-highlights">
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
    <section ref={sectionRef} data-revealed={hasEntered} className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="why-course-heading" data-testid="section-course-why-choose">
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
    <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="course-mentors-heading" data-testid="section-course-faculty">
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
          <Link href="/faculty" className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-sm text-sm font-bold text-[hsl(var(--primary))] transition hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--background))] sm:self-auto" data-testid="link-course-all-faculty">Meet all faculty <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        {visibleMentors.length ? (
          <CourseMentorCarousel mentors={visibleMentors} />
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

const curriculumBenefits = [
  { icon: BookOpen, title: 'Comprehensive Syllabus', description: 'Key topics organized by subject.' },
  { icon: Target, title: 'Exam-Oriented Focus', description: 'A clear focus for each course pathway.' },
  { icon: Layers3, title: 'Structured Progression', description: 'Move from core ideas to applications.' },
  { icon: RefreshCw, title: 'Regular Updates', description: 'Subject details managed by the college.' },
];

export function CurriculumSection({ syllabus, fileName, isSample, downloadUrl }: { syllabus: CourseSyllabusSubject[]; fileName: string | null; isSample: boolean; downloadUrl: string }) {
  const [openSubjectIndex, setOpenSubjectIndex] = useState<number | null>(() => syllabus.length ? 0 : null);
  const pdfAvailable = !isSample && Boolean(downloadUrl);

  useEffect(() => {
    setOpenSubjectIndex(syllabus.length ? 0 : null);
  }, [syllabus]);

  return (
    <section id="course-syllabus" className="scroll-mt-28 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="course-curriculum-heading" data-testid="section-course-syllabus">
      <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(19rem,.9fr)] lg:gap-10">
        <div className="min-w-0">
          <CourseEyebrow label="Curriculum" testId="text-course-syllabus-eyebrow" />
          <h2 id="course-curriculum-heading" className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl">
            A clear path from concepts to <span className="text-[hsl(var(--destructive))]">confidence.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:text-base">
            Explore the subjects, key topics, and preparation areas covered throughout the course.
          </p>

          {syllabus.length ? (
            <div className="mt-7 space-y-3" data-testid="list-course-curriculum">
              {syllabus.map((item, index) => {
                const open = openSubjectIndex === index;
                const panelId = `course-subject-panel-${index}`;
                const topics = item.topics.filter((topic) => topic.trim().length > 0);
                const summary = topics.slice(0, 3).join(' · ');

                return (
                  <article key={`${item.subject}-${index}`} className={`overflow-hidden rounded-2xl border shadow-sm transition-colors ${open ? 'border-[hsl(var(--accent)/.4)] bg-[hsl(var(--card))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)]'}`} data-testid={`accordion-course-subject-${index}`}>
                    <h3>
                      <button
                        type="button"
                        className="grid min-h-[5.25rem] w-full grid-cols-[2.8rem_minmax(0,1fr)_2.5rem] items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent))] sm:grid-cols-[3.25rem_minmax(0,1fr)_2.75rem] sm:gap-4 sm:px-5"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenSubjectIndex(open ? null : index)}
                        data-testid={`button-course-subject-${index}`}
                      >
                        <span aria-hidden="true" className="border-r border-[hsl(var(--border))] pr-3 font-display text-3xl font-semibold leading-none text-[hsl(var(--primary)/.28)] sm:text-4xl">{String(index + 1).padStart(2, '0')}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-display text-lg font-semibold leading-tight text-[hsl(var(--primary))] sm:text-xl">{item.subject}</span>
                          <span className="mt-1 block truncate text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm" title={summary}>{summary || 'Topics are being prepared'}</span>
                        </span>
                        <span className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${open ? 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'}`}>
                          <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </span>
                      </button>
                    </h3>
                    <div id={panelId} hidden={!open} className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background)/.65)] px-5 py-4 sm:px-6" role="region" aria-labelledby={`button-course-subject-${index}`}>
                      {topics.length ? (
                        <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2 xl:grid-cols-3" data-testid={`list-course-topics-${index}`}>
                          {topics.map((topic, topicIndex) => (
                            <li key={`${topic}-${topicIndex}`} className="flex min-w-0 items-start gap-2.5 text-sm leading-6 text-[hsl(var(--foreground))]" data-testid={`text-course-topic-${index}-${topicIndex}`}>
                              <span aria-hidden="true" className="mt-[.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--destructive))]" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]" data-testid={`status-course-topics-empty-${index}`}>Topics are being prepared.</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-sm text-[hsl(var(--muted-foreground))]" data-testid="status-course-curriculum-empty">Subject topics are being prepared.</div>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <aside className="relative overflow-hidden rounded-3xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-xl sm:p-7" data-testid="card-course-curriculum-download">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full border border-white/10" />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-[hsl(var(--accent))]">
                <FileText size={20} aria-hidden="true" />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[.22em] text-white/70">Curriculum Guide</p>
              <h3 className="mt-2 max-w-xs font-display text-3xl font-semibold leading-tight">Take the curriculum with you.</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">Download the subject and topic guide for this course.</p>
              {pdfAvailable ? (
                <>
                  <a href={downloadUrl} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--destructive))] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--primary))]" data-testid="link-course-curriculum-download">
                    Download Curriculum <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  <p className="mt-3 truncate text-xs text-white/60" data-testid="text-course-curriculum-file-meta">PDF · {fileName || 'Course curriculum'}</p>
                </>
              ) : (
                <p className="mt-5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm leading-5 text-white/75" role="status" data-testid="status-course-curriculum-unavailable">Curriculum PDF is not available yet.</p>
              )}
            </div>
          </aside>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm sm:p-6" data-testid="card-course-curriculum-benefits">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Built for Competitive Success</p>
            <div className="mt-4 grid grid-cols-2">
              {curriculumBenefits.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className={`flex min-w-0 gap-3 py-3 ${index % 2 === 1 ? 'pl-3 sm:pl-4' : 'pr-3 sm:pr-4'} ${index > 1 ? 'border-t border-[hsl(var(--border))]' : ''} ${index % 2 === 1 ? 'border-l border-[hsl(var(--border))]' : ''}`} data-testid={`item-course-curriculum-benefit-${index}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold leading-4 text-[hsl(var(--primary))]">{title}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
