import { useEffect, useState } from 'react';
import { ImagePlus, Palette } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSiteSettingsQueryKey, useGetSiteSettings, useUpdateSiteSettings, useUploadAdminImage } from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, normalizeHexColor } from '@/lib/public-theme';

const empty = { collegeName: '', tagline: '', logoUrl: '', email: '', phone: '', address: '', primaryColor: DEFAULT_PRIMARY_COLOR, accentColor: DEFAULT_ACCENT_COLOR, footerText: '' };

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const query = useGetSiteSettings();
  const update = useUpdateSiteSettings();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState(empty);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (query.data) setForm({ collegeName: query.data.collegeName, tagline: query.data.tagline, logoUrl: query.data.logoUrl ?? '', email: query.data.email, phone: query.data.phone, address: query.data.address, primaryColor: normalizeHexColor(query.data.primaryColor) ?? DEFAULT_PRIMARY_COLOR, accentColor: normalizeHexColor(query.data.accentColor) ?? DEFAULT_ACCENT_COLOR, footerText: query.data.footerText }); }, [query.data]);
  const set = (key: keyof typeof empty, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setNotice(''); setError('');
    const primaryColor = normalizeHexColor(form.primaryColor);
    const accentColor = normalizeHexColor(form.accentColor);
    if (!primaryColor || !accentColor) {
      setError('Use valid hex colours for both primary and accent, such as #102846 or #D6AD59.');
      return;
    }
    update.mutate({ data: { ...form, logoUrl: form.logoUrl || null, primaryColor, accentColor } }, { onSuccess: (savedSettings) => { queryClient.setQueryData(getGetSiteSettingsQueryKey(), savedSettings); queryClient.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() }); setForm((current) => ({ ...current, primaryColor, accentColor })); setNotice('Identity saved. The public site is up to date.'); }, onError: () => setError('We could not save these changes. Please try again.') });
  };
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    upload.mutate({ data: { file, purpose: 'logo' } }, { onSuccess: (result) => { set('logoUrl', result.url); setNotice('Logo uploaded. Save identity to publish it.'); }, onError: () => setError('That image could not be uploaded. Try another file.') });
  };
  if (query.isLoading) return <EditorLoading />;
  if (query.isError && !query.data) return <EditorError onRetry={() => query.refetch()} />;
  return <div className="animate-rise max-w-4xl"><PageIntro eyebrow="Site identity" title="Make the welcome feel like Sahsrah." description="These details travel across the website — in the header, contact area, and footer." />
    <form onSubmit={submit} className="mt-10 space-y-6">
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><SectionTitle icon={<Palette size={18} />} title="The essentials" description="The name and voice families meet first." /><div className="mt-7 grid gap-5 md:grid-cols-2"><Field id="collegeName" label="College name" value={form.collegeName} onChange={(e) => set('collegeName', e.target.value)} required placeholder="Sahsrah Junior College" /><Field id="tagline" label="Tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="A clear beginning for a remarkable future." /><div className="md:col-span-2"><Area id="footerText" label="Footer text" hint="Short and human" value={form.footerText} onChange={(e) => set('footerText', e.target.value)} placeholder="A public junior college for curious minds and purposeful lives." /></div></div></section>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><SectionTitle icon={<ImagePlus size={18} />} title="Logo" description="Use a square mark with a transparent or light background." /><div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">{form.logoUrl ? <img src={form.logoUrl} alt="Current college logo" className="h-full w-full object-cover" data-testid="img-settings-logo" /> : <span className="font-display text-3xl text-[hsl(var(--accent-foreground))]" data-testid="text-logo-empty">S</span>}</div><div><label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))]" data-testid="label-upload-logo"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleUpload} data-testid="input-upload-logo" />{upload.isPending ? 'Uploading…' : 'Upload a logo'}</label><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">PNG, JPG, or WebP · up to 5MB</p></div></div><div className="mt-6"><Field id="logoUrl" label="Or paste a logo URL" value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…" /></div></section>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><SectionTitle title="How families can reach you" description="Keep these precise — they are shown on every public page." /><div className="mt-7 grid gap-5 md:grid-cols-2"><Field id="email" label="Admissions email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="admissions@sahsrah.edu" /><Field id="phone" label="Phone number" value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="+91 40 2458 0176" /><div className="md:col-span-2"><Area id="address" label="Campus address" value={form.address} onChange={(e) => set('address', e.target.value)} required placeholder="18 Vidya Marg, Hyderabad, Telangana 500034" /></div></div></section>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><SectionTitle title="Colour cues" description="A little consistency goes a long way." /><div className="mt-7 grid gap-5 sm:grid-cols-2"><ColorField id="primaryColor" label="Primary colour" value={form.primaryColor} onChange={(value) => set('primaryColor', value)} /><ColorField id="accentColor" label="Accent colour" value={form.accentColor} onChange={(value) => set('accentColor', value)} /></div></section>
      {error && <p className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" data-testid="status-settings-error">{error}</p>}{notice && <p className="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" data-testid="status-settings-success">{notice}</p>}<div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-settings">Save identity</SaveButton></div>
    </form>
  </div>;
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{eyebrow}</p><h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))]" data-testid="text-editor-title">{title}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p></div>; }
function SectionTitle({ icon, title, description }: { icon?: React.ReactNode; title: string; description: string }) { return <div className="flex items-start gap-3">{icon && <div className="mt-0.5 text-[hsl(var(--accent-foreground))]">{icon}</div>}<div><h2 className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{title}</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p></div></div>; }
function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const pickerValue = normalizeHexColor(value) ?? '#000000';
  return <label className="block space-y-2 text-sm font-semibold" htmlFor={id}>{label}<div className="flex h-12 items-center gap-3 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3"><input id={id} type="color" value={pickerValue} onChange={(event) => onChange(event.target.value.toUpperCase())} className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" data-testid={`input-${id}`} /><input value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => { const normalized = normalizeHexColor(value); if (normalized) onChange(normalized); }} className="w-full bg-transparent text-sm font-semibold uppercase outline-none" pattern="^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$" aria-invalid={normalizeHexColor(value) === null} data-testid={`text-${id}`} /></div></label>;
}
function EditorLoading() { return <div className="animate-pulse space-y-6"><div className="h-36 max-w-xl rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-96 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-64 rounded-2xl bg-[hsl(var(--muted))]" /></div>; }
function EditorError({ onRetry }: { onRetry: () => void }) { return <div className="rounded-2xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] p-8"><h2 className="font-display text-3xl font-semibold">The editor could not load.</h2><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Check your connection and try once more.</p><button onClick={onRetry} className="mt-6 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-settings">Try again</button></div>; }