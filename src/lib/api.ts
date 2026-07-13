import type {
  AuthUser,
  AvailableSlotsResponse,
  Category,
  ClientConversation,
  NotificationsInbox,
  ConversationSummary,
  CreateQuoteInput,
  UploadQuota,
  LegalDoc,
  MeProfile,
  PendingLegal,
  Message,
  MyVisit,
  OtpChannel,
  PublicProviderProfile,
  UpdateMeInput,
  PricingView,
  Proposal,
  Quote,
  Review,
  TokenResponse,
  UploadResult,
  Visit,
} from './types';

import { reconnectSocket } from './realtime';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const ACCESS_KEY = 'ol_access';
const REFRESH_KEY = 'ol_refresh';
const USER_KEY = 'ol_user';

// ───────── Sessão (localStorage) ─────────
let onAuthLost: (() => void) | null = null;
export function setAuthLostHandler(fn: (() => void) | null): void {
  onAuthLost = fn;
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

function storeSession(res: TokenResponse): void {
  localStorage.setItem(ACCESS_KEY, res.accessToken);
  localStorage.setItem(REFRESH_KEY, res.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

const getAccess = () => localStorage.getItem(ACCESS_KEY);
const getRefresh = () => localStorage.getItem(REFRESH_KEY);

// ───────── HTTP helpers ─────────
async function parseError(res: Response): Promise<Error> {
  let message = `Erro ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (body?.message) {
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    }
  } catch {
    /* sem corpo JSON */
  }
  return new Error(message);
}

function doFetch(path: string, init: RequestInit, auth: boolean): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccess();
  if (auth && token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

// Refresh concorrente compartilha a mesma promise.
let refreshing: Promise<boolean> | null = null;
function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  const refreshToken = getRefresh();
  if (!refreshToken) return Promise.resolve(false);

  refreshing = fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = (await res.json()) as TokenResponse;
      // /auth/refresh não retorna user; preserva o atual.
      const user = getStoredUser();
      if (user) storeSession({ ...data, user });
      // Reconecta o socket com o token novo (senão o realtime fica mudo após expirar).
      reconnectSocket();
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  let res = await doFetch(path, init, auth);

  if (res.status === 401 && auth) {
    const ok = await tryRefresh();
    if (ok) {
      res = await doFetch(path, init, true);
    } else {
      clearSession();
      onAuthLost?.();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function jsonBody(data: unknown): RequestInit {
  return { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

// ───────── API ─────────
export const api = {
  // Auth
  requestOtp(channel: OtpChannel, destination: string) {
    return request<{ sent: boolean; registered: boolean; devCode?: string }>(
      '/auth/otp/request',
      jsonBody({ channel, destination }),
      false,
    );
  },
  async verifyOtp(channel: OtpChannel, destination: string, code: string, name?: string) {
    const res = await request<TokenResponse>(
      '/auth/otp/verify',
      jsonBody({ channel, destination, code, name }),
      false,
    );
    storeSession(res);
    return res.user;
  },
  me() {
    return request<AuthUser & { email: string | null; providerStatus: string | null }>('/auth/me');
  },
  getProfile() {
    return request<MeProfile>('/auth/me');
  },
  updateMe(input: UpdateMeInput) {
    return request<MeProfile>('/auth/me', { ...jsonBody(input), method: 'PATCH' });
  },
  requestPasswordOtp() {
    return request<{ sent: boolean; devCode?: string }>('/auth/password/otp', { method: 'POST' });
  },
  setPassword(input: { newPassword: string; code?: string; currentPassword?: string }) {
    return request<{ ok: boolean }>('/auth/password', { ...jsonBody(input), method: 'PATCH' });
  },
  acceptTerms() {
    return request<{ accepted: boolean; version: string }>('/auth/terms/accept', { method: 'POST' });
  },
  deleteAccount() {
    return request<{ ok: boolean }>('/auth/me', { method: 'DELETE' });
  },
  // Documentos legais (lidos do CMS no banco)
  getLegalDoc(slug: string) {
    return request<LegalDoc>(`/legal/${slug}`);
  },
  listLegalDocs() {
    return request<LegalDoc[]>('/legal');
  },
  getPendingLegal() {
    return request<PendingLegal[]>('/legal/pending');
  },
  acceptLegal() {
    return request<{ accepted: number }>('/legal/accept', { method: 'POST' });
  },
  async logout() {
    const refreshToken = getRefresh();
    try {
      if (refreshToken) await request('/auth/logout', jsonBody({ refreshToken }), false);
    } finally {
      clearSession();
    }
  },

  // Domínio
  listCategories() {
    return request<Category[]>('/categories', {}, false);
  },
  listMyQuotes() {
    return request<Quote[]>('/quotes');
  },
  getQuote(id: string) {
    return request<Quote>(`/quotes/${id}`);
  },
  createQuote(input: CreateQuoteInput) {
    return request<Quote>('/quotes', jsonBody(input));
  },

  // Negociação (cliente)
  listQuoteConversations(quoteId: string) {
    return request<ConversationSummary[]>(`/quotes/${quoteId}/conversations`);
  },
  /** Todas as negociações do cliente (lista global / CRM). */
  listMyConversations() {
    return request<ClientConversation[]>('/me/conversations');
  },
  getMessages(conversationId: string) {
    return request<Message[]>(`/conversations/${conversationId}/messages`);
  },
  reopenConversation(conversationId: string) {
    return request<{ ok: boolean }>(`/conversations/${conversationId}/reopen`, { method: 'POST' });
  },
  registerPushToken(token: string) {
    return request<void>('/notifications/push/register', jsonBody({ token, platform: 'web' }));
  },
  unregisterPushToken(token: string) {
    return request<void>('/notifications/push/register', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
  },
  getProviderPublicProfile(providerId: string) {
    return request<PublicProviderProfile>(`/providers/${providerId}/profile`);
  },
  sendContact(input: { subject: string; category: string; message: string; name?: string; email?: string }) {
    return request<{ ok: boolean; id: string }>('/contact', jsonBody(input));
  },
  sendMessage(conversationId: string, body: string) {
    return request<Message>(`/conversations/${conversationId}/messages`, jsonBody({ body }));
  },
  acceptProposal(proposalId: string) {
    return request<Proposal>(`/proposals/${proposalId}/accept`, { method: 'POST' });
  },
  rejectProposal(proposalId: string) {
    return request<Proposal>(`/proposals/${proposalId}/reject`, { method: 'POST' });
  },

  // Pricing & pagamento
  getPricing(quoteId: string) {
    return request<PricingView>(`/pricing/${quoteId}`);
  },
  pay(quoteId: string, method = 'PIX') {
    return request<{ status: string; invoiceUrl?: string | null; pixCopyPaste?: string | null }>(
      `/quotes/${quoteId}/pay`,
      jsonBody({ method }),
    );
  },
  complete(quoteId: string) {
    return request<{ status: string }>(`/quotes/${quoteId}/complete`, { method: 'POST' });
  },

  // Visitas
  listVisits(quoteId: string) {
    return request<Visit[]>(`/quotes/${quoteId}/visits`);
  },
  /** Todas as visitas do cliente em todos os orçamentos. */
  listMyVisits() {
    return request<MyVisit[]>('/me/visits');
  },
  confirmVisit(visitId: string) {
    return request<Visit>(`/visits/${visitId}/confirm`, { method: 'POST' });
  },
  /** Cliente confirma que a visita técnica foi realizada (libera a proposta final). */
  completeVisit(visitId: string) {
    return request<Visit>(`/visits/${visitId}/complete`, { method: 'POST' });
  },
  rescheduleVisit(visitId: string, scheduledAt: string, reason?: string) {
    return request<Visit>(`/visits/${visitId}/reschedule`, jsonBody({ scheduledAt, reason }));
  },
  cancelVisit(visitId: string, reason: string) {
    return request<Visit>(`/visits/${visitId}/cancel`, jsonBody({ reason }));
  },
  getVisitProviderSlots(visitId: string, date: string) {
    return request<AvailableSlotsResponse>(
      `/visits/${visitId}/provider-slots?date=${encodeURIComponent(date)}`,
    );
  },

  // Avaliações
  getReview(quoteId: string) {
    return request<Review | null>(`/quotes/${quoteId}/review`);
  },
  createReview(quoteId: string, rating: number, comment?: string) {
    return request<Review>(`/quotes/${quoteId}/review`, jsonBody({ rating, comment }));
  },
  // Notificações
  listNotifications() {
    return request<NotificationsInbox>('/notifications');
  },
  markNotificationRead(id: string) {
    return request<void>(`/notifications/${id}/read`, { method: 'POST' });
  },
  markAllNotificationsRead() {
    return request<void>('/notifications/read-all', { method: 'POST' });
  },

  uploadImage(file: File, kind?: string) {
    const form = new FormData();
    form.append('file', file);
    const qs = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    return request<UploadResult>(`/uploads${qs}`, { method: 'POST', body: form });
  },
  /** Quota de upload restante (janela rolante de 1h). */
  getUploadQuota() {
    return request<UploadQuota>('/uploads/quota');
  },
};
