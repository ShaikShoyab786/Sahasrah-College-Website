import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, ChevronDown, FileText, Gauge, GraduationCap, Home, Images, LayoutDashboard, LogOut, Menu, MessageCircle, PanelsTopLeft, Settings2, Trophy, X, Waypoints } from 'lucide-react';
import { useLogoutAdmin, getGetAdminSessionQueryKey, useGetSiteSettings } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { SiteMark } from '@/components/site-mark';
import { createAdminThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

type ShellProps = { children: React.ReactNode; displayName?: string; email?: string };

function PageSectionLink({
  href,
  id,
  label,
  active,
  onSelect,
}: {
  href: string;
  id: string;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${active ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}
      data-testid={`link-admin-section-${id}`}
    >
      <PanelsTopLeft size={16} />
      <span>{label}</span>
    </Link>
  );
}

export function AdminShell({ children, displayName = 'Administrator', email = '' }: ShellProps) {
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const signOutButtonRef = useRef<HTMLButtonElement>(null);
  const cancelSignOutRef = useRef<HTMLButtonElement>(null);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogoutAdmin();
  const settings = useGetSiteSettings();
  const themeStyle = createAdminThemeStyle(
    settings.data?.primaryColor || DEFAULT_PRIMARY_COLOR,
    settings.data?.accentColor || DEFAULT_ACCENT_COLOR,
    settings.data?.surfaceColor || DEFAULT_SURFACE_COLOR,
  );
  const nav = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/site-settings', label: 'Site identity', icon: Settings2 },
  ];
  const megaMenusActive = location.startsWith('/admin/mega-menus');
  const heroActive = location.startsWith('/admin/pages/home/hero') || location.startsWith('/admin/homepage-hero');
  const aboutActive = location.startsWith('/admin/pages/home/about-preview');
  const liveUpdatesActive = location.startsWith('/admin/pages/home/live-updates');
  const statisticsActive = location.startsWith('/admin/pages/home/statistics');
  const favoriteTopicsActive = location.startsWith('/admin/pages/home/favorite-topics');
  const resultsActive = location.startsWith('/admin/pages/home/results');
  const ribbonActive = location.startsWith('/admin/pages/home/achievement-ribbon');
  const testimonialsActive = location.startsWith('/admin/pages/home/testimonials');
  const facultyActive = location.startsWith('/admin/pages/home/faculty');
  const galleryActive = location.startsWith('/admin/pages/home/gallery');
  const knowledgeHubActive = location.startsWith('/admin/pages/home/knowledge-hub');
  const admissionsFaqActive = location.startsWith('/admin/pages/home/admissions-faq');
  const finalCtaActive = location.startsWith('/admin/pages/home/final-cta');
  const aboutHeroActive = location.startsWith('/admin/pages/about/hero');
  const aboutStoryActive = location.startsWith('/admin/pages/about/our-story');
  const chairmanActive = location.startsWith('/admin/pages/about/chairman-message');
  const principlesActive = location.startsWith('/admin/pages/about/guiding-principles');
  const parentChoiceActive = location.startsWith('/admin/pages/about/why-parents-choose');
  const leadershipActive = location.startsWith('/admin/pages/about/leadership');
  const campusHighlightsActive = location.startsWith('/admin/pages/about/campus-highlights');
  const achievementsActive = location.startsWith('/admin/pages/about/achievement-statistics');
  const faqActive = location.startsWith('/admin/pages/about/faqs');
  const admissionCtaActive = location.startsWith('/admin/pages/about/admission-cta');
  const contactActive = location.startsWith('/admin/pages/contact');
  const galleryPageActive = location.startsWith('/admin/pages/gallery');
  const facultyPageActive = location.startsWith('/admin/pages/faculty');
  const coursesPageActive = location.startsWith('/admin/pages/courses');
  const allCoursesPageActive = location.startsWith('/admin/pages/all-courses');
  const knowledgeHubMainPageActive = location.startsWith('/admin/pages/knowledge-hub/main') || location.startsWith('/admin/knowledge-hub-mega-menu');
  const knowledgeHubArticlesActive = location.startsWith('/admin/pages/knowledge-hub/articles');
  const knowledgeHubVideosActive = location.startsWith('/admin/pages/knowledge-hub/videos');
  const nestedKnowledgeHubRoute = knowledgeHubMainPageActive || knowledgeHubArticlesActive || knowledgeHubVideosActive;
  const resultsPageActive = location.startsWith('/admin/pages/results') || location.startsWith('/admin/results');
  const nestedHomeRoute = heroActive || aboutActive || liveUpdatesActive || statisticsActive || favoriteTopicsActive || resultsActive || ribbonActive || testimonialsActive || facultyActive || galleryActive || knowledgeHubActive || admissionsFaqActive || finalCtaActive;
  const nestedAboutRoute = aboutHeroActive || aboutStoryActive || chairmanActive || principlesActive || parentChoiceActive || leadershipActive || campusHighlightsActive || achievementsActive || faqActive || admissionCtaActive;
  const nestedResultsRoute = resultsPageActive;
  const nestedFacultyRoute = facultyPageActive;
  const nestedCoursesRoute = coursesPageActive || allCoursesPageActive;
  const [pagesOpen, setPagesOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [knowledgeHubOpen, setKnowledgeHubOpen] = useState(false);
  const [megaMenusOpen, setMegaMenusOpen] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState(() => typeof window === 'undefined' ? '' : window.location.hash.slice(1));

  useEffect(() => {
    if (megaMenusActive) {
      setMegaMenusOpen(true);
      setPagesOpen(false);
      return;
    }
    setMegaMenusOpen(false);
    if (nestedHomeRoute) {
      setPagesOpen(true);
      setHomeOpen(true);
    } else if (nestedAboutRoute) {
      setPagesOpen(true);
      setAboutOpen(true);
    } else if (nestedResultsRoute) {
      setPagesOpen(true);
      setResultsOpen(true);
    } else if (nestedFacultyRoute) {
      setPagesOpen(true);
      setFacultyOpen(true);
    } else if (nestedCoursesRoute) {
      setPagesOpen(true);
      setCoursesOpen(true);
    } else if (nestedKnowledgeHubRoute) {
      setPagesOpen(true);
      setKnowledgeHubOpen(true);
    } else if (contactActive || galleryPageActive) {
      setPagesOpen(true);
    } else {
      setPagesOpen(false);
      setHomeOpen(false);
      setAboutOpen(false);
      setResultsOpen(false);
      setFacultyOpen(false);
      setCoursesOpen(false);
      setKnowledgeHubOpen(false);
    }
  }, [location, contactActive, galleryPageActive, megaMenusActive, nestedAboutRoute, nestedHomeRoute, nestedCoursesRoute, nestedFacultyRoute, nestedKnowledgeHubRoute, nestedResultsRoute]);

  useEffect(() => {
    const syncHash = () => setActiveAdminSection(window.location.hash.slice(1));
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);

    const sectionId = activeAdminSection || window.location.hash.slice(1);
    if (!sectionId) {
      return () => {
        window.removeEventListener('hashchange', syncHash);
        window.removeEventListener('popstate', syncHash);
      };
    }

    let observer: MutationObserver | undefined;
    let timeout: number | undefined;
    let frame: number | undefined;
    const scrollWhenReady = () => {
      const section = document.getElementById(sectionId);
      if (!section) return false;
      frame = window.requestAnimationFrame(() => section.scrollIntoView({ block: 'start', behavior: 'smooth' }));
      observer?.disconnect();
      if (timeout !== undefined) window.clearTimeout(timeout);
      return true;
    };

    if (!scrollWhenReady()) {
      observer = new MutationObserver(scrollWhenReady);
      observer.observe(document.querySelector('.admin-main-content') ?? document.body, { childList: true, subtree: true });
      timeout = window.setTimeout(() => observer?.disconnect(), 5000);
    }

    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
      observer?.disconnect();
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [location, activeAdminSection]);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)');
    const previousBodyOverflow = document.body.style.overflow;
    const updateBodyScroll = () => {
      document.body.style.overflow = open && mobile.matches ? 'hidden' : previousBodyOverflow;
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) setOpen(false);
    };

    updateBodyScroll();
    mobile.addEventListener('change', updateBodyScroll);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      mobile.removeEventListener('change', updateBodyScroll);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!signOutOpen) return;
    cancelSignOutRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSignOutOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [signOutOpen]);

  useEffect(() => {
    if (!signOutOpen) signOutButtonRef.current?.focus();
  }, [signOutOpen]);

  const signOut = () => logout.mutate(undefined, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() }); setSignOutOpen(false); setLocation('/admin/login'); } });

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--admin-background))] text-[hsl(var(--admin-text))]" style={themeStyle}>
      <aside id="admin-sidebar" aria-label="Admin navigation" className={`admin-sidebar fixed inset-y-0 left-0 z-30 flex w-[276px] flex-col overflow-y-auto overscroll-contain bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <SiteMark inverse compact name={settings.data?.collegeName || 'Sahsrah Junior College'} logoUrl={settings.data?.logoUrl} fallbackLogoUrl="/sahsrah-logo-fallback.svg" logoAlt="Sahsrah Junior College" />
          <button className="rounded-lg p-2 text-[hsl(var(--sidebar-foreground)/.7)] md:hidden" onClick={() => setOpen(false)} data-testid="button-close-sidebar"><X size={19} /></button>
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--sidebar-foreground)/.45)]">Workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Admin navigation">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? location === href : location.startsWith(href);
            return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid={`link-admin-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>;
          })}
          <div className="mt-5">
            <button type="button" onClick={() => setMegaMenusOpen((current) => !current)} aria-expanded={megaMenusOpen} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-[.16em] transition ${megaMenusOpen || megaMenusActive ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.45)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="button-admin-mega-menus-toggle">
              <span className="flex items-center gap-2"><PanelsTopLeft size={14} /> Mega Menus</span>
              <ChevronDown size={15} className={`transition-transform ${megaMenusOpen ? 'rotate-180' : ''}`} />
            </button>
            {megaMenusOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <PageSectionLink href="/admin/mega-menus" id="courses-mega-menu" label="Courses Mega Menu" active={location.startsWith('/admin/mega-menus')} onSelect={() => setOpen(false)} />
              </div>
            )}
          </div>
          <div className="mt-5">
            <button type="button" onClick={() => setPagesOpen((current) => !current)} aria-expanded={pagesOpen} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-[.16em] transition ${pagesOpen || nestedHomeRoute || nestedKnowledgeHubRoute ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.45)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="button-admin-pages-toggle">
              <span className="flex items-center gap-2"><FileText size={14} /> Pages</span>
              <ChevronDown size={15} className={`transition-transform ${pagesOpen ? 'rotate-180' : ''}`} />
            </button>
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <button type="button" onClick={() => setHomeOpen((current) => !current)} aria-expanded={homeOpen} className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold transition ${homeOpen || nestedHomeRoute ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))]'}`} data-testid="button-admin-home-toggle">
                  <span className="flex items-center gap-2"><Home size={15} /> Home</span>
                  <ChevronDown size={14} className={`transition-transform ${homeOpen ? 'rotate-180' : ''}`} />
                </button>
                {homeOpen && (
                  <div className="mt-1">
                    <Link href="/admin/pages/home/hero" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${heroActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-hero"><PanelsTopLeft size={16} /><span>Hero</span></Link>
                    <Link href="/admin/pages/home/about-preview" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${aboutActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-about-preview"><PanelsTopLeft size={16} /><span>About Preview</span></Link>
                    <Link href="/admin/pages/home/live-updates" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${liveUpdatesActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-live-updates"><PanelsTopLeft size={16} /><span>Live Updates</span></Link>
                    <Link href="/admin/pages/home/statistics" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${statisticsActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-statistics"><PanelsTopLeft size={16} /><span>Statistics</span></Link>
                    <Link href="/admin/pages/home/favorite-topics" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${favoriteTopicsActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-favorite-topics"><PanelsTopLeft size={16} /><span>Favorite Topics</span></Link>
                    <Link href="/admin/pages/home/results" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${resultsActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-results"><PanelsTopLeft size={16} /><span>Results</span></Link>
                    <Link href="/admin/pages/home/achievement-ribbon" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${ribbonActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-achievement-ribbon"><PanelsTopLeft size={16} /><span>Achievement Ribbon</span></Link>
                    <Link href="/admin/pages/home/testimonials" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${testimonialsActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-testimonials"><PanelsTopLeft size={16} /><span>Testimonials</span></Link>
                    <Link href="/admin/pages/home/faculty" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${facultyActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-faculty"><PanelsTopLeft size={16} /><span>Faculty Preview</span></Link>
                    <Link href="/admin/pages/home/gallery" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${galleryActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-gallery"><PanelsTopLeft size={16} /><span>Gallery Preview</span></Link>
                    <Link href="/admin/pages/home/knowledge-hub" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${knowledgeHubActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-knowledge-hub"><PanelsTopLeft size={16} /><span>Knowledge Hub</span></Link>
                    <Link href="/admin/pages/home/admissions-faq" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${admissionsFaqActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-admissions-faq"><PanelsTopLeft size={16} /><span>Admissions FAQ</span></Link>
                    <Link href="/admin/pages/home/final-cta" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${finalCtaActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-home-final-cta"><PanelsTopLeft size={16} /><span>Final Admission CTA</span></Link>
                  </div>
                )}
              </div>
            )}
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <button type="button" onClick={() => setAboutOpen((current) => !current)} aria-expanded={aboutOpen} className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold transition ${aboutOpen || nestedAboutRoute ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))]'}`} data-testid="button-admin-about-toggle">
                  <span className="flex items-center gap-2"><BookOpen size={15} /> About</span>
                  <ChevronDown size={14} className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {aboutOpen && (
                  <div className="mt-1">
                    <Link href="/admin/pages/about/hero" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${aboutHeroActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-hero"><PanelsTopLeft size={16} /><span>About Hero</span></Link>
                    <Link href="/admin/pages/about/our-story" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${aboutStoryActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-story"><PanelsTopLeft size={16} /><span>Our Story</span></Link>
                    <Link href="/admin/pages/about/chairman-message" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${chairmanActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-chairman-message"><PanelsTopLeft size={16} /><span>Chairman’s Message</span></Link>
                     <Link href="/admin/pages/about/guiding-principles" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${principlesActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-guiding-principles"><PanelsTopLeft size={16} /><span>Guiding Principles</span></Link>
                     <Link href="/admin/pages/about/why-parents-choose" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${parentChoiceActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-why-parents-choose"><PanelsTopLeft size={16} /><span>Why Parents Choose</span></Link>
                     <Link href="/admin/pages/about/leadership" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${leadershipActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-leadership"><PanelsTopLeft size={16} /><span>Leadership</span></Link>
                     <Link href="/admin/pages/about/campus-highlights" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${campusHighlightsActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-campus-highlights"><PanelsTopLeft size={16} /><span>Campus Highlights</span></Link>
                     <Link href="/admin/pages/about/achievement-statistics" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${achievementsActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-achievements"><PanelsTopLeft size={16} /><span>Achievement Statistics</span></Link>
                     <Link href="/admin/pages/about/faqs" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${faqActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-faqs"><PanelsTopLeft size={16} /><span>FAQs</span></Link>
                     <Link href="/admin/pages/about/admission-cta" onClick={() => setOpen(false)} className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 pl-9 text-sm font-semibold transition ${admissionCtaActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-about-admission-cta"><PanelsTopLeft size={16} /><span>Admission CTA</span></Link>
                  </div>
                )}
              </div>
            )}
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <button type="button" onClick={() => setResultsOpen((current) => !current)} aria-expanded={resultsOpen} className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold transition ${resultsOpen || nestedResultsRoute ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))]'}`} data-testid="button-admin-results-toggle">
                  <span className="flex items-center gap-2"><Trophy size={15} /> Results</span>
                  <ChevronDown size={14} className={`transition-transform ${resultsOpen ? 'rotate-180' : ''}`} />
                </button>
                {resultsOpen && (
                  <div className="mt-1">
                    <PageSectionLink href="/admin/pages/results#admin-results-introduction" id="admin-results-introduction" label="Page Introduction" active={resultsPageActive && activeAdminSection === 'admin-results-introduction'} onSelect={() => { setActiveAdminSection('admin-results-introduction'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/results#admin-results-statistics" id="admin-results-statistics" label="Statistics" active={resultsPageActive && activeAdminSection === 'admin-results-statistics'} onSelect={() => { setActiveAdminSection('admin-results-statistics'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/results#admin-results-student-results" id="admin-results-student-results" label="Student Results" active={resultsPageActive && activeAdminSection === 'admin-results-student-results'} onSelect={() => { setActiveAdminSection('admin-results-student-results'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/results#admin-results-testimonials" id="admin-results-testimonials" label="Shared Testimonials" active={resultsPageActive && activeAdminSection === 'admin-results-testimonials'} onSelect={() => { setActiveAdminSection('admin-results-testimonials'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/results#admin-results-contact-cta" id="admin-results-contact-cta" label="Contact CTA" active={resultsPageActive && activeAdminSection === 'admin-results-contact-cta'} onSelect={() => { setActiveAdminSection('admin-results-contact-cta'); setOpen(false); }} />
                  </div>
                )}
              </div>
            )}
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <button type="button" onClick={() => setFacultyOpen((current) => !current)} aria-expanded={facultyOpen} className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold transition ${facultyOpen || nestedFacultyRoute ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))]'}`} data-testid="button-admin-faculty-toggle">
                  <span className="flex items-center gap-2"><GraduationCap size={15} /> Faculty</span>
                  <ChevronDown size={14} className={`transition-transform ${facultyOpen ? 'rotate-180' : ''}`} />
                </button>
                {facultyOpen && (
                  <div className="mt-1">
                    <PageSectionLink href="/admin/pages/faculty#admin-faculty-introduction" id="admin-faculty-introduction" label="Page Introduction" active={facultyPageActive && activeAdminSection === 'admin-faculty-introduction'} onSelect={() => { setActiveAdminSection('admin-faculty-introduction'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/faculty#admin-faculty-profiles" id="admin-faculty-profiles" label="Faculty Profiles" active={facultyPageActive && activeAdminSection === 'admin-faculty-profiles'} onSelect={() => { setActiveAdminSection('admin-faculty-profiles'); setOpen(false); }} />
                  </div>
                )}
              </div>
            )}
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <button type="button" onClick={() => setCoursesOpen((current) => !current)} aria-expanded={coursesOpen} className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold transition ${coursesOpen || nestedCoursesRoute ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))]'}`} data-testid="button-admin-courses-toggle">
                  <span className="flex items-center gap-2"><Waypoints size={15} /> Courses</span>
                  <ChevronDown size={14} className={`transition-transform ${coursesOpen ? 'rotate-180' : ''}`} />
                </button>
                {coursesOpen && (
                  <div className="mt-1">
                    <PageSectionLink href="/admin/pages/all-courses" id="admin-all-courses" label="All Courses" active={allCoursesPageActive} onSelect={() => { setActiveAdminSection(''); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/courses#admin-courses-hero" id="admin-courses-hero" label="Hero" active={coursesPageActive && activeAdminSection === 'admin-courses-hero'} onSelect={() => { setActiveAdminSection('admin-courses-hero'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/courses#admin-courses-highlights" id="admin-courses-highlights" label="Quick Course Highlights" active={coursesPageActive && activeAdminSection === 'admin-courses-highlights'} onSelect={() => { setActiveAdminSection('admin-courses-highlights'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/courses#admin-courses-why-choose" id="admin-courses-why-choose" label="Why Choose This Pathway" active={coursesPageActive && activeAdminSection === 'admin-courses-why-choose'} onSelect={() => { setActiveAdminSection('admin-courses-why-choose'); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/courses#admin-courses-syllabus" id="admin-courses-syllabus" label="Syllabus" active={coursesPageActive && activeAdminSection === 'admin-courses-syllabus'} onSelect={() => { setActiveAdminSection('admin-courses-syllabus'); setOpen(false); }} />
                  </div>
                )}
              </div>
            )}
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <button type="button" onClick={() => setKnowledgeHubOpen((current) => !current)} aria-expanded={knowledgeHubOpen} className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold transition ${knowledgeHubOpen || nestedKnowledgeHubRoute ? 'text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))]'}`} data-testid="button-admin-knowledge-hub-pages-toggle">
                  <span className="flex items-center gap-2"><BookOpen size={15} /> Knowledge Hub</span>
                  <ChevronDown size={14} className={`transition-transform ${knowledgeHubOpen ? 'rotate-180' : ''}`} />
                </button>
                {knowledgeHubOpen && (
                  <div className="mt-1">
                    <PageSectionLink href="/admin/pages/knowledge-hub/main" id="knowledge-hub-main-page" label="Hub Main Page" active={knowledgeHubMainPageActive} onSelect={() => { setActiveAdminSection(''); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/knowledge-hub/articles" id="knowledge-hub-articles" label="Articles" active={knowledgeHubArticlesActive} onSelect={() => { setActiveAdminSection(''); setOpen(false); }} />
                    <PageSectionLink href="/admin/pages/knowledge-hub/videos" id="knowledge-hub-videos" label="Video Hub" active={knowledgeHubVideosActive} onSelect={() => { setActiveAdminSection(''); setOpen(false); }} />
                  </div>
                )}
              </div>
            )}
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <Link href="/admin/pages/gallery" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${galleryPageActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-gallery"><Images size={16} /><span>Gallery</span></Link>
              </div>
            )}
            {pagesOpen && (
              <div className="mt-2 rounded-2xl bg-[hsl(var(--sidebar-accent)/.55)] p-2">
                <Link href="/admin/pages/contact" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${contactActive ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid="link-admin-pages-contact"><MessageCircle size={16} /><span>Contact</span></Link>
              </div>
            )}
          </div>
        </nav>
        <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] pt-4">
          <div className="mb-4 rounded-xl bg-[hsl(var(--sidebar-accent))] p-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--admin-accent))] text-sm font-bold text-[hsl(var(--admin-on-accent))]">{displayName.charAt(0).toUpperCase()}</div>
            <p className="mt-3 truncate text-sm font-bold" data-testid="text-admin-display-name">{displayName}</p>
            <p className="truncate text-xs text-[hsl(var(--sidebar-foreground)/.54)]" data-testid="text-admin-email">{email}</p>
          </div>
           <button ref={signOutButtonRef} onClick={() => setSignOutOpen(true)} disabled={logout.isPending} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[hsl(var(--sidebar-foreground)/.7)] transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]" data-testid="button-admin-logout"><LogOut size={18} /> Sign out</button>
        </div>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-[hsl(var(--primary)/.35)] md:hidden" onClick={() => setOpen(false)} data-testid="button-menu-backdrop" />}
      <main className="min-h-[100dvh] min-w-0 md:pl-[276px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.9)] px-5 backdrop-blur-md md:px-10">
          <button aria-controls="admin-sidebar" aria-expanded={open} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 md:hidden" onClick={() => setOpen(true)} data-testid="button-open-sidebar"><Menu size={20} /></button>
          <div className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))] md:block">College control room</div>
          <Link href="/" className="text-sm font-bold text-[hsl(var(--primary))] transition hover:text-[hsl(var(--accent-foreground))]" data-testid="link-view-website">View website ↗</Link>
        </header>
        <div className="admin-main-content mx-auto max-w-[1280px] px-5 py-8 pb-16 md:px-10 md:py-12 md:pb-20">{children}</div>
      </main>
      {signOutOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--primary)/.45)] p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSignOutOpen(false); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="sign-out-title" aria-describedby="sign-out-description" className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--foreground))] shadow-2xl motion-safe:animate-rise" onMouseDown={(event) => event.stopPropagation()}>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent-foreground))]"><LogOut size={19} /></div>
            <h2 id="sign-out-title" className="mt-5 font-display text-3xl font-semibold tracking-[-.03em] text-[hsl(var(--primary))]">Are you sure you want to sign out?</h2>
            <p id="sign-out-description" className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">You will need to sign in again to access the admin dashboard.</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button ref={cancelSignOutRef} type="button" onClick={() => setSignOutOpen(false)} className="inline-flex h-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] px-4 text-sm font-bold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.2)]" data-testid="button-cancel-signout">Cancel</button>
              <button type="button" onClick={signOut} disabled={logout.isPending} className="inline-flex h-11 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)] disabled:opacity-60 motion-reduce:transform-none" data-testid="button-confirm-signout">{logout.isPending ? 'Signing out…' : 'Sign out'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}