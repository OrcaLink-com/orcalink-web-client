import { useEffect, useState } from 'react';
import { LuArrowLeft, LuLock, LuMapPin, LuUser } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useProfile, useRequestPasswordOtp, useSetPassword, useUpdateMe } from '../../lib/queries';
import { AvatarUploader } from '../../components/AvatarUploader';
import { Button, Card, Input, Spinner } from '../../components/ui';

/** Tela "Meu Perfil": dados pessoais, endereço e senha. */
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

      <PersonalSection profile={p} />
      <AddressSection profile={p} />
      <PasswordSection hasPassword={p.hasPassword} hasEmail={Boolean(p.email)} />
    </div>
  );
}

/* ───────── Dados pessoais ───────── */
function PersonalSection({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>['data']> }) {
  const update = useUpdateMe();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(false), 2500);
    return () => clearTimeout(t);
  }, [ok]);

  async function saveAvatar(url: string) {
    setAvatarUrl(url);
    await update.mutateAsync({ avatarUrl: url });
    setOk(true);
  }

  async function save() {
    await update.mutateAsync({ name: name.trim(), phone: phone.trim() || undefined, bio: bio.trim() || undefined });
    setOk(true);
  }

  return (
    <Card className="space-y-4 p-5">
      <SectionTitle icon={<LuUser size={16} />} title="Informações pessoais" />
      <div className="flex items-center gap-4">
        <AvatarUploader value={avatarUrl} name={name} onChange={(u) => void saveAvatar(u)} />
        <div className="text-sm text-text-muted">
          <p className="font-medium text-foreground">Foto de perfil</p>
          <p>Toque na foto para trocar, recortar e enviar.</p>
        </div>
      </div>

      <Input label="Nome" value={name} onChange={setName} />
      <Input label="Telefone" value={phone} onChange={setPhone} placeholder="(11) 99999-8888" />
      <div>
        <p className="mb-1 text-sm text-text-muted">E-mail</p>
        <div className="rounded-medium border border-border bg-content2/50 px-3 py-2.5 text-sm text-text-muted">
          {profile.email ?? 'Sem e-mail cadastrado'}
        </div>
      </div>
      <Input label="Bio" value={bio} onChange={setBio} placeholder="Uma linha sobre você (opcional)" />

      {update.isError && <p className="text-sm text-danger">{(update.error as Error).message}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={() => void save()} loading={update.isPending}>
          Salvar alterações
        </Button>
        {ok && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </Card>
  );
}

/* ───────── Endereço ───────── */
function AddressSection({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>['data']> }) {
  const update = useUpdateMe();
  const [form, setForm] = useState({
    zipCode: profile.zipCode ?? '',
    street: profile.street ?? '',
    number: profile.number ?? '',
    neighborhood: profile.neighborhood ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
  });
  const [ok, setOk] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(false), 2500);
    return () => clearTimeout(t);
  }, [ok]);

  async function save() {
    await update.mutateAsync(form);
    setOk(true);
  }

  return (
    <Card className="space-y-4 p-5">
      <SectionTitle icon={<LuMapPin size={16} />} title="Endereço" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="CEP" value={form.zipCode} onChange={set('zipCode')} placeholder="00000-000" />
        <Input label="Número" value={form.number} onChange={set('number')} />
      </div>
      <Input label="Rua" value={form.street} onChange={set('street')} />
      <Input label="Bairro" value={form.neighborhood} onChange={set('neighborhood')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Cidade" value={form.city} onChange={set('city')} />
        <Input label="Estado" value={form.state} onChange={set('state')} placeholder="UF" />
      </div>
      {update.isError && <p className="text-sm text-danger">{(update.error as Error).message}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={() => void save()} loading={update.isPending}>
          Salvar endereço
        </Button>
        {ok && <span className="text-sm text-success">Salvo!</span>}
      </div>
    </Card>
  );
}

/* ───────── Senha ───────── */
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

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="text-primary">{icon}</span>
      {title}
    </div>
  );
}
