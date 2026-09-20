import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, LogOut, Menu, PanelsTopLeft, Settings2, X } from 'lucide-react';
import { useLogoutAdmin, getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { SiteMark } from '@/components/site-mark';

type ShellProps = { children: React.ReactNode; displayName?: string; email?: string };

export function AdminShell({ children, displayName = 'Administrator', email = '' }: ShellProps) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogoutAdmin();
  const nav = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/site-settings', label: 'Site identity', icon: Settings2 },
    { href: '/admin/homepage-hero', label: 'Homepage hero', icon: PanelsTopLeft },
  ];
  const signOut = () => logout.mutate(undefined, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() }); setLocation('/admin/login'); } });

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[276px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <SiteMark inverse compact name="Sahasara" />
          <button className="rounded-lg p-2 text-[hsl(var(--sidebar-foreground)/.7)] md:hidden" onClick={() => setOpen(false)} data-testid="button-close-sidebar"><X size={19} /></button>
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--sidebar-foreground)/.45)]">Workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Admin navigation">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? location === href : location.startsWith(href);
            return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid={`link-admin-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>;
          })}
        </nav>
        <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] pt-4">
          <div className="mb-4 rounded-xl bg-[hsl(var(--sidebar-accent))] p-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--accent))] text-sm font-bold text-[hsl(var(--primary))]">{displayName.charAt(0).toUpperCase()}</div>
            <p className="mt-3 truncate text-sm font-bold" data-testid="text-admin-display-name">{displayName}</p>
            <p className="truncate text-xs text-[hsl(var(--sidebar-foreground)/.54)]" data-testid="text-admin-email">{email}</p>
          </div>
          <button onClick={signOut} disabled={logout.isPending} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[hsl(var(--sidebar-foreground)/.7)] transition hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]" data-testid="button-admin-logout"><LogOut size={18} /> Sign out</button>
        </div>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-[hsl(var(--primary)/.35)] md:hidden" onClick={() => setOpen(false)} data-testid="button-menu-backdrop" />}
      <main className="min-h-[100dvh] md:pl-[276px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.9)] px-5 backdrop-blur-md md:px-10">
          <button className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 md:hidden" onClick={() => setOpen(true)} data-testid="button-open-sidebar"><Menu size={20} /></button>
          <div className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))] md:block">College control room</div>
          <Link href="/" className="text-sm font-bold text-[hsl(var(--primary))] transition hover:text-[hsl(var(--accent-foreground))]" data-testid="link-view-website">View website ↗</Link>
        </header>
        <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-12">{children}</div>
      </main>
    </div>
  );
}