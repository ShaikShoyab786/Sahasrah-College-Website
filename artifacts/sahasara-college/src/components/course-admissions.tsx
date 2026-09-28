import { ArrowRight, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CourseEyebrow } from '@/components/course-experience';
import './course-admissions.css';

const admissionSteps = [
  'Campus Visit & Inquiry',
  'Academic Counseling',
  'Document Verification',
  'Fee Payment & Enrollment',
];

export function CourseAdmissionProcess() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(Boolean(entry?.isIntersecting));
    }, { threshold: 0.2 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="admission-process"
      className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-16"
      aria-labelledby="course-admission-process-heading"
      data-testid="section-course-admission-process"
      data-progress-active={isVisible ? 'true' : 'false'}
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <CourseEyebrow label="Your next steps" className="mx-auto" testId="text-course-admission-process-eyebrow" />
          <h2
            id="course-admission-process-heading"
            className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-.04em] text-[hsl(var(--primary))] sm:text-4xl md:text-5xl"
            data-testid="heading-course-admission-process"
          >
            Admission &amp; Enrollment Process
          </h2>
          <span className="mx-auto mt-5 block h-1 w-14 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
        </header>

        <div className="course-admission-timeline relative mx-auto mt-10 max-w-6xl sm:mt-12">
          <span className="course-admission-track course-admission-track--vertical" aria-hidden="true" />
          <span className="course-admission-track course-admission-track--vertical course-admission-track--fill" aria-hidden="true" />
          <span className="course-admission-track course-admission-track--horizontal" aria-hidden="true" />
          <span className="course-admission-track course-admission-track--horizontal course-admission-track--fill" aria-hidden="true" />
          <ol className="relative grid gap-6 md:grid-cols-4 md:gap-0" aria-label="Admission and enrollment steps">
            {admissionSteps.map((step, index) => (
              <li
                key={step}
                className="course-admission-step relative z-[1] grid min-h-12 grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-3 md:flex md:flex-col md:items-center md:gap-4 md:text-center"
                data-testid={`item-course-admission-step-${index + 1}`}
              >
                <span className="course-admission-node grid h-11 w-11 place-items-center rounded-full border-2 border-[hsl(var(--accent))] bg-[hsl(var(--background))] font-display text-lg font-bold text-[hsl(var(--accent-foreground))]">
                  {index + 1}
                </span>
                <span className="max-w-[18rem] text-sm font-bold leading-5 text-[hsl(var(--primary))] md:text-xs md:uppercase md:tracking-[.07em]">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function CourseFinalAdmissionsCta({
  collegeName,
  enrollmentHref,
  whatsappNumber,
}: {
  collegeName: string;
  enrollmentHref: string;
  whatsappNumber: string;
}) {
  const whatsappDigits = whatsappNumber.replace(/\D/g, '');
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '/contact';

  return (
    <section
      id="course-final-admissions"
      className="relative isolate overflow-hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-6 py-14 lg:px-10 lg:py-20"
      aria-labelledby="course-final-admissions-heading"
      data-testid="section-course-final-admissions"
    >
      <span className="pointer-events-none absolute -left-28 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-[hsl(var(--accent)/.24)] sm:-left-20" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-[hsl(var(--destructive)/.22)] sm:-right-24" aria-hidden="true" />
      <span className="pointer-events-none absolute -left-16 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-[hsl(var(--primary)/.08)] sm:-left-8" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl text-center">
        <CourseEyebrow label="Admissions Open" className="mx-auto" testId="text-course-final-admissions-eyebrow" />
        <h2
          id="course-final-admissions-heading"
          className="mx-auto mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl md:text-6xl"
          data-testid="heading-course-final-admissions"
        >
          Take the First Step Towards Your{' '}
          <span className="text-[hsl(var(--destructive))]">Successful Career</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
          Join {collegeName} and get the right guidance, academic support, and learning environment to achieve your goals.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={enrollmentHref || '/contact'}
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[hsl(var(--destructive))] px-6 py-3 text-sm font-bold text-[hsl(var(--destructive-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--secondary))]"
            data-testid="link-course-enroll-now"
          >
            Enroll Now <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--secondary))]"
            data-testid="link-course-whatsapp"
          >
            <MessageCircle size={17} className="text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            WhatsApp Us <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}