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

export function Current() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-10 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--border))] sm:grid-cols-3" data-testid="list-course-highlights">
          {highlights.length ? highlights.map((item, index) => (
            <article key={`${item.displayOrder}-${index}`} className="bg-[hsl(var(--card))] p-6 md:p-8" data-testid={`card-course-highlight-${index}`}>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">{item.category}</p>
              <p className="mt-3 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{item.title}</p>
              {item.description && <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p>}
            </article>
          )) : <p className="bg-[hsl(var(--card))] p-7 text-sm text-[hsl(var(--muted-foreground))]">Course highlights will be shared here.</p>}
        </div>
      </section>
    </div>
  );
}