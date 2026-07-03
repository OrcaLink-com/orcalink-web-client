import { NavLink, Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { brand } from '@orcalink/design-tokens/brand.config';
import { useAuth } from '../auth/AuthContext';
import { useNotifications } from '../lib/queries';
import { Avatar } from './ui';
import {
  IconQuotes,
  IconUser,
  IconInbox,
  IconPlus,
  IconLogout,
  IconGlobe,
} from './icons';

/**
 * Sidebar de navegação (desktop ≥lg). No mobile a navegação fica na bottom TabBar.
 */
export function Sidebar() {
  const { user, logout } = useAuth();
  const q = useNotifications();
  const unread = q.data?.unreadCount ?? 0;

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-background px-3 py-5 lg:flex">
      <Link to="/" className="px-2" aria-label={brand.name}>
        <img src="/brand/logo.svg" alt={brand.name} className="h-11 w-auto" />
      </Link>

      <Link
        to="/novo"
        className="mt-6 flex items-center justify-center gap-2 rounded-medium bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-secondary"
      >
        <IconPlus size={16} /> Novo orçamento
      </Link>

      <nav className="mt-6 space-y-1">
        <Item to="/" icon={<IconQuotes size={20} />} label="Orçamentos" end />
        <Item to="/inbox" icon={<IconInbox size={20} />} label="Notificações" badge={unread} />
        <Item to="/eu" icon={<IconUser size={20} />} label="Eu" />
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <Link
          to="/site"
          className="mb-1 flex items-center gap-3 rounded-medium px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-content2 hover:text-foreground"
        >
          <IconGlobe size={18} />
          <span className="flex-1">Ver site</span>
        </Link>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar name={user?.name ?? '?'} size="sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{user?.name ?? 'Você'}</span>
          <button
            onClick={() => void logout()}
            aria-label="Sair"
            className="text-text-muted hover:text-danger"
          >
            <IconLogout size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Item({
  to,
  icon,
  label,
  badge,
  end,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: number;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-medium px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-primary/15 text-primary' : 'text-text-muted hover:bg-content2 hover:text-foreground'
        }`
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="min-w-[18px] rounded-full bg-danger px-1.5 text-center text-[10px] font-bold leading-[18px] text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );
}
