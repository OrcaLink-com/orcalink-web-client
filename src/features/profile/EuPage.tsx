import { useState } from 'react';
import { LuHeadphones, LuPencil, LuDownload } from 'react-icons/lu';
import { useAuth } from '../../auth/AuthContext';
import { useProfile } from '../../lib/queries';
import { Avatar, Button, ButtonLink, Card, ListRow } from '../../components/ui';
import { ContactModal } from '../../components/ContactModal';
import { InstallGuide } from '../../components/InstallGuide';
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
  const [contactOpen, setContactOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);

  return (
    <div className="space-y-6">
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} authenticated />
      <InstallGuide open={installOpen} onClose={() => setInstallOpen(false)} />
      <div className="flex items-center gap-4">
        <Avatar name={user?.name ?? 'Você'} src={profile.data?.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold">{user?.name ?? 'Você'}</p>
          <p className="text-xs text-text-muted">Cliente {/* marca */}OrcaLink</p>
        </div>
        <ButtonLink to="/app/perfil" variant="secondary" size="sm" startContent={<LuPencil size={14} />}>
          Editar
        </ButtonLink>
      </div>

      <Card className="divide-y divide-border p-0">
        <ListRow icon={<LuPencil size={18} />} title="Meu perfil" subtitle="Dados, endereço e senha" to="/app/perfil" />
        <ListRow icon={<IconQuotes size={18} />} title="Meus orçamentos" to="/app" />
        <ListRow icon={<IconAgenda size={18} />} title="Minhas visitas" to="/app/visitas" />
        <ListRow icon={<IconInbox size={18} />} title="Notificações" to="/app/inbox" />
        <ListRow
          icon={<LuDownload size={18} />}
          title="Instalar o app"
          subtitle="Adicione à tela inicial (Android e iPhone)"
          onClick={() => setInstallOpen(true)}
        />
        <ListRow
          icon={<LuHeadphones size={18} />}
          title="Falar com a Orca Link"
          subtitle="Dúvidas, suporte, sugestões"
          onClick={() => setContactOpen(true)}
        />
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
