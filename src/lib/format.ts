/** Formata centavos (Int) como BRL. */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Fuso oficial da plataforma — todas as datas de agendamento são exibidas nele. */
export const APP_TZ = 'America/Sao_Paulo';

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: APP_TZ });
}

/** Só a hora (HH:mm) no fuso da plataforma. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: APP_TZ });
}
