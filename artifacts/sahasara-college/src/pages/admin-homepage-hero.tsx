import { useEffect, useState } from 'react';
import { ArrowUpRight, ImagePlus, MonitorPlay } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetHomepageHeroQueryKey,
  useGetHomepageHero,
  useUpdateHomepageHero,
  useUploadAdminImage,
  type HomepageHeroSlideInput,
} from '@workspace/api-client-react';
import { Area, Field, SaveButton } from '@/components/form-fields';

const makeEmptySlide = (displayOrder: number): HomepageHeroSlideInput => ({
  displayOrder,
  eyebrowText: '',
  heading: '',
  highlightedHeadingText: '',
  description: '',
  primaryButtonLabel: '',
  primaryButtonUrl: '',
  secondaryButtonLabel: '',
  secondaryButtonUrl: '',
  heroImageUrl: null,
  heroImageAltText: '',
});

const emptySlides = [1, 2, 3].map(makeEmptySlide);

export default function AdminHomepageHero() {
  const queryClient = useQueryClient();
  const query = useGetHomepageHero();
  const update = useUpdateHomepageHero();
  const upload = useUploadAdminImage();
  const [slides, setSlides] = useState<HomepageHeroSlideInput[]>(emptySlides);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.data?.length === 3) {
      setSlides(query.data.map(({ displayOrder, eyebrowText, heading, highlightedHeadingText, description, primaryButtonLabel, primaryButtonUrl, secondaryButtonLabel, secondaryButtonUrl, heroImageUrl, heroImageAltText }) => ({
        displayOrder,
        eyebrowText,
        heading,
        highlightedHeadingText,
        description,
        primaryButtonLabel,
        primaryButtonUrl,
        secondaryButtonLabel,
        secondaryButtonUrl,
        heroImageUrl,
        heroImageAltText,
      })));
    }
  }, [query.data]);

  const setSlide = (index: number, key: keyof HomepageHeroSlideInput, value: string) => {
    setSlides((current) => current.map((slide, slideIndex) => slideIndex === index ? { ...slide, [key]: value } : slide));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');
    update.mutate(
      { data: slides.map((slide) => ({ ...slide, heroImageUrl: slide.heroImageUrl || null })) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetHomepageHeroQueryKey() });
          setNotice('All three homepage slides were saved.');
        },
        onError: () => setError('We could not save the homepage slides. Please try again.'),
      },
    );
  };

  const handleUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    upload.mutate(
      { data: { file, purpose: 'hero' } },
      {
        onSuccess: (result) => {
          setSlide(index, 'heroImageUrl', result.url);
          setNotice(`Slide ${index + 1} image uploaded. Save all slides to publish it.`);
        },
        onError: () => setError(`Slide ${index + 1} image could not be uploaded. Try another file.`),
      },
    );
  };

  if (query.isLoading) return <div className="animate-pulse space-y-6"><div className="h-36 max-w-xl rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-[700px] rounded-2xl bg-[hsl(var(--muted))]" /></div>;
  if (query.isError && !query.data) return <div className="rounded-2xl border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.06)] p-8"><h2 className="font-display text-3xl font-semibold">The hero editor could not load.</h2><button onClick={() => query.refetch()} className="mt-6 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-retry-hero">Try again</button></div>;

  return (
    <div className="animate-rise max-w-5xl">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Homepage hero</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))]" data-testid="text-hero-editor-title">Give the first hello some feeling.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">Manage the three rotating moments visitors see first. Each slide has its own image, message, and calls to action.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-preview-home">Preview live site <ArrowUpRight size={16} /></a>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-6">
        {slides.map((slide, index) => (
          <section key={slide.displayOrder} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8" aria-labelledby={`slide-title-${slide.displayOrder}`}>
            <div className="flex items-start gap-3">
              <MonitorPlay className="mt-0.5 text-[hsl(var(--accent-foreground))]" size={19} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">Slide {slide.displayOrder}</p>
                <h2 id={`slide-title-${slide.displayOrder}`} className="mt-1 font-display text-2xl font-semibold text-[hsl(var(--primary))]">The message</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Short lines, a clear point of view, and room to breathe.</p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <Field id={`slide-${slide.displayOrder}-eyebrow`} label="Eyebrow" hint="Small line above the heading" value={slide.eyebrowText} onChange={(event) => setSlide(index, 'eyebrowText', event.target.value)} required placeholder="A focused start to a bright future" />
              <div className="grid gap-5 md:grid-cols-2">
                <Field id={`slide-${slide.displayOrder}-heading`} label="Main heading" value={slide.heading} onChange={(event) => setSlide(index, 'heading', event.target.value)} required placeholder="Learn with purpose." />
                <Field id={`slide-${slide.displayOrder}-highlighted`} label="Highlighted heading" hint="Gold emphasis" value={slide.highlightedHeadingText} onChange={(event) => setSlide(index, 'highlightedHeadingText', event.target.value)} required placeholder="Grow with confidence." />
              </div>
              <Area id={`slide-${slide.displayOrder}-description`} label="Description" value={slide.description} onChange={(event) => setSlide(index, 'description', event.target.value)} required placeholder="A clear, welcoming introduction for your future students." />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-5 rounded-xl bg-[hsl(var(--secondary))] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Primary action</p>
                  <Field id={`slide-${slide.displayOrder}-primary-label`} label="Button label" value={slide.primaryButtonLabel} onChange={(event) => setSlide(index, 'primaryButtonLabel', event.target.value)} required placeholder="Explore admissions" />
                  <Field id={`slide-${slide.displayOrder}-primary-url`} label="Button URL" value={slide.primaryButtonUrl} onChange={(event) => setSlide(index, 'primaryButtonUrl', event.target.value)} required placeholder="/contact" />
                </div>
                <div className="space-y-5 rounded-xl bg-[hsl(var(--secondary))] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]">Secondary action</p>
                  <Field id={`slide-${slide.displayOrder}-secondary-label`} label="Button label" value={slide.secondaryButtonLabel} onChange={(event) => setSlide(index, 'secondaryButtonLabel', event.target.value)} required placeholder="Discover our approach" />
                  <Field id={`slide-${slide.displayOrder}-secondary-url`} label="Button URL" value={slide.secondaryButtonUrl} onChange={(event) => setSlide(index, 'secondaryButtonUrl', event.target.value)} required placeholder="#about-preview" />
                </div>
              </div>

              <div className="border-t border-[hsl(var(--border))] pt-6">
                <div className="flex items-start gap-3">
                  <ImagePlus className="mt-0.5 text-[hsl(var(--accent-foreground))]" size={19} />
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[hsl(var(--primary))]">Slide image</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Use a wide image for the full-bleed background. A gradient fallback is used when no image is supplied.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                  <div className="aspect-[16/8] overflow-hidden rounded-xl bg-[hsl(var(--secondary))]">
                    {slide.heroImageUrl ? <img src={slide.heroImageUrl} alt={slide.heroImageAltText || `Slide ${slide.displayOrder} preview`} className="h-full w-full object-cover" data-testid={`img-hero-preview-${slide.displayOrder}`} /> : <div className="grid h-full place-items-center text-sm text-[hsl(var(--muted-foreground))]" data-testid={`text-hero-image-empty-${slide.displayOrder}`}>No image yet — fallback background active</div>}
                  </div>
                  <div>
                    <label className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-bold transition hover:border-[hsl(var(--accent))]" data-testid={`label-upload-hero-${slide.displayOrder}`}>
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleUpload(index, event)} data-testid={`input-upload-hero-${slide.displayOrder}`} />
                      {upload.isPending ? 'Uploading…' : `Upload slide ${slide.displayOrder} image`}
                    </label>
                    <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">PNG, JPG, or WebP · up to 5MB</p>
                    <div className="mt-5 space-y-5">
                      <Field id={`slide-${slide.displayOrder}-image-url`} label="Or paste an image URL" value={slide.heroImageUrl ?? ''} onChange={(event) => setSlide(index, 'heroImageUrl', event.target.value)} placeholder="https://…" />
                      <Field id={`slide-${slide.displayOrder}-image-alt`} label="Image alt text" value={slide.heroImageAltText} onChange={(event) => setSlide(index, 'heroImageAltText', event.target.value)} required placeholder="Students collaborating in a classroom" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {error && <p className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" data-testid="status-hero-error">{error}</p>}
        {notice && <p className="rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" data-testid="status-hero-success">{notice}</p>}
        <div className="flex justify-end"><SaveButton pending={update.isPending} testId="button-save-hero">Save all three slides</SaveButton></div>
      </form>
    </div>
  );
}