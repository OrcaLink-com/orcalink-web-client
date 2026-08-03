/**
 * Modo de operação do app.
 *
 * `VITE_PAYMENTS_ENABLED=true` → fluxo de pagamento (custódia/Asaas/faseado).
 * AUSENTE/`false` → **modo indicação**: a plataforma só conecta cliente e
 * profissional; o pagamento é combinado por fora. É o default de validação.
 */
export const paymentsEnabled =
  String(import.meta.env.VITE_PAYMENTS_ENABLED ?? '').toLowerCase() === 'true';
