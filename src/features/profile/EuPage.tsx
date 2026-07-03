import { LuPencil } from 'react-icons/lu';
import { useAuth } from '../../auth/AuthContext';
import { useProfile } from '../../lib/queries';
import { Avatar, Button, ButtonLink, Card, ListRow } from '../../components/ui';
import {
  IconAgenda,
  IconInbox,
  IconLogout,
  IconQuotes,
} from '../../components/icons';

/** "Eu" do cliente: perfil + atalhos do negócio + sair. */
export function EuPage() {
  const { user, logout } = useAuth();
  const profile = useProfile();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={user?.name ?? 'Você'} src={profile.data?.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold">{user?.name ?? 'Você'}</p>
          <p className="text-xs text-text-muted">Cliente {/* marca */}OrcaLink</p>
        </div>
        <ButtonLink to="/perfil" variant="secondary" size="sm" startContent={<LuPencil size={14} />}>
          Editar
        </ButtonLink>
      </div>

      <Card className="divide-y divide-border p-0">
        <ListRow icon={<LuPencil size={18} />} title="Meu perfil" subtitle="Dados, endereço e senha" to="/perfil" />
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
