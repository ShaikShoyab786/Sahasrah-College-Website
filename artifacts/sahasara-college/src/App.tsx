import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import About from '@/pages/about';
import AdminLogin from '@/pages/admin-login';
import AdminGuard from '@/pages/admin-guard';
import AdminOverview from '@/pages/admin-overview';
import AdminSiteSettings from '@/pages/admin-site-settings';
import AdminHomepageHero from '@/pages/admin-homepage-hero';
import AdminHomepageAboutPreview from '@/pages/admin-homepage-about-preview';
import AdminAboutHero from '@/pages/admin-about-hero';
import AdminAboutStory from '@/pages/admin-about-story';
import AdminChairmanMessage from '@/pages/admin-chairman-message';
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
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/pages/home/hero">
          <AdminGuard><AdminHomepageHero /></AdminGuard>
        </Route>
        <Route path="/admin/pages/home/about-preview">
          <AdminGuard><AdminHomepageAboutPreview /></AdminGuard>
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
        <Route path="/admin">
          <AdminGuard><AdminOverview /></AdminGuard>
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
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
