import { useEffect, useState } from "react";
import { LuArrowLeft, LuShieldCheck } from "react-icons/lu";
import { Link } from "react-router-dom";
import { brand } from "@orcalink/design-tokens/brand.config";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { Button, Input } from "../../components/ui";

/** Sem credencial no build, o bloco do Google (e o divisor) não aparecem. */
const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

type Screen = "start" | "otp" | "password" | "password2fa";

/**
 * Entrada do cliente — mobile-first, alinhada à marca.
 * Google em destaque no topo; código no e-mail ou e-mail + senha logo abaixo.
 * Login por senha em aparelho novo pede um código (2FA); "confiar neste
 * dispositivo" dispensa o código nas próximas vezes. Telefone saiu (custo de SMS).
 */
export function LoginPage() {
  const { requestOtp, verifyOtp, loginWithGoogle, loginWithPassword } =
    useAuth();

  const [screen, setScreen] = useState<Screen>("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [trust, setTrust] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setError(null), [email, password, code, name, screen]);

  async function run(fn: () => Promise<void>) {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const goRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await requestOtp("EMAIL", email.trim());
      setRegistered(res.registered);
      setDevCode(res.devCode ?? null);
      if (res.devCode) setCode(res.devCode);
      setScreen("otp");
    });
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    void run(() =>
      verifyOtp("EMAIL", email.trim(), code.trim(), name.trim() || undefined),
    );
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await loginWithPassword(email.trim(), password, {
        code: screen === "password2fa" ? code.trim() : undefined,
        trustDevice: screen === "password2fa" ? trust : undefined,
      });
      if (res.status === "code_required") {
        setDevCode(res.devCode ?? null);
        if (res.devCode) setCode(res.devCode);
        setScreen("password2fa");
      }
    });
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-5 py-10">
      {/* Atmosfera da marca: brilho radial azul + textura sutil (não distrai). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-12%] h-[46rem] w-[46rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(59,130,246,0.22), rgba(29,78,216,0.08) 55%, transparent 75%)",
          }}
        />
      </div>

      <div
        className={`relative w-full max-w-sm transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {/* Marca */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 scale-150 rounded-full opacity-80 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(59,130,246,0.35), transparent)",
              }}
            />
            <img
              src="/brand/mark.svg"
              alt=""
              className="h-16 w-16 rounded-2xl shadow-pop"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {screen === "otp" || screen === "password2fa"
              ? "Confirme que é você"
              : `Entrar na ${brand.name}`}
          </h1>
          <p className="mt-1.5 max-w-[17rem] text-sm text-text-muted">
            {headerSubtitle(screen, email)}
          </p>
        </div>

        {/* Card de autenticação */}
        <div className="rounded-large border border-border bg-content1/80 p-5 shadow-pop backdrop-blur-sm sm:p-6">
          {/* Google + divisor só aparecem na entrada inicial */}
          {googleEnabled && screen === "start" && (
            <>
              <GoogleSignInButton
                onCode={(code) => run(() => loginWithGoogle(code))}
                onError={setError}
              />
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  ou
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {screen === "start" && (
            <form onSubmit={goRequestOtp} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="voce@exemplo.com"
                isRequired
              />
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit" full size="lg" loading={loading}>
                Receber código por e-mail
              </Button>
              <TextLink onClick={() => setScreen("password")}>
                Já tenho senha
              </TextLink>
            </form>
          )}

          {screen === "otp" && (
            <form onSubmit={submitOtp} className="space-y-4">
              {devCode && <DevCode code={devCode} />}
              <Input
                label="Código de 6 dígitos"
                value={code}
                onChange={setCode}
                placeholder="000000"
              />
              {!registered && (
                <Input
                  label="Seu nome"
                  value={name}
                  onChange={setName}
                  placeholder="Como te chamamos?"
                />
              )}
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit" full size="lg" loading={loading}>
                Entrar
              </Button>
              <BackLink onClick={() => setScreen("start")}>
                Usar outro e-mail
              </BackLink>
            </form>
          )}

          {screen === "password" && (
            <form onSubmit={submitPassword} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="voce@exemplo.com"
                isRequired
              />
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Sua senha"
                isRequired
              />
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit" full size="lg" loading={loading}>
                Entrar
              </Button>
              <TextLink onClick={() => setScreen("start")}>
                Prefiro receber um código
              </TextLink>
            </form>
          )}

          {screen === "password2fa" && (
            <form onSubmit={submitPassword} className="space-y-4">
              {devCode && <DevCode code={devCode} />}
              <Input
                label="Código de 6 dígitos"
                value={code}
                onChange={setCode}
                placeholder="000000"
              />
              <label className="flex cursor-pointer items-start gap-2.5 rounded-medium border border-border bg-content2/40 p-3">
                <input
                  type="checkbox"
                  checked={trust}
                  onChange={(e) => setTrust(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-sm text-text-muted">
                  <span className="font-medium text-foreground">
                    Confiar neste dispositivo
                  </span>{" "}
                  por 60 dias — não pedir código de novo, só a senha.
                </span>
              </label>
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit" full size="lg" loading={loading}>
                Confirmar e entrar
              </Button>
              <BackLink onClick={() => setScreen("password")}>Voltar</BackLink>
            </form>
          )}
        </div>

        {/* Confiança */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <LuShieldCheck size={14} className="text-success" />
          Seus dados ficam protegidos.{" "}
          <Link
            to="/privacidade"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}

function headerSubtitle(screen: Screen, email: string): string {
  switch (screen) {
    case "otp":
      return `Enviamos um código para ${email}.`;
    case "password2fa":
      return `Primeiro acesso neste aparelho. Enviamos um código para ${email}.`;
    case "password":
      return "Entre com seu e-mail e senha.";
    default:
      return "Solicite e acompanhe seus orçamentos com segurança.";
  }
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-danger">{children}</p>;
}

function DevCode({ code }: { code: string }) {
  return (
    <p className="rounded-medium bg-content2 px-3 py-2 text-xs text-text-muted">
      Modo dev — código: <strong className="text-foreground">{code}</strong>
    </p>
  );
}

function TextLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
    >
      {children}
    </button>
  );
}

function BackLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1 text-sm text-text-muted transition-colors hover:text-foreground"
    >
      <LuArrowLeft size={14} /> {children}
    </button>
  );
}
