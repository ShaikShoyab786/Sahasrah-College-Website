import { useGetCourses } from '@workspace/api-client-react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';
import { Link } from 'wouter';
import { SiteMark } from '@/components/site-mark';

type PublicFooterProps = {
  settings: {
    collegeName: string;
    tagline: string;
    logoUrl: string | null;
    email: string;
    phone: string;
    address?: string;
    socialFacebookUrl?: string | null;
    socialInstagramUrl?: string | null;
    socialYoutubeUrl?: string | null;
    socialLinkedinUrl?: string | null;
    footerText: string;
  };
};

const exploreLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Courses', href: '/courses' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Results', href: '/results' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Knowledge Hub', href: '/knowledge-hub' },
  { label: 'Contact', href: '/contact' },
];

function safeSocialUrl(value?: string | null) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

export function PublicFooter({ settings }: PublicFooterProps) {
  const coursesQuery = useGetCourses();
  const socials = [
    { name: 'Facebook', url: safeSocialUrl(settings.socialFacebookUrl), Icon: FaFacebookF },
    { name: 'Instagram', url: safeSocialUrl(settings.socialInstagramUrl), Icon: FaInstagram },
    { name: 'YouTube', url: safeSocialUrl(settings.socialYoutubeUrl), Icon: FaYoutube },
    { name: 'LinkedIn', url: safeSocialUrl(settings.socialLinkedinUrl), Icon: FaLinkedinIn },
  ].filter((social) => social.url);
  const phoneHref = settings.phone.trim().replace(/[^+\dXx]/g, '');
  const address = settings.address?.trim();
  const mapHref = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;

  return (
    <footer id="public-footer" className="relative isolate overflow-hidden bg-[hsl(var(--primary))] px-6 py-12 text-[hsl(var(--primary-foreground))] sm:px-8 lg:px-10 lg:py-14" data-testid="public-footer">
      <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full border border-[hsl(var(--primary-foreground)/.08)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-[hsl(var(--accent)/.14)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-x-10 gap-y-11 border-b border-[hsl(var(--primary-foreground)/.14)] pb-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_.72fr_1fr_1fr] lg:gap-x-12">
          <div className="min-w-0">
            <SiteMark name={settings.collegeName} tagline={settings.tagline} logoUrl={settings.logoUrl} inverse responsive />
            <p className="mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--primary-foreground)/.72)]" data-testid="text-footer">
              {settings.footerText}
            </p>
            {socials.length > 0 && (
              <nav className="mt-6 flex flex-wrap gap-2.5" aria-label="Social media profiles" data-testid="footer-social-links">
                {socials.map(({ name, url, Icon }) => (
                  <a
                    key={name}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${name} profile (opens in a new tab)`}
                    title={name}
                    className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--primary-foreground)/.18)] bg-[hsl(var(--primary-foreground)/.06)] text-base text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    data-testid={`link-footer-social-${name.toLowerCase()}`}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                ))}
              </nav>
            )}
          </div>

          <nav aria-label="Explore">
            <FooterHeading>Explore</FooterHeading>
            <ul className="mt-5 space-y-2.5">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group inline-flex min-h-7 items-center gap-1 text-sm text-[hsl(var(--primary-foreground)/.76)] transition hover:text-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid={`link-footer-${item.label.toLowerCase().replaceAll(' ', '-')}`}>
                    <span>{item.label}</span>
                    <ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <FooterHeading>Our Programs</FooterHeading>
            <ul className="mt-5 space-y-2.5" aria-live="polite">
              {coursesQuery.data?.map((course) => (
                <li key={course.slug}>
                  <Link href={`/courses/${course.slug}`} className="group inline-flex min-h-7 items-start gap-1 text-sm leading-6 text-[hsl(var(--primary-foreground)/.76)] transition hover:text-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid={`link-footer-course-${course.slug}`}>
                    <span>{course.name}</span>
                    <ArrowUpRight size={13} className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
              {coursesQuery.isPending && <li className="text-sm text-[hsl(var(--primary-foreground)/.62)]" role="status">Loading programs…</li>}
              {coursesQuery.isError && <li className="text-sm leading-6 text-[hsl(var(--primary-foreground)/.72)]" role="alert">Programs could not be loaded. <Link href="/courses" className="font-semibold underline underline-offset-4 hover:text-[hsl(var(--accent))]">View all courses</Link></li>}
              {coursesQuery.isSuccess && coursesQuery.data.length === 0 && <li><Link href="/courses" className="text-sm text-[hsl(var(--primary-foreground)/.76)] underline underline-offset-4 hover:text-[hsl(var(--accent))]">Explore all courses</Link></li>}
            </ul>
          </div>

          <div>
            <FooterHeading>Reach Us</FooterHeading>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-[hsl(var(--primary-foreground)/.78)]">
              {address && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--accent))]"><MapPin size={15} aria-hidden="true" /></span>
                  {mapHref ? <a href={mapHref} target="_blank" rel="noopener noreferrer" className="pt-1 hover:text-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-footer-address">{address}</a> : <span>{address}</span>}
                </li>
              )}
              {settings.phone.trim() && <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--accent))]"><Phone size={15} aria-hidden="true" /></span>
                <a href={`tel:${phoneHref}`} className="break-all hover:text-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-footer-phone">{settings.phone}</a>
              </li>}
              {settings.email.trim() && <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary-foreground)/.08)] text-[hsl(var(--accent))]"><Mail size={15} aria-hidden="true" /></span>
                <a href={`mailto:${settings.email}`} className="break-all hover:text-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-footer-email">{settings.email}</a>
              </li>}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-5 text-xs leading-5 text-[hsl(var(--primary-foreground)/.62)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {settings.collegeName}. All rights reserved.</span>
          <span>{settings.tagline}</span>
          <Link href="/admin" className="inline-flex min-h-9 w-fit items-center justify-center rounded-full border border-[hsl(var(--primary-foreground)/.28)] px-3.5 py-1.5 font-semibold text-[hsl(var(--primary-foreground)/.84)] transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" data-testid="link-footer-admin-sign-in">
            Administration Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-flex flex-col gap-2 font-display text-xl font-semibold text-[hsl(var(--primary-foreground))]">
      {children}
      <span className="h-0.5 w-9 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
    </h2>
  );
}