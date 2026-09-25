import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Clock3, RotateCw } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  getGetCallbackPopupSettingsQueryKey,
  useGetCallbackPopupSettings,
  useSubmitContactEnquiry,
  type CallbackPopupSettings,
} from '@workspace/api-client-react';
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
      <div className="space-y-7" data-testid="state-callback-popup-success">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent)/.16)] text-[hsl(var(--accent-foreground))]">
          <CheckCircle2 size={28} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Request received</p>
          <p className="mt-4 text-lg leading-8 text-[hsl(var(--foreground))]" data-testid="text-callback-success-message">{success}</p>
        </div>
        <DialogFooter className="flex-row justify-start gap-3">
          <DialogClose asChild>
            <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid="button-callback-success-close">
              Close
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogFooter>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-callback-popup" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold">{settings.callbackPopupNameLabel}</span>
          <input
            required
            minLength={2}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none transition focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]"
            data-testid="input-callback-name"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">{settings.callbackPopupPhoneLabel}</span>
          <input
            required
            inputMode="tel"
            pattern="(?:\+91[\s-]?)?[6-9]\d{9}"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91 98765 43210"
            className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none transition focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]"
            data-testid="input-callback-phone"
          />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold">{settings.callbackPopupCourseLabel}</span>
          <select
            value={form.course}
            onChange={(event) => update('course', event.target.value)}
            className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none transition focus:border-[hsl(var(--accent))]"
            data-testid="select-callback-course"
          >
            <option value="">Select if you know</option>
            {settings.courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold">{settings.callbackPopupEmailLabel}</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none transition focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]"
            data-testid="input-callback-email"
          />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">{settings.callbackPopupMessageLabel}</span>
        <textarea
          maxLength={2000}
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          className="min-h-24 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]"
          data-testid="textarea-callback-message"
        />
      </label>
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm leading-6 text-[hsl(var(--destructive))]" role="alert" data-testid="state-callback-popup-error">
          <span>{error}</span>
          <button type="submit" className="inline-flex shrink-0 items-center gap-1 font-bold underline underline-offset-2" data-testid="button-callback-retry">
            <RotateCw size={14} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}
      <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          <Clock3 size={15} className="mt-0.5 shrink-0 text-[hsl(var(--accent-foreground))]" aria-hidden="true" />
          No pressure. We will call during working hours.
        </p>
        <button type="submit" disabled={submit.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" data-testid="button-callback-submit">
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl gap-0 overflow-x-hidden rounded-3xl border-[hsl(var(--accent)/.25)] bg-[hsl(var(--card))] p-0 shadow-2xl" data-testid="dialog-callback-popup">
        <div className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-8 pt-8 text-[hsl(var(--primary-foreground))] sm:px-10 sm:pb-9 sm:pt-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[22px] border-[hsl(var(--accent)/.16)]" aria-hidden="true" />
          <div className="relative max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[hsl(var(--accent))]" data-testid="text-callback-eyebrow">{settings.callbackPopupEyebrow}</p>
            <DialogHeader className="mt-4 space-y-3 text-left">
              <DialogTitle className="max-w-lg font-display text-3xl font-semibold leading-[1.05] tracking-[-.04em] text-[hsl(var(--primary-foreground))] sm:text-4xl" data-testid="text-callback-heading">{settings.callbackPopupHeading}</DialogTitle>
              <DialogDescription className="max-w-xl text-sm leading-7 text-[hsl(var(--primary-foreground)/.72)]" data-testid="text-callback-description">{settings.callbackPopupDescription}</DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <div className="px-6 pb-7 pt-7 sm:px-10 sm:pb-9">
          <CallbackPopupForm settings={settings} onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}