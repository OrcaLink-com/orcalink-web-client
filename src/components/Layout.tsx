import { Link, Outlet, useLocation } from 'react-router-dom';
import { brand } from '@orcalink/design-tokens/brand.config';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from '../lib/queries';
import { TabBar } from './TabBar';
import { Sidebar } from './Sidebar';
import { NotificationsBell } from './NotificationsBell';
import { MessageToaster } from './MessageToaster';
import { Avatar } from './ui';

export function Layout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const profile = useProfile();

  // Fluxos focados (negociação e wizard de novo orçamento) escondem a navegação no mobile.
  const focusedFlow = pathname.includes('/negociacao/') || pathname === '/novo';

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Toasts de novas mensagens (tempo real) */}
      <MessageToaster />
      {/* Navegação lateral (desktop) */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header (mobile) */}
        {!focusedFlow && (
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-lg lg:hidden">
            <Link to="/" className="text-lg font-bold tracking-tight text-primary">
              {brand.name}
            </Link>
            <div className="flex items-center gap-1.5">
              <NotificationsBell />
              <Link to="/eu" aria-label="Sua conta">
                <Avatar name={user?.name ?? '?'} src={profile.data?.avatarUrl} size="sm" />
              </Link>
            </div>
          </header>
        )}

        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>

        {/* Bottom nav (mobile) */}
        {!focusedFlow && <TabBar />}
      </div>
    </div>
  );
}
