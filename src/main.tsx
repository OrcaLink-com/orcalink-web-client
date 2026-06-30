import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, useHref, useNavigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { AuthProvider } from './auth/AuthContext';
import { App } from './App';
import { PwaInstall } from './components/PwaInstall';
import './index.css';

const queryClient = new QueryClient();

/** Liga a navegação do HeroUI (ex.: Button as Link) ao React Router. */
function HeroUIWithRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {children}
    </HeroUIProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <HeroUIWithRouter>
            <div className="dark min-h-dvh bg-background text-foreground">
              <App />
              <PwaInstall />
            </div>
          </HeroUIWithRouter>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
