import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { LegalPage } from './components/LegalPage';
import { TermsGate } from './components/TermsGate';
import { Spinner } from './components/ui';

// Code-splitting: cada tela vira um chunk carregado sob demanda.
const LandingPage = lazy(() => import('./features/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const MyQuotesPage = lazy(() => import('./features/quotes/MyQuotesPage').then((m) => ({ default: m.MyQuotesPage })));
const NewQuotePage = lazy(() => import('./features/quotes/NewQuotePage').then((m) => ({ default: m.NewQuotePage })));
const QuoteDetailPage = lazy(() => import('./features/quotes/QuoteDetailPage').then((m) => ({ default: m.QuoteDetailPage })));
const NegotiationPage = lazy(() => import('./features/quotes/NegotiationPage').then((m) => ({ default: m.NegotiationPage })));
const CompareProposalsPage = lazy(() => import('./features/quotes/CompareProposalsPage').then((m) => ({ default: m.CompareProposalsPage })));
const MyVisitsPage = lazy(() => import('./features/quotes/MyVisitsPage').then((m) => ({ default: m.MyVisitsPage })));
const InboxPage = lazy(() => import('./features/inbox/InboxPage').then((m) => ({ default: m.InboxPage })));
const EuPage = lazy(() => import('./features/profile/EuPage').then((m) => ({ default: m.EuPage })));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ProviderProfilePage = lazy(() => import('./features/providers/ProviderProfilePage').then((m) => ({ default: m.ProviderProfilePage })));
const ChatDemoPage = lazy(() => import('./features/chat-demo/ChatDemoPage').then((m) => ({ default: m.ChatDemoPage })));
const NotFoundPage = lazy(() => import('./features/misc/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function Loading() {
  return <Spinner label="Carregando…" />;
}

export function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Público: a landing é sempre a home em "/" (mesmo logado). */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />} />
        {/* Documentos legais (públicos). */}
        <Route path="/termos" element={<LegalPage doc="terms" />} />
        <Route path="/privacidade" element={<LegalPage doc="privacy" />} />
        <Route path="/conduta" element={<LegalPage doc="conduct" />} />
        {/* Compat: quem tinha "/site" salvo cai na landing. */}
        <Route path="/site" element={<Navigate to="/" replace />} />

        {/* Área autenticada sob "/app". */}
        <Route
          path="/app/*"
          element={isAuthenticated ? <AuthenticatedApp /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* Portão de aceite dos Termos/Privacidade (bloqueia até aceitar). */}
      {isAuthenticated && <TermsGate />}
    </Suspense>
  );
}

/** Rotas internas do app (relativas a "/app"). */
function AuthenticatedApp() {
  return (
    <Routes>
      {/* Demo do módulo de chat premium (tela cheia, isolada). */}
      <Route path="chat-demo" element={<ChatDemoPage />} />
      <Route element={<Layout />}>
        <Route index element={<MyQuotesPage />} />
        {/* Negociações agora vivem dentro de cada orçamento (hub em "/app"). */}
        <Route path="negociacoes" element={<Navigate to="/app" replace />} />
        <Route path="eu" element={<EuPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="prestador/:providerId" element={<ProviderProfilePage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="novo" element={<NewQuotePage />} />
        <Route path="visitas" element={<MyVisitsPage />} />
        <Route path="orcamento/:quoteId" element={<QuoteDetailPage />} />
        <Route path="orcamento/:quoteId/propostas" element={<CompareProposalsPage />} />
        <Route path="orcamento/:quoteId/negociacao/:conversationId" element={<NegotiationPage />} />
        {/* Compat com links antigos de conversa */}
        <Route path="orcamento/:quoteId/conversa/:conversationId" element={<NegotiationPage />} />
        <Route path="*" element={<NotFoundPage homeTo="/app" />} />
      </Route>
    </Routes>
  );
}
