import type { ReactNode } from 'react';
import { useCancelVisit, useMyVisits, useRescheduleVisit } from '../../lib/queries';
import { formatDateTime } from '../../lib/format';
import { Card, EmptyState, PageHeader, Spinner, StatusChip } from '../../components/ui';
import { VisitManageCard } from '../../components/VisitManageCard';
import { IconAgenda, IconConfirmed, IconHistory, IconWaiting } from '../../components/icons';
import type { MyVisit, VisitStatus } from '../../lib/types';

const STATUS_LABEL: Record<VisitStatus, string> = {
  PENDING: 'Pendente',
  SUGGESTED: 'Agendada',
  RESCHEDULED: 'Reagendada',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Realizada',
  CANCELED: 'Cancelada',
};

const STATUS_VAR: Record<VisitStatus, string> = {
  PENDING: '--color-status-canceled',
  SUGGESTED: '--color-status-waiting',
  RESCHEDULED: '--color-status-waiting',
  CONFIRMED: '--color-status-scheduled',
  COMPLETED: '--color-status-finished',
  CANCELED: '--color-status-canceled',
};

const TYPE_LABEL = { IN_LOCO: 'Visita técnica', EXECUTION: 'Execução' } as const;

interface Group {
  title: string;
  icon: ReactNode;
  helper?: string;
  items: MyVisit[];
}

function group(visits: MyVisit[]): Group[] {
  const aguardando = visits.filter((v) => v.status === 'SUGGESTED' || v.status === 'RESCHEDULED');
  const confirmadas = visits.filter((v) => v.status === 'CONFIRMED');
  const historico = visits.filter(
    (v) => v.status === 'COMPLETED' || v.status === 'CANCELED' || v.status === 'PENDING',
  );
  return [
    {
      title: 'Aguardando você',
      icon: <IconWaiting size={16} />,
      helper: 'Confirme ou sugira nova data abrindo o orçamento.',
      items: aguardando,
    },
    { title: 'Confirmadas', icon: <IconConfirmed size={16} />, items: confirmadas },
    { title: 'Histórico', icon: <IconHistory size={16} />, items: historico },
  ];
}

/** Card de visita CONFIRMADA com ações de reagendar/cancelar (calendário do cliente). */
function ManageableVisitCard({ visit: v }: { visit: MyVisit }) {
  const reschedule = useRescheduleVisit(v.quoteId);
  const cancel = useCancelVisit(v.quoteId);
  return (
    <div className="overflow-hidden rounded-large border border-border bg-card">
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{TYPE_LABEL[v.type]}</span>
          <StatusChip label={STATUS_LABEL[v.status]} varName={STATUS_VAR[v.status]} size="sm" />
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-text-muted">
          <strong className="text-foreground">{v.quoteCategoryName}</strong> · {v.providerName}
        </p>
      </div>
      <VisitManageCard
        type={v.type}
        scheduledAt={v.scheduledAt}
        onReschedule={async (iso, reason) => {
          await reschedule.mutateAsync({ visitId: v.id, scheduledAt: iso, reason });
        }}
        onCancel={async (reason) => {
          await cancel.mutateAsync({ visitId: v.id, reason });
        }}
      />
    </div>
  );
}

export function MyVisitsPage() {
  const q = useMyVisits();

  if (q.isLoading) return <Spinner label="Carregando…" />;
  if (q.isError) return <p className="text-danger">{(q.error as Error).message}</p>;

  const visits = q.data ?? [];

  if (visits.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Minhas visitas" backTo="/eu" />
        <EmptyState
          icon={<IconAgenda size={26} />}
          title="Nenhuma visita ainda"
          hint="Quando um profissional sugerir uma visita técnica ou execução, ela aparece aqui."
        />
      </div>
    );
  }

  const activeInLoco = visits.filter(
    (v) => v.type === 'IN_LOCO' && ['SUGGESTED', 'CONFIRMED', 'RESCHEDULED'].includes(v.status),
  ).length;

  const groups = group(visits);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas visitas"
        subtitle={`${activeInLoco} visita(s) técnica(s) ativa(s).`}
        backTo="/eu"
      />

      {groups.map((g) =>
        g.items.length === 0 ? null : (
          <section key={g.title}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-muted">
              {g.icon}
              {g.title}
              <span className="text-text-muted/70">({g.items.length})</span>
            </h2>
            {g.helper && <p className="mb-2.5 text-xs text-text-muted">{g.helper}</p>}
            <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {g.items.map((v) => (
                <li key={v.id}>
                  {v.status === 'CONFIRMED' ? (
                    <ManageableVisitCard visit={v} />
                  ) : (
                    <Card to={`/orcamento/${v.quoteId}`} className="p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{TYPE_LABEL[v.type]}</span>
                        <StatusChip label={STATUS_LABEL[v.status]} varName={STATUS_VAR[v.status]} size="sm" />
                      </div>
                      <p className="mt-0.5 text-sm text-text-muted">
                        {v.scheduledAt ? formatDateTime(v.scheduledAt) : '— sem data —'}
                        {v.endsAt ? ` → ${formatDateTime(v.endsAt)}` : ''}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-text-muted">
                        <strong className="text-foreground">{v.quoteCategoryName}</strong> ·{' '}
                        {v.quoteDescription} · {v.providerName}
                      </p>
                    </Card>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
