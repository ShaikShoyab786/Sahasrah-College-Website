import { ArrowRight } from 'lucide-react';
import type { GalleryItem } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { CourseEyebrow } from '@/components/course-experience';

export function CourseCampusGallery({ items }: { items: GalleryItem[] }) {
  const visibleItems = items
    .filter((item): item is GalleryItem & { imageUrl: string } => (
      item.isPublished && item.showOnCourses && Boolean(item.imageUrl?.trim())
    ))
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id));

  if (visibleItems.length === 0) return null;

  return (
    <section
      id="course-campus-gallery"
      className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-12 lg:px-10 lg:py-16"
      aria-labelledby="course-campus-gallery-heading"
      data-testid="section-course-campus-gallery"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <CourseEyebrow label="Campus Gallery" className="mx-auto" testId="text-course-campus-gallery-eyebrow" />
          <h2
            id="course-campus-gallery-heading"
            className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-.04em] text-[hsl(var(--primary))] sm:text-4xl md:text-5xl"
            data-testid="heading-course-campus-gallery"
          >
            Campus &amp; Learning Experience
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            A closer look at the spaces and experiences that support learning.
          </p>
        </header>

        {visibleItems.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3" data-testid="grid-course-campus-gallery">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="group min-w-0 overflow-hidden rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none"
                data-testid={`card-course-campus-gallery-${item.id}`}
              >
                <div className="relative aspect-[1.16] overflow-hidden bg-[hsl(var(--secondary))]">
                  <img
                    src={item.imageUrl}
                    alt={item.imageAltText}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.88)] via-[hsl(var(--primary)/.12)] to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="font-display text-xl font-semibold leading-tight sm:text-2xl">{item.title}</h3>
                    {item.locationLabel && (
                      <p className="mt-2 text-xs font-semibold tracking-wide text-white/75">{item.locationLabel}</p>
                    )}
                  </div>
                </div>
                {item.description?.trim() && (
                  <p className="line-clamp-2 px-5 py-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="mt-7 flex justify-end">
          <Link
            href="/gallery"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--primary)/.18)] bg-[hsl(var(--card))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]"
            data-testid="link-course-gallery-all"
          >
            View Gallery <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}