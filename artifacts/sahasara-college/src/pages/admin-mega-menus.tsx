import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, BookOpen, ImagePlus, Link2, Plus, Save, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminCoursesMegaMenuQueryKey,
  getGetCoursesMegaMenuQueryKey,
  useGetAdminCoursesMegaMenu,
  useUpdateCoursesMegaMenu,
  useUploadAdminImage,
  type CoursesMegaMenu,
} from '@workspace/api-client-react';
import { Area, Field } from '@/components/form-fields';
import { EditorCard, EditorFrame, EditorSkeleton, LoadError } from '@/pages/admin-about-hero';

type MenuContent = CoursesMegaMenu;
type StandardCard = MenuContent['standardCards'][number];
type Benefit = MenuContent['footerBenefits'][number];
type MenuLink = MenuContent['utilityLinks'][number];
type CtaButton = MenuContent['ctaButtons'][number];

const icons: Array<{ value: StandardCard['icon']; label: string }> = [
  { value: 'atom', label: 'Atom' },
  { value: 'dna', label: 'DNA' },
  { value: 'target', label: 'Target' },
  { value: 'stethoscope', label: 'Stethoscope' },
  { value: 'graduation-cap', label: 'Graduation cap' },
  { value: 'book-open', label: 'Open book' },
  { value: 'users', label: 'People' },
  { value: 'chart', label: 'Chart' },
  { value: 'clipboard', label: 'Clipboard' },
  { value: 'trophy', label: 'Trophy' },
];

const tints: Array<{ value: StandardCard['tint']; label: string }> = [
  { value: 'sky', label: 'Soft blue' },
  { value: 'rose', label: 'Soft rose' },
  { value: 'amber', label: 'Soft amber' },
  { value: 'mint', label: 'Soft mint' },
  { value: 'violet', label: 'Soft violet' },
  { value: 'slate', label: 'Soft slate' },
];

function cloneContent(content: MenuContent): MenuContent {
  return {
    ...content,
    standardCards: [...content.standardCards].sort((a, b) => a.displayOrder - b.displayOrder).map((item) => ({ ...item })),
    integratedCard: { ...content.integratedCard },
    footerBenefits: [...content.footerBenefits].sort((a, b) => a.displayOrder - b.displayOrder).map((item) => ({ ...item })),
    utilityLinks: [...content.utilityLinks].sort((a, b) => a.displayOrder - b.displayOrder).map((item) => ({ ...item })),
    ctaButtons: [...content.ctaButtons].sort((a, b) => a.displayOrder - b.displayOrder).map((item) => ({ ...item })),
  };
}

function reorder<T extends { displayOrder: number }>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next.map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 }));
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-semibold text-[hsl(var(--admin-text))]">
      <span className="mb-2 block">{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm">
        {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function ImageControl({
  id,
  label,
  url,
  altText,
  uploading,
  onUrlChange,
  onAltChange,
  onUpload,
}: {
  id: string;
  label: string;
  url: string | null;
  altText: string;
  uploading: boolean;
  onUrlChange: (value: string | null) => void;
  onAltChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{label}</p>
        <label htmlFor={`${id}-upload`} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-bold transition hover:border-[hsl(var(--accent))]">
          <ImagePlus size={15} aria-hidden="true" />
          {uploading ? 'Uploading…' : 'Upload image'}
          <input id={`${id}-upload`} type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={onUpload} className="sr-only" />
        </label>
      </div>
      {url && <img src={url} alt={altText || ''} className="mt-3 h-32 w-full rounded-xl object-cover" />}
      <div className="mt-4 space-y-4">
        <Field id={`${id}-url`} label="Image URL" value={url ?? ''} onChange={(event) => onUrlChange(event.target.value.trim() || null)} />
        <Field id={`${id}-alt`} label="Image description" value={altText} onChange={(event) => onAltChange(event.target.value)} required={Boolean(url)} />
      </div>
    </div>
  );
}

function ItemActions({
  index,
  count,
  label,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  label: string;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--border))] disabled:opacity-40"><ArrowUp size={16} /></button>
      <button type="button" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-[hsl(var(--border))] disabled:opacity-40"><ArrowDown size={16} /></button>
      <button type="button" aria-label={`Remove ${label}`} onClick={onRemove} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50"><Trash2 size={16} /></button>
    </div>
  );
}

function VisibilityField({ id, checked, label, onChange }: { id: string; checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex min-h-11 items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm font-semibold">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
      {label}
    </label>
  );
}

function ItemHeading({ title, subtitle, actions }: { title: string; subtitle: string; actions: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p></div>
      {actions}
    </div>
  );
}

export default function AdminMegaMenus() {
  const queryClient = useQueryClient();
  const query = useGetAdminCoursesMegaMenu();
  const update = useUpdateCoursesMegaMenu();
  const upload = useUploadAdminImage();
  const [form, setForm] = useState<MenuContent | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploadingTarget, setUploadingTarget] = useState('');

  useEffect(() => {
    if (query.data) setForm(cloneContent(query.data));
  }, [query.data]);

  const setField = <K extends keyof MenuContent>(key: K, value: MenuContent[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  const setCard = (index: number, patch: Partial<StandardCard>) => {
    setForm((current) => current ? {
      ...current,
      standardCards: current.standardCards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card),
    } : current);
  };

  const setIntegratedCard = (patch: Partial<MenuContent['integratedCard']>) => {
    setForm((current) => current ? {
      ...current,
      integratedCard: { ...current.integratedCard, ...patch },
    } : current);
  };

  const setBenefit = (index: number, patch: Partial<Benefit>) => {
    setForm((current) => current ? {
      ...current,
      footerBenefits: current.footerBenefits.map((benefit, itemIndex) => itemIndex === index ? { ...benefit, ...patch } : benefit),
    } : current);
  };

  const setUtilityLink = (index: number, patch: Partial<MenuLink>) => {
    setForm((current) => current ? {
      ...current,
      utilityLinks: current.utilityLinks.map((link, itemIndex) => itemIndex === index ? { ...link, ...patch } : link),
    } : current);
  };

  const setCtaButton = (index: number, patch: Partial<CtaButton>) => {
    setForm((current) => current ? {
      ...current,
      ctaButtons: current.ctaButtons.map((button, itemIndex) => itemIndex === index ? { ...button, ...patch } : button),
    } : current);
  };

  const uploadImage = (target: string, onUploaded: (url: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('Choose an image smaller than 8 MB.');
      return;
    }
    setError('');
    setNotice('');
    setUploadingTarget(target);
    upload.mutate({ data: { file, purpose: 'hero' } }, {
      onSuccess: (result) => {
        onUploaded(result.url);
        setUploadingTarget('');
        setNotice('Image uploaded. Save the menu to publish it.');
      },
      onError: () => {
        setUploadingTarget('');
        setError('That image could not be uploaded. Please try again.');
      },
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setNotice('');
    setError('');
    update.mutate({ data: form }, {
      onSuccess: (saved) => {
        const next = cloneContent(saved);
        setForm(next);
        queryClient.setQueryData(getGetAdminCoursesMegaMenuQueryKey(), next);
        queryClient.setQueryData(getGetCoursesMegaMenuQueryKey(), next);
        setNotice('Mega Menu saved and visible on the website.');
      },
      onError: () => setError('We could not save the menu. Check image descriptions, destinations, and item order.'),
    });
  };

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError && !form) return <LoadError onRetry={() => query.refetch()} />;
  if (!form) return <LoadError onRetry={() => query.refetch()} />;

  const moveStandardCard = (index: number, direction: -1 | 1) => setField('standardCards', reorder(form.standardCards, index, direction));
  const moveBenefit = (index: number, direction: -1 | 1) => setField('footerBenefits', reorder(form.footerBenefits, index, direction));
  const moveUtilityLink = (index: number, direction: -1 | 1) => setField('utilityLinks', reorder(form.utilityLinks, index, direction));
  const moveCtaButton = (index: number, direction: -1 | 1) => setField('ctaButtons', reorder(form.ctaButtons, index, direction));

  const addStandardCard = () => {
    const id = crypto.randomUUID();
    setField('standardCards', [...form.standardCards, {
      id,
      title: 'New pathway',
      category: 'Science pathway',
      description: 'Add a short description for this course pathway.',
      imageUrl: null,
      imageAltText: '',
      icon: 'atom',
      tint: 'sky',
      displayOrder: form.standardCards.length + 1,
      isVisible: false,
      href: '/courses',
    }]);
  };

  const addBenefit = () => {
    setField('footerBenefits', [...form.footerBenefits, {
      id: crypto.randomUUID(),
      title: 'New benefit',
      description: 'Add a short benefit description.',
      icon: 'users',
      displayOrder: form.footerBenefits.length + 1,
      isVisible: false,
    }]);
  };

  const addUtilityLink = () => {
    setField('utilityLinks', [...form.utilityLinks, {
      id: crypto.randomUUID(),
      label: 'New link',
      href: '/contact',
      displayOrder: form.utilityLinks.length + 1,
      isVisible: false,
    }]);
  };

  const addCtaButton = () => {
    setField('ctaButtons', [...form.ctaButtons, {
      id: crypto.randomUUID(),
      label: 'New button',
      href: '/courses',
      displayOrder: form.ctaButtons.length + 1,
      isVisible: false,
      style: 'secondary',
    }]);
  };

  return (
    <EditorFrame eyebrow="Mega Menus" title="Manage the Courses menu." description="Edit the content, images, cards, links, and calls to action shown in the public Courses menu." previewHref="/">
      <form onSubmit={submit} className="mt-10 space-y-6">
        <EditorCard icon={<BookOpen size={19} />} title="Menu heading and brand panel" description="The brand panel can use the website logo or a menu-specific logo and background image.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="mega-sidebar-brand" label="Sidebar brand name" value={form.sidebarBrandName} onChange={(event) => setField('sidebarBrandName', event.target.value)} required />
            <Field id="mega-sidebar-tagline" label="Sidebar tagline" value={form.sidebarTagline} onChange={(event) => setField('sidebarTagline', event.target.value)} required />
            <Field id="mega-sidebar-headline" label="Sidebar headline" value={form.sidebarHeadline} onChange={(event) => setField('sidebarHeadline', event.target.value)} required />
            <Area id="mega-sidebar-supporting" label="Sidebar supporting text" value={form.sidebarSupportingText} onChange={(event) => setField('sidebarSupportingText', event.target.value)} required />
            <ImageControl id="mega-sidebar-logo" label="Sidebar logo (blank uses the site logo)" url={form.sidebarLogoUrl} altText={form.sidebarLogoAltText} uploading={uploadingTarget === 'sidebar-logo'} onUrlChange={(value) => setField('sidebarLogoUrl', value)} onAltChange={(value) => setField('sidebarLogoAltText', value)} onUpload={uploadImage('sidebar-logo', (url) => setField('sidebarLogoUrl', url))} />
            <ImageControl id="mega-sidebar-image" label="Sidebar background image (optional)" url={form.sidebarImageUrl} altText={form.sidebarImageAltText} uploading={uploadingTarget === 'sidebar-image'} onUrlChange={(value) => setField('sidebarImageUrl', value)} onAltChange={(value) => setField('sidebarImageAltText', value)} onUpload={uploadImage('sidebar-image', (url) => setField('sidebarImageUrl', url))} />
            <div className="space-y-4 md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Main menu heading</p>
              <div className="grid gap-5 md:grid-cols-2">
                <Field id="mega-eyebrow" label="Eyebrow" value={form.eyebrow} onChange={(event) => setField('eyebrow', event.target.value)} required />
                <Field id="mega-heading" label="Heading" value={form.heading} onChange={(event) => setField('heading', event.target.value)} required />
                <Field id="mega-badge" label="Pathway count badge" value={form.pathwayBadgeLabel} onChange={(event) => setField('pathwayBadgeLabel', event.target.value)} required />
                <VisibilityField id="mega-badge-visible" checked={form.pathwayBadgeVisible} label="Show pathway badge" onChange={(value) => setField('pathwayBadgeVisible', value)} />
                <VisibilityField id="mega-logo-visible" checked={form.sidebarLogoVisible} label="Show sidebar logo" onChange={(value) => setField('sidebarLogoVisible', value)} />
              </div>
            </div>
          </div>
        </EditorCard>

        <EditorCard icon={<BookOpen size={19} />} title="Standard course cards" description="Add, edit, reorder, or hide the clickable course pathways. The integrated-course card is configured separately below.">
          <div className="space-y-4">
            {form.standardCards.map((card, index) => (
              <section key={card.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <ItemHeading title={`Course card ${index + 1}`} subtitle={`Saved order ${card.displayOrder}`} actions={<ItemActions index={index} count={form.standardCards.length} label={card.title || `card ${index + 1}`} onMove={(direction) => moveStandardCard(index, direction)} onRemove={() => setField('standardCards', form.standardCards.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 })))} />} />
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field id={`mega-card-${index}-title`} label="Title" value={card.title} onChange={(event) => setCard(index, { title: event.target.value })} required />
                  <Field id={`mega-card-${index}-category`} label="Category label" value={card.category} onChange={(event) => setCard(index, { category: event.target.value })} required />
                  <Area id={`mega-card-${index}-description`} label="Short description" value={card.description} onChange={(event) => setCard(index, { description: event.target.value })} required />
                  <Field id={`mega-card-${index}-destination`} label="Destination" value={card.href} onChange={(event) => setCard(index, { href: event.target.value })} required />
                  <SelectField id={`mega-card-${index}-icon`} label="Icon (shown when no image is set)" value={card.icon} options={icons} onChange={(value) => setCard(index, { icon: value as StandardCard['icon'] })} />
                  <SelectField id={`mega-card-${index}-tint`} label="Card tint" value={card.tint} options={tints} onChange={(value) => setCard(index, { tint: value as StandardCard['tint'] })} />
                  <ImageControl id={`mega-card-${index}-image`} label="Optional card image" url={card.imageUrl} altText={card.imageAltText} uploading={uploadingTarget === `card-${card.id}`} onUrlChange={(value) => setCard(index, { imageUrl: value })} onAltChange={(value) => setCard(index, { imageAltText: value })} onUpload={uploadImage(`card-${card.id}`, (url) => setCard(index, { imageUrl: url }))} />
                  <VisibilityField id={`mega-card-${index}-visible`} checked={card.isVisible} label="Show this course card" onChange={(value) => setCard(index, { isVisible: value })} />
                </div>
              </section>
            ))}
            <button type="button" onClick={addStandardCard} disabled={form.standardCards.length >= 20} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))] disabled:opacity-50"><Plus size={17} /> Add course card</button>
          </div>
        </EditorCard>

        <EditorCard icon={<ImagePlus size={19} />} title="Integrated Courses feature card" description="This card is informational only; it never links to another page.">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field id="mega-integrated-title" label="Title" value={form.integratedCard.title} onChange={(event) => setIntegratedCard({ title: event.target.value })} required />
            <Field id="mega-integrated-category" label="Category label" value={form.integratedCard.category} onChange={(event) => setIntegratedCard({ category: event.target.value })} required />
            <Area id="mega-integrated-description" label="Description" value={form.integratedCard.description} onChange={(event) => setIntegratedCard({ description: event.target.value })} required />
            <Field id="mega-integrated-status" label="Status badge" value={form.integratedCard.statusLabel} onChange={(event) => setIntegratedCard({ statusLabel: event.target.value })} required />
            <SelectField id="mega-integrated-icon" label="Icon (shown when no image is set)" value={form.integratedCard.icon} options={icons} onChange={(value) => setIntegratedCard({ icon: value as StandardCard['icon'] })} />
            <ImageControl id="mega-integrated-image" label="Optional card image" url={form.integratedCard.imageUrl} altText={form.integratedCard.imageAltText} uploading={uploadingTarget === 'integrated-image'} onUrlChange={(value) => setIntegratedCard({ imageUrl: value })} onAltChange={(value) => setIntegratedCard({ imageAltText: value })} onUpload={uploadImage('integrated-image', (url) => setIntegratedCard({ imageUrl: url }))} />
            <VisibilityField id="mega-integrated-visible" checked={form.integratedCard.isVisible} label="Show Integrated Courses card" onChange={(value) => setIntegratedCard({ isVisible: value })} />
          </div>
        </EditorCard>

        <EditorCard icon={<BookOpen size={19} />} title="Footer benefits" description="These short proof points appear along the bottom of the menu.">
          <div className="space-y-4">
            {form.footerBenefits.map((benefit, index) => (
              <section key={benefit.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <ItemHeading title={`Benefit ${index + 1}`} subtitle={`Saved order ${benefit.displayOrder}`} actions={<ItemActions index={index} count={form.footerBenefits.length} label={benefit.title || `benefit ${index + 1}`} onMove={(direction) => moveBenefit(index, direction)} onRemove={() => setField('footerBenefits', form.footerBenefits.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 })))} />} />
                <div className="grid gap-5 md:grid-cols-2">
                  <Field id={`mega-benefit-${index}-title`} label="Title" value={benefit.title} onChange={(event) => setBenefit(index, { title: event.target.value })} required />
                  <Field id={`mega-benefit-${index}-description`} label="Description" value={benefit.description} onChange={(event) => setBenefit(index, { description: event.target.value })} required />
                  <SelectField id={`mega-benefit-${index}-icon`} label="Icon" value={benefit.icon} options={icons} onChange={(value) => setBenefit(index, { icon: value as Benefit['icon'] })} />
                  <VisibilityField id={`mega-benefit-${index}-visible`} checked={benefit.isVisible} label="Show this benefit" onChange={(value) => setBenefit(index, { isVisible: value })} />
                </div>
              </section>
            ))}
            <button type="button" onClick={addBenefit} disabled={form.footerBenefits.length >= 20} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))] disabled:opacity-50"><Plus size={17} /> Add benefit</button>
          </div>
        </EditorCard>

        <EditorCard icon={<Link2 size={19} />} title="Footer links and calls to action" description="Control destinations, labels, order, and visibility for every footer link and button.">
          <div className="space-y-7">
            <div>
              <h3 className="mb-4 text-sm font-bold">Utility links</h3>
              <div className="space-y-4">
                {form.utilityLinks.map((link, index) => (
                  <section key={link.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                    <ItemHeading title={`Utility link ${index + 1}`} subtitle={`Saved order ${link.displayOrder}`} actions={<ItemActions index={index} count={form.utilityLinks.length} label={link.label || `link ${index + 1}`} onMove={(direction) => moveUtilityLink(index, direction)} onRemove={() => setField('utilityLinks', form.utilityLinks.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 })))} />} />
                    <div className="grid gap-5 md:grid-cols-3">
                      <Field id={`mega-link-${index}-label`} label="Label" value={link.label} onChange={(event) => setUtilityLink(index, { label: event.target.value })} required />
                      <Field id={`mega-link-${index}-href`} label="Destination" value={link.href} onChange={(event) => setUtilityLink(index, { href: event.target.value })} required />
                      <VisibilityField id={`mega-link-${index}-visible`} checked={link.isVisible} label="Show this link" onChange={(value) => setUtilityLink(index, { isVisible: value })} />
                    </div>
                  </section>
                ))}
                <button type="button" onClick={addUtilityLink} disabled={form.utilityLinks.length >= 20} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))] disabled:opacity-50"><Plus size={17} /> Add utility link</button>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold">CTA buttons</h3>
              <div className="space-y-4">
                {form.ctaButtons.map((button, index) => (
                  <section key={button.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                    <ItemHeading title={`CTA button ${index + 1}`} subtitle={`Saved order ${button.displayOrder}`} actions={<ItemActions index={index} count={form.ctaButtons.length} label={button.label || `button ${index + 1}`} onMove={(direction) => moveCtaButton(index, direction)} onRemove={() => setField('ctaButtons', form.ctaButtons.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 })))} />} />
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field id={`mega-cta-${index}-label`} label="Button label" value={button.label} onChange={(event) => setCtaButton(index, { label: event.target.value })} required />
                      <Field id={`mega-cta-${index}-href`} label="Destination" value={button.href} onChange={(event) => setCtaButton(index, { href: event.target.value })} required />
                      <SelectField id={`mega-cta-${index}-style`} label="Button style" value={button.style} options={[{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }]} onChange={(value) => setCtaButton(index, { style: value as CtaButton['style'] })} />
                      <VisibilityField id={`mega-cta-${index}-visible`} checked={button.isVisible} label="Show this button" onChange={(value) => setCtaButton(index, { isVisible: value })} />
                    </div>
                  </section>
                ))}
                <button type="button" onClick={addCtaButton} disabled={form.ctaButtons.length >= 10} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))] disabled:opacity-50"><Plus size={17} /> Add CTA button</button>
              </div>
            </div>
          </div>
        </EditorCard>

        <div aria-live="polite" className="min-h-6 text-sm">
          {error && <p className="text-rose-700">{error}</p>}
          {notice && <p className="text-emerald-700">{notice}</p>}
        </div>
        <div className="flex justify-end border-t border-[hsl(var(--border))] pt-5">
          <button type="submit" disabled={update.isPending || Boolean(uploadingTarget)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[hsl(var(--admin-accent))] px-6 text-sm font-bold text-[hsl(var(--admin-on-accent))] shadow-sm transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
            <Save size={17} aria-hidden="true" />
            {update.isPending ? 'Saving menu…' : 'Save Mega Menu'}
          </button>
        </div>
      </form>
    </EditorFrame>
  );
}