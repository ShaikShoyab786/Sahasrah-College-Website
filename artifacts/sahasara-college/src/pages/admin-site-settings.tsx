import { useEffect, useState } from 'react';
import { Check, ImagePlus, LockKeyhole, Palette } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSiteSettingsQueryKey, useGetSiteSettings, useUpdateSiteSettings, useUploadAdminImage } from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR, normalizeHexColor, THEME_PRESETS, type ThemePresetId } from '@/lib/public-theme';

const loginDefaults = {
  loginLeftEyebrow: 'ACADEMIC ADMINISTRATION',
  loginLeftHeading: 'Manage with',
  loginLeftHighlightedHeading: 'clarity and purpose.',
  loginLeftDescription: 'A secure workspace for managing Sahsrah Junior College operations, academic information, student records, and institutional updates.',
  loginLeftBottomText: 'Authorized administrators only · Internal use',
  loginBackgroundImageUrl: '',
  loginBackgroundImageAltText: 'Sahsrah Junior College academic administration workspace',
  loginRightEyebrow: 'ADMIN WORKSPACE',
  loginRightHeading: 'Welcome back.',
  loginRightDescription: "Sign in to access Sahsrah's administrative workspace.",
  loginEmailLabel: 'Official email address',
  loginPasswordLabel: 'Password',
  loginButtonLabel: 'Sign in →',
  loginSecurityNote: 'This workspace is restricted to authorized Sahsrah administrators.',
  loginBackLinkLabel: 'Back to website',
};

const empty = { collegeName: '', tagline: '', logoUrl: '', email: '', phone: '', address: '', primaryColor: DEFAULT_PRIMARY_COLOR, accentColor: DEFAULT_ACCENT_COLOR, surfaceColor: DEFAULT_SURFACE_COLOR, themePreset: 'sahsrah-blue-red' as ThemePresetId, footerText: '', ...loginDefaults };

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const query = useGetSiteSettings();
  const update = useUpdateSiteSettings();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState(empty);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
   useEffect(() => { if (query.data) setForm({ collegeName: query.data.collegeName, tagline: query.data.tagline, logoUrl: query.data.logoUrl ?? '', email: query.data.email, phone: query.data.phone, address: query.data.address, primaryColor: normalizeHexColor(query.data.primaryColor) ?? DEFAULT_PRIMARY_COLOR, accentColor: normalizeHexColor(query.data.accentColor) ?? DEFAULT_ACCENT_COLOR, surfaceColor: normalizeHexColor(query.data.surfaceColor) ?? DEFAULT_SURFACE_COLOR, themePreset: (query.data.themePreset as ThemePresetId) || 'custom', footerText: query.data.footerText, loginLeftEyebrow: query.data.loginLeftEyebrow || loginDefaults.loginLeftEyebrow, loginLeftHeading: query.data.loginLeftHeading || loginDefaults.loginLeftHeading, loginLeftHighlightedHeading: query.data.loginLeftHighlightedHeading || loginDefaults.loginLeftHighlightedHeading, loginLeftDescription: query.data.loginLeftDescription || loginDefaults.loginLeftDescription, loginLeftBottomText: query.data.loginLeftBottomText || loginDefaults.loginLeftBottomText, loginBackgroundImageUrl: query.data.loginBackgroundImageUrl ?? '', loginBackgroundImageAltText: query.data.loginBackgroundImageAltText || loginDefaults.loginBackgroundImageAltText, loginRightEyebrow: query.data.loginRightEyebrow || loginDefaults.loginRightEyebrow, loginRightHeading: query.data.loginRightHeading || loginDefaults.loginRightHeading, loginRightDescription: query.data.loginRightDescription || loginDefaults.loginRightDescription, loginEmailLabel: query.data.loginEmailLabel || loginDefaults.loginEmailLabel, loginPasswordLabel: query.data.loginPasswordLabel || loginDefaults.loginPasswordLabel, loginButtonLabel: query.data.loginButtonLabel || loginDefaults.loginButtonLabel, loginSecurityNote: query.data.loginSecurityNote || loginDefaults.loginSecurityNote, loginBackLinkLabel: query.data.loginBackLinkLabel || loginDefaults.loginBackLinkLabel }); }, [query.data]);
  const set = (key: keyof typeof empty, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setNotice(''); setError('');
    const primaryColor = normalizeHexColor(form.primaryColor);
    const accentColor = normalizeHexColor(form.accentColor);
    const surfaceColor = normalizeHexColor(form.surfaceColor);
    if (!primaryColor || !accentColor || !surfaceColor) {
      setError('Use valid hex colours for primary, accent, and surface, such as #022A6C, #CE0B11, and #F5F7FB.');
      return;
    }
     update.mutate({ data: { ...form, logoUrl: form.logoUrl || null, loginBackgroundImageUrl: form.loginBackgroundImageUrl || null, primaryColor, accentColor, surfaceColor, themePreset: form.themePreset || 'custom' } }, { onSuccess: (savedSettings) => { queryClient.setQueryData(getGetSiteSettingsQueryKey(), savedSettings); queryClient.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() }); setForm((current) => ({ ...current, primaryColor, accentColor, surfaceColor, loginBackgroundImageUrl: savedSettings.loginBackgroundImageUrl ?? '' })); setNotice('Identity and admin login content saved.'); }, onError: () => setError('We could not save these changes. Please try again.') });
  };
  const selectPreset = (preset: typeof THEME_PRESETS[number]) => setForm((current) => ({ ...current, themePreset: preset.id, primaryColor: preset.primary, accentColor: preset.accent, surfaceColor: preset.surface }));
  const useCustomTheme = () => setForm((current) => ({ ...current, themePreset: 'custom' }));
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
     upload.mutate({ data: { file, purpose: 'logo' } }, { onSuccess: (result) => { set('logoUrl', result.url); setNotice('Logo uploaded. Save identity to publish it.'); }, onError: () => setError('That image could not be uploaded. Try another file.') });
  };
   const handleLoginBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0]; if (!file) return;
     upload.mutate({ data: { file, purpose: 'login' } }, { onSuccess: (result) => { set('loginBackgroundImageUrl', result.url); setNotice('Login background uploaded. Save identity to publish it.'); }, onError: () => setError('That image could not be uploaded. Try another file.') });
   };
  if (query.isLoading) return <EditorLoading />;
  if (query.isError && !query.data) return <EditorError onRetry={() => query.refetch()} />;
  return <div className="animate-rise max-w-4xl"><PageIntro eyebrow="Site identity" title="Make the welcome feel like Sahsrah." description="These details travel across the website — in the header, contact area, and footer." />
    <form onSubmit={submit} className="mt-10 space-y-6">
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><SectionTitle icon={<Palette size={18} />} title="The essentials" description="The name and voice families meet first." /><div className="mt-7 grid gap-5 md:grid-cols-2"><Field id="collegeName" label="College name" value={form.collegeName} onChange={(e) => set('collegeName', e.target.value)} required placeholder="Sahsrah Junior College" /><Field id="tagline" label="Tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="A clear beginning for a remarkable future." /><div className="md:col-span-2"><Area id="footerText" label="Footer text" hint="Short and human" value={form.footerText} onChange={(e) => set('footerText', e.target.value)} placeholder="A public junior college for curious minds and purposeful lives." /></div></div></section>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><SectionTitle icon={<ImagePlus size={18} />} title="Logo" description="Use a square mark with a transparent or light background." /><div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">{form.logoUrl ? <img src={form.logoUrl} alt="Current college logo" className="h-full w-full object-cover" data-testid="img-settings-logo" /> : <span className="font-display text-3xl text-[hsl(var(--accent-foreground))]" data-testid="text-logo-empty">S</span>}</div><div><label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))]" data-testid="label-upload-logo"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleUpload} data-testid="input-upload-logo" />{upload.isPending ? 'Uploading…' : 'Upload a logo'}</label><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">PNG, JPG, or WebP · up to 5MB</p></div></div><div className="mt-6"><Field id="logoUrl" label="Or paste a logo URL" value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…" /></div></section>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><SectionTitle title="How families can reach you" description="Keep these precise — they are shown on every public page." /><div className="mt-7 grid gap-5 md:grid-cols-2"><Field id="email" label="Admissions email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="admissions@sahsrah.edu" /><Field id="phone" label="Phone number" value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="+91 40 2458 0176" /><div className="md:col-span-2"><Area id="address" label="Campus address" value={form.address} onChange={(e) => set('address', e.target.value)} required placeholder="18 Vidya Marg, Hyderabad, Telangana 500034" /></div></div></section>
       <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8">
         <SectionTitle icon={<Palette size={18} />} title="Available Themes" description="Choose a reusable colour system for the public site and admin dashboard." />
         <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {THEME_PRESETS.map((preset) => {
             const selected = form.themePreset === preset.id;
             return <button key={preset.id} type="button" onClick={() => selectPreset(preset)} aria-pressed={selected} className={`relative overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.2)] ${selected ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.07)] shadow-sm' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]'}`} data-testid={`theme-preset-${preset.id}`}>
               {selected && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Check size={15} strokeWidth={3} /></span>}
               <div className="flex h-20 overflow-hidden rounded-xl border border-black/10" style={{ background: preset.surface }}>
                 <div className="flex-1 p-3" style={{ background: preset.primary }}><span className="block h-2 w-16 rounded-full opacity-60" style={{ background: preset.surface }} /><span className="mt-2 block h-2 w-10 rounded-full opacity-40" style={{ background: preset.accent }} /></div>
                 <div className="flex w-1/3 items-end justify-end p-3" style={{ background: preset.accent }}><span className="h-5 w-5 rounded-full border-2" style={{ borderColor: preset.primary }} /></div>
               </div>
               <div className="mt-4 flex items-center gap-2">
                 {[preset.primary, preset.accent, preset.surface].map((color) => <span key={color} className="h-5 w-5 rounded-full border border-black/10" style={{ background: color }} aria-label={color} />)}
               </div>
               <h3 className="mt-3 text-sm font-bold text-[hsl(var(--primary))]">{preset.name}</h3>
               <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{preset.description}</p>
             </button>;
           })}
         </div>
         <button type="button" onClick={useCustomTheme} className={`mt-5 rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:border-[hsl(var(--accent))] ${form.themePreset === 'custom' ? 'border-[hsl(var(--accent))] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`} aria-pressed={form.themePreset === 'custom'} data-testid="button-custom-theme">Use custom colours</button>
         <details className="mt-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4" open={form.themePreset === 'custom'}>
           <summary className="cursor-pointer text-sm font-bold text-[hsl(var(--primary))]">Advanced Custom Theme</summary>
           <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Optional: adjust the three semantic theme colours. Contrast-aware foregrounds and supporting tokens are derived automatically.</p>
           <div className="mt-5 grid gap-5 sm:grid-cols-3"><ColorField id="primaryColor" label="Primary colour" value={form.primaryColor} onChange={(value) => { set('themePreset', 'custom'); set('primaryColor', value); }} /><ColorField id="accentColor" label="Accent colour" value={form.accentColor} onChange={(value) => { set('themePreset', 'custom'); set('accentColor', value); }} /><ColorField id="surfaceColor" label="Surface colour" value={form.surfaceColor} onChange={(value) => { set('themePreset', 'custom'); set('surfaceColor', value); }} /></div>
         </details>
       </section>
       <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8">
         <SectionTitle icon={<LockKeyhole size={18} />} title="Admin Login Appearance" description="Control the welcome content shown before an administrator signs in. Authentication and security behavior stay unchanged." />
         <div className="mt-7 space-y-8">
           <div>
             <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Left panel</p>
             <div className="mt-4 grid gap-5 md:grid-cols-2">
               <Field id="loginLeftEyebrow" label="Eyebrow text" value={form.loginLeftEyebrow} onChange={(e) => set('loginLeftEyebrow', e.target.value)} required />
               <Field id="loginLeftHeading" label="Main heading" value={form.loginLeftHeading} onChange={(e) => set('loginLeftHeading', e.target.value)} required />
               <Field id="loginLeftHighlightedHeading" label="Highlighted heading" value={form.loginLeftHighlightedHeading} onChange={(e) => set('loginLeftHighlightedHeading', e.target.value)} required />
               <Field id="loginLeftBottomText" label="Bottom text" value={form.loginLeftBottomText} onChange={(e) => set('loginLeftBottomText', e.target.value)} required />
               <div className="md:col-span-2"><Area id="loginLeftDescription" label="Description" value={form.loginLeftDescription} onChange={(e) => set('loginLeftDescription', e.target.value)} required /></div>
             </div>
           </div>
           <div>
             <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Background image</p>
             <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
               <div className="h-32 w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] sm:w-56">{form.loginBackgroundImageUrl ? <img src={form.loginBackgroundImageUrl} alt={form.loginBackgroundImageAltText} className="h-full w-full object-cover" data-testid="img-login-background" /> : <div className="grid h-full place-items-center px-4 text-center text-xs text-[hsl(var(--muted-foreground))]">No background image selected</div>}</div>
               <div>
                 <label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))]" data-testid="label-upload-login-background"><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleLoginBackgroundUpload} data-testid="input-upload-login-background" />{upload.isPending ? 'Uploading…' : 'Upload background image'}</label>
                 <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">PNG, JPG, or WebP · up to 5MB. The current image stays in place until you save a replacement.</p>
               </div>
             </div>
             <div className="mt-5 grid gap-5 md:grid-cols-2">
               <Field id="loginBackgroundImageUrl" label="Or paste an image URL" value={form.loginBackgroundImageUrl} onChange={(e) => set('loginBackgroundImageUrl', e.target.value)} placeholder="https://…" />
               <Field id="loginBackgroundImageAltText" label="Background image alt text" value={form.loginBackgroundImageAltText} onChange={(e) => set('loginBackgroundImageAltText', e.target.value)} required />
             </div>
           </div>
           <div>
             <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Right panel</p>
             <div className="mt-4 grid gap-5 md:grid-cols-2">
               <Field id="loginRightEyebrow" label="Eyebrow text" value={form.loginRightEyebrow} onChange={(e) => set('loginRightEyebrow', e.target.value)} required />
               <Field id="loginRightHeading" label="Main heading" value={form.loginRightHeading} onChange={(e) => set('loginRightHeading', e.target.value)} required />
               <div className="md:col-span-2"><Area id="loginRightDescription" label="Description" value={form.loginRightDescription} onChange={(e) => set('loginRightDescription', e.target.value)} required /></div>
               <Field id="loginEmailLabel" label="Email label" value={form.loginEmailLabel} onChange={(e) => set('loginEmailLabel', e.target.value)} required />
               <Field id="loginPasswordLabel" label="Password label" value={form.loginPasswordLabel} onChange={(e) => set('loginPasswordLabel', e.target.value)} required />
               <Field id="loginButtonLabel" label="Sign-in button label" value={form.loginButtonLabel} onChange={(e) => set('loginButtonLabel', e.target.value)} required />
               <Field id="loginBackLinkLabel" label="Back to website label" value={form.loginBackLinkLabel} onChange={(e) => set('loginBackLinkLabel', e.target.value)} required />
               <div className="md:col-span-2"><Area id="loginSecurityNote" label="Security note" value={form.loginSecurityNote} onChange={(e) => set('loginSecurityNote', e.target.value)} required /></div>
             </div>
           </div>
         </div>
       </section>
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