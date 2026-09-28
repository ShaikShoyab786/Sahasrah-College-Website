import './_group.css';

type CourseHighlight = {
  label: string;
  value: string;
  description: string;
};

const highlights: CourseHighlight[] = [
  { label: 'Core subjects', value: 'Mathematics · Physics · Chemistry', description: 'Three connected disciplines in one pathway.' },
  { label: 'Learning lens', value: 'Concepts first', description: 'Build understanding before moving to harder applications.' },
  { label: 'Practice focus', value: 'Reasoning and accuracy', description: 'Work through ideas methodically and check each step.' },
  { label: 'Good fit for', value: 'Curious problem-solvers', description: 'Students who like patterns, models, and quantitative questions.' },
];

export function Refined() {
  return (
    <section className="min-h-screen border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <header>
          <h2 className="font-display text-3xl font-semibold leading-tight text-[hsl(var(--primary))] md:text-4xl">Quick Course Highlights</h2>
          <div aria-hidden="true" className="relative mt-6 h-px w-full bg-[hsl(var(--border))]">
            <span className="absolute inset-y-0 left-0 w-20 bg-teal-700 dark:bg-teal-300" />
          </div>
        </header>
        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="list-course-highlights">
          {highlights.map((item, index) => (
            <article key={`${item.label}-${index}`} className="group relative flex min-h-56 flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm transition duration-300 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-1.5 hover:border-teal-700/40 dark:hover:border-teal-300/40 hover:shadow-xl" data-testid={`card-course-highlight-${index}`}>
              <span aria-hidden="true" className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-teal-700/45 transition-colors duration-300 group-hover:bg-teal-700 dark:bg-teal-300/45 dark:group-hover:bg-teal-300" />
              <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-800 dark:text-teal-300">{item.label}</p>
              <p className="mt-3 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}