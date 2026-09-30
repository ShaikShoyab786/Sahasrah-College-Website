import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, Phone, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import {
  getGetContactSettingsQueryKey,
  getGetSiteSettingsQueryKey,
  useGetContactSettings,
  useGetSiteSettings,
} from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';
import {
  createPublicThemeStyle,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SURFACE_COLOR,
} from '@/lib/public-theme';

type QuickAction = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  internal?: boolean;
  external?: boolean;
  accent?: boolean;
};

const SCROLL_THRESHOLD_RATIO = 0.65;
const MIN_SCROLL_THRESHOLD = 240;

export function PublicQuickActions() {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');
  const settingsQuery = useGetSiteSettings({
    query: { enabled: !isAdmin, queryKey: getGetSiteSettingsQueryKey() },
  });
  const settings = settingsQuery.data;
  const needsContactNumber = Boolean(settings?.showCallQuickAction || settings?.showWhatsappQuickAction);
  const contactQuery = useGetContactSettings({
    query: { enabled: !isAdmin && needsContactNumber, queryKey: getGetContactSettingsQueryKey() },
  });
  const [hasScrolled, setHasScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    if (isAdmin) {
      setHasScrolled(false);
      return;
    }

    const updateScrollState = () => {
      const threshold = Math.max(MIN_SCROLL_THRESHOLD, window.innerHeight * SCROLL_THRESHOLD_RATIO);
      setHasScrolled(window.scrollY >= threshold);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [isAdmin, location]);

  const contact = contactQuery.isSuccess ? contactQuery.data : undefined;
  const phone = contact?.primaryPhone?.trim() ?? '';
  const phoneHref = phone.replace(/[^\d+]/g, '');
  const whatsappDigits = contact?.whatsappNumber?.replace(/\D/g, '') ?? '';
  const actions: QuickAction[] = [];

  if (settings?.showCallQuickAction && phoneHref.replace(/\D/g, '').length >= 7) {
    actions.push({ id: 'call', label: 'Call Us', href: `tel:${phoneHref}`, icon: <Phone size={19} aria-hidden="true" /> });
  }
  if (settings?.showWhatsappQuickAction && whatsappDigits.length >= 7) {
    actions.push({ id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${whatsappDigits}`, icon: <FaWhatsapp size={20} aria-hidden="true" />, external: true });
  }
  if (settings?.showApplyQuickAction) {
    actions.push({ id: 'apply', label: 'Apply Now', href: '/contact', icon: <ArrowUpRight size={19} aria-hidden="true" />, internal: true, accent: true });
  }

  const showBar = !isAdmin && hasScrolled && !dismissed && actions.length > 0;
  const showWhatsappBubble = !isAdmin && hasScrolled && settings?.showWhatsappQuickAction && whatsappDigits.length >= 7;
  if (!showBar && !showWhatsappBubble) return null;

  const themeStyle = createPublicThemeStyle(
    settings?.primaryColor ?? DEFAULT_PRIMARY_COLOR,
    settings?.accentColor ?? DEFAULT_ACCENT_COLOR,
    settings?.surfaceColor ?? DEFAULT_SURFACE_COLOR,
  );

  return (
    <div style={themeStyle}>
      {showBar && (
        <div className="fixed bottom-4 left-1/2 z-[80] w-[calc(100vw-24px)] max-w-[620px] -translate-x-1/2" data-testid="public-quick-actions">
          <nav aria-label="Quick actions" className="relative flex w-full items-center rounded-full bg-[hsl(var(--primary))] p-1.5 text-[hsl(var(--primary-foreground))] shadow-[0_14px_40px_rgba(0,0,0,.24)] ring-1 ring-white/10">
            {actions.map((action, index) => {
              const divider = index > 0 && !action.accent ? 'border-l border-[hsl(var(--primary-foreground)/.18)]' : '';
              const emphasis = action.accent
                ? 'rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105'
                : 'text-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--accent))]';
              const className = `flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-1.5 py-3 text-[13px] font-bold transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent))] sm:gap-2 sm:px-3 sm:text-sm ${divider} ${emphasis}`;
              const contents = <>{action.icon}<span>{action.label}</span></>;

              return action.internal ? (
                <Link key={action.id} href={action.href} className={className} data-testid={`quick-action-${action.id}`}>
                  {contents}
                </Link>
              ) : (
                <a
                  key={action.id}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noopener noreferrer' : undefined}
                  className={className}
                  data-testid={`quick-action-${action.id}`}
                >
                  {contents}
                </a>
              );
            })}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Hide quick actions"
              className="absolute -right-1 -top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              data-testid="button-dismiss-quick-actions"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}

      {showWhatsappBubble && (
        <a
          href={`https://wa.me/${whatsappDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          title="Chat with us on WhatsApp"
          className={`fixed right-4 z-[79] grid h-14 w-14 place-items-center rounded-full bg-[#20c763] text-white shadow-[0_8px_24px_rgba(0,0,0,.24)] transition hover:scale-105 hover:bg-[#1bb65a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#20c763]/35 ${showBar ? 'bottom-24 md:bottom-7' : 'bottom-5'}`}
          data-testid="floating-whatsapp-button"
        >
          <FaWhatsapp size={32} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}