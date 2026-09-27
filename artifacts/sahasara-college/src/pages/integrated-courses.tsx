import { ArrowRight, Layers3 } from 'lucide-react';
import { useGetSiteSettings } from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { CourseLoadingState } from '@/components/course-experience';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';
import { Link } from 'wouter';

export default function IntegratedCourses() {
  const settingsQuery = useGetSiteSettings();
  const settings = settingsQuery.data;
  const publicSettings = settings ?? { collegeName: 'Sahsrah Junior College', tagline: 'Your College Tagline', logoUrl: null, email: 'admissions@sahsrah.edu', phone: '+91 40 2458 0176', footerText: 'A public junior college for curious minds and purposeful lives.' };
  if (settingsQuery.isLoading) return <CourseLoadingState label="Loading integrated courses" />;
  return (
    <div className="paper-grain min-h-[100dvh] overflow-hidden bg-[hsl(var(--background))]" style={createPublicThemeStyle(settings?.primaryColor || DEFAULT_PRIMARY_COLOR, settings?.accentColor || DEFAULT_ACCENT_COLOR, settings?.surfaceColor || DEFAULT_SURFACE_COLOR)}>
      <PublicHeader settings={publicSettings} activePage="courses" />
      <main className="grid min-h-[calc(100dvh-300px)] place-items-center px-6 py-24 lg:px-10">
        <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-sm md:p-14" data-testid="section-integrated-courses">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]"><Layers3 size={28} aria-hidden="true" /></div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.22em] text-[hsl(var(--accent-foreground))]">Integrated courses</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[.94] tracking-[-.06em] text-[hsl(var(--primary))] md:text-7xl" data-testid="text-integrated-courses-heading">A separate conversation.</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[hsl(var(--muted-foreground))]">Integrated options combine regular college study with entrance-focused preparation. They are intentionally kept separate from the five regular pathways in this guide.</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">Speak with admissions for current availability, structure, and fit.</p>
          <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="link-integrated-contact">Talk with admissions <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      </main>
      <PublicFooter settings={publicSettings} />
    </div>
  );
}