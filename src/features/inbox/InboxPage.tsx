import { useNavigate } from 'react-router-dom';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../lib/queries';
import { useNotificationsRealtime } from '../../lib/realtime';
import { Button, Card, EmptyState, PageHeader, SectionHeader, Spinner } from '../../components/ui';
import { IconChevronRight, IconInbox } from '../../components/icons';
import type { Notification } from '../../lib/types';

/** Inbox: notificações com pendências no topo e ação direta (toca → marca lida + abre destino). */
export function InboxPage() {
  useNotificationsRealtime();
  const q = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  const items = q.data?.items ?? [];
  const unread = items.filter((n) => !n.readAt);
  const read = items.filter((n) => n.readAt);

  function onItemClick(n: Notification) {
    if (!n.readAt) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notificações"
        action={
          unread.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              Marcar todas
            </Button>
          ) : undefined
        }
      />

      {q.isLoading && <Spinner label="Carregando…" />}
      {!q.isLoading && items.length === 0 && (
        <EmptyState
          icon={<IconInbox size={26} />}
          title="Nada por aqui ainda"
          hint="Avisos sobre estimativas, visitas e propostas aparecem aqui."
        />
      )}

      {unread.length > 0 && (
        <section>
          <SectionHeader title={`Pendentes · ${unread.length}`} />
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {unread.map((n) => (
              <InboxItem key={n.id} n={n} onClick={() => onItemClick(n)} />
            ))}
          </ul>
        </section>
      )}

      {read.length > 0 && (
        <section>
          <SectionHeader title="Anteriores" />
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {read.map((n) => (
              <InboxItem key={n.id} n={n} onClick={() => onItemClick(n)} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}m`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

function InboxItem({ n, onClick }: { n: Notification; onClick: () => void }) {
  return (
    <li>
      <Card onClick={onClick} variant={n.readAt ? 'default' : 'highlight'} className="p-3.5">
        <div className="flex items-start gap-3">
          {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">{n.title}</span>
              <span className="shrink-0 text-[10px] text-text-muted">{relative(n.createdAt)}</span>
            </div>
            {n.body && <p className="mt-0.5 text-xs text-text-muted">{n.body}</p>}
            {n.link && (
              <p className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                Abrir <IconChevronRight size={13} />
              </p>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}
