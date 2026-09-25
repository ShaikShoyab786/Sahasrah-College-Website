import { useEffect, useState, type FormEvent } from 'react';
import { Check, MessageCircle, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCallbackPopupSettingsQueryKey,
  getGetAdminContactEnquiriesQueryKey,
  getGetAdminContactSettingsQueryKey,
  getGetContactSettingsQueryKey,
  useGetAdminContactEnquiries,
  useGetAdminContactSettings,
  useDeleteAdminContactEnquiry,
  useUpdateAdminContactEnquiry,
  useUpdateContactSettings,
  type ContactEnquiry,
  type ContactSettingsInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError, SaveStatus } from '@/pages/admin-about-hero';

const defaultCourseOptions = [
  'MPC',
  'BiPC',
  'MPC + IIT-JEE',
  'BiPC + NEET',
  'MPC + EAMCET',
  'NEET Foundation',
  'Other',
];

const emptyForm: ContactSettingsInput = {
  eyebrow: 'CONTACT SAHSRAH',
  heading: 'Let’s plan the right next step.',
  description: 'Speak with our admissions team about courses, campus visits, and a focused start for your student.',
  formHeading: 'Start a conversation',
  formDescription: 'Share a few details and our admissions team will review your enquiry.',
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
  courseOptions: [...defaultCourseOptions],
  nameLabel: 'Student or parent name',
  phoneLabel: 'Indian mobile number',
  courseLabel: 'Course of interest',
  emailLabel: 'Email address (optional)',
  messageLabel: 'Message (optional)',
  submitButtonLabel: 'Send enquiry',
  successMessage: 'Thank you. Your enquiry has been received.',
  prospectusButtonLabel: 'Request the prospectus',
  prospectusButtonHref: '/contact',
  campusVisitButtonLabel: 'Plan a campus visit',
  campusVisitButtonHref: '/contact',
  callbackPopupEnabled: true,
  callbackPopupDelaySeconds: 7,
  callbackPopupEyebrow: 'A QUIET NEXT STEP',
  callbackPopupHeading: 'Would a short call help you decide?',
  callbackPopupDescription: 'Share your number and a member of our admissions team will call during working hours. Ask what you need, then take the time you need.',
  callbackPopupNameLabel: 'Student or parent name',
  callbackPopupPhoneLabel: 'Indian mobile number',
  callbackPopupCourseLabel: 'Course of interest (optional)',
  callbackPopupEmailLabel: 'Email address (optional)',
  callbackPopupMessageLabel: 'What would you like to understand?',
  callbackPopupSubmitButtonLabel: 'Request a callback',
  callbackPopupSuccessMessage: 'Thank you. We have your request and will call during working hours.',
  isVisible: true,
};

function lines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

function courseOptionLines(value: string) {
  const seen = new Set<string>();
  return value.split(/\r?\n/).map((item) => item.trim()).filter((item) => {
    const key = item.toLowerCase();
    if (!item || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function links(value: string) {
  return lines(value).map((item) => {
    const [label, ...href] = item.split('|');
    return { label: label.trim(), href: href.join('|').trim() };
  }).filter((item) => item.label && item.href);
}

export function AdminContact() {
  const query = useGetAdminContactSettings();
  const update = useUpdateContactSettings();
  const client = useQueryClient();
  const [form, setForm] = useState<ContactSettingsInput>(emptyForm);
  const [additionalPhonesText, setAdditionalPhonesText] = useState('');
  const [courseOptionsText, setCourseOptionsText] = useState(defaultCourseOptions.join('\n'));
  const [socialLinksText, setSocialLinksText] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.data) return;
    const { id: _id, updatedAt: _updatedAt, ...data } = query.data;
    setForm(data);
    setAdditionalPhonesText(data.additionalPhones.join('\n'));
    setCourseOptionsText(data.courseOptions.join('\n'));
    setSocialLinksText(data.socialLinks.map((item) => `${item.label} | ${item.href}`).join('\n'));
  }, [query.data]);

  const set = <K extends keyof ContactSettingsInput>(key: K, value: ContactSettingsInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    setError('');
    const callbackDelay = Number(form.callbackPopupDelaySeconds);
    if (!Number.isInteger(callbackDelay) || callbackDelay < 5 || callbackDelay > 10) {
      setError('Callback popup delay must be a whole number between 5 and 10 seconds.');
      return;
    }
    update.mutate({ data: { ...form, additionalPhones: lines(additionalPhonesText), courseOptions: courseOptionLines(courseOptionsText), socialLinks: links(socialLinksText), mapEmbedUrl: form.mapEmbedUrl || null, logoUrl: form.logoUrl || null } }, {
      onSuccess: (saved) => {
        client.setQueryData(getGetAdminContactSettingsQueryKey(), saved);
        client.invalidateQueries({ queryKey: getGetContactSettingsQueryKey() });
        client.invalidateQueries({ queryKey: getGetCallbackPopupSettingsQueryKey() });
        setNotice('Contact settings saved.');
      },
      onError: () => setError('We could not save Contact settings. Check the required fields and try again.'),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;

  return (
    <EditorFrame eyebrow="Pages / Contact" title="Make it easy to start a conversation." description="Own the Contact page here. Footer Details and Site Identity remain separate, so saving this page will not overwrite shared footer values." previewHref="/contact">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard title="Page introduction" description="This copy appears above the contact details and enquiry form.">
          <div className="space-y-4"><Field label="Eyebrow" value={form.eyebrow} onChange={(event) => set('eyebrow', event.target.value)} required /><Field label="Heading" value={form.heading} onChange={(event) => set('heading', event.target.value)} required /><Area label="Description" value={form.description} onChange={(event) => set('description', event.target.value)} required /></div>
        </EditorCard>
        <EditorCard icon={<Phone size={18} />} title="Contact details" description="These values belong to the Contact page and are shown to visitors.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Main contact email" type="email" value={form.mainEmail} onChange={(event) => set('mainEmail', event.target.value)} required hint="Displayed only; no email notification is sent" />
            <Field label="Primary phone" value={form.primaryPhone} onChange={(event) => set('primaryPhone', event.target.value)} required />
            <Field label="WhatsApp contact number" value={form.whatsappNumber} onChange={(event) => set('whatsappNumber', event.target.value)} required hint="Shown as a direct contact option on the Contact page" />
            <Field label="Additional phone numbers" value={additionalPhonesText} onChange={(event) => setAdditionalPhonesText(event.target.value)} hint="One per line" />
            <div className="md:col-span-2"><Area label="Address" value={form.address} onChange={(event) => set('address', event.target.value)} required /></div>
            <Field label="Working hours" value={form.workingHours} onChange={(event) => set('workingHours', event.target.value)} required />
            <Field label="Map embed URL" value={form.mapEmbedUrl ?? ''} onChange={(event) => set('mapEmbedUrl', event.target.value || null)} placeholder="https://www.google.com/maps/embed?pb=…" />
            <Field label="Map link label" value={form.mapLabel} onChange={(event) => set('mapLabel', event.target.value)} required />
            <Field label="Logo URL" value={form.logoUrl ?? ''} onChange={(event) => set('logoUrl', event.target.value || null)} />
            <div className="md:col-span-2"><Area label="Social links" value={socialLinksText} onChange={(event) => setSocialLinksText(event.target.value)} hint="One per line: Instagram | https://…" /></div>
          </div>
        </EditorCard>
        <EditorCard icon={<MessageCircle size={18} />} title="Enquiry form" description="Keep the required name, Indian mobile number, and course fields. Email and message remain optional.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Form heading" value={form.formHeading} onChange={(event) => set('formHeading', event.target.value)} required />
            <Field label="Submit button label" value={form.submitButtonLabel} onChange={(event) => set('submitButtonLabel', event.target.value)} required />
            <div className="md:col-span-2"><Area label="Form description" value={form.formDescription} onChange={(event) => set('formDescription', event.target.value)} required /></div>
            <Field label="Name field label" value={form.nameLabel} onChange={(event) => set('nameLabel', event.target.value)} required />
            <Field label="Mobile field label" value={form.phoneLabel} onChange={(event) => set('phoneLabel', event.target.value)} required />
            <Field label="Course field label" value={form.courseLabel} onChange={(event) => set('courseLabel', event.target.value)} required />
            <Field label="Email field label" value={form.emailLabel} onChange={(event) => set('emailLabel', event.target.value)} required />
            <Field label="Message field label" value={form.messageLabel} onChange={(event) => set('messageLabel', event.target.value)} required />
            <Area label="Course options" value={courseOptionsText} onChange={(event) => setCourseOptionsText(event.target.value)} hint="Enter one course option per line." rows={8} required />
            <Field label="Response-time message" value={form.responseTimeMessage} onChange={(event) => set('responseTimeMessage', event.target.value)} required />
            <div className="md:col-span-2"><Area label="Success message" value={form.successMessage} onChange={(event) => set('successMessage', event.target.value)} required /></div>
          </div>
        </EditorCard>
        <EditorCard title="Contact CTAs" description="Use /contact or another configured destination.">
          <div className="grid gap-5 md:grid-cols-2"><Field label="Prospectus button label" value={form.prospectusButtonLabel} onChange={(event) => set('prospectusButtonLabel', event.target.value)} required /><Field label="Prospectus button link" value={form.prospectusButtonHref} onChange={(event) => set('prospectusButtonHref', event.target.value)} required /><Field label="Campus visit button label" value={form.campusVisitButtonLabel} onChange={(event) => set('campusVisitButtonLabel', event.target.value)} required /><Field label="Campus visit button link" value={form.campusVisitButtonHref} onChange={(event) => set('campusVisitButtonHref', event.target.value)} required /></div>
        </EditorCard>
         <EditorCard icon={<MessageCircle size={18} />} title="Callback popup" description="Invite a brief admissions conversation without pressure. It uses the course options above, and course selection stays optional for visitors.">
           <div className="grid gap-5 md:grid-cols-2">
             <label className="flex items-start gap-3 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-input-background))] p-4 text-sm font-semibold text-[hsl(var(--admin-text))] md:col-span-2">
               <input type="checkbox" checked={form.callbackPopupEnabled} onChange={(event) => set('callbackPopupEnabled', event.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(var(--admin-focus))]" data-testid="input-callback-popup-enabled" />
               <span><span className="block">Show the callback popup on public pages</span><span className="mt-1 block text-xs font-normal text-[hsl(var(--admin-text-muted))]">It appears once per browser session after the configured delay.</span></span>
             </label>
             <Field id="callback-popup-delay" label="Delay before showing" type="number" min={5} max={10} step={1} value={form.callbackPopupDelaySeconds} onChange={(event) => set('callbackPopupDelaySeconds', Number(event.target.value))} hint="5–10 seconds" required data-testid="input-callback-popup-delay" />
             <Field id="callback-popup-eyebrow" label="Eyebrow" value={form.callbackPopupEyebrow} onChange={(event) => set('callbackPopupEyebrow', event.target.value)} required data-testid="input-callback-popup-eyebrow" />
             <Field id="callback-popup-heading" label="Heading" value={form.callbackPopupHeading} onChange={(event) => set('callbackPopupHeading', event.target.value)} required data-testid="input-callback-popup-heading" />
             <Field id="callback-popup-submit" label="Submit button label" value={form.callbackPopupSubmitButtonLabel} onChange={(event) => set('callbackPopupSubmitButtonLabel', event.target.value)} required data-testid="input-callback-popup-submit-label" />
             <div className="md:col-span-2"><Area id="callback-popup-description" label="Description" value={form.callbackPopupDescription} onChange={(event) => set('callbackPopupDescription', event.target.value)} required data-testid="textarea-callback-popup-description" /></div>
             <Field id="callback-popup-name-label" label="Name field label" value={form.callbackPopupNameLabel} onChange={(event) => set('callbackPopupNameLabel', event.target.value)} required data-testid="input-callback-popup-name-label" />
             <Field id="callback-popup-phone-label" label="Phone field label" value={form.callbackPopupPhoneLabel} onChange={(event) => set('callbackPopupPhoneLabel', event.target.value)} required data-testid="input-callback-popup-phone-label" />
             <Field id="callback-popup-course-label" label="Course field label" value={form.callbackPopupCourseLabel} onChange={(event) => set('callbackPopupCourseLabel', event.target.value)} required data-testid="input-callback-popup-course-label" />
             <Field id="callback-popup-email-label" label="Email field label" value={form.callbackPopupEmailLabel} onChange={(event) => set('callbackPopupEmailLabel', event.target.value)} required data-testid="input-callback-popup-email-label" />
             <Field id="callback-popup-message-label" label="Message field label" value={form.callbackPopupMessageLabel} onChange={(event) => set('callbackPopupMessageLabel', event.target.value)} required data-testid="input-callback-popup-message-label" />
             <div className="md:col-span-2"><Area id="callback-popup-success" label="Success message" value={form.callbackPopupSuccessMessage} onChange={(event) => set('callbackPopupSuccessMessage', event.target.value)} required data-testid="textarea-callback-popup-success" /></div>
           </div>
         </EditorCard>
        <label className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm font-semibold"><input type="checkbox" checked={form.isVisible} onChange={(event) => set('isVisible', event.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(var(--accent))]" /> Show the Contact page publicly</label>
        <SaveStatus error={error} notice={notice} />
        <div className="flex justify-end"><SaveButton pending={update.isPending}>Save Contact page</SaveButton></div>
      </form>
    </EditorFrame>
  );
}

export function AdminContactEnquiries() {
  const query = useGetAdminContactEnquiries();
  const client = useQueryClient();
  const update = useUpdateAdminContactEnquiry();
  const remove = useDeleteAdminContactEnquiry();
  const [error, setError] = useState('');
  const save = (item: ContactEnquiry, patch: { contacted: boolean; resolved: boolean }) => {
    setError('');
    update.mutate({ id: item.id, data: patch }, {
      onSuccess: (saved) => client.setQueryData(getGetAdminContactEnquiriesQueryKey(), (current: ContactEnquiry[] | undefined) => current?.map((entry) => entry.id === saved.id ? saved : entry)),
      onError: () => setError('We could not update that enquiry. Please try again.'),
    });
  };
  const deleteEnquiry = (item: ContactEnquiry) => {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    setError('');
    remove.mutate({ id: item.id }, {
      onSuccess: () => client.setQueryData(getGetAdminContactEnquiriesQueryKey(), (current: ContactEnquiry[] | undefined) => current?.filter((entry) => entry.id !== item.id)),
      onError: () => setError('We could not delete that enquiry. Please try again.'),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !query.data) return <LoadError onRetry={() => query.refetch()} />;
  return (
    <EditorFrame eyebrow="Dashboard / Enquiries" title="Review admissions enquiries." description="Contact form submissions and callback requests are stored privately for the admissions team to review and follow up." previewHref="/contact">
      {error && <p className="mt-8 rounded-xl border border-red-700/20 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <div className="mt-10 space-y-4">
        {!query.data?.length && <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">No Contact enquiries yet.</div>}
        {query.data?.map((item) => <article key={item.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-7"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.name}</h2><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.contacted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{item.contacted ? 'Reviewed' : 'New'}</span><span className="inline-flex rounded-full bg-[hsl(var(--accent)/.14)] px-2.5 py-1 text-xs font-bold text-[hsl(var(--primary))]">{item.source === 'callback-request' ? 'Callback Request' : 'Contact Form'}</span></div><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{new Date(item.createdAt).toLocaleString()} · {item.course || 'Course not specified'}</p></div><a href={`tel:${item.phone}`} className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><Phone size={16} />{item.phone}</a></div><div className="mt-5 grid gap-4 text-sm leading-6 text-[hsl(var(--muted-foreground))] md:grid-cols-3"><p><strong className="text-[hsl(var(--foreground))]">Email</strong><br />{item.email || 'Not provided'}</p><p className="md:col-span-2"><strong className="text-[hsl(var(--foreground))]">Message</strong><br />{item.message || 'Not provided'}</p></div><div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-5 text-sm font-semibold"><div className="flex flex-wrap gap-5"><label className="flex items-center gap-2"><input type="checkbox" checked={item.contacted} onChange={(event) => save(item, { contacted: event.target.checked, resolved: item.resolved })} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Reviewed / contacted</label><label className="flex items-center gap-2"><input type="checkbox" checked={item.resolved} onChange={(event) => save(item, { contacted: item.contacted, resolved: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" /> Resolved</label></div><button type="button" onClick={() => deleteEnquiry(item)} disabled={remove.isPending} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /> Delete</button></div></article>)}
      </div>
    </EditorFrame>
  );
}