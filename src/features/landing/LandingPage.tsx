import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LuTarget, LuEye, LuHeart } from 'react-icons/lu';
import { Accordion, AccordionItem } from '@heroui/react';
import { brand } from '@orcalink/design-tokens/brand.config';
import { links } from '@orcalink/design-tokens/links.config';
import { useAuth } from '../../auth/AuthContext';
import { useCategories, useShowcaseReviews } from '../../lib/queries';
import { Button, ButtonLink } from '../../components/ui';
import { ContactModal } from '../../components/ContactModal';
import { ReviewCard } from '../../components/ReviewCard';
import {
  IconArrowRight,
  IconCompare,
  IconEye,
  IconFast,
  IconQuotes,
  IconRealtime,
  IconShield,
  IconStar,
  IconSuccess,
} from '../../components/icons';

/**
 * Landing page premium do Cliente (pública, para visitante deslogado).
 * Responsiva mobile→ultrawide. CTAs levam ao login; nav cruza p/ Prestador/Admin.
 */
export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingNav />
      <Hero />
      <TrustStrip />
      {/* Primeiro o que o visitante pode fazer; "quem somos" mais pro fim. */}
      <Services />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <MissionVisionValues />
      <Faq />
      <Footer />
    </div>
  );
}

/* ───────── Nav ───────── */
function LandingNav() {
  const { isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <a href="#topo" aria-label={brand.name}>
          <img src="/brand/logo.svg" alt={brand.name} className="h-10 w-auto" />
        </a>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a
            href={links.providerUrl}
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:text-foreground sm:inline-block"
          >
            Sou profissional
          </a>
          <ButtonLink to={isAuthenticated ? '/app' : '/login'} size="sm">
            {isAuthenticated ? 'Entrar no app' : 'Entrar'}
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(59,130,246,0.2),transparent)]" />
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-content1 px-3 py-1 text-xs text-text-muted">
          <IconStar size={13} className="text-warning" /> Profissionais verificados
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Orçamentos de serviços, <span className="text-primary">sem complicação</span>.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-text-muted">
          Descreva o que precisa, receba propostas de profissionais qualificados, compare e contrate
          com segurança — tudo num só lugar.
        </p>
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <ButtonLink to="/login" size="lg" endContent={<IconArrowRight size={18} />}>
            Solicitar orçamento
          </ButtonLink>
          <Button variant="secondary" size="lg" onClick={() => scrollTo('servicos')}>
            Conhecer serviços
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ───────── Faixa de confiança (sinais reais, sem números inflados) ───────── */
function TrustStrip() {
  const signals = [
    { icon: <IconShield size={20} />, title: 'Pagamento protegido', desc: 'O valor fica em custódia e só é liberado quando você confirma a conclusão.' },
    { icon: <IconSuccess size={20} />, title: 'Profissionais verificados', desc: 'Cadastro com aprovação antes de começar a atender.' },
    { icon: <IconQuotes size={20} />, title: 'Grátis para o cliente', desc: 'Peça orçamentos e compare propostas sem pagar para usar.' },
    { icon: <IconRealtime size={20} />, title: 'Suporte e mediação', desc: 'Acompanhamos cada serviço e mediamos se algo sair do combinado.' },
  ];
  return (
    <section className="border-y border-border bg-content1/50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {signals.map((s) => (
          <div key={s.title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-medium bg-primary/15 text-primary">
              {s.icon}
            </span>
            <div>
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── Serviços ───────── */
function Services() {
  const { data } = useCategories();
  const cats = (data ?? []).slice(0, 8);
  const fallback = ['Pintura', 'Marcenaria', 'Elétrica', 'Encanamento', 'Limpeza', 'Reformas'];
  const items = cats.length ? cats.map((c) => c.name) : fallback;
  return (
    <Section id="servicos" eyebrow="Serviços" title="Tudo o que sua casa ou negócio precisa">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((name) => (
          <div
            key={name}
            className="group rounded-large border border-border bg-content1 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-medium bg-primary/15 text-primary">
              <IconQuotes size={20} />
            </div>
            <p className="font-semibold">{name}</p>
            <p className="mt-1 text-xs text-text-muted">Receba propostas de profissionais da sua região.</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────── Como funciona ───────── */
function HowItWorks() {
  const steps: { title: string; desc: string }[] = [
    { title: 'Solicite um orçamento', desc: 'Descreva o serviço, adicione fotos e envie em minutos.' },
    { title: 'Receba propostas', desc: 'Profissionais verificados respondem com valores e prazos.' },
    { title: 'Escolha o melhor profissional', desc: 'Compare propostas, avaliações e portfólio.' },
    { title: 'Pague com segurança pela plataforma', desc: 'O valor fica em custódia e só é liberado quando o serviço é concluído.' },
    { title: 'Acompanhe o serviço', desc: 'Chat, agendamento e status em tempo real.' },
    { title: 'Avalie o prestador', desc: 'Sua nota ajuda toda a comunidade.' },
  ];
  return (
    <Section eyebrow="Como funciona" title="Do pedido à avaliação, em 6 passos">
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-large border border-border bg-content1 p-5 shadow-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {i + 1}
            </span>
            <p className="mt-3 text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-xs text-text-muted">{s.desc}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ───────── Missão · Visão · Valores ───────── */
function MissionVisionValues() {
  const cards = [
    {
      icon: <LuTarget size={20} />,
      label: 'Missão',
      text: 'Conectar pessoas aos melhores profissionais de serviços, com transparência, segurança e simplicidade.',
    },
    {
      icon: <LuEye size={20} />,
      label: 'Visão',
      text: 'Ser a plataforma de referência em contratação de serviços no Brasil, onde cada contratação inspira confiança.',
    },
    {
      icon: <LuHeart size={20} />,
      label: 'Valores',
      text: 'Confiança, transparência, qualidade e respeito — em cada orçamento, conversa e pagamento.',
    },
  ];
  return (
    <Section eyebrow="Quem somos" title="Missão, visão e valores" className="bg-content1/30">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-large border border-border bg-content1 p-5 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              {c.icon}
            </span>
            <p className="mt-3 text-sm font-semibold">{c.label}</p>
            <p className="mt-1 text-sm text-text-muted">{c.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────── Benefícios ───────── */
function Benefits() {
  // Sem repetir a faixa de confiança (custódia/verificação); foco nos diferenciais.
  const benefits = [
    { icon: <IconFast size={20} />, title: 'Atendimento rápido', desc: 'Receba as primeiras propostas em poucas horas.' },
    { icon: <IconCompare size={20} />, title: 'Compare propostas', desc: 'Veja valores, prazos e garantias lado a lado antes de decidir.' },
    { icon: <IconRealtime size={20} />, title: 'Acompanhamento em tempo real', desc: 'Conversa, agendamento, visitas e status num só lugar.' },
    { icon: <IconEye size={20} />, title: 'Transparência total', desc: 'Histórico completo de cada orçamento e negociação.' },
  ];
  return (
    <Section eyebrow="Por que a gente" title="Feito para facilitar a sua vida" className="bg-content1/30">
      <div className="grid gap-4 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-large border border-border bg-content1 p-5 shadow-card">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-medium bg-primary/15 text-primary">
              {b.icon}
            </div>
            <p className="font-semibold">{b.title}</p>
            <p className="mt-1 text-sm text-text-muted">{b.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────── Avaliações reais (data-driven) ───────── */
function Testimonials() {
  const { data, isLoading } = useShowcaseReviews(3, 0);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  // Enquanto carrega, não pisca a seção (evita empty-state falso).
  if (isLoading) {
    return (
      <Section eyebrow="Avaliações" title="O que dizem sobre a Orca Link">
        <div className="mx-auto max-w-md text-center text-sm text-text-muted">Carregando…</div>
      </Section>
    );
  }

  // Sem avaliações ainda: convite honesto a ser o primeiro.
  if (total === 0) {
    return (
      <Section eyebrow="Avaliações" title="Seja um dos primeiros">
        <div className="mx-auto max-w-lg rounded-large border border-dashed border-border bg-content1 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <IconStar size={22} />
          </div>
          <p className="text-base font-semibold">Ainda não há avaliações por aqui</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-muted">
            Contrate um profissional pela plataforma e deixe a primeira avaliação — ela aparece aqui
            para ajudar outras pessoas a decidir.
          </p>
          <div className="mt-5">
            <ButtonLink to="/login" endContent={<IconArrowRight size={16} />}>
              Solicitar orçamento
            </ButtonLink>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section eyebrow="Avaliações" title="Quem usa, recomenda">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((r, i) => (
          <ReviewCard key={i} review={r} />
        ))}
      </div>
      {total > items.length && (
        <div className="mt-8 text-center">
          <ButtonLink to="/avaliacoes" variant="secondary">
            Ver todas as avaliações ({total})
          </ButtonLink>
        </div>
      )}
    </Section>
  );
}

/* ───────── FAQ ───────── */
function Faq() {
  const faqs = [
    { q: 'Quanto custa para solicitar um orçamento?', a: 'É gratuito para o cliente. Você só paga o serviço contratado.' },
    { q: 'Como sei que o profissional é confiável?', a: 'Todos passam por aprovação e têm avaliações de outros clientes.' },
    { q: 'O pagamento é seguro?', a: 'Sim. O valor fica em custódia e só é liberado quando você confirma a conclusão.' },
    { q: 'Posso comparar várias propostas?', a: 'Pode. Você compara valores, prazos e garantias lado a lado antes de decidir.' },
  ];
  return (
    <Section id="faq" eyebrow="Dúvidas" title="Perguntas frequentes" className="bg-content1/30">
      <div className="mx-auto max-w-3xl">
        <Accordion variant="bordered">
          {faqs.map((f) => (
            <AccordionItem key={f.q} title={f.q} classNames={{ title: 'text-sm font-medium' }}>
              <p className="text-sm text-text-muted">{f.a}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/* ───────── Footer ───────── */
function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <footer className="border-t border-border bg-content1/50">
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-primary">{brand.name}</p>
          <p className="mt-2 text-sm text-text-muted">Conectando você aos melhores profissionais.</p>
        </div>
        <FooterCol title="Plataforma" items={[['Solicitar orçamento', '/login'], ['Sou profissional', links.providerUrl], ['Perguntas frequentes', '#faq']]} />
        <FooterCol
          title="Legal"
          items={[['Política de privacidade', '/privacidade'], ['Termos de uso', '/termos']]}
          onContact={() => setContactOpen(true)}
        />
        <FooterCol title="Social" items={[['Instagram', '#'], ['LinkedIn', '#'], ['Facebook', '#']]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} {brand.legalName}
          </span>
          <a href={links.adminUrl} className="text-text-muted/60 hover:text-text-muted">
            Acesso administrativo
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items, onContact }: { title: string; items: [string, string][]; onContact?: () => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</p>
      <ul className="space-y-1.5">
        {items.map(([label, href]) => (
          <li key={label}>
            {href.startsWith('/') ? (
              <Link to={href} className="text-sm text-text-muted hover:text-foreground">
                {label}
              </Link>
            ) : (
              <a href={href} className="text-sm text-text-muted hover:text-foreground">
                {label}
              </a>
            )}
          </li>
        ))}
        {onContact && (
          <li>
            <button type="button" onClick={onContact} className="text-sm text-text-muted hover:text-foreground">
              Contato
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

/* ───────── helpers ───────── */
function Section({
  id,
  eyebrow,
  title,
  children,
  className = '',
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-8 text-center">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
