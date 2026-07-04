import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { CreateQuoteInput, UpdateMeInput } from './types';

export const queryKeys = {
  categories: ['categories'] as const,
  quotes: ['quotes'] as const,
  quote: (id: string) => ['quotes', id] as const,
  quoteConversations: (id: string) => ['quotes', id, 'conversations'] as const,
  myConversations: ['me', 'conversations'] as const,
  uploadQuota: ['uploads', 'quota'] as const,
  messages: (conversationId: string) => ['conversations', conversationId, 'messages'] as const,
  pricing: (quoteId: string) => ['quotes', quoteId, 'pricing'] as const,
  visits: (quoteId: string) => ['quotes', quoteId, 'visits'] as const,
  review: (quoteId: string) => ['quotes', quoteId, 'review'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.listCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyQuotes() {
  return useQuery({ queryKey: queryKeys.quotes, queryFn: api.listMyQuotes });
}

export function useQuote(id: string) {
  return useQuery({ queryKey: queryKeys.quote(id), queryFn: () => api.getQuote(id) });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteInput) => api.createQuote(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.quotes });
    },
  });
}

// Tempo real via WebSocket; refetchInterval é apenas fallback (30s).
export function useQuoteConversations(quoteId: string) {
  return useQuery({
    queryKey: queryKeys.quoteConversations(quoteId),
    queryFn: () => api.listQuoteConversations(quoteId),
    refetchInterval: 30000,
  });
}

/** Todas as negociações do cliente (lista global). */
export function useMyConversations() {
  return useQuery({
    queryKey: queryKeys.myConversations,
    queryFn: api.listMyConversations,
    refetchInterval: 30000,
  });
}

/** Quota de upload de imagens (janela rolante de 1h). */
export function useUploadQuota() {
  return useQuery({
    queryKey: queryKeys.uploadQuota,
    queryFn: api.getUploadQuota,
    staleTime: 30000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationId ? queryKeys.messages(conversationId) : ['messages', 'none'],
    queryFn: () => api.getMessages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: 30000,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.sendMessage(conversationId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
    },
  });
}

export function useAcceptProposal(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: string) => api.acceptProposal(proposalId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.quoteConversations(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quote(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quotes });
    },
  });
}

export function useRejectProposal(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (proposalId: string) => api.rejectProposal(proposalId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.quoteConversations(quoteId) });
    },
  });
}

export function usePricing(quoteId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.pricing(quoteId),
    queryFn: () => api.getPricing(quoteId),
    enabled,
  });
}

function usePaymentMutation<T>(quoteId: string, fn: () => Promise<T>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.quote(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.pricing(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quotes });
    },
  });
}

export function usePay(quoteId: string) {
  return usePaymentMutation(quoteId, () => api.pay(quoteId));
}

export function useComplete(quoteId: string) {
  return usePaymentMutation(quoteId, () => api.complete(quoteId));
}

// ───────── Visitas ─────────
export function useVisits(quoteId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.visits(quoteId),
    queryFn: () => api.listVisits(quoteId),
    enabled,
    refetchInterval: 30000,
  });
}

export function useConfirmVisit(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => api.confirmVisit(visitId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.visits(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quote(quoteId) });
    },
  });
}

export function useCompleteVisit(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => api.completeVisit(visitId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.visits(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quote(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quoteConversations(quoteId) });
    },
  });
}

export function useReopenConversation(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => api.reopenConversation(conversationId),
    onSuccess: (_d, conversationId) => {
      void qc.invalidateQueries({ queryKey: queryKeys.quoteConversations(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
    },
  });
}

export function useRescheduleVisit(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { visitId: string; scheduledAt: string; reason?: string }) =>
      api.rescheduleVisit(input.visitId, input.scheduledAt, input.reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.visits(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quote(quoteId) });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCancelVisit(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { visitId: string; reason: string }) =>
      api.cancelVisit(input.visitId, input.reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.visits(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quote(quoteId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quoteConversations(quoteId) });
    },
  });
}

export function useVisitProviderSlots(visitId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['visit-slots', visitId ?? 'none', date ?? 'none'] as const,
    queryFn: () => api.getVisitProviderSlots(visitId as string, date as string),
    enabled: Boolean(visitId && date && /^\d{4}-\d{2}-\d{2}$/.test(date)),
  });
}

// ───────── Avaliação ─────────
export function useReview(quoteId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.review(quoteId),
    queryFn: () => api.getReview(quoteId),
    enabled,
  });
}

export function useCreateReview(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; comment?: string }) =>
      api.createReview(quoteId, input.rating, input.comment),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.review(quoteId) });
    },
  });
}

// ───────── Minhas visitas (cliente) — C12 do doc 07 ─────────
export function useMyVisits() {
  return useQuery({
    queryKey: ['my-visits'] as const,
    queryFn: api.listMyVisits,
    refetchInterval: 30000,
  });
}

// ───────── Notificações ─────────
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'] as const,
    queryFn: api.listNotifications,
    refetchInterval: 60000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ───────── Perfil ─────────
export function useProfile() {
  return useQuery({ queryKey: ['profile'] as const, queryFn: api.getProfile });
}

/** Perfil público de um prestador (visão do cliente). */
export function useProviderPublicProfile(providerId: string | undefined) {
  return useQuery({
    queryKey: ['provider-public', providerId] as const,
    queryFn: () => api.getProviderPublicProfile(providerId as string),
    enabled: Boolean(providerId),
  });
}

export function useSendContact() {
  return useMutation({
    mutationFn: (input: { subject: string; category: string; message: string; name?: string; email?: string }) =>
      api.sendContact(input),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeInput) => api.updateMe(input),
    onSuccess: (data) => {
      qc.setQueryData(['profile'], data);
    },
  });
}

export function useRequestPasswordOtp() {
  return useMutation({ mutationFn: () => api.requestPasswordOtp() });
}

export function useSetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { newPassword: string; code?: string; currentPassword?: string }) =>
      api.setPassword(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
