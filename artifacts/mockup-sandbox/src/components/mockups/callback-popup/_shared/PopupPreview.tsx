import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Clock3, RotateCw } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createPreviewThemeStyle,
  previewPalettes,
  type PreviewPalette,
} from './preview-theme';

type PopupPreviewProps = {
  variant: 'current' | 'compact';
  palette: keyof typeof previewPalettes;
};

type CallbackForm = {
  name: string;
  phone: string;
  course: string;
  email: string;
  message: string;
};

const initialForm: CallbackForm = {
  name: '',
  phone: '',
  course: '',
  email: '',
  message: '',
};

const settings = {
  eyebrow: 'A QUICK CALLBACK',
  heading: 'Would you like us to call you?',
  description: 'Share your details and our admissions team will get in touch.',
  nameLabel: 'Student or parent name',
  phoneLabel: 'Indian mobile number',
  courseLabel: 'Course of interest (optional)',
  emailLabel: 'Email address (optional)',
  messageLabel: 'What would you like to know? (optional)',
  submitButtonLabel: 'Request a callback',
  successMessage: 'Thank you. We have your request and will call during working hours.',
  courseOptions: ['MPC', 'BiPC', 'MPC + IIT-JEE', 'BiPC + NEET', 'MPC + EAMCET', 'NEET Foundation', 'Other'],
};

function PreviewField({
  label,
  compact,
  children,
}: {
  label: string;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={compact ? 'block min-w-0 space-y-1.5' : 'space-y-2'}>
      <span className={compact ? 'text-xs font-semibold text-[hsl(var(--card-foreground))] sm:text-[13px]' : 'text-sm font-semibold'}>{label}</span>
      {children}
    </label>
  );
}

const fieldClassName = 'h-11 w-full min-w-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus-visible:border-[hsl(var(--ring))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring)/.25)]';
const currentFieldClassName = 'h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none transition focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]';

function CallbackFormPreview({ compact }: { compact: boolean }) {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const update = (field: keyof CallbackForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess(settings.successMessage);
    setForm(initialForm);
  };

  if (success) {
    return (
      <div className={compact ? 'space-y-5' : 'space-y-7'} data-testid="state-callback-popup-success">
        <div className={compact ? 'grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--accent)/.16)] text-[hsl(var(--accent-foreground))]' : 'grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent)/.16)] text-[hsl(var(--accent-foreground))]'}>
          <CheckCircle2 size={compact ? 24 : 28} aria-hidden="true" />
        </div>
        <div>
          <p className={compact ? 'text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--eyebrow-text))]' : 'text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]'}>Request received</p>
          <p className={compact ? 'mt-3 text-base leading-7 text-[hsl(var(--foreground))]' : 'mt-4 text-lg leading-8 text-[hsl(var(--foreground))]'} data-testid="text-callback-success-message">{success}</p>
        </div>
        <DialogFooter className={compact ? 'flex-row justify-start' : 'flex-row justify-start gap-3'}>
          <DialogClose asChild>
            <button type="button" className={compact ? 'inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]' : 'inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5'}>
              Close <ArrowRight size={16} aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogFooter>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? 'space-y-3.5' : 'space-y-5'} data-testid="form-callback-popup">
      <div className={compact ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-5 sm:grid-cols-2'}>
        <PreviewField label={settings.nameLabel} compact={compact}>
          <input
            required
            minLength={2}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            className={compact ? fieldClassName : currentFieldClassName}
            data-testid="input-callback-name"
          />
        </PreviewField>
        <PreviewField label={settings.phoneLabel} compact={compact}>
          <input
            required
            inputMode="tel"
            pattern="(?:\+91[\s-]?)?[6-9]\d{9}"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91 98765 43210"
            className={compact ? fieldClassName : currentFieldClassName}
            data-testid="input-callback-phone"
          />
        </PreviewField>
      </div>

      <div className={compact ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-5 sm:grid-cols-2'}>
        <PreviewField label={settings.courseLabel} compact={compact}>
          <select
            value={form.course}
            onChange={(event) => update('course', event.target.value)}
            className={compact ? fieldClassName : currentFieldClassName}
            data-testid="select-callback-course"
          >
            <option value="">Select if you know</option>
            {settings.courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
          </select>
        </PreviewField>
        <PreviewField label={settings.emailLabel} compact={compact}>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className={compact ? fieldClassName : currentFieldClassName}
            data-testid="input-callback-email"
          />
        </PreviewField>
      </div>

      <PreviewField label={settings.messageLabel} compact={compact}>
        <textarea
          maxLength={2000}
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          className={compact
            ? 'min-h-[76px] max-h-36 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3.5 py-2.5 text-sm leading-5 text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus-visible:border-[hsl(var(--ring))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring)/.25)]'
            : 'min-h-24 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]'}
          data-testid="textarea-callback-message"
        />
      </PreviewField>

      {error && (
        <div className={compact
          ? 'flex items-start justify-between gap-3 rounded-xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] px-3.5 py-3 text-sm text-[hsl(var(--destructive))]'
          : 'flex items-start justify-between gap-4 rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm leading-6 text-[hsl(var(--destructive))]'} role="alert">
          <span>{error}</span>
          <button type="submit" className="inline-flex shrink-0 items-center gap-1 font-bold underline underline-offset-2">
            <RotateCw size={14} aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      <DialogFooter className={compact ? 'flex-col gap-3 pt-0.5 sm:flex-row sm:items-center sm:justify-between' : 'flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'}>
        <p className={compact ? 'flex items-center gap-2 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]' : 'flex items-start gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]'}>
          <Clock3 size={compact ? 14 : 15} className={compact ? 'shrink-0 text-[hsl(var(--primary))]' : 'mt-0.5 shrink-0 text-[hsl(var(--accent-foreground))]'} aria-hidden="true" />
          No pressure. We will call during working hours.
        </p>
        <button
          type="submit"
          className={compact
            ? 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_22px_-14px_hsl(var(--primary)/.6)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))] sm:w-auto'
            : 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5 sm:w-auto'}
          data-testid="button-callback-submit"
        >
          {settings.submitButtonLabel}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </DialogFooter>
    </form>
  );
}

function CompactHeader({ palette }: { palette: PreviewPalette }) {
  return (
    <div className="relative overflow-hidden bg-[hsl(var(--primary))] px-5 pb-5 pt-5 pr-16 text-[hsl(var(--primary-foreground))] sm:px-7 sm:pb-6 sm:pt-6 sm:pr-20">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border-[14px] border-[hsl(var(--primary-foreground)/.08)]" aria-hidden="true" />
      <div className="relative">
        <p className="inline-flex items-center rounded-full border border-[var(--eyebrow-dark-border)] bg-[var(--eyebrow-dark-background)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--eyebrow-dark-text))]" data-testid="text-callback-eyebrow">
          {settings.eyebrow}
        </p>
        <DialogHeader className="mt-3 space-y-2 text-left">
          <DialogTitle className="max-w-[17ch] font-display text-[1.65rem] font-semibold leading-[1.05] tracking-[-.04em] text-[hsl(var(--primary-foreground))] sm:text-[1.9rem]" data-testid="text-callback-heading">
            {settings.heading}
          </DialogTitle>
          <DialogDescription className="max-w-[54ch] text-[13px] leading-5 text-[hsl(var(--primary-foreground))]" data-testid="text-callback-description">
            {settings.description}
          </DialogDescription>
        </DialogHeader>
        <span className="sr-only">{palette.name} theme preview</span>
      </div>
    </div>
  );
}

export function PopupPreview({ variant, palette: paletteKey }: PopupPreviewProps) {
  const compact = variant === 'compact';
  const palette = previewPalettes[paletteKey];
  const themeStyle = compact ? createPreviewThemeStyle(palette) : undefined;

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-2 py-5 sm:px-8 sm:py-8"
      style={themeStyle}
    >
      <Dialog open>
        <DialogContent
          overlayClassName={compact ? 'bg-black/45 backdrop-blur-[3px]' : undefined}
          closeButtonClassName={compact ? 'right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] opacity-100 shadow-sm hover:bg-[hsl(var(--primary-foreground)/.88)] focus:ring-[hsl(var(--ring))] focus:ring-offset-[hsl(var(--primary))] sm:right-4 sm:top-4' : undefined}
          className={compact
            ? 'h-fit w-[92vw] max-w-[560px] max-h-[calc(100dvh-1.5rem)] gap-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 text-[hsl(var(--card-foreground))] shadow-2xl'
            : 'max-h-[85vh] max-w-2xl gap-0 overflow-x-hidden overflow-y-auto rounded-3xl border-[hsl(var(--accent)/.25)] bg-[hsl(var(--card))] p-0 shadow-2xl'}
          style={themeStyle}
          data-testid="dialog-callback-popup"
        >
          {compact ? (
            <CompactHeader palette={palette} />
          ) : (
            <div className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-8 pt-8 text-[hsl(var(--primary-foreground))] sm:px-10 sm:pb-9 sm:pt-10">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[22px] border-[hsl(var(--accent)/.16)]" aria-hidden="true" />
              <div className="relative max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[.22em] text-[hsl(var(--accent))]" data-testid="text-callback-eyebrow">{settings.eyebrow}</p>
                <DialogHeader className="mt-4 space-y-3 text-left">
                  <DialogTitle className="max-w-lg font-display text-3xl font-semibold leading-[1.05] tracking-[-.04em] text-[hsl(var(--primary-foreground))] sm:text-4xl" data-testid="text-callback-heading">{settings.heading}</DialogTitle>
                  <DialogDescription className="max-w-xl text-sm leading-7 text-[hsl(var(--primary-foreground)/.72)]" data-testid="text-callback-description">{settings.description}</DialogDescription>
                </DialogHeader>
              </div>
            </div>
          )}
          <div className={compact ? 'px-5 py-5 sm:px-7 sm:py-6' : 'px-6 pb-7 pt-7 sm:px-10 sm:pb-9'}>
            <CallbackFormPreview compact={compact} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}