import { Suspense } from 'react';
import { lazyPage } from './lib/lazyPage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { LegalPage } from './components/LegalPage';
import { LegalIndex } from './components/LegalIndex';
import { TermsGate } from './components/TermsGate';
import { Spinner } from './components/ui';

// Code-splitting: cada tela vira um chunk carregado sob demanda.
const LandingPage = lazyPage(() => import('./features/landing/LandingPage'), 'LandingPage');
const AvaliacoesPage = lazyPage(() => import('./features/landing/AvaliacoesPage'), 'AvaliacoesPage');
const LoginPage = lazyPage(() => import('./features/auth/LoginPage'), 'LoginPage');
const MyQuotesPage = lazyPage(() => import('./features/quotes/MyQuotesPage'), 'MyQuotesPage');
const NewQuotePage = lazyPage(() => import('./features/quotes/NewQuotePage'), 'NewQuotePage');
const QuoteDetailPage = lazyPage(() => import('./features/quotes/QuoteDetailPage'), 'QuoteDetailPage');
const NegotiationPage = lazyPage(() => import('./features/quotes/NegotiationPage'), 'NegotiationPage');
const CompareProposalsPage = lazyPage(() => import('./features/quotes/CompareProposalsPage'), 'CompareProposalsPage');
const MyVisitsPage = lazyPage(() => import('./features/quotes/MyVisitsPage'), 'MyVisitsPage');
const InboxPage = lazyPage(() => import('./features/inbox/InboxPage'), 'InboxPage');
const EuPage = lazyPage(() => import('./features/profile/EuPage'), 'EuPage');
const ProfilePage = lazyPage(() => import('./features/profile/ProfilePage'), 'ProfilePage');
const ProviderProfilePage = lazyPage(() => import('./features/providers/ProviderProfilePage'), 'ProviderProfilePage');
const ChatDemoPage = lazyPage(() => import('./features/chat-demo/ChatDemoPage'), 'ChatDemoPage');
const NotFoundPage = lazyPage(() => import('./features/misc/NotFoundPage'), 'NotFoundPage');

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
        <Route path="/avaliacoes" element={<AvaliacoesPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />} />
        {/* Documentos legais (públicos). */}
        <Route path="/legal" element={<LegalIndex />} />
        <Route path="/termos" element={<LegalPage doc="terms" />} />
        <Route path="/privacidade" element={<LegalPage doc="privacy" />} />
        <Route path="/conduta" element={<LegalPage doc="conduct" />} />
        <Route path="/reembolso" element={<LegalPage doc="refund" />} />
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
