import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { MyQuotesPage } from './features/quotes/MyQuotesPage';
import { NewQuotePage } from './features/quotes/NewQuotePage';
import { QuoteDetailPage } from './features/quotes/QuoteDetailPage';
import { NegotiationPage } from './features/quotes/NegotiationPage';
import { CompareProposalsPage } from './features/quotes/CompareProposalsPage';
import { MyVisitsPage } from './features/quotes/MyVisitsPage';
import { NegociacoesPage } from './features/negociacoes/NegociacoesPage';
import { InboxPage } from './features/inbox/InboxPage';
import { EuPage } from './features/profile/EuPage';

export function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Visitante deslogado: landing pública na home + login. Usuário logado vai direto ao app.
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
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
        <Route
          path="orcamento/:quoteId/negociacao/:conversationId"
          element={<NegotiationPage />}
        />
        {/* Compat com links antigos de conversa */}
        <Route
          path="orcamento/:quoteId/conversa/:conversationId"
          element={<NegotiationPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
