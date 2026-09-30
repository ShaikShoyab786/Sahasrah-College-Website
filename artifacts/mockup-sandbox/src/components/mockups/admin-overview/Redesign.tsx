import './_group.css';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  Camera,
  GraduationCap,
  Image,
  LibraryBig,
  MessageSquareQuote,
  Newspaper,
  Settings2,
  ShieldCheck,
  Video,
} from 'lucide-react';

const quickActionGroups = [
  {
    title: 'Knowledge Hub',
    description: 'Keep learning content current.',
    icon: LibraryBig,
    actions: [
      { label: 'Articles', action: 'Post an article', href: '/admin/pages/knowledge-hub/articles', icon: Newspaper },
      { label: 'Video Hub', action: 'Add a video', href: '/admin/pages/knowledge-hub/videos', icon: Video },
      { label: 'Study Resources', action: 'Upload a resource', href: '/admin/pages/knowledge-hub/resources', icon: BookOpenText },
      { label: 'Exam Updates', action: 'Manage exam updates', href: '/admin/pages/knowledge-hub/exam-updates', icon: CalendarDays },
    ],
  },
  {
    title: 'Courses',
    description: 'Maintain the pathways shown to students.',
    icon: GraduationCap,
    actions: [
      { label: 'Course pathways', action: 'Manage courses', href: '/admin/pages/courses', icon: GraduationCap },
    ],
  },
  {
    title: 'Website Content',
    description: 'Bring the college community into view.',
    icon: Image,
    actions: [
      { label: 'Gallery', action: 'Add images', href: '/admin/pages/gallery', icon: Camera },
      { label: 'Faculty', action: 'Add faculty', href: '/admin/pages/faculty', icon: GraduationCap },
      { label: 'Testimonials', action: 'Add a testimonial', href: '/admin/pages/home/testimonials', icon: MessageSquareQuote },
    ],
  },
];

export function Redesign() {
  return (
    <div className="overview-shell">
      <style>{`
        .overview-shell {
          --ov-ink: hsl(var(--primary));
          --ov-copy: hsl(var(--foreground));
          --ov-muted: hsl(var(--muted-foreground));
          --ov-paper: hsl(var(--admin-background));
          --ov-line: hsl(var(--border));
          --ov-gold: hsl(var(--accent));
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          color: var(--ov-copy);
          background: var(--ov-paper);
          font-family: var(--app-font-sans);
        }
        .overview-shell * { box-sizing: border-box; }
        .ov-sidebar {
          width: 238px;
          flex: 0 0 238px;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          padding: 27px 17px 19px;
          color: hsl(var(--primary-foreground));
          background: hsl(var(--primary));
        }
        .ov-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 9px 36px;
          color: inherit;
          text-decoration: none;
        }
        .ov-brand-mark {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          flex: 0 0 auto;
          border: 1px solid hsl(var(--primary-foreground) / .38);
          border-radius: 50%;
          color: var(--ov-gold);
        }
        .ov-brand-name { font: 600 14px/1.2 var(--app-font-serif); letter-spacing: -.02em; }
        .ov-workspace-label {
          padding: 0 11px;
          color: hsl(var(--primary-foreground) / .55);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .19em;
          text-transform: uppercase;
        }
        .ov-side-nav { display: grid; gap: 5px; margin-top: 13px; }
        .ov-side-link {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 39px;
          padding: 0 11px;
          border-radius: 9px;
          color: hsl(var(--primary-foreground) / .76);
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: background .18s ease, color .18s ease;
        }
        .ov-side-link:hover { color: hsl(var(--primary-foreground)); background: hsl(var(--primary-foreground) / .09); }
        .ov-side-link.active { color: hsl(var(--primary)); background: var(--ov-gold); font-weight: 700; }
        .ov-sidebar-foot {
          margin-top: auto;
          padding: 17px 9px 0;
          border-top: 1px solid hsl(var(--primary-foreground) / .17);
        }
        .ov-admin-chip { display: flex; align-items: center; gap: 10px; }
        .ov-admin-avatar {
          display: grid;
          place-items: center;
          width: 33px;
          height: 33px;
          border-radius: 50%;
          color: hsl(var(--primary));
          background: hsl(var(--primary-foreground));
          font: 700 11px var(--app-font-sans);
        }
        .ov-admin-copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .ov-admin-name { font-size: 11px; font-weight: 700; }
        .ov-admin-role { margin-top: 3px; color: hsl(var(--primary-foreground) / .58); font-size: 10px; }
        .ov-main { min-width: 0; flex: 1; }
        .ov-topbar {
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(22px, 4.4vw, 68px);
          border-bottom: 1px solid var(--ov-line);
          background: hsl(var(--card) / .55);
        }
        .ov-topbar-label { color: var(--ov-muted); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .ov-site-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--ov-ink);
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
        }
        .ov-site-link:hover { text-decoration: underline; text-underline-offset: 4px; }
        .ov-content {
          width: min(1120px, 100%);
          margin: 0 auto;
          padding: 43px clamp(22px, 4.4vw, 68px) 60px;
          animation: ov-appear .48s ease both;
        }
        @keyframes ov-appear { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
        .ov-page-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
        .ov-eyebrow { display: flex; align-items: center; gap: 8px; color: hsl(var(--accent-foreground)); font-size: 9px; font-weight: 700; letter-spacing: .19em; text-transform: uppercase; }
        .ov-eyebrow-line { width: 18px; height: 1px; background: var(--ov-gold); }
        .ov-title { margin: 12px 0 0; color: var(--ov-ink); font: 600 clamp(34px, 4vw, 48px)/1.04 var(--app-font-serif); letter-spacing: -.045em; }
        .ov-subtitle { margin: 12px 0 0; color: var(--ov-muted); font-size: 13px; line-height: 1.65; }
        .ov-secure-note { display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; border: 1px solid var(--ov-line); border-radius: 999px; color: var(--ov-muted); background: hsl(var(--card) / .72); font-size: 10px; white-space: nowrap; }
        .ov-identity {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 24px;
          margin-top: 31px;
          padding: 24px 28px;
          border: 1px solid var(--ov-line);
          border-radius: 15px;
          background: hsl(var(--card));
          box-shadow: 0 9px 25px hsl(var(--primary) / .035);
        }
        .ov-identity:before { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--ov-gold); content: ''; }
        .ov-identity-main { display: flex; align-items: center; gap: 17px; min-width: 0; }
        .ov-identity-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          flex: 0 0 auto;
          border-radius: 12px;
          color: var(--ov-ink);
          background: hsl(var(--secondary));
        }
        .ov-overline { color: var(--ov-muted); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
        .ov-college { margin: 6px 0 0; color: var(--ov-ink); font: 600 20px/1.15 var(--app-font-serif); letter-spacing: -.02em; }
        .ov-tagline { margin: 5px 0 0; color: var(--ov-muted); font-size: 11px; line-height: 1.5; }
        .ov-identity-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid hsl(var(--primary));
          border-radius: 8px;
          color: hsl(var(--primary-foreground));
          background: hsl(var(--primary));
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          transition: background .18s ease, transform .18s ease;
          white-space: nowrap;
        }
        .ov-identity-action:hover { transform: translateY(-1px); background: hsl(var(--primary) / .9); }
        .ov-section-heading { display: flex; align-items: end; justify-content: space-between; gap: 14px; margin: 37px 0 15px; }
        .ov-section-title { margin: 0; color: var(--ov-ink); font: 600 23px/1.15 var(--app-font-serif); letter-spacing: -.025em; }
        .ov-section-caption { margin: 6px 0 0; color: var(--ov-muted); font-size: 11px; }
        .ov-section-count { color: var(--ov-muted); font: 500 10px var(--app-font-sans); letter-spacing: .09em; text-transform: uppercase; }
        .ov-groups { display: grid; gap: 13px; }
        .ov-group {
          display: grid;
          grid-template-columns: 205px minmax(0, 1fr);
          align-items: start;
          gap: 19px;
          padding: 20px 21px;
          border: 1px solid var(--ov-line);
          border-radius: 13px;
          background: hsl(var(--card) / .82);
        }
        .ov-group-intro { display: flex; align-items: flex-start; gap: 11px; padding-top: 2px; }
        .ov-group-icon { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 10px; color: hsl(var(--accent-foreground)); background: hsl(var(--accent) / .25); }
        .ov-group-title { margin: 2px 0 0; color: var(--ov-ink); font-size: 12px; font-weight: 700; }
        .ov-group-desc { margin: 5px 0 0; color: var(--ov-muted); font-size: 10px; line-height: 1.5; }
        .ov-action-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .ov-action-link {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          min-height: 57px;
          padding: 9px 11px;
          border: 1px solid transparent;
          border-radius: 9px;
          color: var(--ov-copy);
          background: hsl(var(--admin-background) / .78);
          text-decoration: none;
          transition: border-color .18s ease, background .18s ease, transform .18s ease;
        }
        .ov-action-link:hover { transform: translateY(-1px); border-color: hsl(var(--accent) / .75); background: hsl(var(--secondary)); }
        .ov-action-icon { display: grid; place-items: center; width: 31px; height: 31px; flex: 0 0 auto; border-radius: 8px; color: var(--ov-ink); background: hsl(var(--card)); }
        .ov-action-copy { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .ov-action-label { overflow: hidden; color: var(--ov-ink); font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
        .ov-action-name { color: var(--ov-muted); font-size: 10px; line-height: 1.2; }
        .ov-action-arrow { margin-left: auto; flex: 0 0 auto; color: hsl(var(--muted-foreground) / .7); }
        .overview-shell a:focus-visible { outline: 3px solid hsl(var(--accent)); outline-offset: 3px; }
        @media (max-width: 850px) {
          .ov-sidebar { width: 72px; flex-basis: 72px; padding: 21px 10px; }
          .ov-brand { justify-content: center; padding: 0 0 32px; }
          .ov-brand-name, .ov-workspace-label, .ov-side-link span, .ov-admin-copy { display: none; }
          .ov-side-link { justify-content: center; padding: 0; }
          .ov-sidebar-foot { padding-right: 0; padding-left: 0; }
          .ov-admin-chip { justify-content: center; }
          .ov-group { grid-template-columns: 165px minmax(0, 1fr); }
        }
        @media (max-width: 620px) {
          .ov-sidebar { display: none; }
          .ov-topbar { height: 52px; padding: 0 19px; }
          .ov-topbar-label { font-size: 8px; }
          .ov-content { padding: 31px 19px 42px; }
          .ov-page-heading { align-items: flex-start; }
          .ov-title { font-size: 37px; }
          .ov-subtitle { max-width: 380px; }
          .ov-secure-note { display: none; }
          .ov-identity { grid-template-columns: 1fr; gap: 17px; padding: 20px 19px; }
          .ov-identity-action { justify-self: start; margin-left: 63px; }
          .ov-section-heading { margin-top: 31px; }
          .ov-groups { gap: 11px; }
          .ov-group { grid-template-columns: 1fr; gap: 13px; padding: 17px 15px; }
          .ov-action-list { grid-template-columns: 1fr; gap: 6px; }
          .ov-action-link { min-height: 54px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ov-content { animation: none; }
          .ov-action-link, .ov-side-link, .ov-identity-action { transition: none; }
        }
      `}</style>
      <aside className="ov-sidebar" aria-label="Admin workspace navigation">
        <div className="ov-brand">
          <span className="ov-brand-mark" aria-hidden="true"><GraduationCap size={19} /></span>
          <span className="ov-brand-name">Sahasrah Junior<br />College</span>
        </div>
        <div className="ov-workspace-label">Workspace</div>
        <nav className="ov-side-nav" aria-label="Workspace">
          <a className="ov-side-link" href="/admin/dashboard"><ArrowRight size={15} /><span>Dashboard</span></a>
          <a className="ov-side-link active" href="/admin/overview" aria-current="page"><Settings2 size={15} /><span>Overview</span></a>
          <a className="ov-side-link" href="/admin/site-settings"><Settings2 size={15} /><span>Site identity</span></a>
        </nav>
        <div className="ov-sidebar-foot">
          <div className="ov-admin-chip">
            <span className="ov-admin-avatar" aria-hidden="true">C</span>
            <span className="ov-admin-copy"><span className="ov-admin-name">College Administrator</span><span className="ov-admin-role">Website workspace</span></span>
          </div>
        </div>
      </aside>

      <div className="ov-main">
        <header className="ov-topbar">
          <span className="ov-topbar-label">College control room</span>
          <a className="ov-site-link" href="/" aria-label="View public website">View website <ArrowUpRight size={13} /></a>
        </header>
        <main className="ov-content">
          <section className="ov-page-heading" aria-labelledby="overview-title">
            <div>
              <div className="ov-eyebrow"><span className="ov-eyebrow-line" />Admin overview</div>
              <h1 id="overview-title" className="ov-title">Website Overview</h1>
              <p className="ov-subtitle">Manage your website’s key content and settings from one place.</p>
            </div>
            <div className="ov-secure-note"><ShieldCheck size={14} /> Staff workspace</div>
          </section>

          <section className="ov-identity" aria-labelledby="identity-title">
            <div className="ov-identity-main">
              <div className="ov-identity-icon" aria-hidden="true"><Settings2 size={21} /></div>
              <div>
                <div className="ov-overline">Site identity</div>
                <h2 id="identity-title" className="ov-college">Sahasrah Junior College</h2>
                <p className="ov-tagline">A clear beginning for a remarkable future</p>
              </div>
            </div>
            <a className="ov-identity-action" href="/admin/site-settings">Edit Site Identity <ArrowUpRight size={14} /></a>
          </section>

          <section aria-labelledby="quick-actions-title">
            <div className="ov-section-heading">
              <div>
                <h2 id="quick-actions-title" className="ov-section-title">Quick Actions</h2>
                <p className="ov-section-caption">Go straight to the content you need to update.</p>
              </div>
              <span className="ov-section-count">3 content areas</span>
            </div>
            <div className="ov-groups">
              {quickActionGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <section className="ov-group" key={group.title} aria-labelledby={`group-${group.title.replace(/\s+/g, '-').toLowerCase()}`}>
                    <div className="ov-group-intro">
                      <span className="ov-group-icon" aria-hidden="true"><GroupIcon size={17} /></span>
                      <div>
                        <h3 id={`group-${group.title.replace(/\s+/g, '-').toLowerCase()}`} className="ov-group-title">{group.title}</h3>
                        <p className="ov-group-desc">{group.description}</p>
                      </div>
                    </div>
                    <div className="ov-action-list">
                      {group.actions.map((item) => {
                        const ActionIcon = item.icon;
                        return (
                          <a className="ov-action-link" href={item.href} key={item.href} aria-label={`${item.label}: ${item.action}`}>
                            <span className="ov-action-icon" aria-hidden="true"><ActionIcon size={16} /></span>
                            <span className="ov-action-copy">
                              <span className="ov-action-label">{item.label}</span>
                              <span className="ov-action-name">{item.action}</span>
                            </span>
                            <ArrowUpRight className="ov-action-arrow" size={14} aria-hidden="true" />
                          </a>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}