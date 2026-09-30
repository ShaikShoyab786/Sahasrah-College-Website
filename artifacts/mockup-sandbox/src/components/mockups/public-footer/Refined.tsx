import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import './_group.css';

const settings = {
  collegeName: 'Sahasrah Junior College',
  tagline: 'A clear beginning for a remarkable future',
  logoUrl: '/api/uploads/logo-afb86660-e2ed-4965-973e-bd3148a62fda.jpeg',
  email: 'smartshoyab653@gmail.com',
  phone: '+91 XXXXX 00009',
  address: 'Your College Address',
  footerText: 'Building confident futures through focused learning.',
};

const courses = [
  { name: 'MPC (Maths, Physics, Chemistry)', slug: 'mpc' },
  { name: 'BiPC (Biology, Physics, Chemistry)', slug: 'bipc' },
  { name: 'MPC + IIT-JEE', slug: 'mpc-iit-jee' },
  { name: 'BiPC + NEET', slug: 'bipc-neet' },
  { name: 'MPC + EAMCET', slug: 'mpc-eamcet' },
];

const exploreLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Courses', '/courses'],
  ['Faculty', '/faculty'],
  ['Results', '/results'],
  ['Gallery', '/gallery'],
  ['Knowledge Hub', '/knowledge-hub'],
  ['Contact', '/contact'],
];

const socialLinks: { name: string; url: string }[] = [];

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="inline-flex flex-col gap-2 font-serif text-xl font-semibold text-white">{children}<span className="h-0.5 w-9 rounded-full bg-[#CE0B11]" aria-hidden="true" /></h2>;
}

export function Refined() {
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;
  return (
    <div className="flex min-h-screen items-end bg-white font-sans">
      <footer className="relative isolate w-full overflow-hidden bg-[#022A6C] px-6 py-12 text-white sm:px-8 lg:px-10 lg:py-14">
        <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-[#CE0B11]/30" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-x-10 gap-y-11 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_.72fr_1fr_1fr] lg:gap-x-12">
            <div className="min-w-0">
              <a href="/" className="inline-flex items-center gap-3">
                <img src={settings.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-contain" />
                <span className="leading-tight">
                  <span className="block font-serif text-lg font-semibold">{settings.collegeName}</span>
                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.16em] text-white/75">{settings.tagline}</span>
                </span>
              </a>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/75">{settings.footerText}</p>
              {socialLinks.length > 0 && <nav className="mt-6 flex gap-2.5" aria-label="Social media profiles">
                {socialLinks.map(({ name, url }) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in a new tab)`} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-sm hover:border-[#CE0B11] hover:bg-[#CE0B11]">{name[0]}</a>)}
              </nav>}
            </div>

            <nav aria-label="Explore">
              <Heading>Explore</Heading>
              <ul className="mt-5 space-y-2.5">
                {exploreLinks.map(([label, href]) => <li key={label}><a href={href} className="group inline-flex min-h-7 items-center gap-1 text-sm text-white/80 transition hover:text-white"><span>{label}</span><ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100" aria-hidden="true" /></a></li>)}
              </ul>
            </nav>

            <div>
              <Heading>Our Programs</Heading>
              <ul className="mt-5 space-y-2.5">
                {courses.map((course) => <li key={course.slug}><a href={`/courses/${course.slug}`} className="group inline-flex min-h-7 items-start gap-1 text-sm leading-6 text-white/80 transition hover:text-white"><span>{course.name}</span><ArrowUpRight size={13} className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" /></a></li>)}
              </ul>
            </div>

            <div>
              <Heading>Reach Us</Heading>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[#F07C82]"><MapPin size={15} aria-hidden="true" /></span>
                  <a href={mapHref} target="_blank" rel="noopener noreferrer" className="pt-1 hover:text-white">{settings.address}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[#F07C82]"><Phone size={15} aria-hidden="true" /></span>
                  <a href={`tel:${settings.phone.trim().replace(/\s+/g, '')}`} className="break-all hover:text-white">{settings.phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[#F07C82]"><Mail size={15} aria-hidden="true" /></span>
                  <a href={`mailto:${settings.email}`} className="break-all hover:text-white">{settings.email}</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-5 text-xs leading-5 text-white/65 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 {settings.collegeName}. All rights reserved.</span>
            <span>{settings.tagline}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}