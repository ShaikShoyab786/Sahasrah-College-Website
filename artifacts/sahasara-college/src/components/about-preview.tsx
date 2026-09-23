import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Image as ImageIcon } from 'lucide-react';
import type { HomepageAboutPreview } from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';

type AboutPreviewProps = {
  content: HomepageAboutPreview;
};

export function AboutPreview({ content }: AboutPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.16 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="about-preview" className={`about-preview-section overflow-hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-24 lg:px-10 lg:py-32 ${isVisible ? 'about-preview-is-visible' : ''}`} aria-labelledby="about-preview-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <div className="about-preview-collage relative min-h-[430px]">
          <div className="about-preview-image-card about-preview-image-card-primary group absolute left-0 top-0 h-[78%] w-[78%] overflow-hidden rounded-[2rem] bg-[hsl(var(--secondary))] shadow-xl shadow-[hsl(var(--primary)/.12)]">
            {content.primaryImage ? (
              <img src={content.primaryImage} alt={content.primaryImageAltText} className="about-preview-image h-full w-full object-cover" data-testid="img-about-primary" />
            ) : (
              <ImageFallback label="Sahasara learning together" />
            )}
            <div className="about-preview-image-overlay absolute inset-0" aria-hidden="true" />
          </div>
          <div className="about-preview-image-card about-preview-image-card-secondary group absolute bottom-0 right-0 flex aspect-square w-[48%] items-end overflow-hidden rounded-[1.5rem] border-8 border-[hsl(var(--background))] bg-[hsl(var(--primary))] shadow-xl">
            {content.secondaryImage ? (
              <img src={content.secondaryImage} alt={content.secondaryImageAltText} className="about-preview-image h-full w-full object-cover" data-testid="img-about-secondary" />
            ) : (
              <ImageFallback label="A place to belong" dark />
            )}
            <div className="about-preview-image-overlay absolute inset-0" aria-hidden="true" />
          </div>
          <div className="about-preview-reveal about-preview-callout absolute bottom-10 left-8 hidden items-center gap-3 rounded-full border border-white/20 bg-[hsl(var(--primary)/.86)] px-4 py-3 text-xs font-bold text-white shadow-lg backdrop-blur-md sm:flex">
            <BookOpen size={16} className="text-[hsl(var(--accent))]" />
            <span>Learning with purpose</span>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="about-preview-reveal about-preview-eyebrow"><SectionEyebrow className="about-eyebrow">{content.eyebrow}</SectionEyebrow></div>
          <h2 id="about-preview-heading" className="about-preview-reveal about-preview-heading mt-4 max-w-xl font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl" data-testid="text-about-preview-heading">{content.heading}</h2>
          <p className="about-preview-reveal about-preview-description mt-7 text-lg leading-8 text-[hsl(var(--muted-foreground))]" data-testid="text-about-preview-description">{content.description}</p>
          <p className="about-preview-reveal about-preview-body mt-5 max-w-xl text-[15px] leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-about-preview-body">{content.body}</p>
          <a href={content.buttonHref || '/about'} className="about-preview-reveal about-preview-cta mt-8 inline-flex items-center rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]" data-testid="link-about-preview">
            {content.buttonLabel || 'Explore Our Philosophy'}
            <ArrowUpRight size={17} className="ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ImageFallback({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div className={`grid h-full w-full place-items-center p-8 text-center ${dark ? 'bg-[radial-gradient(circle_at_35%_25%,hsl(42_63%_60%/.32),transparent_35%),hsl(var(--primary))] text-white/70' : 'bg-[radial-gradient(circle_at_70%_20%,hsl(42_63%_60%/.45),transparent_30%),hsl(var(--secondary))] text-[hsl(var(--primary)/.65)]'}`} data-testid="about-image-fallback">
      <div>
        <ImageIcon className="mx-auto mb-3 opacity-60" size={26} />
        <span className="text-xs font-bold uppercase tracking-[.16em]">{label}</span>
      </div>
    </div>
  );
}