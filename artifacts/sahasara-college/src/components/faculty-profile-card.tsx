import type { CSSProperties } from 'react';
import { ArrowUpRight, Clock3, GraduationCap } from 'lucide-react';
import type { HomepageFacultyMember } from '@workspace/api-client-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function FacultyProfileCard({
  member,
  themeStyle,
  index = 0,
}: {
  member: HomepageFacultyMember;
  themeStyle?: CSSProperties;
  index?: number;
}) {
  const description = [member.role, member.subject].filter(Boolean).join(' · ');

  return (
    <Dialog>
      <article
        className="faculty-profile-card group overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[hsl(var(--accent)/.6)] hover:shadow-xl motion-reduce:transition-none"
        style={{ '--faculty-card-delay': `${index * 55}ms` } as CSSProperties}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className="faculty-profile-trigger group relative block w-full overflow-hidden text-left focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[hsl(var(--accent)/.6)]"
            aria-label={`Read ${member.name}'s faculty biography`}
            data-testid={`button-open-faculty-${member.id}`}
          >
            <div className="relative aspect-[.82] overflow-hidden bg-[hsl(var(--primary))]">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.imageAltText}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : (
                <div className="grid h-full place-items-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/.76)] text-[hsl(var(--accent))]">
                  <div className="grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10">
                    <GraduationCap size={34} aria-hidden="true" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.96)] via-[hsl(var(--primary)/.22)] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[hsl(var(--accent))]">
                  {member.subject || member.role}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-.025em]">
                  {member.name}
                </h2>
                <p className="mt-1.5 text-sm font-semibold text-white/80">{member.role}</p>
                {member.experience && (
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm">
                    <Clock3 size={13} aria-hidden="true" />
                    {member.experience}
                  </span>
                )}
              </div>
              <span className="absolute right-4 top-4 rounded-full border border-white/25 bg-[hsl(var(--primary)/.55)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                Read biography
              </span>
            </div>
          </button>
        </DialogTrigger>

        {member.socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-5">
            {member.socialLinks.map((link, linkIndex) => (
              <a
                key={`${member.id}-${link.href}-${linkIndex}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${member.name}'s ${link.label} profile in a new tab`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-xs font-bold text-[hsl(var(--primary))] transition-colors hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                data-testid={`link-faculty-social-${member.id}-${linkIndex}`}
              >
                {link.label}
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
      </article>

      <DialogContent
        style={themeStyle}
        className="max-w-3xl overflow-y-auto border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0 text-[hsl(var(--card-foreground))] sm:rounded-[1.5rem]"
        data-testid={`dialog-faculty-${member.id}`}
      >
        <div className="grid md:grid-cols-[.82fr_1.18fr]">
          <div className="relative min-h-64 bg-[hsl(var(--primary))] md:min-h-full">
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={member.imageAltText}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/.76)] text-[hsl(var(--accent))]">
                <GraduationCap size={52} aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.62)] to-transparent md:bg-gradient-to-r" />
          </div>

          <div className="p-6 sm:p-9">
            <DialogHeader className="space-y-0 text-left">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(var(--accent-foreground))]">
                {member.subject || 'Faculty profile'}
              </p>
              <DialogTitle className="mt-3 pr-8 font-display text-3xl font-semibold tracking-[-.04em] text-[hsl(var(--primary))] sm:text-4xl">
                {member.name}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm font-semibold leading-6 text-[hsl(var(--muted-foreground))]">
                {description || 'Faculty member'}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-wrap gap-2">
              {member.qualification && (
                <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--primary))]">
                  <GraduationCap size={15} aria-hidden="true" />
                  {member.qualification}
                </span>
              )}
              {member.experience && (
                <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--primary))]">
                  <Clock3 size={14} aria-hidden="true" />
                  {member.experience}
                </span>
              )}
            </div>

            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[hsl(var(--muted-foreground))]">
              {member.biography.trim() || 'Profile details will be added soon.'}
            </p>

            {member.socialLinks.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2 border-t border-[hsl(var(--border))] pt-5">
                {member.socialLinks.map((link, linkIndex) => (
                  <a
                    key={`${member.id}-dialog-${link.href}-${linkIndex}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${member.name}'s ${link.label} profile in a new tab`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)] motion-reduce:transition-none"
                  >
                    {link.label}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}