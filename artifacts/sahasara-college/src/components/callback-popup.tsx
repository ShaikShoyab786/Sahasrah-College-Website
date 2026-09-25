import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Clock3, RotateCw } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  getGetCallbackPopupSettingsQueryKey,
  getGetSiteSettingsQueryKey,
  useGetCallbackPopupSettings,
  useGetSiteSettings,
  useSubmitContactEnquiry,
  type CallbackPopupSettings,
} from '@workspace/api-client-react';
import {
  createPublicThemeStyle,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SURFACE_COLOR,
} from '@/lib/public-theme';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CALLBACK_SESSION_KEY = 'college-callback-popup-seen';
const PUBLIC_PATHS = new Set(['/', '/about', '/contact']);

type CallbackForm = {
  name: string;
  phone: string;
  course: string;
  email: string;
  message: string;
};

const emptyForm: CallbackForm = {
  name: '',
  phone: '',
  course: '',
  email: '',
  message: '',
};

const callbackFieldClassName = 'h-11 w-full min-w-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus-visible:border-[hsl(var(--ring))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring)/.25)]';

function isPublicSitePath(path: string) {
  return PUBLIC_PATHS.has(path);
}

function errorMessage(error: unknown) {
  const value = error as { body?: { error?: string }; message?: string } | undefined;
  return value?.body?.error || value?.message || 'We could not save your request. Please try again.';
}

function safeDelay(value: number | undefined) {
  const delay = Number(value);
  if (!Number.isFinite(delay)) return 7;
  return Math.min(10, Math.max(5, delay));
}

function CallbackPopupForm({
  settings,
  onClose,
}: {
  settings: CallbackPopupSettings;
  onClose: () => void;
}) {
  const submit = useSubmitContactEnquiry();
  const [form, setForm] = useState<CallbackForm>(emptyForm);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const update = (field: keyof CallbackForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    submit.mutate({
      data: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        course: form.course || undefined,
        email: form.email.trim() || undefined,
        message: form.message.trim() || undefined,
        source: 'callback-request',
      },
    }, {
      onSuccess: (result) => {
        setSuccess(result.message);
        setForm(emptyForm);
      },
      onError: (requestError) => setError(errorMessage(requestError)),
    });
  };

  if (success) {
    return (
      <div className="space-y-5" data-testid="state-callback-popup-success">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--accent)/.16)] text-[hsl(var(--accent-foreground))]">
          <CheckCircle2 size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--eyebrow-text))]">Request received</p>
          <p className="mt-3 text-base leading-7 text-[hsl(var(--foreground))]" data-testid="text-callback-success-message">{success}</p>
        </div>
        <DialogFooter className="flex-row justify-start">
          <DialogClose asChild>
            <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]" data-testid="button-callback-success-close">
              Close
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogFooter>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5" data-testid="form-callback-popup" noValidate={false}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block min-w-0 space-y-1.5">
          <span className="text-xs font-semibold text-[hsl(var(--card-foreground))] sm:text-[13px]">{settings.callbackPopupNameLabel}</span>
          <input
            required
            minLength={2}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            className={callbackFieldClassName}
            data-testid="input-callback-name"
          />
        </label>
        <label className="block min-w-0 space-y-1.5">
          <span className="text-xs font-semibold text-[hsl(var(--card-foreground))] sm:text-[13px]">{settings.callbackPopupPhoneLabel}</span>
          <input
            required
            inputMode="tel"
            pattern="(?:\+91[\s-]?)?[6-9]\d{9}"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91 98765 43210"
            className={callbackFieldClassName}
            data-testid="input-callback-phone"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block min-w-0 space-y-1.5">
          <span className="text-xs font-semibold text-[hsl(var(--card-foreground))] sm:text-[13px]">{settings.callbackPopupCourseLabel}</span>
          <select
            value={form.course}
            onChange={(event) => update('course', event.target.value)}
            className={callbackFieldClassName}
            data-testid="select-callback-course"
          >
            <option value="">Select if you know</option>
            {settings.courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
          </select>
        </label>
        <label className="block min-w-0 space-y-1.5">
          <span className="text-xs font-semibold text-[hsl(var(--card-foreground))] sm:text-[13px]">{settings.callbackPopupEmailLabel}</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className={callbackFieldClassName}
            data-testid="input-callback-email"
          />
        </label>
      </div>
      <label className="block min-w-0 space-y-1.5">
        <span className="text-xs font-semibold text-[hsl(var(--card-foreground))] sm:text-[13px]">{settings.callbackPopupMessageLabel}</span>
        <textarea
          maxLength={2000}
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          className="min-h-[76px] max-h-36 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 py-2.5 text-sm leading-5 text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus-visible:border-[hsl(var(--ring))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring)/.25)]"
          data-testid="textarea-callback-message"
        />
      </label>
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] px-3.5 py-3 text-sm leading-5 text-[hsl(var(--destructive))]" role="alert" data-testid="state-callback-popup-error">
          <span>{error}</span>
          <button type="submit" className="inline-flex shrink-0 items-center gap-1 font-bold underline underline-offset-2" data-testid="button-callback-retry">
            <RotateCw size={14} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}
      <DialogFooter className="flex-col gap-3 pt-0.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
          <Clock3 size={14} className="shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
          No pressure. We will call during working hours.
        </p>
        <button type="submit" disabled={submit.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_22px_-14px_hsl(var(--primary)/.6)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" data-testid="button-callback-submit">
          {submit.isPending ? 'Sending request…' : settings.callbackPopupSubmitButtonLabel}
          {!submit.isPending && <ArrowRight size={17} aria-hidden="true" />}
        </button>
      </DialogFooter>
    </form>
  );
}

export function CallbackPopupGate() {
  const [location] = useLocation();
  const isPublicPath = isPublicSitePath(location);
  const siteSettingsQuery = useGetSiteSettings({
    query: {
      enabled: isPublicPath,
      queryKey: getGetSiteSettingsQueryKey(),
    },
  });
  const settingsQuery = useGetCallbackPopupSettings({
    query: {
      enabled: isPublicPath,
      queryKey: getGetCallbackPopupSettingsQueryKey(),
    },
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isPublicPath) {
      setOpen(false);
      return;
    }
    if (!settingsQuery.data?.callbackPopupEnabled) return;

    try {
      if (window.sessionStorage.getItem(CALLBACK_SESSION_KEY)) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(CALLBACK_SESSION_KEY, '1');
      } catch {
        return;
      }
      setOpen(true);
    }, safeDelay(settingsQuery.data.callbackPopupDelaySeconds) * 1000);

    return () => window.clearTimeout(timer);
  }, [isPublicPath, settingsQuery.data]);

  if (!isPublicPath || !settingsQuery.data?.callbackPopupEnabled) return null;

  const settings = settingsQuery.data;
  const siteSettings = siteSettingsQuery.data;
  const themeStyle = createPublicThemeStyle(
    siteSettings?.primaryColor ?? DEFAULT_PRIMARY_COLOR,
    siteSettings?.accentColor ?? DEFAULT_ACCENT_COLOR,
    siteSettings?.surfaceColor ?? DEFAULT_SURFACE_COLOR,
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        overlayClassName="bg-black/45 backdrop-blur-[3px]"
        closeButtonClassName="right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] opacity-100 shadow-sm hover:bg-[hsl(var(--primary-foreground)/.88)] focus:ring-[hsl(var(--ring))] focus:ring-offset-[hsl(var(--primary))] sm:right-4 sm:top-4"
        className="h-fit w-[92vw] max-w-[560px] max-h-[calc(100dvh-1.5rem)] gap-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 text-[hsl(var(--card-foreground))] shadow-2xl"
        style={themeStyle}
        data-testid="dialog-callback-popup"
      >
        <div className="relative overflow-hidden bg-[hsl(var(--primary))] px-5 pb-5 pt-5 pr-16 text-[hsl(var(--primary-foreground))] sm:px-7 sm:pb-6 sm:pt-6 sm:pr-20">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border-[14px] border-[hsl(var(--primary-foreground)/.08)]" aria-hidden="true" />
          <div className="relative">
            <p className="inline-flex items-center rounded-full border border-[var(--eyebrow-dark-border)] bg-[var(--eyebrow-dark-background)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--eyebrow-dark-text))]" data-testid="text-callback-eyebrow">{settings.callbackPopupEyebrow}</p>
            <DialogHeader className="mt-3 space-y-2 text-left">
              <DialogTitle className="max-w-[17ch] font-display text-[1.65rem] font-semibold leading-[1.05] tracking-[-.04em] text-[hsl(var(--primary-foreground))] sm:text-[1.9rem]" data-testid="text-callback-heading">{settings.callbackPopupHeading}</DialogTitle>
              <DialogDescription className="max-w-[54ch] text-[13px] leading-5 text-[hsl(var(--primary-foreground))]" data-testid="text-callback-description">{settings.callbackPopupDescription}</DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <CallbackPopupForm settings={settings} onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}