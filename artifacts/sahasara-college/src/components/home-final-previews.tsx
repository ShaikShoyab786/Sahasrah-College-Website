import { useState } from 'react';
import { ArrowRight, BookOpen, ChevronDown, Download, FileText, Phone, Search } from 'lucide-react';
import type {
  HomepageAdmissionsFaq,
  HomepageFinalCta,
  HomepageKnowledgeHub,
} from '@workspace/api-client-react';
import { SectionEyebrow } from '@/components/section-eyebrow';

const knowledgeCategories = ['Physics', 'Chemistry', 'Mathematics', 'Previous Papers', 'DPP', 'Mock Tests', 'NCERT', 'Formula Sheets'];

export const fallbackKnowledgeHub: HomepageKnowledgeHub = {
  id: 'fallback-knowledge-hub',
  eyebrow: 'Knowledge Hub',
  heading: 'Your Digital Learning Library',
  description: 'Study materials, expert guidance, exam updates, and practical resources for JEE and NEET aspirants.',
  isVisible: true,
  sortOrder: 11,
  updatedAt: '2026-06-15T00:00:00.000Z',
  resources: [
    { id: 'resource-1', title: 'Complete Target JEE Question Bank', description: '5,000+ handpicked questions with weightage analysis, difficulty ratings, and detailed solutions.', category: 'Featured', thumbnailUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=85', thumbnailAltText: 'Open study book and notes for JEE preparation', icon: 'file-text', fileSize: '8.4 MB', downloadCount: 5200, updatedLabel: 'Updated Jun 2026', resourceUrl: '/#home-knowledge-hub', isFeatured: true, isActive: true, displayOrder: 1 },
    { id: 'resource-2', title: 'Complete Physics Mechanics Master Notes', description: 'Concept-first notes covering kinematics, laws of motion, and rotational dynamics.', category: 'Physics', thumbnailUrl: null, thumbnailAltText: 'Physics resource document icon', icon: 'file-text', fileSize: '4.2 MB', downloadCount: 12500, updatedLabel: 'Updated Oct 2023', resourceUrl: '/#home-knowledge-hub', isFeatured: false, isActive: true, displayOrder: 2 },
    { id: 'resource-3', title: 'Organic Chemistry Reaction Mechanisms', description: 'Visual guidance to the reaction mechanisms required for NEET and JEE Advanced.', category: 'Chemistry', thumbnailUrl: null, thumbnailAltText: 'Chemistry resource document icon', icon: 'file-text', fileSize: '3.8 MB', downloadCount: 8300, updatedLabel: 'Updated Nov 2023', resourceUrl: '/#home-knowledge-hub', isFeatured: false, isActive: true, displayOrder: 3 },
    { id: 'resource-4', title: 'Integral Calculus Formula Sheet', description: 'Quick revision cheat sheet for integration formulas and shortcuts.', category: 'Mathematics', thumbnailUrl: null, thumbnailAltText: 'Mathematics resource document icon', icon: 'file-text', fileSize: '1.2 MB', downloadCount: 15400, updatedLabel: 'Updated Dec 2023', resourceUrl: '/#home-knowledge-hub', isFeatured: false, isActive: true, displayOrder: 4 },
  ],
};

export const fallbackAdmissionsFaq: HomepageAdmissionsFaq = {
  id: 'fallback-admissions-faq',
  eyebrow: 'Admissions FAQ',
  heading: 'Common Questions, Clear Answers',
  description: 'Everything you need to know about joining Sahasara Junior College.',
  isVisible: true,
  sortOrder: 12,
  updatedAt: '2026-06-15T00:00:00.000Z',
  questions: [
    { id: 'faq-1', question: 'Why should I choose Sahasara over other junior colleges?', answer: 'We combine focused concept learning with personal mentorship, regular feedback, and a supportive environment that helps students build confidence without losing sight of their goals.', displayOrder: 1, isVisible: true },
    { id: 'faq-2', question: 'Do you offer integrated coaching for IIT-JEE and NEET?', answer: 'Yes. Our MPC and BiPC pathways include integrated preparation, guided practice, regular tests, and subject support for ambitious IIT-JEE and NEET goals.', displayOrder: 2, isVisible: true },
    { id: 'faq-3', question: 'What is the student-to-teacher ratio?', answer: 'We keep groups focused so teachers can notice individual progress, answer questions, and give students useful feedback throughout the academic year.', displayOrder: 3, isVisible: true },
    { id: 'faq-4', question: 'Are separate hostel facilities available for boys and girls?', answer: 'Hostel support is available for eligible students. Contact the admissions office for current availability, routines, safety details, and a campus visit.', displayOrder: 4, isVisible: true },
    { id: 'faq-5', question: 'How do you track and improve student performance?', answer: 'Regular assessments, review meetings, practice plans, and individual guidance help students identify gaps early and build steady improvement.', displayOrder: 5, isVisible: true },
  ],
};

export const fallbackFinalCta: HomepageFinalCta = {
  id: 'fallback-final-cta',
  eyebrow: 'Join Sahasara College',
  heading: 'Seats Are Limited. Admissions Are Open.',
  supportingText: 'Give your child the advantage of personal mentorship from experienced faculty and integrated IIT-JEE and NEET preparation. Limited admission availability for the new academic year.',
  applyButtonLabel: 'Apply Now',
  applyButtonHref: '/#contact',
  phoneButtonLabel: 'Call Admission Office',
  phoneNumber: '',
  backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=85',
  backgroundImageAltText: 'Students walking across a college campus',
  backgroundOverlay: true,
  isVisible: true,
  sortOrder: 13,
  updatedAt: '2026-06-15T00:00:00.000Z',
};

function linkProps(url: string) {
  return url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};
}

export function HomeKnowledgeHub({ content }: { content: HomepageKnowledgeHub }) {
  const [activeCategory, setActiveCategory] = useState('Physics');
  const resources = content.resources.filter((resource) => resource.isActive);
  const featured = resources.find((resource) => resource.isFeatured) ?? resources[0];
  const supporting = resources.filter((resource) => resource.id !== featured?.id).slice(0, 3);
  if (!featured) return null;

  return (
    <section id="home-knowledge-hub" className="home-preview-section home-paper-grid overflow-hidden px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-knowledge-hub-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="about-eyebrow about-eyebrow-centered">{content.eyebrow}</SectionEyebrow>
          <h2 id="home-knowledge-hub-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.9)] p-2 shadow-sm" aria-label="Knowledge Hub search preview">
          <Search size={18} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
          <input disabled aria-label="Search Knowledge Hub preview" placeholder="Search topics, PDFs, and notes…" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" />
          <span className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))]"><Search size={14} aria-hidden="true" /> Preview</span>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-2" aria-label="Knowledge Hub categories">
          {knowledgeCategories.map((category) => (
            <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.28)] ${activeCategory === category ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card)/.88)] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))]'}`}>
              {category}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
          <ResourceFeatured resource={featured} />
          <div className="grid gap-4">
            {supporting.map((resource, index) => <ResourceCard key={resource.id} resource={resource} index={index} />)}
          </div>
        </div>

        <div className="mt-9 text-center">
          <a href="/#home-knowledge-hub" className="group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--card))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] shadow-sm transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.28)]">
            View All Resources <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ResourceFeatured({ resource }: { resource: HomepageKnowledgeHub['resources'][number] }) {
  return (
    <article className="knowledge-featured home-reveal overflow-hidden rounded-[1.75rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl">
      <div className="grid min-h-[330px] md:grid-cols-[1.05fr_.95fr]">
        <div className="flex flex-col justify-between p-7 md:p-9">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent)/.18)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--accent-foreground))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" /> Featured</span>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">{resource.category}</p>
            <h3 className="mt-3 max-w-md font-display text-3xl font-semibold leading-tight text-[hsl(var(--primary))] md:text-4xl">{resource.title}</h3>
            <p className="mt-4 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{resource.description}</p>
          </div>
          <a href={resource.resourceUrl} {...linkProps(resource.resourceUrl)} className="group mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]">
            <Download size={15} aria-hidden="true" /> View Resource <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="relative min-h-[230px] overflow-hidden bg-[hsl(var(--secondary))]">
          {resource.thumbnailUrl ? <img src={resource.thumbnailUrl} alt={resource.thumbnailAltText} className="h-full w-full object-cover transition duration-700 hover:scale-105" /> : <div className="grid h-full place-items-center text-[hsl(var(--primary))]"><DocumentVisual large /></div>}
          <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--primary)/.18)] to-transparent" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function ResourceCard({ resource, index }: { resource: HomepageKnowledgeHub['resources'][number]; index: number }) {
  return (
    <article className="knowledge-card home-reveal group rounded-[1.25rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-lg" style={{ '--home-card-delay': `${index * 80}ms` } as React.CSSProperties}>
      <div className="flex gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--accent-foreground))]">
          {resource.thumbnailUrl ? <img src={resource.thumbnailUrl} alt={resource.thumbnailAltText} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <DocumentVisual />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--accent-foreground))]">{resource.category}</span>
            <FileText size={15} className="shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-[hsl(var(--primary))]">{resource.title}</h3>
          <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{resource.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            {resource.fileSize && <span>{resource.fileSize}</span>}
            {resource.downloadCount !== null && resource.downloadCount !== undefined && <span>{resource.downloadCount.toLocaleString()} downloads</span>}
            {resource.updatedLabel && <span>{resource.updatedLabel}</span>}
          </div>
          <a href={resource.resourceUrl} {...linkProps(resource.resourceUrl)} className="group/link mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.3)]">
            View Resource <ArrowRight size={13} className="transition-transform group-hover/link:translate-x-1" />
          </a>
        </div>
      </div>
    </article>
  );
}

function DocumentVisual({ large = false }: { large?: boolean }) {
  return <div className={`relative flex ${large ? 'h-44 w-32' : 'h-8 w-7'} items-center justify-center rounded-md bg-[hsl(var(--card))] shadow-md`} aria-hidden="true"><FileText size={large ? 34 : 18} strokeWidth={1.5} /><span className={`absolute ${large ? 'bottom-5 h-1 w-16' : 'bottom-1 h-0.5 w-4'} rounded-full bg-[hsl(var(--accent)/.5)]`} /></div>;
}

export function HomeAdmissionsFaq({ content }: { content: HomepageAdmissionsFaq }) {
  const questions = content.questions.filter((question) => question.isVisible && question.question.trim() && question.answer.trim());
  const [openIndex, setOpenIndex] = useState(0);
  if (!questions.length) return null;

  return (
    <section id="home-admissions-faq" className="home-preview-section bg-[hsl(var(--background))] px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-admissions-faq-heading">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="about-eyebrow about-eyebrow-centered">{content.eyebrow}</SectionEyebrow>
          <h2 id="home-admissions-faq-heading" className="mt-5 font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] text-[hsl(var(--primary))] md:text-6xl">{content.heading}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{content.description}</p>
        </div>
        <div className="mt-12 space-y-3">
          {questions.map((question, index) => {
            const isOpen = openIndex === index;
            const answerId = `home-faq-answer-${question.id}`;
            return (
              <article key={question.id} className={`home-faq-item rounded-2xl border bg-[hsl(var(--card))] transition ${isOpen ? 'border-[hsl(var(--accent)/.55)] shadow-md' : 'border-[hsl(var(--border))] shadow-sm'}`} style={{ '--home-card-delay': `${index * 70}ms` } as React.CSSProperties}>
                <h3>
                  <button id={`home-faq-question-${question.id}`} type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenIndex(isOpen ? -1 : index)} className="flex min-h-16 w-full items-center justify-between gap-6 px-5 py-5 text-left text-sm font-bold text-[hsl(var(--primary))] outline-none transition hover:text-[hsl(var(--accent-foreground))] focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent)/.22)] md:px-7">
                    <span>{question.question}</span>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${isOpen ? 'bg-[hsl(var(--accent)/.2)] text-[hsl(var(--accent-foreground))]' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}><ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" /></span>
                  </button>
                </h3>
                <div id={answerId} role="region" aria-labelledby={answerId.replace('answer', 'question')} className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="border-t border-[hsl(var(--border))] px-5 py-5 text-sm leading-7 text-[hsl(var(--muted-foreground))] md:px-7">{question.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <a href="#contact" className="group inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] underline decoration-[hsl(var(--accent)/.6)] decoration-2 underline-offset-4 transition hover:text-[hsl(var(--accent-foreground))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.25)]">Still have a question? Talk to admissions <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></a>
        </div>
      </div>
    </section>
  );
}

export function HomeFinalCta({ content }: { content: HomepageFinalCta }) {
  const phoneDigits = content.phoneNumber.replace(/\D/g, '');
  const hasPhone = phoneDigits.length >= 7;
  const phoneHref = `tel:${content.phoneNumber.replace(/[^\d+]/g, '')}`;
  return (
    <section id="home-final-cta" className="home-preview-section px-6 py-20 lg:px-10 lg:py-28" aria-labelledby="home-final-cta-heading">
      <div className="home-cta-panel relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-2xl">
        {content.backgroundImage && <img src={content.backgroundImage} alt={content.backgroundImageAltText} className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        {content.backgroundOverlay && <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/.98)] via-[hsl(var(--primary)/.92)] to-[hsl(181_58%_20%/.86)]" aria-hidden="true" />}
        <div className="home-cta-glow absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[hsl(var(--accent)/.18)] blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-9 p-8 md:p-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:p-16">
          <div>
            <SectionEyebrow className="text-[hsl(var(--primary-foreground)/.75)]"><span>{content.eyebrow}</span></SectionEyebrow>
            <h2 id="home-final-cta-heading" className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] md:text-6xl">{content.heading}</h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[hsl(var(--primary-foreground)/.7)]">{content.supportingText}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a href={content.applyButtonHref} {...linkProps(content.applyButtonHref)} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary))] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]">
              {content.applyButtonLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            {hasPhone && <a href={phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--primary-foreground)/.18)] bg-[hsl(var(--primary-foreground)/.06)] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.7)] hover:bg-[hsl(var(--primary-foreground)/.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]">
              <Phone size={16} aria-hidden="true" /> {content.phoneButtonLabel}
            </a>}
          </div>
        </div>
      </div>
    </section>
  );
}