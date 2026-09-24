import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Medal, Quote, Star, Trophy } from 'lucide-react';
import type {
  HomepageAchievementRibbon,
  HomepageFacultyMember,
  HomepageGalleryItem,
  HomepageResults,
  HomepageTestimonials,
} from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';

export const fallbackResults: HomepageResults = {
  id: 'fallback-results',
  eyebrow: 'Pride of KVR',
  heading: 'Our Results, Our Pride',
  description: 'Steady preparation, strong foundations, and focused guidance help our students turn ambition into meaningful academic achievement.',
  viewAllButtonLabel: 'View All Achievements',
  viewAllButtonLink: '/about#achievement-statistics',
  isVisible: true,
  sortOrder: 6,
  updatedAt: '2026-06-15T00:00:00.000Z',
  results: [
    { id: 'result-1', studentImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=85', studentImageAltText: 'KVR student portrait', studentName: 'Aarav Reddy', examCourse: 'MPC · IIT-JEE', score: '98.6%', achievement: 'State Rank 42', resultLabel: 'Top Scorer', examName: 'JEE Main', year: '2025', accentColor: '#D6AD59', displayOrder: 1, isActive: true },
    { id: 'result-2', studentImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=85', studentImageAltText: 'KVR student portrait', studentName: 'Saanvi Rao', examCourse: 'BiPC · NEET', score: '675 / 720', achievement: 'Medical Seat Secured', resultLabel: 'Selected', examName: 'NEET', year: '2025', accentColor: '#2E8C7B', displayOrder: 2, isActive: true },
    { id: 'result-3', studentImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=85', studentImageAltText: 'KVR student portrait', studentName: 'Vihaan Kumar', examCourse: 'MPC · EAMCET', score: '96.2%', achievement: 'Engineering Pathway', resultLabel: 'Outstanding', examName: 'TS EAMCET', year: '2025', accentColor: '#17365D', displayOrder: 3, isActive: true },
    { id: 'result-4', studentImageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=85', studentImageAltText: 'KVR student portrait', studentName: 'Ishita Varma', examCourse: 'BiPC · NEET', score: '99.1%', achievement: 'District Top 10', resultLabel: 'Top Scorer', examName: 'Intermediate', year: '2025', accentColor: '#C26D3E', displayOrder: 4, isActive: true },
  ],
};

export const fallbackRibbon: HomepageAchievementRibbon = {
  id: 'fallback-ribbon',
  isVisible: true,
  sortOrder: 7,
  updatedAt: '2026-06-15T00:00:00.000Z',
  phrases: [
    { id: 'ribbon-1', phrase: 'Best NEET Preparation', displayOrder: 1, isActive: true, accentColor: '#D6AD59', separatorStyle: 'star' },
    { id: 'ribbon-2', phrase: 'Excellence', displayOrder: 2, isActive: true, accentColor: '#FFFFFF', separatorStyle: 'dot' },
    { id: 'ribbon-3', phrase: 'Discipline', displayOrder: 3, isActive: true, accentColor: '#75C7B5', separatorStyle: 'star' },
    { id: 'ribbon-4', phrase: 'Dedication', displayOrder: 4, isActive: true, accentColor: '#FFFFFF', separatorStyle: 'dot' },
    { id: 'ribbon-5', phrase: 'Top IIT-JEE Coaching', displayOrder: 5, isActive: true, accentColor: '#D6AD59', separatorStyle: 'star' },
  ],
};

export const fallbackTestimonials: HomepageTestimonials = {
  id: 'fallback-testimonials',
  eyebrow: 'What Parents & Students Say',
  heading: 'Real Stories of Success',
  description: 'Real stories from the KVR Junior College family.',
  isVisible: true,
  sortOrder: 8,
  updatedAt: '2026-06-15T00:00:00.000Z',
  testimonials: [
    { id: 'testimonial-1', rating: 5, quote: 'The regular feedback and personal attention gave our daughter the confidence to keep improving without feeling overwhelmed.', personName: 'Mrs. Lakshmi Rao', role: 'Parent', courseAchievement: 'BiPC · NEET 2025', avatarImageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Parent from the KVR college community', accentColor: '#D6AD59', displayOrder: 1, isActive: true },
    { id: 'testimonial-2', rating: 5, quote: 'Every subject became clearer because our teachers made time for questions. I learned how to prepare with a steady routine.', personName: 'Rohan Mehta', role: 'Student', courseAchievement: 'MPC · IIT-JEE 2025', avatarImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Student from the KVR college community', accentColor: '#2E8C7B', displayOrder: 2, isActive: true },
    { id: 'testimonial-3', rating: 5, quote: 'We chose KVR for the combination of discipline and care. The transition to junior college felt structured and genuinely supportive.', personName: 'Mr. Anil Kumar', role: 'Parent', courseAchievement: 'MPC · EAMCET 2025', avatarImageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Parent from the KVR college community', accentColor: '#17365D', displayOrder: 3, isActive: true },
    { id: 'testimonial-4', rating: 5, quote: 'The mentors helped me see the path ahead, then supported me with the practice and patience to walk it.', personName: 'Nandini Shah', role: 'Alumni', courseAchievement: 'NEET · 2024', avatarImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85', avatarAltText: 'Alumna from the KVR college community', accentColor: '#C26D3E', displayOrder: 4, isActive: true },
  ],
};

export const fallbackFaculty: HomepageFacultyMember[] = [
  { id: 'faculty-1', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=85', imageAltText: 'KVR faculty member', name: 'Dr. Ananya Rao', role: 'Senior Faculty', subject: 'Physics', experience: '15+ years', profileUrl: null, displayOrder: 1, isActive: true },
  { id: 'faculty-2', imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=85', imageAltText: 'KVR faculty member', name: 'Prof. Vikram Shah', role: 'Academic Mentor', subject: 'Mathematics', experience: '12+ years', profileUrl: null, displayOrder: 2, isActive: true },
  { id: 'faculty-3', imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=85', imageAltText: 'KVR faculty member', name: 'Dr. Meera Nair', role: 'Senior Faculty', subject: 'Biology', experience: '14+ years', profileUrl: null, displayOrder: 3, isActive: true },
  { id: 'faculty-4', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=85', imageAltText: 'KVR faculty member', name: 'Prof. Arjun Menon', role: 'Subject Expert', subject: 'Chemistry', experience: '10+ years', profileUrl: null, displayOrder: 4, isActive: true },
  { id: 'faculty-5', imageUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=700&q=85', imageAltText: 'KVR faculty member', name: 'Ms. Kavya Iyer', role: 'Student Mentor', subject: 'English & Aptitude', experience: '8+ years', profileUrl: null, displayOrder: 5, isActive: true },
];

export const fallbackGallery: HomepageGalleryItem[] = [
  { id: 'gallery-1', imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85', imageAltText: 'Bright KVR college classroom', title: 'Learning spaces with purpose', category: 'Campus Feature', description: 'Comfortable classrooms designed for focused daily learning.', locationLabel: 'Academic Block', displayOrder: 1, isFeatured: true, isActive: true },
  { id: 'gallery-2', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85', imageAltText: 'Students working in a KVR science laboratory', title: 'Curiosity in practice', category: 'Labs', description: 'Practical experiences that help concepts become clearer.', locationLabel: 'Science Labs', displayOrder: 2, isFeatured: true, isActive: true },
  { id: 'gallery-3', imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85', imageAltText: 'Quiet KVR library and study area', title: 'Room to read and grow', category: 'Library', description: 'Calm spaces for revision, reading, and independent discovery.', locationLabel: 'Central Library', displayOrder: 3, isFeatured: true, isActive: true },
];

export function HomeResults({ content }: { content: HomepageResults }) {
  const results = content.results.filter((result) => result.isActive);
  if (!results.length) return null;
  return (
    <section id="home-results" className="home-preview-section overflow-hidden bg-[hsl(var(--secondary))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-results-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow className="about-eyebrow">{content.eyebrow || 'Pride of KVR'}</SectionEyebrow>
            <h2 id="home-results-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p>
          </div>
          <a href={content.viewAllButtonLink || '/about#achievement-statistics'} className="group inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]">{content.viewAllButtonLabel || 'View All Achievements'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((result, index) => <ResultCard key={result.id} result={result} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function ResultCard({ result, index }: { result: HomepageResults['results'][number]; index: number }) {
  return (
    <article className="home-reveal group relative overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl focus-within:-translate-y-2" style={{ '--home-card-delay': `${index * 80}ms`, '--result-accent': result.accentColor || '#D6AD59' } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--primary))] text-lg font-bold text-[hsl(var(--accent))]">
          {result.studentImageUrl ? <img src={result.studentImageUrl} alt={result.studentImageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /> : result.studentName.split(' ').map((word) => word[0]).join('').slice(0, 2)}
        </div>
        <span className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]" style={{ borderColor: 'color-mix(in srgb, var(--result-accent) 40%, transparent)', color: 'var(--result-accent)' }}>{result.resultLabel}</span>
      </div>
      <p className="mt-6 text-[10px] font-bold uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))]">{result.examCourse}</p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{result.studentName}</h3>
      <div className="mt-6 border-t border-[hsl(var(--border))] pt-5">
        <p className="font-display text-4xl font-semibold tracking-[-.04em]" style={{ color: 'var(--result-accent)' }}>{result.score}</p>
        <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">{result.achievement}</p>
        {(result.examName || result.year) && <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{[result.examName, result.year].filter(Boolean).join(' · ')}</p>}
      </div>
    </article>
  );
}

export function AchievementRibbon({ content }: { content: HomepageAchievementRibbon }) {
  const phrases = content.phrases.filter((phrase) => phrase.isActive);
  if (!phrases.length) return null;
  const items = [...phrases, ...phrases];
  return (
    <section className="home-ribbon overflow-hidden bg-[hsl(var(--primary))] text-white" aria-label="KVR achievements">
      <div className="home-marquee" tabIndex={0}>
        <div className="home-marquee-track">
          {items.map((phrase, index) => <span key={`${phrase.id}-${index}`} className="inline-flex shrink-0 items-center gap-8 px-8 text-xs font-bold uppercase tracking-[.2em]" style={{ color: phrase.accentColor || '#FFFFFF' }}>
            {phrase.phrase}
            <span className="text-[hsl(var(--accent))]" aria-hidden="true">{phrase.separatorStyle === 'dot' ? '•' : '✦'}</span>
          </span>)}
        </div>
      </div>
    </section>
  );
}

export function HomeTestimonials({ content }: { content: HomepageTestimonials }) {
  const testimonials = content.testimonials.filter((testimonial) => testimonial.isActive);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const getCardStep = () => {
    const container = carouselRef.current;
    const card = container?.querySelector<HTMLElement>('[data-testimonial-slide]');
    return card ? card.offsetWidth + 16 : container?.clientWidth ?? 0;
  };
  const move = (direction: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const step = getCardStep();
    const next = container.scrollLeft + step * direction;
    const atEnd = direction > 0 && next + container.clientWidth >= container.scrollWidth - 8;
    const atStart = direction < 0 && next <= 0;
    container.scrollTo({ left: atEnd ? 0 : atStart ? Math.max(0, container.scrollWidth - container.clientWidth) : Math.max(0, next), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    if (paused || reducedMotion || testimonials.length < 2) return;
    const timer = window.setInterval(() => move(1), 6500);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, testimonials.length]);

  if (!testimonials.length) return null;
  return (
    <section id="home-testimonials" className="overflow-hidden bg-[hsl(var(--background))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-testimonials-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow className="about-eyebrow about-eyebrow-centered">{content.eyebrow}</SectionEyebrow>
          <h2 id="home-testimonials-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p>
        </div>
        <div className="mt-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}>
          <div ref={carouselRef} className="overflow-x-auto scrollbar-none" role="region" aria-roledescription="carousel" aria-label="Stories from parents and students" onScroll={(event) => { const step = getCardStep(); setSelectedIndex(step ? Math.min(testimonials.length - 1, Math.round(event.currentTarget.scrollLeft / step)) : 0); }}>
            <div className="flex gap-4">
              {testimonials.map((testimonial, index) => <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />)}
            </div>
          </div>
          <div className="mt-7 flex items-center justify-between gap-4">
            <div className="flex gap-1.5" aria-label="Testimonial position">{testimonials.map((testimonial, index) => <button key={testimonial.id} type="button" aria-label={`Go to testimonial from ${testimonial.personName}`} aria-current={selectedIndex === index} onClick={() => carouselRef.current?.scrollTo({ left: getCardStep() * index, behavior: reducedMotion ? 'auto' : 'smooth' })} className={`h-1.5 rounded-full transition-all ${selectedIndex === index ? 'w-8 bg-[hsl(var(--accent))]' : 'w-1.5 bg-[hsl(var(--border))]'}`} />)}</div>
            <div className="flex gap-2"><button type="button" aria-label="Previous testimonial" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]"><ChevronLeft size={18} /></button><button type="button" aria-label="Next testimonial" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]"><ChevronRight size={18} /></button></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: HomepageTestimonials['testimonials'][number]; index: number }) {
  return <article data-testimonial-slide className="home-reveal min-w-0 flex-[0_0_88%] rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-lg sm:flex-[0_0_56%] lg:flex-[0_0_calc((100%-2rem)/3)]" style={{ '--home-card-delay': `${index * 80}ms`, borderBottomColor: testimonial.accentColor || undefined } as React.CSSProperties}><div className="flex items-center justify-between gap-4"><div className="flex gap-1 text-[hsl(var(--accent))]" aria-label={`${testimonial.rating} out of 5 stars`}>{Array.from({ length: testimonial.rating }).map((_, starIndex) => <Star key={starIndex} size={15} fill="currentColor" />)}</div><Quote size={27} className="text-[hsl(var(--accent)/.5)]" /></div><p className="mt-7 min-h-[120px] text-base leading-7 text-[hsl(var(--foreground))]">“{testimonial.quote}”</p><div className="mt-7 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-5"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--accent))]">{testimonial.avatarImageUrl ? <img src={testimonial.avatarImageUrl} alt={testimonial.avatarAltText} className="h-full w-full object-cover" /> : testimonial.personName.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><div><p className="text-sm font-bold text-[hsl(var(--primary))]">{testimonial.personName}</p><p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{testimonial.role} · {testimonial.courseAchievement}</p></div></div></article>;
}

export function HomeFaculty({ faculty, eyebrow = 'Learn From the Best', heading = 'Our Expert Faculty', description = 'Experienced subject-matter experts who make difficult ideas clearer and ambitious goals more achievable.', buttonLabel = 'More Faculty', buttonHref = '/about#leadership' }: { faculty: HomepageFacultyMember[]; eyebrow?: string; heading?: string; description?: string; buttonLabel?: string; buttonHref?: string }) {
  const members = faculty.filter((member) => member.isActive);
  if (!members.length) return null;
  return (
    <section id="home-faculty" className="overflow-hidden bg-[hsl(var(--secondary))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-faculty-heading">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
           <div className="max-w-2xl"><SectionEyebrow className="about-eyebrow">{eyebrow}</SectionEyebrow><h2 id="home-faculty-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{heading}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{description}</p></div>
           <a href={buttonHref} className="group inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--card))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]">{buttonLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{members.slice(0, 5).map((member, index) => <FacultyCard key={member.id} member={member} index={index} />)}</div>
      </div>
    </section>
  );
}

function FacultyCard({ member, index }: { member: HomepageFacultyMember; index: number }) {
  const card = <article className="home-reveal faculty-preview-card group relative min-h-[380px] overflow-hidden rounded-[1.5rem] bg-[hsl(var(--primary))] shadow-lg" style={{ '--home-card-delay': `${index * 80}ms` } as React.CSSProperties}><div className="absolute inset-0">{member.imageUrl ? <img src={member.imageUrl} alt={member.imageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-[hsl(var(--accent))]"><Medal size={44} /></div>}</div><div className="faculty-preview-overlay absolute inset-0" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">{member.subject}</p><h3 className="mt-2 font-display text-2xl font-semibold">{member.name}</h3><p className="mt-1 text-sm font-semibold text-white/75">{member.role}</p>{member.experience && <p className="mt-4 text-xs text-white/65">{member.experience}</p>}</div></article>;
  return member.profileUrl ? <a href={member.profileUrl} target="_blank" rel="noreferrer" className="block rounded-[1.5rem] outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.35)]">{card}</a> : <div tabIndex={0} className="rounded-[1.5rem] outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.35)]">{card}</div>;
}

export function HomeGallery({ gallery, eyebrow = 'Campus Gallery', heading = 'Life at KVR College', description = 'A quick look at the spaces, routines, and experiences that shape the KVR college day.', buttonLabel = 'View Gallery', buttonHref = '/about#campus-highlights' }: { gallery: HomepageGalleryItem[]; eyebrow?: string; heading?: string; description?: string; buttonLabel?: string; buttonHref?: string }) {
  const items = gallery.filter((item) => item.isActive && item.isFeatured).slice(0, 3);
  if (!items.length) return null;
  return (
    <section id="home-gallery" className="overflow-hidden bg-[hsl(var(--background))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-gallery-heading">
      <div className="mx-auto max-w-7xl">
         <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div className="max-w-2xl"><SectionEyebrow className="about-eyebrow">{eyebrow}</SectionEyebrow><h2 id="home-gallery-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{heading}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{description}</p></div><a href={buttonHref} className="group inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]">{buttonLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{items.map((item, index) => <article key={item.id} className="home-reveal group overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1" tabIndex={0} style={{ '--home-card-delay': `${index * 90}ms` } as React.CSSProperties}><div className="relative aspect-[1.35] overflow-hidden bg-[hsl(var(--primary))]">{item.imageUrl ? <img src={item.imageUrl} alt={item.imageAltText} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-[hsl(var(--accent))]"><Trophy size={38} /></div>}<div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.55)] to-transparent opacity-70 transition group-hover:opacity-100" /></div><div className="p-6"><div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]"><span>{item.category}</span>{item.locationLabel && <span className="text-[hsl(var(--muted-foreground))]">{item.locationLabel}</span>}</div><h3 className="mt-3 font-display text-2xl font-semibold text-[hsl(var(--primary))]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p></div></article>)}</div>
      </div>
    </section>
  );
}