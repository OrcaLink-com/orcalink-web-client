import { useEffect, useState } from "react";
import { brand } from "@orcalink/design-tokens/brand.config";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";
import { Button, Card, Input } from "../../components/ui";

type Mode = "code" | "password";

/** Sem credencial no build, o bloco do Google (e o divisor) não aparecem. */
const googleEnabled = Boolean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);

/**
 * Entrada do cliente. Caminhos: Google (se configurado), código no e-mail (OTP)
 * ou e-mail + senha. O canal por telefone saiu — SMS/WhatsApp têm custo por
 * mensagem e o backend recusa o canal (AUTH_PHONE_OTP_ENABLED).
 */
export function LoginPage() {
  const { requestOtp, verifyOtp, loginWithGoogle, loginWithPassword } =
    useAuth();
  const [mode, setMode] = useState<Mode>("code");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Limpa o erro assim que o usuário edita os campos.
  useEffect(() => {
    setError(null);
  }, [email, code, name, password]);

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

  const onRequest = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await requestOtp("EMAIL", email.trim());
      setDevCode(res.devCode ?? null);
      setRegistered(res.registered);
      if (res.devCode) setCode(res.devCode); // conveniência em dev
      setStep("verify");
    });
  };

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    void run(() =>
      verifyOtp("EMAIL", email.trim(), code.trim(), name.trim() || undefined),
    );
  };

  const onPassword = (e: React.FormEvent) => {
    e.preventDefault();
    void run(() => loginWithPassword(email.trim(), password));
  };

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-10">
      <h1 className="mb-1 text-center text-2xl font-bold text-brand">
        {brand.name}
      </h1>
      <p className="mb-6 text-center text-sm text-text-muted">
        Entre para solicitar e acompanhar seus orçamentos.
      </p>

      <Card className="space-y-5 p-5">
        {/* Google primeiro: um toque, sem código. Some (com o divisor) se não
            houver VITE_FIREBASE_AUTH_DOMAIN — o login por e-mail segue inteiro. */}
        {googleEnabled && (
          <>
            <GoogleSignInButton
              onCredential={(idToken) => run(() => loginWithGoogle(idToken))}
              onError={setError}
            />
            <Divider />
          </>
        )}

        {step === "verify" ? (
          <form onSubmit={onVerify} className="space-y-4">
            <p className="text-sm text-text-muted">
              Enviamos um código para{" "}
              <strong className="text-foreground">{email}</strong>.
            </p>
            {devCode && (
              <p className="rounded-medium bg-content2 px-3 py-2 text-xs text-text-muted">
                Modo dev — código: <strong>{devCode}</strong>
              </p>
            )}
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
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" full loading={loading}>
              Entrar
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setError(null);
              }}
              className="w-full text-center text-sm text-text-muted underline"
            >
              Usar outro e-mail
            </button>
          </form>
        ) : mode === "code" ? (
          <form onSubmit={onRequest} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="voce@exemplo.com"
              isRequired
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" full loading={loading}>
              Receber código por e-mail
            </Button>
            <button
              type="button"
              onClick={() => setMode("password")}
              className="w-full text-center text-sm text-text-muted underline"
            >
              Entrar com senha
            </button>
          </form>
        ) : (
          <form onSubmit={onPassword} className="space-y-4">
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
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" full loading={loading}>
              Entrar
            </Button>
            <button
              type="button"
              onClick={() => setMode("code")}
              className="w-full text-center text-sm text-text-muted underline"
            >
              Prefiro receber um código por e-mail
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-text-muted">ou</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
