import { useState, type FormEvent } from 'react';
import { Clock3, MapPin, MessageCircle, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useGetContactSettings, useGetSiteSettings, useSubmitContactEnquiry, type ContactSettings } from '@workspace/api-client-react';
import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
import { createPublicThemeStyle, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, DEFAULT_SURFACE_COLOR } from '@/lib/public-theme';

const fallbackContact: ContactSettings = {
  id: 'fallback-contact',
  eyebrow: 'CONTACT SAHSRAH',
  heading: 'Let’s plan the right next step.',
  description: 'Speak with our admissions team about courses, campus visits, and a focused start for your student.',
  formHeading: 'Start a conversation',
  formDescription: 'Share a few details and our admissions team will continue the conversation on WhatsApp.',
  responseTimeMessage: 'We usually respond during working hours.',
  mainEmail: 'admissions@sahsrah.edu',
  primaryPhone: '+91 40 2458 0176',
  additionalPhones: [],
  whatsappNumber: '+91 40 2458 0176',
  address: '18 Vidya Marg, Hyderabad, Telangana 500034',
  workingHours: 'Monday–Saturday, 9:00–16:30',
  mapEmbedUrl: null,
  mapLabel: 'Open the campus location in Maps',
  logoUrl: null,
  socialLinks: [],
  courseOptions: ['MPC', 'BiPC'],
  nameLabel: 'Student or parent name',
  phoneLabel: 'Indian mobile number',
  courseLabel: 'Course of interest',
  emailLabel: 'Email address (optional)',
  messageLabel: 'Message (optional)',
  submitButtonLabel: 'Send enquiry on WhatsApp',
  successMessage: 'Thanks — your enquiry has reached our admissions team on WhatsApp.',
  prospectusButtonLabel: 'Request the prospectus',
  prospectusButtonHref: '/contact',
  campusVisitButtonLabel: 'Plan a campus visit',
  campusVisitButtonHref: '/contact',
  isVisible: true,
  updatedAt: new Date().toISOString(),
};

function errorMessage(error: unknown) {
  const value = error as { body?: { error?: string }; message?: string } | undefined;
  return value?.body?.error || value?.message || 'WhatsApp delivery failed. Please try again later.';
}

export default function Contact() {
  const settingsQuery = useGetSiteSettings();
  const contactQuery = useGetContactSettings();
  const submit = useSubmitContactEnquiry();
  const settings = settingsQuery.data;
  const contact = contactQuery.data ?? fallbackContact;
  const [form, setForm] = useState({ name: '', phone: '', course: '', email: '', message: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    submit.mutate({ data: { name: form.name.trim(), phone: form.phone.trim(), course: form.course, email: form.email.trim() || undefined, message: form.message.trim() || undefined } }, {
      onSuccess: (result) => {
        if (!result.accepted) {
          setError('WhatsApp delivery was not accepted. Please try again later.');
          return;
        }
        setSuccess(result.message || contact.successMessage);
        setForm({ name: '', phone: '', course: '', email: '', message: '' });
      },
      onError: (requestError) => setError(errorMessage(requestError)),
    });
  };

  const primaryColor = settings?.primaryColor || DEFAULT_PRIMARY_COLOR;
  const accentColor = settings?.accentColor || DEFAULT_ACCENT_COLOR;
  const surfaceColor = settings?.surfaceColor || DEFAULT_SURFACE_COLOR;
  const publicSettings = settings ?? {
    collegeName: 'Sahsrah Junior College',
    tagline: 'Your College Tagline',
    logoUrl: null,
    email: contact.mainEmail,
    phone: contact.primaryPhone,
    address: contact.address,
    footerText: 'A public junior college for curious minds and purposeful lives.',
  };

  return (
    <div className="paper-grain min-h-screen overflow-hidden bg-[hsl(var(--background))]" style={createPublicThemeStyle(primaryColor, accentColor, surfaceColor)}>
      <PublicHeader settings={{ collegeName: publicSettings.collegeName, tagline: publicSettings.tagline, logoUrl: publicSettings.logoUrl }} activePage="contact" />
      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 pb-20 pt-36 text-white lg:px-10 lg:pb-28 lg:pt-44">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[hsl(var(--accent)/.18)] blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-[hsl(var(--accent))]">{contact.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] md:text-7xl" data-testid="text-contact-heading">{contact.heading}</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 md:text-lg">{contact.description}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[.78fr_1.22fr] lg:px-10 lg:py-24">
          <aside className="space-y-5">
            <div className="rounded-3xl bg-[hsl(var(--primary))] p-7 text-white shadow-xl md:p-9">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">Admissions desk</p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight">A direct answer is one message away.</h2>
              <div className="mt-8 space-y-5 border-t border-white/15 pt-7 text-sm leading-6 text-white/75">
                <a href={`tel:${contact.primaryPhone.replace(/[^\d+]/g, '')}`} className="flex gap-3 hover:text-white"><Phone size={18} className="mt-1 shrink-0 text-[hsl(var(--accent))]" />{contact.primaryPhone}</a>
                <a href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white"><MessageCircle size={18} className="mt-1 shrink-0 text-[hsl(var(--accent))]" />WhatsApp: {contact.whatsappNumber}</a>
                <a href={`mailto:${contact.mainEmail}`} className="flex gap-3 hover:text-white"><Mail size={18} className="mt-1 shrink-0 text-[hsl(var(--accent))]" />{contact.mainEmail}</a>
                <div className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0 text-[hsl(var(--accent))]" /><span>{contact.address}</span></div>
                <div className="flex gap-3"><Clock3 size={18} className="mt-1 shrink-0 text-[hsl(var(--accent))]" /><span>{contact.workingHours}</span></div>
              </div>
            </div>
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 md:p-9">
              <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">{contact.responseTimeMessage}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={contact.prospectusButtonHref} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))] hover:border-[hsl(var(--accent))]">{contact.prospectusButtonLabel}<ArrowRight size={15} /></a>
                <a href={contact.campusVisitButtonHref} className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))] hover:-translate-y-0.5">{contact.campusVisitButtonLabel}<ArrowRight size={15} /></a>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm md:p-9">
            <h2 className="font-display text-3xl font-semibold tracking-[-.03em] text-[hsl(var(--primary))]">{contact.formHeading}</h2>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{contact.formDescription}</p>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2"><span className="text-sm font-semibold">{contact.nameLabel}</span><input required minLength={2} value={form.name} onChange={(event) => update('name', event.target.value)} className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]" /></label>
                <label className="space-y-2"><span className="text-sm font-semibold">{contact.phoneLabel}</span><input required inputMode="tel" pattern="(?:\+91[\s-]?)?[6-9]\d{9}" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+91 98765 43210" className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]" /></label>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2"><span className="text-sm font-semibold">{contact.courseLabel}</span><select required value={form.course} onChange={(event) => update('course', event.target.value)} className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:border-[hsl(var(--accent))]"><option value="">Choose a course</option>{contact.courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}</select></label>
                <label className="space-y-2"><span className="text-sm font-semibold">{contact.emailLabel}</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]" /></label>
              </div>
              <label className="block space-y-2"><span className="text-sm font-semibold">{contact.messageLabel}</span><textarea maxLength={2000} value={form.message} onChange={(event) => update('message', event.target.value)} className="min-h-32 w-full resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm leading-6 outline-none focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/.15)]" /></label>
              {error && <p role="alert" className="rounded-xl border border-red-700/20 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" data-testid="text-contact-error">{error}</p>}
              {success && <p role="status" className="flex gap-2 rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800" data-testid="text-contact-success"><CheckCircle2 size={18} className="mt-1 shrink-0" />{success}</p>}
              <button type="submit" disabled={submit.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{submit.isPending ? 'Sending enquiry…' : contact.submitButtonLabel}<MessageCircle size={17} /></button>
              <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">Your enquiry is sent only to the configured primary WhatsApp number. Your email is optional and is not used for notifications.</p>
            </form>
          </section>
        </section>
        {contact.mapEmbedUrl && <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10 lg:pb-24"><iframe title={contact.mapLabel} src={contact.mapEmbedUrl} className="h-72 w-full rounded-3xl border-0 grayscale md:h-96" loading="lazy" /></section>}
      </main>
      <PublicFooter settings={{ ...publicSettings, footerText: publicSettings.footerText || 'A public junior college for curious minds and purposeful lives.' }} />
    </div>
  );
}