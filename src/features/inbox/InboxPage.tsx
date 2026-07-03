import { useNavigate } from 'react-router-dom';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../lib/queries';
import { useNotificationsRealtime } from '../../lib/realtime';
import { Button, Card, EmptyState, PageHeader, SectionHeader, Spinner } from '../../components/ui';
import { IconChevronRight, IconInbox } from '../../components/icons';
import { notificationMeta } from '../../lib/notificationMeta';
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
          <ul className="space-y-2.5">
            {unread.map((n) => (
              <InboxItem key={n.id} n={n} onClick={() => onItemClick(n)} />
            ))}
          </ul>
        </section>
      )}

      {read.length > 0 && (
        <section>
          <SectionHeader title="Anteriores" />
          <ul className="space-y-2.5">
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
  const { icon, circleClass } = notificationMeta(n.kind, 17);
  return (
    <li>
      <Card onClick={onClick} variant={n.readAt ? 'default' : 'highlight'} className="p-3.5">
        <div className="flex items-start gap-3">
          <span className={circleClass}>{icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-semibold">{n.title}</span>
                {!n.readAt && (
                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Nova
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[10px] text-text-muted" title={new Date(n.createdAt).toLocaleString('pt-BR')}>
                {relative(n.createdAt)}
              </span>
            </div>
            {n.body && <p className="mt-0.5 text-xs text-text-muted">{n.body}</p>}
            {n.link && (
              <p className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                Abrir <IconChevronRight size={13} />
              </p>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}
