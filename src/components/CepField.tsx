import { useState } from 'react';
import { api } from '../lib/api';
import type { CepLookup } from '../lib/types';
import { Button, Input } from './ui';

/**
 * Campo de CEP com busca EXPLÍCITA (botão "Buscar CEP") — sem busca silenciosa.
 * Mostra loading, bloqueia cliques repetidos e dá erros amigáveis. Ao resolver,
 * chama `onResolved` com o endereço (o pai preenche os demais campos).
 */
export function CepField({
  value,
  onChange,
  onResolved,
  label = 'CEP',
}: {
  value: string;
  onChange: (v: string) => void;
  onResolved: (r: CepLookup) => void;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length !== 8) {
      setError('Digite um CEP com 8 dígitos.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await api.lookupCep(digits);
      onResolved(r);
    } catch (e) {
      const msg = (e as Error).message || '';
      setError(
        /não encontrado|not found|404/i.test(msg)
          ? 'CEP não encontrado. Confira o número ou preencha manualmente.'
          : 'Não foi possível buscar o CEP agora. Preencha manualmente ou tente de novo.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label={label}
            value={value}
            onChange={(v) => {
              onChange(v);
              if (error) setError(null);
            }}
            placeholder="00000-000"
          />
        </div>
        <Button variant="secondary" onClick={() => void search()} loading={loading} disabled={loading}>
          Buscar CEP
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-warning">{error}</p>}
    </div>
  );
}
