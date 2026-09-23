import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, hint, error, id, ...props }: FieldProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="flex items-center justify-between text-sm font-semibold text-[hsl(var(--foreground))]">
        {label}
        {hint && <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">{hint}</span>}
      </span>
      <input id={id} {...props} className={`h-12 w-full rounded-xl border bg-[hsl(var(--card))] px-4 text-sm text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.16)] ${error ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--input))]'}`} />
      {error && <span className="block text-xs text-[hsl(var(--destructive))]">{error}</span>}
    </label>
  );
}

type AreaProps = {
  label: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Area({ label, hint, id, ...props }: AreaProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="flex items-center justify-between text-sm font-semibold text-[hsl(var(--foreground))]">
        {label}
        {hint && <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">{hint}</span>}
      </span>
      <textarea id={id} {...props} className="min-h-32 w-full resize-y rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-3 text-sm leading-6 text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.16)]" />
    </label>
  );
}

export function SaveButton({ children, pending, testId = 'button-save' }: { children: string; pending?: boolean; testId?: string }) {
  return (
    <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:bg-[hsl(var(--primary)/.9)] disabled:cursor-not-allowed disabled:opacity-60" data-testid={testId}>
      {pending ? 'Saving changes…' : children}
    </button>
  );
}