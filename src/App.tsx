import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
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
const NegociacoesPage = lazy(() => import('./features/negociacoes/NegociacoesPage').then((m) => ({ default: m.NegociacoesPage })));
const InboxPage = lazy(() => import('./features/inbox/InboxPage').then((m) => ({ default: m.InboxPage })));
const EuPage = lazy(() => import('./features/profile/EuPage').then((m) => ({ default: m.EuPage })));

function Loading() {
  return <Spinner label="Carregando…" />;
}

export function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<MyQuotesPage />} />
          <Route path="negociacoes" element={<NegociacoesPage />} />
          <Route path="eu" element={<EuPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="novo" element={<NewQuotePage />} />
          <Route path="visitas" element={<MyVisitsPage />} />
          <Route path="orcamento/:quoteId" element={<QuoteDetailPage />} />
          <Route path="orcamento/:quoteId/propostas" element={<CompareProposalsPage />} />
          <Route path="orcamento/:quoteId/negociacao/:conversationId" element={<NegotiationPage />} />
          {/* Compat com links antigos de conversa */}
          <Route path="orcamento/:quoteId/conversa/:conversationId" element={<NegotiationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
