import type { CSSProperties, ReactNode } from 'react';
import { Building2, ChevronLeft, ChevronRight, GraduationCap, Trophy } from 'lucide-react';
import type { HomepageResult } from '@workspace/api-client-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ResultsStoryDialogProps = {
  result: HomepageResult | null;
  index: number;
  total: number;
  themeStyle: CSSProperties;
  onOpenChange: (open: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
};

const categoryLabels: Record<string, string> = {
  INTERMEDIATE: 'Intermediate',
  JEE_MAIN: 'JEE Main',
  NEET: 'NEET',
  EAMCET: 'EAMCET',
  OTHER: 'Other',
};

function studentInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
}

function DetailBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.12)] bg-[hsl(var(--background))] px-3 py-2 text-xs font-semibold text-[hsl(var(--primary))]">
      {children}
    </span>
  );
}

export function ResultsStoryDialog({
  result,
  index,
  total,
  themeStyle,
  onOpenChange,
  onPrevious,
  onNext,
}: ResultsStoryDialogProps) {
  const course = result?.course?.trim() || result?.examCourse?.trim();
  const category = result ? categoryLabels[result.category] || result.category : '';

  return (
    <Dialog open={Boolean(result)} onOpenChange={onOpenChange}>
      <DialogContent
        style={themeStyle}
        overlayClassName="bg-black/50 backdrop-blur-[3px] motion-reduce:animate-none motion-reduce:duration-0"
        closeButtonClassName="right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--primary)/.16)] bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-md opacity-100 transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)] motion-reduce:transition-none sm:right-5 sm:top-5"
        className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-5xl overflow-y-auto rounded-[1.4rem] border-[hsl(var(--border))] bg-[#fffdf7] p-0 text-[hsl(var(--foreground))] shadow-2xl motion-reduce:animate-none motion-reduce:duration-0 sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-[1.8rem] md:overflow-hidden"
        data-testid="dialog-student-story"
      >
        {result && (
          <div className="grid min-h-0 grid-cols-1 md:min-h-[min(78vh,690px)] md:grid-cols-[minmax(270px,0.82fr)_minmax(0,1.18fr)]">
            <section className="relative flex flex-col items-center overflow-hidden bg-[hsl(var(--primary))] px-6 pb-7 pt-10 text-center text-[hsl(var(--primary-foreground))] sm:px-9 sm:pb-9 sm:pt-12 md:justify-center md:px-10">
              <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full border-[22px] border-[hsl(var(--primary-foreground)/.08)]" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full border-[24px] border-[hsl(var(--accent)/.22)]" />
              <div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-[hsl(var(--primary-foreground)/.88)] bg-[hsl(var(--primary-foreground)/.12)] font-display text-3xl font-semibold text-[hsl(var(--accent))] shadow-[0_14px_36px_hsl(0_0%_0%/.2)] sm:h-32 sm:w-32">
                {result.studentImageUrl ? (
                  <img
                    src={result.studentImageUrl}
                    alt={result.studentImageAltText || `Portrait of ${result.studentName}`}
                    className="h-full w-full object-cover"
                    data-testid={`img-story-student-${result.id}`}
                  />
                ) : studentInitials(result.studentName)}
              </div>

              <div className="relative mt-5 max-w-md">
                {result.resultLabel && (
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--eyebrow-dark-text))]">{result.resultLabel}</p>
                )}
                <DialogHeader className="mt-2 space-y-0 text-center sm:text-center">
                  <DialogTitle data-testid="dialog-story-title" className="font-display text-3xl font-semibold leading-tight tracking-[-.04em] text-[hsl(var(--primary-foreground))] sm:text-4xl">
                    {result.studentName}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                  Published result details for {result.studentName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="mx-auto mt-5 h-px w-14 bg-[hsl(var(--accent)/.75)]" />
              </div>

              <div className="relative mt-6 grid w-full max-w-sm grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl border border-[hsl(var(--primary-foreground)/.14)] bg-[hsl(var(--primary-foreground)/.06)] px-4 py-4">
                  <p className="text-[9px] font-bold uppercase tracking-[.17em] text-[hsl(var(--primary-foreground)/.62)]">Marks / score</p>
                  <p className="mt-2 break-words font-display text-2xl font-semibold leading-none tracking-[-.04em] text-[hsl(var(--primary-foreground))] sm:text-3xl" data-testid="dialog-story-score">{result.score}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--primary-foreground)/.14)] bg-[hsl(var(--primary-foreground)/.06)] px-4 py-4">
                  <p className="text-[9px] font-bold uppercase tracking-[.17em] text-[hsl(var(--primary-foreground)/.62)]">Course / stream</p>
                  <p className="mt-2 break-words text-sm font-bold leading-5 text-[hsl(var(--primary-foreground))]" data-testid="dialog-story-course">{course || 'Not provided'}</p>
                </div>
              </div>

              <p className="relative mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--primary-foreground)/.78)]">
                {result.achievement}
              </p>
            </section>

            <section className="flex min-h-0 flex-col px-6 py-7 sm:px-9 sm:py-9 md:max-h-[min(78vh,690px)] md:overflow-y-auto md:px-10">
              <div className="pr-10">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--eyebrow-text))]">Student achievement</p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-.035em] text-[hsl(var(--primary))] sm:text-3xl">
                  Published achievement details.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                  {result.achievement}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2" aria-label="Result details">
                {result.year && <DetailBadge>{result.year}</DetailBadge>}
                {category && <DetailBadge>{category}</DetailBadge>}
                {result.examName && <DetailBadge><GraduationCap size={14} aria-hidden="true" />{result.examName}</DetailBadge>}
                {result.institution && <DetailBadge><Building2 size={14} aria-hidden="true" />{result.institution}</DetailBadge>}
              </div>

              <div className="mt-7 rounded-2xl border border-[hsl(var(--accent)/.26)] bg-[hsl(var(--accent)/.08)] p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[hsl(var(--eyebrow-text))]">
                  <Trophy size={16} aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-[.18em]">Key achievement</p>
                </div>
                <p className="mt-3 font-display text-xl font-semibold leading-snug tracking-[-.02em] text-[hsl(var(--primary))]" data-testid="dialog-story-achievement">
                  {result.achievement}
                </p>
              </div>

              <div className="mt-auto pt-8">
                <div className="flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-5">
                  <button
                    type="button"
                    disabled={index <= 0}
                    onClick={onPrevious}
                    data-testid="button-story-previous"
                    aria-label="Previous student"
                    className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-xs font-bold text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--secondary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none sm:gap-2 sm:px-3"
                  >
                    <ChevronLeft size={17} aria-hidden="true" /> Prev Student
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <DialogClose asChild>
                      <button
                        type="button"
                        data-testid="button-close-story"
                        className="rounded-full border border-[hsl(var(--primary)/.16)] bg-white px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary))] shadow-sm transition hover:border-[hsl(var(--accent)/.55)] hover:bg-[hsl(var(--accent)/.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] motion-reduce:transition-none"
                      >
                        Back to Results
                      </button>
                    </DialogClose>
                    <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">{index + 1} of {total}</span>
                  </div>
                  <button
                    type="button"
                    disabled={index < 0 || index >= total - 1}
                    onClick={onNext}
                    data-testid="button-story-next"
                    aria-label="Next student"
                    className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-xs font-bold text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--secondary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none sm:gap-2 sm:px-3"
                  >
                    Next Student <ChevronRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}