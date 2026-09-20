import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetAdminSession } from '@workspace/api-client-react';
import { AdminShell } from '@/components/admin-shell';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const session = useGetAdminSession();
  useEffect(() => { if (session.isError || (session.data && !session.data.authenticated)) setLocation('/admin/login'); }, [session.isError, session.data, setLocation]);
  if (session.isLoading || !session.data?.authenticated) return <div className="min-h-[100dvh] bg-[hsl(var(--background))] p-6"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-8 w-52 rounded-lg bg-[hsl(var(--muted))]" /><div className="h-40 rounded-2xl bg-[hsl(var(--muted))]" /><div className="grid gap-6 md:grid-cols-2"><div className="h-56 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-56 rounded-2xl bg-[hsl(var(--muted))]" /></div></div></div>;
  return <AdminShell displayName={session.data.displayName} email={session.data.email}>{children}</AdminShell>;
}