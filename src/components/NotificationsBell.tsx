import { Link } from 'react-router-dom';
import { Badge } from '@heroui/react';
import { useNotifications } from '../lib/queries';
import { IconBell } from './icons';

/** Sino de notificações no topo: abre o Inbox e mostra badge de não lidas. */
export function NotificationsBell() {
  const q = useNotifications();
  const unread = q.data?.unreadCount ?? 0;
  return (
    <Link
      to="/app/inbox"
      className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-content2 hover:text-foreground"
      aria-label="Notificações"
    >
      <Badge
        content={unread > 9 ? '9+' : unread}
        color="danger"
        size="sm"
        isInvisible={unread === 0}
        shape="circle"
      >
        <IconBell size={20} />
      </Badge>
    </Link>
  );
}
