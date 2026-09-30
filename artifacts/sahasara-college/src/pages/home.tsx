import { useGetHomepageAboutPreview, useGetHomepageAchievementRibbon, useGetHomepageAdmissionsFaq, useGetHomepageFaculty, useGetHomepageFavoriteTopics, useGetHomepageFinalCta, useGetHomepageGallery, useGetHomepageHero, useGetHomepageKnowledgeHub, useGetHomepageLiveUpdates, useGetHomepagePreviewCopy, useGetHomepageResults, useGetHomepageStatistics, useGetHomepageTestimonials, useGetSiteSettings, type HomepageFavoriteTopics, type HomepageLiveUpdate } from '@workspace/api-client-react';
import { HeroCarousel } from '@/components/hero-carousel';
import { AboutPreview } from '@/components/about-preview';
import { PublicFooter } from '@/components/public-footer';
import { PublicHeader } from '@/components/public-header';
import { HomeLiveUpdates } from '@/components/home-live-updates';
import { HomeStatistics } from '@/components/home-statistics';
import { FavoriteTopics } from '@/components/favorite-topics';
import { AchievementRibbon, fallbackRibbon, fallbackTestimonials, HomeFaculty, HomeGallery, HomeResults, HomeTestimonials } from '@/components/home-previews';
import { fallbackAdmissionsFaq, fallbackFinalCta, fallbackKnowledgeHub, HomeAdmissionsFaq, HomeFinalCta, HomeKnowledgeHub } from '@/components/home-final-previews';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const fallbackSettings = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'Your College Tagline',
  logoUrl: null,
  email: 'admissions@sahsrah.edu',
  phone: '+91 40 2458 0176',
  address: '18 Vidya Marg, Hyderabad, Telangana 500034',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  surfaceColor: DEFAULT_SURFACE_COLOR,
  footerText: 'A public junior college for curious minds and purposeful lives.',
};
const fallbackHeroSlides = [
  {
    id: 'fallback-1',
    displayOrder: 1,
    eyebrowText: 'A focused start to a bright future',
    heading: 'Learn with purpose.',
    highlightedHeadingText: 'Grow with confidence.',
    description: 'A welcoming academic environment where students build strong foundations, discover their strengths, and prepare for what comes next.',
    primaryButtonLabel: 'Explore admissions',
    primaryButtonUrl: '/contact',
    secondaryButtonLabel: 'Discover our approach',
     secondaryButtonUrl: '#about-preview',
    heroImageUrl: null,
    heroImageAltText: 'Sahsrah students learning together',
  },
  {
    id: 'fallback-2',
    displayOrder: 2,
    eyebrowText: 'Make room for possibility',
    heading: 'Ask better',
    highlightedHeadingText: 'questions.',
    description: 'At Sahsrah, curiosity is not a detour from learning. It is where confidence, creativity, and clarity begin.',
    primaryButtonLabel: 'See how we learn',
     primaryButtonUrl: '#about-preview',
    secondaryButtonLabel: 'Meet Sahsrah',
    secondaryButtonUrl: '/contact',
    heroImageUrl: null,
    heroImageAltText: 'Students collaborating in a Sahsrah classroom',
  },
  {
    id: 'fallback-3',
    displayOrder: 3,
    eyebrowText: 'Your next chapter starts here',
    heading: 'Find your',
    highlightedHeadingText: 'direction.',
    description: 'Choose a path that fits your strengths, then give yourself the space to discover what it can become.',
    primaryButtonLabel: 'Start a conversation',
    primaryButtonUrl: '/contact',
    secondaryButtonLabel: 'Explore next steps',
     secondaryButtonUrl: '/contact',
    heroImageUrl: null,
    heroImageAltText: 'Sahsrah students looking toward their future',
  },
];
const fallbackLiveUpdates: HomepageLiveUpdate[] = [
  {
    id: 'fallback-update-1',
    title: 'Admissions for 2026–27 are now open',
    excerpt: 'Meet our admissions team, compare pathways, and find the right academic start for your student.',
    category: 'Admissions',
    actionBadge: 'Apply Now',
    publishDate: '2026-06-15T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85',
    imageAltText: 'Students collaborating around a table',
    detailUrl: '/contact',
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'fallback-update-2',
    title: 'Campus visit days are open for booking',
    excerpt: 'Walk through our classrooms, laboratories, and student spaces with a member of the Sahsrah team.',
    category: 'Campus',
    actionBadge: 'Schedule',
    publishDate: '2026-05-28T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=85',
    imageAltText: 'Bright college classroom',
    detailUrl: '/contact',
    isFeatured: false,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'fallback-update-3',
    title: 'A new term of focused learning begins',
    excerpt: 'Explore the routines, support, and subject guidance that help students build steady momentum.',
    category: 'Community',
    actionBadge: 'Latest',
    publishDate: '2026-05-09T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=85',
    imageAltText: 'Students working together in a science laboratory',
    detailUrl: '/about',
    isFeatured: false,
    isActive: true,
    displayOrder: 3,
  },
];
const fallbackHomepagePreviewCopy = {
  liveUpdatesEyebrow: 'From Sahsrah',
  liveUpdatesHeading: 'Live Updates',
  liveUpdatesButtonLabel: 'View all updates',
  liveUpdatesButtonHref: '/knowledge-hub/exam-updates',
  facultyEyebrow: 'Learn From the Best',
  facultyHeading: 'Our Expert Faculty',
  facultyDescription: 'Experienced subject-matter experts who make difficult ideas clearer and ambitious goals more achievable.',
  facultyButtonLabel: 'More Faculty',
  facultyButtonHref: '/faculty',
  galleryEyebrow: 'Campus Gallery',
  galleryHeading: 'Life at Sahasrah College',
  galleryDescription: 'A quick look at the spaces, routines, and experiences that shape the Sahasrah college day.',
  galleryButtonLabel: 'View Gallery',
  galleryButtonHref: '/gallery',
};
const fallbackFavoriteTopics: HomepageFavoriteTopics = {
  id: 'fallback-favorite-topics',
  eyebrow: 'Explore Our Programs',
  buttonLabel: 'Explore curriculum',
  heading: 'Favorite Topics To Learn',
  description: 'Intermediate MPC & BiPC integrated with IIT-JEE and NEET.',
  isVisible: true,
  sortOrder: 5,
  updatedAt: '2026-06-15T00:00:00.000Z',
  topics: [
    { id: 'fallback-topic-1', categoryLabel: 'MPC · Integrated', title: 'MPC + IIT-JEE', description: 'Build strong concepts and exam confidence through a focused engineering pathway.', featureOne: 'Physics, Chemistry & Maths', featureTwo: 'IIT-JEE integrated preparation', featureThree: 'Regular tests and feedback', imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Mathematics notes and geometry tools', icon: 'atom', curriculumUrl: '/contact', displayOrder: 1, isActive: true },
    { id: 'fallback-topic-2', categoryLabel: 'MPC · Integrated', title: 'MPC + EAMCET', description: 'A steady, practical routine for students preparing for state-level engineering admissions.', featureOne: 'Concept-first classroom teaching', featureTwo: 'EAMCET practice support', featureThree: 'Personal progress guidance', imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Geometry drawing on a classroom board', icon: 'line-chart', curriculumUrl: '/contact', displayOrder: 2, isActive: true },
    { id: 'fallback-topic-3', categoryLabel: 'MPC · Foundation', title: 'MPC', description: 'Strengthen the fundamentals that make higher study clearer and more confident.', featureOne: 'Clear subject foundations', featureTwo: 'Guided daily practice', featureThree: 'Supportive doubt resolution', imageUrl: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Student studying in a quiet library', icon: 'book-open', curriculumUrl: '/contact', displayOrder: 3, isActive: true },
    { id: 'fallback-topic-4', categoryLabel: 'BiPC · Foundation', title: 'BiPC', description: 'Learn biology and the sciences with structure, curiosity, and personal attention.', featureOne: 'Biology, Physics & Chemistry', featureTwo: 'Visual and practical learning', featureThree: 'Consistent revision plans', imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Microscope and biology laboratory equipment', icon: 'dna', curriculumUrl: '/contact', displayOrder: 4, isActive: true },
    { id: 'fallback-topic-5', categoryLabel: 'BiPC · Integrated', title: 'BiPC + NEET', description: 'Prepare for medical pathways with a strong core and a calm, consistent rhythm.', featureOne: 'NEET-aligned subject guidance', featureTwo: 'Test analysis and revision', featureThree: 'Mentorship for steady progress', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Medical science laboratory glassware', icon: 'heart-pulse', curriculumUrl: '/contact', displayOrder: 5, isActive: true },
    { id: 'fallback-topic-6', categoryLabel: 'NEET · Foundation', title: 'NEET Foundation', description: 'Start early with habits, concepts, and guidance that make later preparation stronger.', featureOne: 'Early science foundations', featureTwo: 'Focused study habits', featureThree: 'Regular mentor check-ins', imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Medical anatomy model and study notes', icon: 'stethoscope', curriculumUrl: '/contact', displayOrder: 6, isActive: true },
  ],
};

function HomeSkeleton() {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-8 w-40 rounded-lg bg-[hsl(var(--muted))]" /><div className="h-[520px] rounded-[2rem] bg-[hsl(var(--muted))]" /></div></div>;
}

export default function Home() {
  const settingsQuery = useGetSiteSettings();
  const heroQuery = useGetHomepageHero();
  const aboutPreviewQuery = useGetHomepageAboutPreview();
  const liveUpdatesQuery = useGetHomepageLiveUpdates();
  const previewCopyQuery = useGetHomepagePreviewCopy();
  const statisticsQuery = useGetHomepageStatistics();
  const favoriteTopicsQuery = useGetHomepageFavoriteTopics();
  const resultsQuery = useGetHomepageResults();
  const ribbonQuery = useGetHomepageAchievementRibbon();
  const testimonialsQuery = useGetHomepageTestimonials();
  const facultyQuery = useGetHomepageFaculty();
  const galleryQuery = useGetHomepageGallery();
  const knowledgeHubQuery = useGetHomepageKnowledgeHub();
  const admissionsFaqQuery = useGetHomepageAdmissionsFaq();
  const finalCtaQuery = useGetHomepageFinalCta();
  if (settingsQuery.isLoading || heroQuery.isLoading) return <HomeSkeleton />;
  const settings = settingsQuery.data ?? fallbackSettings;
  const previewCopy = previewCopyQuery.data ?? fallbackHomepagePreviewCopy;
  const slides = heroQuery.data?.length === 3 ? heroQuery.data : fallbackHeroSlides;
  const primaryColor = settings.primaryColor || DEFAULT_PRIMARY_COLOR;
  const accentColor = settings.accentColor || DEFAULT_ACCENT_COLOR;
  const surfaceColor = settings.surfaceColor || DEFAULT_SURFACE_COLOR;
  const themeStyle = createPublicThemeStyle(primaryColor, accentColor, surfaceColor);
  const knowledgeHub = knowledgeHubQuery.isError ? null : (knowledgeHubQuery.data ?? fallbackKnowledgeHub);
  const admissionsFaq = admissionsFaqQuery.isError ? null : (admissionsFaqQuery.data ?? fallbackAdmissionsFaq);
  const finalCta = finalCtaQuery.isError ? null : (finalCtaQuery.data ?? { ...fallbackFinalCta, phoneNumber: settings.phone });

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
       <PublicHeader settings={settings} activePage="home" />

      <main>
        <HeroCarousel slides={slides} />
        {aboutPreviewQuery.data?.isVisible && <AboutPreview content={aboutPreviewQuery.data} />}
        <HomeLiveUpdates updates={liveUpdatesQuery.data?.length ? liveUpdatesQuery.data : fallbackLiveUpdates} eyebrow={previewCopy.liveUpdatesEyebrow} heading={previewCopy.liveUpdatesHeading} buttonLabel={previewCopy.liveUpdatesButtonLabel} buttonHref={previewCopy.liveUpdatesButtonHref} />
        {statisticsQuery.data?.isVisible && <HomeStatistics content={statisticsQuery.data} statistics={(resultsQuery.data?.statistics ?? []).filter((statistic) => statistic.isPublished && statistic.showInHomePreview).sort((a, b) => a.homePreviewOrder - b.homePreviewOrder)} />}
        <FavoriteTopics content={favoriteTopicsQuery.data?.isVisible ? favoriteTopicsQuery.data : fallbackFavoriteTopics} />
         {resultsQuery.data?.isVisible && <HomeResults content={resultsQuery.data} />}
        <AchievementRibbon content={ribbonQuery.data?.isVisible ? ribbonQuery.data : fallbackRibbon} />
        <HomeTestimonials content={testimonialsQuery.data?.isVisible ? testimonialsQuery.data : fallbackTestimonials} />
        <HomeFaculty faculty={facultyQuery.data ?? []} eyebrow={previewCopy.facultyEyebrow} heading={previewCopy.facultyHeading} description={previewCopy.facultyDescription} buttonLabel={previewCopy.facultyButtonLabel} buttonHref="/faculty" themeStyle={themeStyle} unavailable={facultyQuery.isError} />
        <HomeGallery gallery={galleryQuery.data ?? []} eyebrow={previewCopy.galleryEyebrow} heading={previewCopy.galleryHeading} description={previewCopy.galleryDescription} buttonLabel={previewCopy.galleryButtonLabel} buttonHref={previewCopy.galleryButtonHref || '/gallery'} />
        {knowledgeHub?.isVisible && <HomeKnowledgeHub content={knowledgeHub} />}
        {admissionsFaq?.isVisible && <HomeAdmissionsFaq content={admissionsFaq} />}
        {finalCta?.isVisible && <HomeFinalCta content={finalCta} />}

      </main>
        <PublicFooter settings={{ ...settings, footerText: settings.footerText || fallbackSettings.footerText }} />
    </div>
  );
}