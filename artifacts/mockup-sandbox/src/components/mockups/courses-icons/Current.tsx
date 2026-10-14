import './_group.css';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Phone,
  UsersRound,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

type Course = {
  slug: string;
  name: string;
  heroEyebrow: string;
  heroDescription: string;
};

type Feature = { id: string; title: string; description: string };
type Benefit = { id: string; title: string; description: string };
type Batch = {
  id: string;
  displayOrder: number;
  batchName: string;
  startDate: string;
  targetExam: string;
  admissionsStatus: string;
};
type ScheduleItem = {
  id: string;
  displayOrder: number;
  activity: string;
  startTime: string;
  endTime: string;
};

const siteSettings = {
  collegeName: 'Sahsrah Junior College',
  tagline: 'Learn with purpose. Lead with confidence.',
  logoUrl: null,
  email: 'admissions@sahsrah.edu',
  phone: '+91 40 2458 0176',
  address: 'Himayatnagar, Hyderabad, Telangana',
  footerText: 'A public junior college for curious minds and purposeful lives.',
};

// Local fixtures stand in for the public settings, All Courses page, and course API responses.
const courses: Course[] = [
  {
    slug: 'mpc',
    name: 'Mathematics, Physics & Chemistry',
    heroEyebrow: 'MPC · SCIENCE',
    heroDescription: 'Build a strong foundation in quantitative thinking, physical systems, and chemical principles.',
  },
  {
    slug: 'bipc',
    name: 'Biology, Physics & Chemistry',
    heroEyebrow: 'BiPC · LIFE SCIENCES',
    heroDescription: 'Explore living systems and the sciences that open pathways into health and research.',
  },
  {
    slug: 'cec',
    name: 'Civics, Economics & Commerce',
    heroEyebrow: 'CEC · COMMERCE',
    heroDescription: 'Understand how communities, markets, and institutions shape the world around us.',
  },
  {
    slug: 'mec',
    name: 'Mathematics, Economics & Commerce',
    heroEyebrow: 'MEC · BUSINESS',
    heroDescription: 'Connect analytical thinking with the foundations of business and economics.',
  },
];

const page = {
  heroBackgroundImageUrl: null as string | null,
  heroBackgroundOverlay: 0,
  heroEyebrow: 'FIND YOUR DIRECTION',
  heroTitle: 'A course for every kind of curiosity',
  heroDescription:
    'Explore focused intermediate pathways designed to turn your interests into strong foundations for what comes next.',
  heroFeatures: [
    { id: 'guided-learning', title: 'Guided learning', description: 'Clear direction from experienced faculty.' },
    { id: 'small-community', title: 'A supportive community', description: 'Space to ask, practice, and grow.' },
    { id: 'future-ready', title: 'Future-ready pathways', description: 'Subject choices with long-term purpose.' },
  ] satisfies Feature[],
  heroCalloutTitle: 'The right next step starts with a conversation.',
  heroCalloutDescription: 'Our admissions team can help you compare subjects and find a pathway that fits.',
  coursePlacements: courses.map((course, index) => ({
    courseSlug: course.slug,
    isVisible: true,
    displayOrder: index + 1,
  })),
  featuredCourseSlug: 'mpc',
  batches: [
    {
      id: 'batch-2026',
      displayOrder: 1,
      batchName: 'Intermediate 2026–27',
      startDate: '2026-06-08',
      targetExam: 'Board examinations',
      admissionsStatus: 'Admissions open',
    },
    {
      id: 'batch-bridge',
      displayOrder: 2,
      batchName: 'Foundation & Bridge Batch',
      startDate: '2026-05-18',
      targetExam: 'EAMCET · NEET · Board',
      admissionsStatus: 'Limited seats',
    },
  ] satisfies Batch[],
  schedule: [
    { id: 'morning', displayOrder: 1, activity: 'Morning assembly & mentoring', startTime: '08:30', endTime: '09:00' },
    { id: 'classes', displayOrder: 2, activity: 'Core subject classes', startTime: '09:00', endTime: '12:30' },
    { id: 'lunch', displayOrder: 3, activity: 'Lunch & campus break', startTime: '12:30', endTime: '13:15' },
    { id: 'practice', displayOrder: 4, activity: 'Labs, tutorials & practice', startTime: '13:15', endTime: '16:00' },
  ] satisfies ScheduleItem[],
  ctaEyebrow: 'YOUR NEXT CHAPTER',
  ctaHeading: 'Let’s find the right fit.',
  ctaDescription:
    'Choosing a pathway is a big decision. Talk with our admissions team about your goals, subjects, and the support you need to thrive.',
  ctaBenefits: [
    { id: 'personal-guidance', title: 'Personal guidance', description: 'A real conversation about your options.' },
    { id: 'clear-subjects', title: 'Clear subject choices', description: 'Understand what each pathway covers.' },
    { id: 'supportive-campus', title: 'Supportive campus', description: 'A community that helps you grow.' },
    { id: 'simple-admissions', title: 'Simple admissions', description: 'Know what to expect at every step.' },
  ] satisfies Benefit[],
  ctaButtonLabel: 'Talk to Admissions',
};

const featureIcons = [BookOpen, UsersRound, ChartNoAxesColumnIncreasing];
const benefitIcons = [UsersRound, GraduationCap, BookOpen, Phone];
const exploreLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Courses', '/courses'],
  ['Faculty', '/faculty'],
  ['Results', '/results'],
  ['Gallery', '/gallery'],
  ['Knowledge Hub', '/knowledge-hub'],
  ['Contact', '/contact'],
];

function displayDate(value: string) {
  if (!value) return 'Date to be announced';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(date);
}

function displayTime(value: string) {
  if (!value) return '';
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    .format(new Date(2000, 0, 1, hour, minute));
}

function hexToHslChannels(hex: string) {
  const channels = hex.replace('#', '').match(/.{2}/g)?.map((part) => Number.parseInt(part, 16) / 255) ?? [0, 0, 0];
  const [red, green, blue] = channels;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  const lightness = (max + min) / 2;
  let saturation = 0;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  if (hue < 0) hue += 360;
  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

const themeStyle = {
  '--background': hexToHslChannels('#F5F7FB'),
  '--foreground': '216 48% 13%',
  '--border': '214 26% 84%',
  '--card': '0 0% 100%',
  '--card-foreground': '216 48% 13%',
  '--secondary': '220 32% 94%',
  '--secondary-foreground': '216 48% 13%',
  '--muted': '220 32% 94%',
  '--muted-foreground': '216 48% 30%',
  '--primary': hexToHslChannels('#022A6C'),
  '--primary-foreground': '0 0% 100%',
  '--accent': hexToHslChannels('#CE0B11'),
  '--accent-foreground': '0 0% 100%',
  '--ring': hexToHslChannels('#CE0B11'),
  '--input': '214 26% 84%',
} as CSSProperties;

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/45 to-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-2 py-3 sm:px-6 sm:py-5 lg:px-10">
        <a href="/" className="group inline-flex min-w-0 items-center gap-2" aria-label="Sahsrah Junior College home">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[hsl(var(--accent))] font-display text-lg font-bold text-white sm:h-11 sm:w-11">S</span>
          <span className="min-w-0 leading-tight">
            <span className="block break-words font-display text-xs font-semibold tracking-[-.02em] text-white sm:text-base lg:text-lg">{siteSettings.collegeName}</span>
            <span className="mt-1 block max-w-full break-words text-[10px] font-semibold uppercase leading-[1.35] tracking-[.08em] text-white/80 sm:text-xs">{siteSettings.tagline}</span>
          </span>
        </a>
        <nav className="hidden items-center gap-3 text-sm font-semibold text-white/90 lg:flex xl:gap-5" aria-label="Public navigation">
          <a href="/" className="transition hover:text-white">Home</a>
          <a href="/about" className="transition hover:text-white">About</a>
          <a href="/courses" className="text-white underline decoration-[hsl(var(--accent))] underline-offset-8">Courses</a>
          <a href="/faculty" className="transition hover:text-white">Faculty</a>
          <a href="/results" className="transition hover:text-white">Results</a>
          <a href="/gallery" className="transition hover:text-white">Gallery</a>
          <a href="/knowledge-hub" className="whitespace-nowrap transition hover:text-white">Knowledge Hub</a>
          <a href="/contact" className="transition hover:text-white">Contact</a>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <a href="/contact" className="inline-flex h-10 items-center whitespace-nowrap rounded-full bg-[hsl(var(--accent))] px-2 text-xs font-bold text-[hsl(var(--accent-foreground))] shadow-sm transition hover:-translate-y-0.5 sm:h-11 sm:px-5 sm:text-sm">Admissions <ArrowRight size={16} className="ml-2 hidden sm:inline" aria-hidden="true" /></a>
          <button type="button" aria-label="Open navigation menu" className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white lg:hidden"><Menu size={20} /></button>
        </div>
      </div>
    </header>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="inline-flex flex-col gap-2 font-display text-xl font-semibold text-[hsl(var(--primary-foreground))]">
      {children}
      <span className="h-0.5 w-9 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
    </h2>
  );
}

function Footer() {
  return (
    <footer id="public-footer" className="relative isolate overflow-hidden bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] sm:px-8 lg:px-10 lg:py-14" data-testid="public-footer">
      <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full border border-[hsl(var(--primary-foreground)/.08)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-[hsl(var(--accent)/.14)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-x-10 gap-y-11 border-b border-[hsl(var(--primary-foreground)/.14)] pb-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_.72fr_1fr_1fr] lg:gap-x-12">
          <div className="min-w-0">
            <a href="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent))] font-display text-lg font-bold text-white">S</span>
              <span className="leading-tight"><span className="block font-display text-lg font-semibold">{siteSettings.collegeName}</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.16em] text-[hsl(var(--accent))]">{siteSettings.tagline}</span></span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--primary-foreground)/.72)]" data-testid="text-footer">{siteSettings.footerText}</p>
          </div>
          <nav aria-label="Explore">
            <FooterHeading>Explore</FooterHeading>
            <ul className="mt-5 space-y-2.5">
              {exploreLinks.map(([label, href]) => <li key={label}><a href={href} className="group inline-flex min-h-7 items-center gap-1 text-sm text-[hsl(var(--primary-foreground)/.76)] transition hover:text-[hsl(var(--accent))]"><span>{label}</span><ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100" aria-hidden="true" /></a></li>)}
            </ul>
          </nav>
          <div>
            <FooterHeading>Our Programs</FooterHeading>
            <ul className="mt-5 space-y-2.5">
              {courses.map((course) => <li key={course.slug}><a href={`/courses/${course.slug}`} className="group inline-flex min-h-7 items-start gap-1 text-sm leading-6 text-[hsl(var(--primary-foreground)/.76)] transition hover:text-[hsl(var(--accent))]"><span>{course.name}</span><ArrowUpRight size={13} className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" /></a></li>)}
            </ul>
          </div>
          <div>
            <FooterHeading>Reach Us</FooterHeading>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-[hsl(var(--primary-foreground)/.78)]">
              <li className="flex items-start gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--accent))]"><MapPin size={15} aria-hidden="true" /></span><span className="pt-1">{siteSettings.address}</span></li>
              <li className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--accent))]"><Phone size={15} aria-hidden="true" /></span><a href="tel:+914024580176" className="break-all">{siteSettings.phone}</a></li>
              <li className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--accent))]"><Mail size={15} aria-hidden="true" /></span><a href={`mailto:${siteSettings.email}`} className="break-all">{siteSettings.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-5 text-xs leading-5 text-[hsl(var(--primary-foreground)/.62)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {siteSettings.collegeName}. All rights reserved.</span>
          <span>{siteSettings.tagline}</span>
          <a href="/admin" className="inline-flex min-h-9 w-fit items-center justify-center rounded-full border border-[hsl(var(--primary-foreground)/.28)] px-3.5 py-1.5 font-semibold text-[hsl(var(--primary-foreground)/.84)] transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]">Administration Sign In</a>
        </div>
      </div>
    </footer>
  );
}

export function Current() {
  const coursesBySlug = new Map(courses.map((course) => [course.slug, course]));
  const placements = [...page.coursePlacements].filter((item) => item.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const selectedCourses = placements.flatMap((item) => {
    const course = coursesBySlug.get(item.courseSlug);
    return course ? [course] : [];
  });
  const featuredCourse = selectedCourses.find((course) => course.slug === page.featuredCourseSlug) ?? selectedCourses[0];
  const standardCourses = selectedCourses.filter((course) => course.slug !== featuredCourse?.slug);

  return (
    <div className="courses-icons-current paper-grain min-h-screen overflow-hidden bg-[hsl(var(--background))]" style={themeStyle}>
      <Header />
      <main>
        <section className="relative isolate overflow-hidden bg-[hsl(var(--background))] px-6 pb-12 pt-32 text-[hsl(var(--primary))] sm:pt-36 lg:px-10 lg:pb-16 lg:pt-40" aria-labelledby="all-courses-hero-heading" data-testid="section-all-courses-hero">
          {page.heroBackgroundImageUrl && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(page.heroBackgroundImageUrl)})` }} aria-hidden="true" />}
          <div className="absolute inset-0 bg-[hsl(var(--background))]" style={{ opacity: page.heroBackgroundOverlay / 100 }} aria-hidden="true" />
          <div className="absolute -left-48 top-28 h-96 w-96 rounded-full border border-[hsl(var(--accent)/.18)]" aria-hidden="true" />
          <div className="absolute -right-24 -top-24 h-[34rem] w-[34rem] rounded-full border border-[hsl(var(--accent)/.16)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,.8fr)]">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{page.heroEyebrow}</span>
              <h1 id="all-courses-hero-heading" className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-6xl md:text-7xl">
                {page.heroTitle.trim().split(/\s+/).map((word, index, words) => <span key={`${word}-${index}`} className={index === words.length - 1 ? 'text-[hsl(var(--accent))]' : ''}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base sm:leading-8">{page.heroDescription}</p>
              <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                {page.heroFeatures.map((feature, index) => {
                  const Icon = featureIcons[index % featureIcons.length];
                  return <div key={feature.id} className="flex items-start gap-3 rounded-2xl bg-[hsl(var(--background)/.76)] p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><Icon size={17} aria-hidden="true" /></span><span><span className="block text-xs font-bold text-[hsl(var(--primary))]">{feature.title}</span><span className="mt-1 block text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{feature.description}</span></span></div>;
                })}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#all-courses-grid" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))]" data-testid="link-all-courses-explore">Explore All Courses <ArrowRight size={16} aria-hidden="true" /></a>
                <a href="#all-courses-grid" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/.8)] px-5 text-sm font-bold text-[hsl(var(--primary))] transition hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]" data-testid="link-all-courses-compare"><ChartNoAxesColumnIncreasing size={16} aria-hidden="true" /> Compare Pathways</a>
              </div>
            </div>
            <aside className="relative hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] p-6 shadow-xl backdrop-blur sm:block lg:ml-auto lg:max-w-sm" aria-label="Course guidance">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><BookOpen size={20} aria-hidden="true" /></span>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{page.heroCalloutTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{page.heroCalloutDescription}</p>
              <span aria-hidden="true" className="absolute -left-px bottom-6 top-6 w-1 rounded-r-full bg-[hsl(var(--accent))]" />
            </aside>
          </div>
        </section>

        <section id="all-courses-grid" className="scroll-mt-24 px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="all-courses-heading" data-testid="section-all-courses-grid">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex flex-col gap-3 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div><span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Regular Pathways</span><h2 id="all-courses-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl">Choose with context.</h2></div>
              <p className="max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{selectedCourses.length} pathways with clear subject direction and a supportive college experience.</p>
            </header>
            {featuredCourse ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]" data-testid="list-course-pathways">
                <a href={`/courses/${featuredCourse.slug}`} className="group relative flex min-h-[31rem] flex-col overflow-hidden rounded-3xl border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--card))] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-8 lg:row-span-2" data-testid={`card-course-featured-${featuredCourse.slug}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,hsl(var(--accent)/.12),transparent_45%),linear-gradient(to_top,hsl(var(--card)),hsl(var(--card)/.88))]" aria-hidden="true" />
                  <div className="relative flex h-full flex-col">
                    <span className="inline-flex w-fit rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{featuredCourse.heroEyebrow}</span>
                    <span className="mt-5 grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><BookOpen size={20} aria-hidden="true" /></span>
                    <h3 className="mt-4 max-w-md font-display text-4xl font-semibold leading-[.98] tracking-[-.045em] text-[hsl(var(--primary))] sm:text-5xl">{featuredCourse.name}</h3>
                    <p className="mt-4 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{featuredCourse.heroDescription}</p>
                    <span className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-bold text-[hsl(var(--primary))]">Explore pathway <ArrowRight size={16} aria-hidden="true" /></span>
                  </div>
                </a>
                <div className="grid gap-4 sm:grid-cols-2">
                  {standardCourses.map((course, index) => (
                    <a href={`/courses/${course.slug}`} key={course.slug} className="group relative flex min-h-[15rem] flex-col overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[hsl(var(--accent)/.45)] hover:shadow-lg sm:p-6" data-testid={`card-course-${course.slug}`}>
                      <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] transition group-hover:bg-[hsl(var(--accent))] group-hover:text-[hsl(var(--accent-foreground))]"><ArrowRight size={16} aria-hidden="true" /></span>
                      <span className="inline-flex w-fit max-w-[calc(100%-3rem)] rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">{course.heroEyebrow}</span>
                      <span className="mt-4 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]">{index % 2 === 0 ? <GraduationCap size={19} aria-hidden="true" /> : <BookOpen size={19} aria-hidden="true" />}</span>
                      <h3 className="mt-3 max-w-[calc(100%-1.5rem)] font-display text-2xl font-semibold leading-tight text-[hsl(var(--primary))]">{course.name}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{course.heroDescription}</p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-bold text-[hsl(var(--primary))]">Explore pathway <ArrowRight size={14} aria-hidden="true" /></span>
                    </a>
                  ))}
                </div>
              </div>
            ) : <p className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Course pathways are being prepared.</p>}
          </div>
        </section>

        <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.55)] px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="batch-schedule-heading" data-testid="section-batch-schedule">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8 text-center"><span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Batch Details &amp; Schedule</span><h2 id="batch-schedule-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl">Plan your next step.</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Important dates and a typical day at Sahsrah Junior College.</p></header>
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm sm:p-7" aria-labelledby="upcoming-batches-heading">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><CalendarDays size={20} aria-hidden="true" /></span><div><h3 id="upcoming-batches-heading" className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Upcoming Batches</h3><p className="text-xs text-[hsl(var(--muted-foreground))]">Start your journey with the right batch.</p></div></div>
                <div className="mt-5 space-y-3">
                  {page.batches.length ? page.batches.slice().sort((a, b) => a.displayOrder - b.displayOrder).map((batch) => (
                    <div key={batch.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2"><p className="font-bold text-[hsl(var(--primary))]">{batch.batchName}</p>{batch.admissionsStatus && <span className="rounded-full bg-[hsl(var(--accent)/.1)] px-3 py-1 text-[10px] font-bold text-[hsl(var(--primary))]">{batch.admissionsStatus}</span>}</div>
                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><p className="flex items-start gap-2 text-[hsl(var(--muted-foreground))]"><CalendarDays size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Start date<br /><strong className="text-[hsl(var(--primary))]">{displayDate(batch.startDate)}</strong></span></p><p className="flex items-start gap-2 text-[hsl(var(--muted-foreground))]"><GraduationCap size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Target exam<br /><strong className="text-[hsl(var(--primary))]">{batch.targetExam}</strong></span></p></div>
                    </div>
                  )) : <p className="rounded-2xl bg-[hsl(var(--background))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Batch dates will be shared by admissions.</p>}
                </div>
              </article>
              <article className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm sm:p-7" aria-labelledby="daily-schedule-heading">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><Clock3 size={20} aria-hidden="true" /></span><div><h3 id="daily-schedule-heading" className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">Daily Schedule</h3><p className="text-xs text-[hsl(var(--muted-foreground))]">A balanced day for learning, practice, and growth.</p></div></div>
                <ol className="mt-5 space-y-2">
                  {page.schedule.length ? page.schedule.slice().sort((a, b) => a.displayOrder - b.displayOrder).map((item) => {
                    const time = [displayTime(item.startTime), displayTime(item.endTime)].filter(Boolean).join(' – ');
                    return <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--background))] p-3"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" /><span className="min-w-0 flex-1 text-sm font-semibold text-[hsl(var(--primary))]">{item.activity}</span>{time && <time className="shrink-0 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-[10px] font-bold text-[hsl(var(--primary))]">{time}</time>}</li>;
                  }) : <li className="rounded-2xl bg-[hsl(var(--background))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">The daily schedule will be shared by admissions.</li>}
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 lg:px-10 lg:py-16" aria-labelledby="all-courses-cta-heading" data-testid="section-all-courses-cta">
          <div className="mx-auto grid max-w-7xl gap-7 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm sm:p-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-[hsl(var(--accent)/.28)] bg-[hsl(var(--accent)/.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{page.ctaEyebrow}</span>
              <h2 id="all-courses-cta-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] text-[hsl(var(--primary))] sm:text-5xl">{page.ctaHeading}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{page.ctaDescription}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {page.ctaBenefits.map((benefit, index) => {
                  const Icon = benefitIcons[index % benefitIcons.length];
                  return <li key={benefit.id} className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))]"><Icon size={16} aria-hidden="true" /></span><span><strong className="block text-[10px] font-bold text-[hsl(var(--primary))]">{benefit.title}</strong><span className="text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{benefit.description}</span></span></li>;
                })}
              </ul>
            </div>
            <div className="border-t border-[hsl(var(--border))] pt-5 text-center lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <a href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-foreground))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))]" data-testid="link-all-courses-admissions">{page.ctaButtonLabel} <ArrowRight size={16} aria-hidden="true" /></a>
              <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">Get guidance from our admissions team.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
