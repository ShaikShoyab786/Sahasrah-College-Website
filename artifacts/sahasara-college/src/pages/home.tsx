import { ArrowRight, Mail, MapPin, Phone, Quote } from 'lucide-react';
import { useGetHomepageAboutPreview, useGetHomepageFavoriteTopics, useGetHomepageHero, useGetHomepageLiveUpdates, useGetHomepageStatistics, useGetSiteSettings, type HomepageFavoriteTopics, type HomepageLiveUpdate, type HomepageStatistics } from '@workspace/api-client-react';
import { HeroCarousel } from '@/components/hero-carousel';
import { AboutPreview } from '@/components/about-preview';
import { SiteMark } from '@/components/site-mark';
import { HomeLiveUpdates } from '@/components/home-live-updates';
import { HomeStatistics } from '@/components/home-statistics';
import { FavoriteTopics } from '@/components/favorite-topics';

const fallbackSettings = {
  collegeName: 'Sahasara Junior College',
  tagline: 'Your College Tagline',
  logoUrl: null,
  email: 'admissions@sahasara.edu',
  phone: '+91 40 2458 0176',
  address: '18 Vidya Marg, Hyderabad, Telangana 500034',
  primaryColor: '#102846',
  accentColor: '#D6AD59',
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
    primaryButtonUrl: '#contact',
    secondaryButtonLabel: 'Discover our approach',
     secondaryButtonUrl: '#about-preview',
    heroImageUrl: null,
    heroImageAltText: 'Sahasara students learning together',
  },
  {
    id: 'fallback-2',
    displayOrder: 2,
    eyebrowText: 'Make room for possibility',
    heading: 'Ask better',
    highlightedHeadingText: 'questions.',
    description: 'At Sahasara, curiosity is not a detour from learning. It is where confidence, creativity, and clarity begin.',
    primaryButtonLabel: 'See how we learn',
     primaryButtonUrl: '#about-preview',
    secondaryButtonLabel: 'Meet Sahasara',
    secondaryButtonUrl: '#contact',
    heroImageUrl: null,
    heroImageAltText: 'Students collaborating in a Sahasara classroom',
  },
  {
    id: 'fallback-3',
    displayOrder: 3,
    eyebrowText: 'Your next chapter starts here',
    heading: 'Find your',
    highlightedHeadingText: 'direction.',
    description: 'Choose a path that fits your strengths, then give yourself the space to discover what it can become.',
    primaryButtonLabel: 'Start a conversation',
    primaryButtonUrl: '#contact',
    secondaryButtonLabel: 'Explore next steps',
     secondaryButtonUrl: '#contact',
    heroImageUrl: null,
    heroImageAltText: 'Sahasara students looking toward their future',
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
    detailUrl: '/#contact',
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'fallback-update-2',
    title: 'Campus visit days are open for booking',
    excerpt: 'Walk through our classrooms, laboratories, and student spaces with a member of the Sahasara team.',
    category: 'Campus',
    actionBadge: 'Schedule',
    publishDate: '2026-05-28T00:00:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=85',
    imageAltText: 'Bright college classroom',
    detailUrl: '/#contact',
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
const fallbackStatistics: HomepageStatistics = {
  id: 'fallback-home-statistics',
  eyebrow: 'THE SAHASARA DIFFERENCE',
  heading: 'Progress you can feel.',
  description: 'A focused learning environment turns daily effort into outcomes students can carry forward.',
  isVisible: true,
  sortOrder: 4,
  updatedAt: '2026-06-15T00:00:00.000Z',
  statistics: [
    { id: 'fallback-stat-1', numericTarget: 100, suffix: '%', icon: 'badge-check', label: 'Pass Percentage', displayOrder: 1, isActive: true },
    { id: 'fallback-stat-2', numericTarget: 40, suffix: '+', icon: 'calendar-days', label: 'Years of Physics Mentorship', displayOrder: 2, isActive: true },
    { id: 'fallback-stat-3', numericTarget: 25, suffix: '+', icon: 'graduation-cap', label: 'IIT / NIT Selections', displayOrder: 3, isActive: true },
    { id: 'fallback-stat-4', numericTarget: 4, suffix: '', icon: 'flask-conical', label: 'Science Labs', displayOrder: 4, isActive: true },
  ],
};
const fallbackFavoriteTopics: HomepageFavoriteTopics = {
  id: 'fallback-favorite-topics',
  eyebrow: 'Explore Our Programs',
  heading: 'Favorite Topics To Learn',
  description: 'Intermediate MPC & BiPC integrated with IIT-JEE and NEET.',
  isVisible: true,
  sortOrder: 5,
  updatedAt: '2026-06-15T00:00:00.000Z',
  topics: [
    { id: 'fallback-topic-1', categoryLabel: 'MPC · Integrated', title: 'MPC + IIT-JEE', description: 'Build strong concepts and exam confidence through a focused engineering pathway.', featureOne: 'Physics, Chemistry & Maths', featureTwo: 'IIT-JEE integrated preparation', featureThree: 'Regular tests and feedback', imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Mathematics notes and geometry tools', icon: 'atom', curriculumUrl: '/#contact', displayOrder: 1, isActive: true },
    { id: 'fallback-topic-2', categoryLabel: 'MPC · Integrated', title: 'MPC + EAMCET', description: 'A steady, practical routine for students preparing for state-level engineering admissions.', featureOne: 'Concept-first classroom teaching', featureTwo: 'EAMCET practice support', featureThree: 'Personal progress guidance', imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Geometry drawing on a classroom board', icon: 'line-chart', curriculumUrl: '/#contact', displayOrder: 2, isActive: true },
    { id: 'fallback-topic-3', categoryLabel: 'MPC · Foundation', title: 'MPC', description: 'Strengthen the fundamentals that make higher study clearer and more confident.', featureOne: 'Clear subject foundations', featureTwo: 'Guided daily practice', featureThree: 'Supportive doubt resolution', imageUrl: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Student studying in a quiet library', icon: 'book-open', curriculumUrl: '/#contact', displayOrder: 3, isActive: true },
    { id: 'fallback-topic-4', categoryLabel: 'BiPC · Foundation', title: 'BiPC', description: 'Learn biology and the sciences with structure, curiosity, and personal attention.', featureOne: 'Biology, Physics & Chemistry', featureTwo: 'Visual and practical learning', featureThree: 'Consistent revision plans', imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Microscope and biology laboratory equipment', icon: 'dna', curriculumUrl: '/#contact', displayOrder: 4, isActive: true },
    { id: 'fallback-topic-5', categoryLabel: 'BiPC · Integrated', title: 'BiPC + NEET', description: 'Prepare for medical pathways with a strong core and a calm, consistent rhythm.', featureOne: 'NEET-aligned subject guidance', featureTwo: 'Test analysis and revision', featureThree: 'Mentorship for steady progress', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Medical science laboratory glassware', icon: 'heart-pulse', curriculumUrl: '/#contact', displayOrder: 5, isActive: true },
    { id: 'fallback-topic-6', categoryLabel: 'NEET · Foundation', title: 'NEET Foundation', description: 'Start early with habits, concepts, and guidance that make later preparation stronger.', featureOne: 'Early science foundations', featureTwo: 'Focused study habits', featureThree: 'Regular mentor check-ins', imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1000&q=85', imageAltText: 'Medical anatomy model and study notes', icon: 'stethoscope', curriculumUrl: '/#contact', displayOrder: 6, isActive: true },
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
  const statisticsQuery = useGetHomepageStatistics();
  const favoriteTopicsQuery = useGetHomepageFavoriteTopics();
  if (settingsQuery.isLoading || heroQuery.isLoading) return <HomeSkeleton />;
  const settings = settingsQuery.data ?? fallbackSettings;
  const slides = heroQuery.data?.length === 3 ? heroQuery.data : fallbackHeroSlides;
  const primaryColor = settings.primaryColor || '#102846';
  const accentColor = settings.accentColor || '#D6AD59';

  return (
    <div className="paper-grain overflow-hidden bg-[hsl(var(--background))]" style={{ '--site-primary': primaryColor, '--site-accent': accentColor } as React.CSSProperties}>
      <header className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/45 to-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse />
           <nav className="hidden items-center gap-8 text-sm font-semibold text-white/90 lg:flex">
             <a href="/about" className="transition hover:text-white" data-testid="link-nav-about">About</a>
            <a href="#contact" className="transition hover:text-white" data-testid="link-nav-contact">Contact</a>
          </nav>
          <a href="#contact" className="inline-flex h-11 items-center rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5" data-testid="link-header-admissions">Admissions <ArrowRight size={16} className="ml-2" /></a>
        </div>
      </header>

      <main>
        <HeroCarousel slides={slides} />
        {aboutPreviewQuery.data?.isVisible && <AboutPreview content={aboutPreviewQuery.data} />}
        <HomeLiveUpdates updates={liveUpdatesQuery.data?.length ? liveUpdatesQuery.data : fallbackLiveUpdates} />
        <HomeStatistics content={statisticsQuery.data?.isVisible ? statisticsQuery.data : fallbackStatistics} />
        <FavoriteTopics content={favoriteTopicsQuery.data?.isVisible ? favoriteTopicsQuery.data : fallbackFavoriteTopics} />

        <section id="contact" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid overflow-hidden rounded-[2rem] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-8 md:p-12 lg:p-16"><p className="text-xs font-bold uppercase tracking-[.2em]">Your next chapter starts here</p><h2 className="mt-5 max-w-lg font-display text-5xl font-semibold leading-[.96] tracking-[-.045em]">Bring us your questions. We’ll bring the time.</h2><p className="mt-6 max-w-md text-sm leading-7 text-[hsl(var(--primary)/.72)]">Our admissions team is happy to help with courses, campus visits, applications, and the questions you haven’t found the words for yet.</p><a href={`mailto:${settings.email}`} className="mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid="link-contact-email">Contact admissions <ArrowRight size={16} className="ml-2" /></a></div>
            <div className="flex flex-col justify-end bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] md:p-12 lg:p-16"><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Come say hello</p><div className="mt-8 space-y-6 text-sm"><div className="flex gap-4"><Mail size={18} className="mt-0.5 text-[hsl(var(--accent))]" /><span data-testid="text-contact-email">{settings.email}</span></div><div className="flex gap-4"><Phone size={18} className="mt-0.5 text-[hsl(var(--accent))]" /><span data-testid="text-contact-phone">{settings.phone}</span></div><div className="flex gap-4"><MapPin size={18} className="mt-0.5 text-[hsl(var(--accent))]" /><span className="leading-6" data-testid="text-contact-address">{settings.address}</span></div></div><div className="mt-10 border-t border-[hsl(var(--primary-foreground)/.16)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.55)]">Office hours · Monday–Saturday, 9:00–16:30</div></div>
          </div>
        </section>

        <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-10 lg:px-10"><div className="mx-auto flex max-w-7xl items-center gap-4"><Quote size={22} className="shrink-0 text-[hsl(var(--accent-foreground))]" /><p className="font-display text-xl italic text-[hsl(var(--primary))]">“The most useful thing we can teach is how to keep becoming.”</p></div></section>
      </main>
        <footer className="bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] lg:px-10"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_.7fr_.7fr]"><div><SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse /><p className="mt-6 max-w-xs text-sm leading-6 text-[hsl(var(--primary-foreground)/.58)]" data-testid="text-footer">{settings.footerText || fallbackSettings.footerText}</p></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Navigate</p><div className="mt-5 space-y-3 text-sm text-[hsl(var(--primary-foreground)/.7)]"><a href="/about" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-about">About</a><a href="#contact" className="block hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-contact">Admissions</a><a href="/admin/login" className="block pt-3 text-[hsl(var(--accent))] hover:text-[hsl(var(--primary-foreground))]" data-testid="link-footer-admin">Administrator sign in</a></div></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Stay in touch</p><p className="mt-5 text-sm leading-6 text-[hsl(var(--primary-foreground)/.7)]">{settings.email}<br />{settings.phone}</p></div></div><div className="mx-auto mt-12 max-w-7xl border-t border-[hsl(var(--primary-foreground)/.15)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.42)]">© {new Date().getFullYear()} {settings.collegeName}. A public college for purposeful beginnings.</div></footer>
    </div>
  );
}