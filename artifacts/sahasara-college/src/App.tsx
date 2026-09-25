import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import About from '@/pages/about';
import Contact from '@/pages/contact';
import Gallery from '@/pages/gallery';
import AdminLogin from '@/pages/admin-login';
import AdminGuard from '@/pages/admin-guard';
import AdminOverview from '@/pages/admin-overview';
import AdminDashboard from '@/pages/admin-dashboard';
import AdminSiteSettings from '@/pages/admin-site-settings';
import { PublicVisitIntroGate } from '@/components/public-visit-intro';
import { CallbackPopupGate } from '@/components/callback-popup';
import AdminHomepageHero from '@/pages/admin-homepage-hero';
import AdminHomepageAboutPreview from '@/pages/admin-homepage-about-preview';
import { AdminHomepageFavoriteTopics, AdminHomepageLiveUpdates, AdminHomepageStatistics } from '@/pages/admin-homepage-content';
import { AdminHomepageAchievementRibbon, AdminHomepageFaculty, AdminHomepageGallery, AdminHomepageResults, AdminHomepageTestimonials } from '@/pages/admin-homepage-previews';
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
        <Route path="/contact" component={Contact} />
        <Route path="/gallery" component={Gallery} />
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
          <AdminGuard><AdminHomepageStatistics /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/favorite-topics">
          <AdminGuard><AdminHomepageFavoriteTopics /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/results">
          <AdminGuard><AdminHomepageResults /></AdminGuard>
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
        <Route path="/admin">
          <AdminGuard><AdminOverview /></AdminGuard>
        </Route>
        <Route path="/admin/dashboard">
          <AdminGuard><AdminDashboard /></AdminGuard>
        </Route>
        <Route path="/admin/site-settings">
          <AdminGuard><AdminSiteSettings /></AdminGuard>
        </Route>
        <Route path="/admin/homepage-hero">
          <AdminGuard><AdminHomepageHero /></AdminGuard>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
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
