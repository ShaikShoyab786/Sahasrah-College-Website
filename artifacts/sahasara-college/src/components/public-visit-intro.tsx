import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIsFetching } from '@tanstack/react-query';
import { useGetSiteSettings } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import {
  createPublicThemeStyle,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SURFACE_COLOR,
  normalizeHexColor,
} from '@/lib/public-theme';
import './public-visit-intro.css';

const INTRO_SESSION_KEY = 'college-public-intro-seen';
const DEFAULT_INTRO_QUOTE = 'Best place to learn';
const SETTINGS_TIMEOUT_MS = 4_000;
const INTRO_MAX_DURATION_MS = 4_000;

type GateState = 'pending' | 'eligible' | 'active' | 'done';

function isPublicSitePath(path: string) {
  return path === '/' || path === '/about' || path === '/contact';
}

function initialGateState(isPublicPath: boolean): GateState {
  if (!isPublicPath) return 'pending';
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) ? 'done' : 'eligible';
  } catch {
    return 'done';
  }
}

export function PublicVisitIntroGate() {
  const [location] = useLocation();
  const isPublicPath = isPublicSitePath(location);
  const [gateState, setGateState] = useState<GateState>(() => initialGateState(isPublicPath));
  const entryClaimed = useRef(false);

  useEffect(() => {
    if (!isPublicPath || entryClaimed.current) return;
    entryClaimed.current = true;

    if (gateState === 'pending') {
      try {
        if (window.sessionStorage.getItem(INTRO_SESSION_KEY)) {
          setGateState('done');
          return;
        }
        window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
        setGateState('eligible');
      } catch {
        setGateState('done');
      }
      return;
    }

    if (gateState === 'eligible') {
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      } catch {
        setGateState('done');
      }
    }
  }, [gateState, isPublicPath]);

  useEffect(() => {
    if (!isPublicPath && (gateState === 'eligible' || gateState === 'active')) {
      setGateState('done');
    }
  }, [gateState, isPublicPath]);

  const handleStart = useCallback(() => {
    setGateState((current) => current === 'eligible' ? 'active' : current);
  }, []);
  const handleFinish = useCallback(() => setGateState('done'), []);

  if (!isPublicPath || (gateState !== 'eligible' && gateState !== 'active')) return null;
  return <PublicVisitIntro onStart={handleStart} onFinish={handleFinish} />;
}

function PublicVisitIntro({ onStart, onFinish }: { onStart: () => void; onFinish: () => void }) {
  const settingsQuery = useGetSiteSettings();
  const activeQueries = useIsFetching();
  const [visible, setVisible] = useState(false);
  const [minimumDurationComplete, setMinimumDurationComplete] = useState(false);
  const started = useRef(false);
  const finished = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (started.current || finished.current) return;
      finished.current = true;
      onFinish();
    }, SETTINGS_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [onFinish]);

  useEffect(() => {
    if (finished.current) return;

    if (settingsQuery.isError) {
      finished.current = true;
      onFinish();
      return;
    }
    if (!settingsQuery.isSuccess || !settingsQuery.data) return;
    if (!settingsQuery.data.introEnabled) {
      finished.current = true;
      onFinish();
      return;
    }
    if (started.current) return;

    started.current = true;
    onStart();
    setVisible(true);
    setMinimumDurationComplete(false);

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const minimumTimer = window.setTimeout(
      () => setMinimumDurationComplete(true),
      reducedMotion ? 650 : 1_000,
    );
    const maximumTimer = window.setTimeout(() => {
      if (finished.current) return;
      finished.current = true;
      setVisible(false);
      onFinish();
    }, INTRO_MAX_DURATION_MS);

    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(maximumTimer);
    };
  }, [
    onFinish,
    onStart,
    settingsQuery.data,
    settingsQuery.isError,
    settingsQuery.isSuccess,
  ]);

  useEffect(() => {
    if (!visible || !minimumDurationComplete || activeQueries > 0 || finished.current) return;
    finished.current = true;
    setVisible(false);
    onFinish();
  }, [activeQueries, minimumDurationComplete, onFinish, visible]);

  useEffect(() => {
    if (!visible) return;

    const appRoot = document.getElementById('root');
    const previousInert = appRoot?.inert ?? false;
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden') ?? null;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    if (appRoot) {
      appRoot.inert = true;
      appRoot.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => {
      overlayRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (appRoot) {
        appRoot.inert = previousInert;
        if (previousAriaHidden === null) appRoot.removeAttribute('aria-hidden');
        else appRoot.setAttribute('aria-hidden', previousAriaHidden);
      }
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [visible]);

  if (!visible || !settingsQuery.data || typeof document === 'undefined') return null;

  const settings = settingsQuery.data;
  const collegeName = settings.collegeName.trim() || 'Sahsrah Junior College';
  const quote = settings.introQuote?.replace(/[\r\n]+/g, ' ').trim() || DEFAULT_INTRO_QUOTE;

  return createPortal(
    <PublicVisitIntroVisual
      ref={overlayRef}
      logoUrl={settings.logoUrl}
      collegeName={collegeName}
      quote={quote}
      primaryColor={normalizeHexColor(settings.primaryColor) ?? DEFAULT_PRIMARY_COLOR}
      accentColor={normalizeHexColor(settings.accentColor) ?? DEFAULT_ACCENT_COLOR}
      surfaceColor={normalizeHexColor(settings.surfaceColor) ?? DEFAULT_SURFACE_COLOR}
    />,
    document.body,
  );
}

type PublicVisitIntroVisualProps = {
  logoUrl: string | null;
  collegeName: string;
  quote: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  preview?: boolean;
};

export const PublicVisitIntroVisual = forwardRef<HTMLDivElement, PublicVisitIntroVisualProps>(
  function PublicVisitIntroVisual({
    logoUrl,
    collegeName,
    quote,
    primaryColor,
    accentColor,
    surfaceColor,
    preview = false,
  }, ref) {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const safeQuote = quote.replace(/[\r\n]+/g, ' ').trim() || DEFAULT_INTRO_QUOTE;
  const themeStyle = createPublicThemeStyle(
    normalizeHexColor(primaryColor) ?? DEFAULT_PRIMARY_COLOR,
    normalizeHexColor(accentColor) ?? DEFAULT_ACCENT_COLOR,
    normalizeHexColor(surfaceColor) ?? DEFAULT_SURFACE_COLOR,
  );
  const fallbackInitial = collegeName.trim().charAt(0).toUpperCase() || 'S';

  return (
    <div
      ref={ref}
      className={`public-visit-intro ${preview ? 'public-visit-intro--preview' : 'public-visit-intro--screen'}`}
      style={themeStyle}
      role={preview ? undefined : 'status'}
      aria-live={preview ? undefined : 'polite'}
      aria-atomic={preview ? undefined : true}
      tabIndex={preview ? undefined : -1}
      data-testid={preview ? 'preview-intro-loading-screen' : 'overlay-intro-loading-screen'}
    >
      {!preview && <div className="public-visit-intro__ambient" aria-hidden="true" />}
      <div className="public-visit-intro__content">
        <div className="public-visit-intro__badge">
          {logoUrl && failedLogoUrl !== logoUrl
            ? <img
                src={logoUrl}
                alt={preview ? `${collegeName} logo` : ''}
                aria-hidden={preview ? undefined : 'true'}
                className="public-visit-intro__logo"
                onError={() => setFailedLogoUrl(logoUrl)}
                data-testid={preview ? 'img-intro-preview-logo' : 'img-intro-logo'}
              />
            : <span className="public-visit-intro__fallback-mark" aria-hidden="true">{fallbackInitial}</span>}
        </div>
        <p className="public-visit-intro__quote font-display" data-testid="text-intro-quote">{safeQuote}</p>
        <div className="public-visit-intro__line" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
  },
);