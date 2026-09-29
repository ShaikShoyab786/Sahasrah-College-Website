import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import About from '@/pages/about';
import Faculty from '@/pages/faculty';
import Contact from '@/pages/contact';
import Gallery from '@/pages/gallery';
import Results from '@/pages/results';
import AdminLogin from '@/pages/admin-login';
import AdminGuard from '@/pages/admin-guard';
import AdminOverview from '@/pages/admin-overview';
import AdminDashboard from '@/pages/admin-dashboard';
import AdminSiteSettings from '@/pages/admin-site-settings';
import AdminMegaMenus from '@/pages/admin-mega-menus';
import { PublicVisitIntroGate } from '@/components/public-visit-intro';
import { CallbackPopupGate } from '@/components/callback-popup';
import AdminHomepageHero from '@/pages/admin-homepage-hero';
import AdminHomepageAboutPreview from '@/pages/admin-homepage-about-preview';
import { AdminHomepageFavoriteTopics, AdminHomepageLiveUpdates, AdminHomepageStatistics } from '@/pages/admin-homepage-content';
import AdminHomeStatistics from '@/pages/admin-home-statistics';
import { AdminHomepageAchievementRibbon, AdminHomepageFaculty, AdminHomepageGallery, AdminHomepageTestimonials } from '@/pages/admin-homepage-previews';
import AdminHomeResults from '@/pages/admin-home-results';
import AdminResults from '@/pages/admin-results';
import { AdminHomepageAdmissionsFaq, AdminHomepageFinalCta, AdminHomepageKnowledgeHub } from '@/pages/admin-homepage-final-sections';
import AdminAboutHero from '@/pages/admin-about-hero';
import AdminAboutStory from '@/pages/admin-about-story';
import AdminChairmanMessage from '@/pages/admin-chairman-message';
import AdminGuidingPrinciples from '@/pages/admin-guiding-principles';
import AdminWhyParentsChoose from '@/pages/admin-why-parents-choose';
import AdminLeadership from '@/pages/admin-leadership';
import { AdminAboutAchievements, AdminAboutAdmissionCta, AdminAboutCampusHighlights, AdminAboutFaq } from '@/pages/admin-about-sections';
import { AdminContact, AdminContactEnquiries } from '@/pages/admin-contact';
import AdminGallery from '@/pages/admin-gallery';
import AdminFaculty from '@/pages/admin-faculty';
import AdminCourses from '@/pages/admin-courses';
import AdminAllCourses from '@/pages/admin-all-courses';
import Courses from '@/pages/courses';
import KnowledgeHub from '@/pages/knowledge-hub';
import KnowledgeHubVideos from '@/pages/knowledge-hub-videos';
import KnowledgeHubResources from '@/pages/knowledge-hub-resources';
import KnowledgeHubArticles from '@/pages/knowledge-hub-articles';
import KnowledgeHubArticle from '@/pages/knowledge-hub-article';
import AdminKnowledgeHubVideos from '@/pages/admin-knowledge-hub-videos';
import AdminKnowledgeHubResources from '@/pages/admin-knowledge-hub-resources';
import AdminKnowledgeHubArticles from '@/pages/admin-knowledge-hub-articles';
import AdminKnowledgeHubMegaMenu from '@/pages/admin-knowledge-hub-mega-menu';
import CourseDetail from '@/pages/course-detail';
import IntegratedCourses from '@/pages/integrated-courses';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/faculty" component={Faculty} />
        <Route path="/contact" component={Contact} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/results" component={Results} />
        <Route path="/knowledge-hub/videos" component={KnowledgeHubVideos} />
        <Route path="/knowledge-hub/resources" component={KnowledgeHubResources} />
        <Route path="/knowledge-hub/articles/:slug" component={KnowledgeHubArticle} />
        <Route path="/knowledge-hub/articles" component={KnowledgeHubArticles} />
        <Route path="/knowledge-hub" component={KnowledgeHub} />
        <Route path="/courses" component={Courses} />
        <Route path="/courses/integrated" component={IntegratedCourses} />
        <Route path="/courses/:slug" component={CourseDetail} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/pages/home/hero">
          <AdminGuard><AdminHomepageHero /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/about-preview">
          <AdminGuard><AdminHomepageAboutPreview /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/live-updates">
          <AdminGuard><AdminHomepageLiveUpdates /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/statistics">
          <AdminGuard><AdminHomeStatistics /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/favorite-topics">
          <AdminGuard><AdminHomepageFavoriteTopics /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/results">
          <AdminGuard><AdminHomeResults /></AdminGuard>
        </Route>
        <Route path="/admin/pages/results">
          <AdminGuard><AdminResults /></AdminGuard>
        </Route>
        <Route path="/admin/results">
          <AdminGuard><AdminResults /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/achievement-ribbon">
          <AdminGuard><AdminHomepageAchievementRibbon /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/testimonials">
          <AdminGuard><AdminHomepageTestimonials /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/faculty">
          <AdminGuard><AdminHomepageFaculty /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/gallery">
          <AdminGuard><AdminHomepageGallery /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/knowledge-hub">
          <AdminGuard><AdminHomepageKnowledgeHub /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/admissions-faq">
          <AdminGuard><AdminHomepageAdmissionsFaq /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/final-cta">
          <AdminGuard><AdminHomepageFinalCta /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/hero">
          <AdminGuard><AdminAboutHero /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/our-story">
          <AdminGuard><AdminAboutStory /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/chairman-message">
          <AdminGuard><AdminChairmanMessage /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/guiding-principles">
          <AdminGuard><AdminGuidingPrinciples /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/why-parents-choose">
          <AdminGuard><AdminWhyParentsChoose /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/leadership">
          <AdminGuard><AdminLeadership /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/campus-highlights">
          <AdminGuard><AdminAboutCampusHighlights /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/achievement-statistics">
          <AdminGuard><AdminAboutAchievements /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/faqs">
          <AdminGuard><AdminAboutFaq /></AdminGuard>
        </Route>
        <Route path="/admin/pages/about/admission-cta">
          <AdminGuard><AdminAboutAdmissionCta /></AdminGuard>
        </Route>
        <Route path="/admin/contact-enquiries">
          <AdminGuard><AdminContactEnquiries /></AdminGuard>
        </Route>
        <Route path="/admin/pages/contact">
          <AdminGuard><AdminContact /></AdminGuard>
        </Route>
        <Route path="/admin/pages/gallery">
          <AdminGuard><AdminGallery /></AdminGuard>
        </Route>
        <Route path="/admin/pages/faculty">
          <AdminGuard><AdminFaculty /></AdminGuard>
        </Route>
        <Route path="/admin/pages/courses">
          <AdminGuard><AdminCourses /></AdminGuard>
        </Route>
        <Route path="/admin/pages/all-courses">
          <AdminGuard><AdminAllCourses /></AdminGuard>
        </Route>
        <Route path="/admin/pages/knowledge-hub/articles">
          <AdminGuard><AdminKnowledgeHubArticles /></AdminGuard>
        </Route>
        <Route path="/admin/pages/knowledge-hub/videos">
          <AdminGuard><AdminKnowledgeHubVideos /></AdminGuard>
        </Route>
        <Route path="/admin/pages/knowledge-hub/resources">
          <AdminGuard><AdminKnowledgeHubResources /></AdminGuard>
        </Route>
        <Route path="/admin/pages/knowledge-hub/main">
          <AdminGuard><AdminKnowledgeHubMegaMenu /></AdminGuard>
        </Route>
        <Route path="/admin">
          <AdminGuard><AdminOverview /></AdminGuard>
        </Route>
        <Route path="/admin/dashboard">
          <AdminGuard><AdminDashboard /></AdminGuard>
        </Route>
        <Route path="/admin/site-settings">
          <AdminGuard><AdminSiteSettings /></AdminGuard>
        </Route>
        <Route path="/admin/mega-menus">
          <AdminGuard><AdminMegaMenus /></AdminGuard>
        </Route>
        <Route path="/admin/knowledge-hub-mega-menu">
          <AdminGuard><AdminKnowledgeHubMegaMenu /></AdminGuard>
        </Route>
        <Route path="/admin/homepage-hero">
          <AdminGuard><AdminHomepageHero /></AdminGuard>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RouteScrollManager() {
  const [location] = useLocation();
  const previousLocation = useRef(location);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (previousLocation.current === location) return;
    previousLocation.current = location;

    // Keep explicit destination anchors; reset only page-to-page navigation.
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);

  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RouteScrollManager />
          <Router />
          <PublicVisitIntroGate />
          <CallbackPopupGate />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
