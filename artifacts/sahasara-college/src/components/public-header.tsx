import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetCourses, getGetCoursesQueryKey } from '@workspace/api-client-react';
import { SiteMark } from '@/components/site-mark';

type PublicHeaderProps = {
  settings: {
    collegeName: string;
    tagline: string;
    logoUrl: string | null;
  };
  activePage?: 'home' | 'about' | 'faculty' | 'results' | 'gallery' | 'contact' | 'courses';
  mobileFlow?: boolean;
};

const courseLinkMeta = [
  { slug: 'mpc', label: 'MPC', description: 'Mathematics, Physics & Chemistry' },
  { slug: 'bipc', label: 'BiPC', description: 'Biology, Physics & Chemistry' },
  { slug: 'mpc-iit-jee', label: 'MPC + IIT-JEE', description: 'MPC with focused entrance support' },
  { slug: 'bipc-neet', label: 'BiPC + NEET', description: 'BiPC with focused entrance support' },
  { slug: 'mpc-eamcet', label: 'MPC + EAMCET', description: 'MPC with focused entrance support' },
] as const;

export function PublicHeader({ settings, activePage = 'home', mobileFlow = false }: PublicHeaderProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const coursesPointerInsideRef = useRef(false);
  const coursesQuery = useGetCourses({ query: { queryKey: getGetCoursesQueryKey() } });
  const homeActive = activePage === 'home' || location === '/';
  const aboutActive = activePage === 'about' || location === '/about';
  const facultyActive = activePage === 'faculty' || location === '/faculty';
  const resultsActive = activePage === 'results' || location === '/results';
  const galleryActive = activePage === 'gallery' || location === '/gallery';
  const contactActive = activePage === 'contact' || location === '/contact';
  const coursesActive = activePage === 'courses' || location.startsWith('/courses');
  const closeMenus = () => {
    setMenuOpen(false);
    setCoursesOpen(false);
    setMobileCoursesOpen(false);
    coursesPointerInsideRef.current = false;
  };
  const linkClass = (active: boolean) => `transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent ${active ? 'text-[hsl(var(--accent))]' : ''}`;
  const courses = [...(coursesQuery.data ?? [])].sort((left, right) => left.displayOrder - right.displayOrder);
  const menuCourses = courses.length ? courses.map((course) => ({ slug: course.slug, label: course.name, description: course.heroDescription })) : courseLinkMeta;

  useLayoutEffect(() => {
    const headerRow = headerRowRef.current;
    if (!headerRow) return;
    const updateHeaderHeight = () => document.documentElement.style.setProperty('--public-header-height', `${Math.ceil(headerRow.getBoundingClientRect().height)}px`);
    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(headerRow);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--public-header-height');
    };
  }, []);

  useEffect(() => {
    closeMenus();
  }, [location]);

  useEffect(() => {
    if (!coursesOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCoursesOpen(false);
        coursesPointerInsideRef.current = false;
        document.getElementById('public-courses-trigger')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [coursesOpen]);

  return (
    <header className={`${mobileFlow ? 'relative bg-[hsl(var(--primary))] lg:absolute lg:bg-gradient-to-b lg:from-black/45 lg:to-transparent' : 'absolute bg-gradient-to-b from-black/45 to-transparent'} inset-x-0 top-0 z-20`}>
      <div ref={headerRowRef} className="mx-auto flex max-w-7xl items-center justify-between gap-1 px-2 py-3 sm:gap-2 sm:px-6 sm:py-5 lg:gap-0 lg:px-10">
        <div className="min-w-0 flex-1 lg:flex-none">
          <SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse responsive />
        </div>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/90 lg:flex" aria-label="Public navigation">
          <Link href="/" className={linkClass(homeActive)} aria-current={homeActive ? 'page' : undefined} data-testid="link-nav-home" onClick={closeMenus}>Home</Link>
          <Link href="/about" className={linkClass(aboutActive)} aria-current={aboutActive ? 'page' : undefined} data-testid="link-nav-about" onClick={closeMenus}>About</Link>
          <Link href="/faculty" className={linkClass(facultyActive)} aria-current={facultyActive ? 'page' : undefined} data-testid="link-nav-faculty" onClick={closeMenus}>Faculty</Link>
          <Link href="/results" className={linkClass(resultsActive)} aria-current={resultsActive ? 'page' : undefined} data-testid="link-nav-results" onClick={closeMenus}>Results</Link>
          <Link href="/gallery" className={linkClass(galleryActive)} aria-current={galleryActive ? 'page' : undefined} data-testid="link-nav-gallery" onClick={closeMenus}>Gallery</Link>
          <div
            className="relative"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') {
                coursesPointerInsideRef.current = true;
                setCoursesOpen(true);
              }
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') {
                coursesPointerInsideRef.current = false;
                setCoursesOpen(false);
              }
            }}
            onBlur={(event) => {
              if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
                setCoursesOpen(false);
                coursesPointerInsideRef.current = false;
              }
            }}
          >
            <button
              id="public-courses-trigger"
              type="button"
              className={`inline-flex items-center gap-1 ${linkClass(coursesActive)}`}
              aria-expanded={coursesOpen}
              aria-controls="public-courses-mega-menu"
              onClick={(event) => {
                if (event.detail === 0 || !coursesPointerInsideRef.current) {
                  setCoursesOpen((current) => !current);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setCoursesOpen(true);
                  requestAnimationFrame(() => megaMenuRef.current?.querySelector<HTMLElement>('a')?.focus());
                }
              }}
              data-testid="button-nav-courses"
            >
              Courses <ChevronDown size={15} className={`transition-transform ${coursesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {coursesOpen && <div ref={megaMenuRef} id="public-courses-mega-menu" className="absolute right-1/2 top-full z-30 mt-0 w-[min(45rem,calc(100vw-3rem))] translate-x-1/2 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-[hsl(var(--foreground))] shadow-2xl" role="region" aria-label="Course pathways">
              <div className="grid gap-1 md:grid-cols-2">
                <Link href="/courses" onClick={closeMenus} className="group rounded-2xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid="link-mega-courses-overview">
                  <span className="text-xs font-bold uppercase tracking-[.17em] text-[hsl(var(--accent))]">Course guide</span>
                  <span className="mt-3 block font-display text-2xl font-semibold">Compare all regular pathways.</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--accent))]">View overview <ArrowRight size={15} aria-hidden="true" /></span>
                </Link>
                <div className="grid gap-1">
                  {menuCourses.map((item) => <Link href={`/courses/${item.slug}`} key={item.slug} onClick={closeMenus} className="group rounded-xl px-4 py-3 transition hover:bg-[hsl(var(--secondary))]" data-testid={`link-mega-course-${item.slug}`}><span className="flex items-center justify-between gap-3 font-bold text-[hsl(var(--primary))]">{item.label}<ArrowRight size={15} className="text-[hsl(var(--accent-foreground))] transition-transform group-hover:translate-x-1" aria-hidden="true" /></span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">{item.description}</span></Link>)}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] px-4 pt-3 text-xs font-bold">
                <Link href="/courses/integrated" onClick={closeMenus} className="text-[hsl(var(--accent-foreground))] hover:text-[hsl(var(--primary))]" data-testid="link-mega-integrated">Integrated Courses <span className="ml-1 font-normal text-[hsl(var(--muted-foreground))]">separate options</span></Link>
                <div className="flex gap-4"><Link href="/courses" onClick={closeMenus} className="text-[hsl(var(--primary))]" data-testid="link-mega-utility-courses">All courses</Link><Link href="/contact" onClick={closeMenus} className="text-[hsl(var(--primary))]" data-testid="link-mega-utility-contact">Contact admissions</Link></div>
              </div>
            </div>}
          </div>
          <Link href="/contact" className={linkClass(contactActive)} aria-current={contactActive ? 'page' : undefined} data-testid="link-nav-contact" onClick={closeMenus}>Contact</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/contact" onClick={closeMenus} className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-[hsl(var(--accent))] px-2 text-xs font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent sm:h-11 sm:px-5 sm:text-sm" data-testid="link-header-admissions">Admissions <ArrowRight size={16} className="ml-2 hidden sm:inline" aria-hidden="true" /></Link>
          <button type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="public-mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 text-white transition hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] sm:h-11 sm:w-11 lg:hidden" data-testid="button-public-menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && <nav id="public-mobile-navigation" className="mx-3 mb-4 rounded-2xl border border-white/15 bg-[hsl(var(--primary)/.96)] p-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md sm:mx-4 lg:hidden" aria-label="Mobile navigation">
        <Link href="/" onClick={closeMenus} className={`block rounded-xl px-4 py-3 transition hover:bg-white/10 ${homeActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={homeActive ? 'page' : undefined} data-testid="link-mobile-nav-home">Home</Link>
        <Link href="/about" onClick={closeMenus} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 ${aboutActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={aboutActive ? 'page' : undefined} data-testid="link-mobile-nav-about">About</Link>
        <Link href="/faculty" onClick={closeMenus} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 ${facultyActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={facultyActive ? 'page' : undefined} data-testid="link-mobile-nav-faculty">Faculty</Link>
        <Link href="/results" onClick={closeMenus} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 ${resultsActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={resultsActive ? 'page' : undefined} data-testid="link-mobile-nav-results">Results</Link>
        <Link href="/gallery" onClick={closeMenus} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 ${galleryActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={galleryActive ? 'page' : undefined} data-testid="link-mobile-nav-gallery">Gallery</Link>
        <div className="mt-1 rounded-xl border border-white/10">
          <button type="button" className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left ${coursesActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-expanded={mobileCoursesOpen} aria-controls="public-mobile-course-links" onClick={() => setMobileCoursesOpen((current) => !current)} data-testid="button-mobile-nav-courses">Courses <ChevronDown size={16} className={`transition-transform ${mobileCoursesOpen ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
          {mobileCoursesOpen && <div id="public-mobile-course-links" className="border-t border-white/10 px-2 pb-2 pt-1">
            <Link href="/courses" onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-[hsl(var(--accent))]" data-testid="link-mobile-courses-overview">Course overview</Link>
            {menuCourses.map((item) => <Link href={`/courses/${item.slug}`} key={item.slug} onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white" data-testid={`link-mobile-course-${item.slug}`}>{item.label}</Link>)}
            <Link href="/courses/integrated" onClick={closeMenus} className="mt-1 block rounded-lg border-t border-white/10 px-3 pb-1 pt-3 text-[hsl(var(--accent))]" data-testid="link-mobile-integrated">Integrated Courses</Link>
            <Link href="/contact" onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white" data-testid="link-mobile-course-contact">Contact admissions</Link>
          </div>}
        </div>
        <Link href="/contact" onClick={closeMenus} className={`mt-1 block rounded-xl px-4 py-3 transition hover:bg-white/10 ${contactActive ? 'text-[hsl(var(--accent))]' : ''}`} aria-current={contactActive ? 'page' : undefined} data-testid="link-mobile-nav-contact">Contact</Link>
      </nav>}
    </header>
  );
}