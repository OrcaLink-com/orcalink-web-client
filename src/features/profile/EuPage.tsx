import { useAuth } from '../../auth/AuthContext';
import { Avatar, Button, Card, ListRow } from '../../components/ui';
import {
  IconAgenda,
  IconInbox,
  IconLogout,
  IconQuotes,
} from '../../components/icons';

/** "Eu" do cliente: perfil + atalhos do negócio + sair. */
export function EuPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={user?.name ?? 'Você'} size="lg" />
        <div>
          <p className="text-lg font-semibold">{user?.name ?? 'Você'}</p>
          <p className="text-xs text-text-muted">Cliente {/* marca */}OrcaLink</p>
        </div>
      </div>

      <Card className="divide-y divide-border p-0">
        <ListRow icon={<IconQuotes size={18} />} title="Meus orçamentos" to="/" />
        <ListRow icon={<IconAgenda size={18} />} title="Minhas visitas" to="/visitas" />
        <ListRow icon={<IconInbox size={18} />} title="Notificações" to="/inbox" />
      </Card>

      <Button
        variant="secondary"
        full
        onClick={() => void logout()}
        startContent={<IconLogout size={16} />}
        className="text-danger"
      >
        Sair
      </Button>
    </div>
  );
}
