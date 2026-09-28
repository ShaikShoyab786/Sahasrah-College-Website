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

export function Current() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-10 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--border))] sm:grid-cols-3" data-testid="list-course-highlights">
          {highlights.length ? highlights.map((item, index) => (
            <article key={`${item.label}-${index}`} className="bg-[hsl(var(--card))] p-6 md:p-8" data-testid={`card-course-highlight-${index}`}>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">{item.label}</p>
              <p className="mt-3 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{item.value}</p>
              {item.description && <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p>}
            </article>
          )) : <p className="bg-[hsl(var(--card))] p-7 text-sm text-[hsl(var(--muted-foreground))]">Course highlights will be shared here.</p>}
        </div>
      </section>
    </div>
  );
}