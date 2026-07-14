import { useEffect, useState } from 'react';
import { LuArrowLeft, LuLock, LuMapPin, LuTrash2, LuUser } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useProfile, useRequestPasswordOtp, useSetPassword, useUpdateMe } from '../../lib/queries';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../lib/api';
import { AvatarUploader } from '../../components/AvatarUploader';
import { CepField } from '../../components/CepField';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button, Card, Input, Spinner } from '../../components/ui';

/**
 * "Meu Perfil": um único formulário (dados pessoais + endereço) com UM salvar.
 * Senha e exclusão de conta são ações separadas (fluxos próprios), abaixo.
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const profileQ = useProfile();

  if (profileQ.isLoading) return <Spinner label="Carregando perfil…" />;
  if (profileQ.isError || !profileQ.data)
    return <p className="p-6 text-center text-sm text-danger">Não foi possível carregar seu perfil.</p>;

  const p = profileQ.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-content2 hover:text-foreground"
        >
          <LuArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Meu perfil</h1>
      </div>

      <ProfileForm profile={p} />
      <PasswordSection hasPassword={p.hasPassword} hasEmail={Boolean(p.email)} />
      <DangerZoneSection />
    </div>
  );
}

/* ───────── Formulário único: dados pessoais + endereço (um único salvar) ───────── */
function ProfileForm({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>['data']> }) {
  const update = useUpdateMe();
  const [f, setF] = useState({
    name: profile.name,
    phone: profile.phone ?? '',
    bio: profile.bio ?? '',
    zipCode: profile.zipCode ?? '',
    street: profile.street ?? '',
    number: profile.number ?? '',
    neighborhood: profile.neighborhood ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
  });
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [ok, setOk] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(false), 2500);
    return () => clearTimeout(t);
  }, [ok]);

  // A foto é uma ação de upload → salva na hora.
  async function saveAvatar(url: string) {
    setAvatarUrl(url);
    await update.mutateAsync({ avatarUrl: url });
    setOk(true);
  }

  function applyCep(r: { street?: string; neighborhood?: string; city?: string; state?: string }) {
    setF((s) => ({
      ...s,
      street: r.street || s.street,
      neighborhood: r.neighborhood || s.neighborhood,
      city: r.city || s.city,
      state: r.state || s.state,
    }));
  }

  async function saveAll() {
    await update.mutateAsync({
      name: f.name.trim(),
      phone: f.phone.trim() || undefined,
      bio: f.bio.trim() || undefined,
      zipCode: f.zipCode.trim() || undefined,
      street: f.street.trim() || undefined,
      number: f.number.trim() || undefined,
      neighborhood: f.neighborhood.trim() || undefined,
      city: f.city.trim() || undefined,
      state: f.state.trim() || undefined,
    });
    setOk(true);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void saveAll();
      }}
      className="space-y-4"
    >
      {/* Dados pessoais */}
      <Card className="space-y-4 p-5">
        <SectionTitle icon={<LuUser size={16} />} title="Informações pessoais" />
        <div className="flex items-center gap-4">
          <AvatarUploader value={avatarUrl} name={f.name} onChange={(u) => void saveAvatar(u)} />
          <div className="text-sm text-text-muted">
            <p className="font-medium text-foreground">Foto de perfil</p>
            <p>Toque na foto para trocar, recortar e enviar.</p>
          </div>
        </div>
        <Input label="Nome" value={f.name} onChange={set('name')} />
        <Input label="Telefone" value={f.phone} onChange={set('phone')} placeholder="(11) 99999-8888" />
        <div>
          <p className="mb-1 text-sm text-text-muted">E-mail</p>
          <div className="rounded-medium border border-border bg-content2/50 px-3 py-2.5 text-sm text-text-muted">
            {profile.email ?? 'Sem e-mail cadastrado'}
          </div>
        </div>
        <Input label="Bio" value={f.bio} onChange={set('bio')} placeholder="Uma linha sobre você (opcional)" />
      </Card>

      {/* Endereço */}
      <Card className="space-y-4 p-5">
        <SectionTitle icon={<LuMapPin size={16} />} title="Endereço" />
        <CepField value={f.zipCode} onChange={set('zipCode')} onResolved={applyCep} />
        <Input label="Rua" value={f.street} onChange={set('street')} />
        <Input label="Número" value={f.number} onChange={set('number')} />
        <Input label="Bairro" value={f.neighborhood} onChange={set('neighborhood')} />
        <div className="grid grid-cols-[1fr,5rem] gap-3">
          <Input label="Cidade" value={f.city} onChange={set('city')} />
          <Input label="UF" value={f.state} onChange={set('state')} placeholder="SP" />
        </div>
      </Card>

      {update.isError && <p className="text-sm text-danger">{(update.error as Error).message}</p>}

      {/* Único salvar de todo o perfil */}
      <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-large border border-border bg-content1/95 p-3 shadow-pop backdrop-blur">
        <Button type="submit" full loading={update.isPending}>
          Salvar alterações
        </Button>
        {ok && <span className="shrink-0 text-sm text-success">Salvo!</span>}
      </div>
    </form>
  );
}

/* ───────── Senha (ação separada, fluxo próprio) ───────── */
function PasswordSection({ hasPassword, hasEmail }: { hasPassword: boolean; hasEmail: boolean }) {
  const requestOtp = useRequestPasswordOtp();
  const setPassword = useSetPassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [current, next, code]);

  async function sendOtp() {
    setError(null);
    try {
      const res = await requestOtp.mutateAsync();
      setOtpSent(true);
      setDevCode(res.devCode ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function submit() {
    setError(null);
    if (next.length < 8) {
      setError('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }
    try {
      await setPassword.mutateAsync(
        hasPassword ? { newPassword: next, currentPassword: current } : { newPassword: next, code },
      );
      setDone(true);
      setCurrent('');
      setNext('');
      setCode('');
      setOtpSent(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <SectionTitle icon={<LuLock size={16} />} title={hasPassword ? 'Alterar senha' : 'Cadastrar senha'} />

      {done && <p className="rounded-medium bg-success/15 px-3 py-2 text-sm text-success">Senha atualizada com sucesso.</p>}

      {hasPassword ? (
        <>
          <Input label="Senha atual" type="password" value={current} onChange={setCurrent} />
          <Input label="Nova senha" type="password" value={next} onChange={setNext} placeholder="Mín. 8 caracteres" />
        </>
      ) : (
        <>
          <p className="text-sm text-text-muted">
            Sua conta usa código por e-mail. Para criar uma senha, confirme seu e-mail com o código e defina a senha.
          </p>
          {!otpSent ? (
            <Button variant="secondary" onClick={() => void sendOtp()} loading={requestOtp.isPending} disabled={!hasEmail}>
              {hasEmail ? 'Enviar código ao meu e-mail' : 'Cadastre um e-mail primeiro'}
            </Button>
          ) : (
            <>
              {devCode && <p className="text-xs text-text-muted">Código (dev): <strong>{devCode}</strong></p>}
              <Input label="Código do e-mail" value={code} onChange={setCode} placeholder="6 dígitos" />
              <Input label="Nova senha" type="password" value={next} onChange={setNext} placeholder="Mín. 8 caracteres" />
            </>
          )}
        </>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      {(hasPassword || otpSent) && (
        <Button onClick={() => void submit()} loading={setPassword.isPending}>
          {hasPassword ? 'Alterar senha' : 'Cadastrar senha'}
        </Button>
      )}
    </Card>
  );
}

/* ───────── Zona de risco: excluir conta (LGPD) ───────── */
function DangerZoneSection() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    try {
      await api.deleteAccount();
      await logout();
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  }

  return (
    <Card className="space-y-3 border-danger/30 p-5">
      <SectionTitle icon={<LuTrash2 size={16} />} title="Excluir minha conta" />
      <p className="text-sm text-text-muted">
        Remove seus dados pessoais e encerra o acesso. Registros financeiros exigidos por lei são
        mantidos de forma anonimizada. Esta ação não pode ser desfeita.
      </p>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button variant="secondary" className="text-danger" onClick={() => setOpen(true)}>
        Excluir minha conta
      </Button>
      <ConfirmDialog
        open={open}
        danger
        title="Excluir sua conta?"
        description="Seus dados pessoais serão removidos e você perderá o acesso. Não é possível desfazer."
        confirmLabel="Excluir conta"
        onConfirm={remove}
        onClose={() => setOpen(false)}
      />
    </Card>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="text-primary">{icon}</span>
      {title}
    </div>
  );
}
