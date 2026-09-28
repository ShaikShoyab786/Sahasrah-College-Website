import './_group.css';

type CourseHighlight = {
  category: string;
  title: string;
  description: string;
  displayOrder: number;
};

const highlights: CourseHighlight[] = [
  { category: 'Core subjects', title: 'Mathematics, Physics & Chemistry', description: 'Work across quantitative ideas, physical systems, and chemical principles.', displayOrder: 1 },
  { category: 'Learning lens', title: 'Concepts before methods', description: 'Build understanding before applying formulas or multi-step procedures.', displayOrder: 2 },
  { category: 'Practice focus', title: 'Reasoning with accuracy', description: 'Use equations, diagrams, and clear working to explain each answer.', displayOrder: 3 },
  { category: 'Good fit for', title: 'Curious problem-solvers', description: 'For students drawn to patterns, models, and scientific questions.', displayOrder: 4 },
];

export function Refined() {
  return (
    <section className="min-h-screen border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-px w-9 bg-[hsl(var(--accent))]" />
            <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[hsl(var(--accent))]">Quick Overview</p>
            <span aria-hidden="true" className="h-px w-9 bg-[hsl(var(--accent))]" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-.035em] text-[hsl(var(--primary))] sm:text-4xl md:text-5xl">
            Quick Course <span className="text-[hsl(var(--accent))]">Highlights</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            Mathematics, Physics, and Chemistry come together in a pathway built around scientific thinking, quantitative ideas, and clear problem-solving.
          </p>
        </header>
        <ol className="relative mt-10 grid min-w-0 grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-5 lg:mt-14 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-0" aria-label="Quick course highlights" data-testid="list-course-highlights">
          <span aria-hidden="true" className="pointer-events-none absolute bottom-6 left-[.625rem] top-6 w-px bg-[hsl(var(--accent)/.28)] sm:hidden" />
          <span aria-hidden="true" className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[6.125rem] hidden h-px bg-[hsl(var(--accent)/.28)] lg:block" />
          {highlights.map((item, index) => (
            <li key={item.displayOrder} className="group relative grid min-w-0 grid-cols-[4.25rem_minmax(0,1fr)] items-stretch sm:block">
              <div className="relative min-h-full pr-2 sm:mx-auto sm:h-28 sm:w-full sm:pr-0">
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