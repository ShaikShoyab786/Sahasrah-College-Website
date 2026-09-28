import { getGetCallbackPopupSettingsQueryKey, getGetCourseBySlugQueryKey, useGetCallbackPopupSettings, useGetContactSettings, useGetCourseBySlug, useGetGalleryPage, useGetSiteSettings, type CourseSlug } from '@workspace/api-client-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { CourseEmptyState, CourseErrorState, CourseHero, CourseLoadingState, CurriculumSection, HighlightsSection, MentorsSection, WhyChooseSection } from '@/components/course-experience';
import { CourseAdmissionProcess, CourseFinalAdmissionsCta } from '@/components/course-admissions';
import { CourseCampusGallery } from '@/components/course-campus-gallery';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';
import { useParams } from 'wouter';

const validSlugs = new Set<CourseSlug>(['mpc', 'bipc', 'mpc-iit-jee', 'bipc-neet', 'mpc-eamcet']);

export default function CourseDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as CourseSlug;
  const settingsQuery = useGetSiteSettings();
  const courseQuery = useGetCourseBySlug(slug, { query: { queryKey: getGetCourseBySlugQueryKey(slug) } });
  const enquirySettingsQuery = useGetCallbackPopupSettings({
    query: { queryKey: getGetCallbackPopupSettingsQueryKey() },
  });
  const contactSettingsQuery = useGetContactSettings();
  const galleryQuery = useGetGalleryPage();
  const settings = settingsQuery.data;
  const publicSettings = settings ?? {
    collegeName: 'Sahsrah Junior College',
    tagline: 'Your College Tagline',
    logoUrl: null,
    email: 'admissions@sahsrah.edu',
    phone: '+91 40 2458 0176',
    footerText: 'A public junior college for curious minds and purposeful lives.',
  };

  if (!validSlugs.has(slug)) return <CourseEmptyState detail />;
  if (settingsQuery.isLoading || courseQuery.isLoading) return <CourseLoadingState label="Loading course detail" />;
  if (settingsQuery.isError || courseQuery.isError) return <CourseErrorState label="Course unavailable" onRetry={() => { void settingsQuery.refetch(); void courseQuery.refetch(); }} />;
  const course = courseQuery.data;
  if (!course) return <CourseEmptyState detail />;

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={createPublicThemeStyle(settings?.primaryColor || DEFAULT_PRIMARY_COLOR, settings?.accentColor || DEFAULT_ACCENT_COLOR, settings?.surfaceColor || DEFAULT_SURFACE_COLOR)}>
      <PublicHeader settings={publicSettings} activePage="courses" />
      <main>
        <CourseHero
          course={course}
          enquirySettings={enquirySettingsQuery.data}
          enquirySettingsLoading={enquirySettingsQuery.isLoading}
          enquirySettingsError={enquirySettingsQuery.isError}
          onRetryEnquirySettings={() => { void enquirySettingsQuery.refetch(); }}
        />
        <HighlightsSection eyebrow={course.highlightsEyebrow} heading={course.highlightsHeading} introduction={course.highlightsIntroduction} highlights={course.highlights} />
        <WhyChooseSection heading={course.whyChooseHeading} introduction={course.whyChooseIntroduction} reasons={course.whyChoose} />
        <MentorsSection mentors={course.mentors} />
        <CurriculumSection syllabus={course.syllabus} fileName={course.curriculumPdfFileName} isSample={course.curriculumPdfIsSample} downloadUrl={course.curriculumDownloadUrl} />
        <CourseCampusGallery items={galleryQuery.data?.items ?? []} />
        <CourseAdmissionProcess />
        <CourseFinalAdmissionsCta
          collegeName={publicSettings.collegeName}
          enrollmentHref={course.primaryActionUrl?.trim() || '/contact'}
          whatsappNumber={contactSettingsQuery.data?.whatsappNumber || ''}
        />
      </main>
      <PublicFooter settings={publicSettings} />
    </div>
  );
}