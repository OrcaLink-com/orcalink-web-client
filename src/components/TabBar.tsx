import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IconQuotes, IconNegotiations, IconUser } from './icons';

/**
 * Navegação inferior do app Cliente: 3 destinos com ícones Lucide.
 *  Orçamentos · Negociações · Eu  (notificações ficam no sino do topo)
 */
export function TabBar() {
  return (
    <nav className="sticky bottom-0 z-20 flex border-t border-border bg-background/85 backdrop-blur-lg lg:hidden">
      <Tab to="/" icon={<IconQuotes size={22} />} label="Orçamentos" />
      <Tab to="/negociacoes" icon={<IconNegotiations size={22} />} label="Negociações" />
      <Tab to="/eu" icon={<IconUser size={22} />} label="Eu" />
    </nav>
  );
}

function Tab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
          isActive ? 'font-semibold text-primary' : 'text-text-muted hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute top-0 h-0.5 w-10 rounded-full bg-primary" aria-hidden />
          )}
          {icon}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
