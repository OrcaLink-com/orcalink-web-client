import { useState } from 'react';
import { api } from './api';
import type { CepLookup } from './types';

/**
 * Busca de endereço por CEP (ViaCEP + coordenadas), reutilizável em qualquer
 * formulário de endereço. Só dispara com 8 dígitos; nunca lança.
 */
export function useCep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(rawCep: string): Promise<CepLookup | null> {
    const digits = (rawCep || '').replace(/\D/g, '');
    if (digits.length !== 8) return null;
    setLoading(true);
    setError(null);
    try {
      return await api.lookupCep(digits);
    } catch {
      setError('Não encontramos esse CEP.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { lookup, loading, error };
}
