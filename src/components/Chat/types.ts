/**
 * Domínio do módulo de Chat (mensageria de marketplace de serviços).
 *
 * Princípio: `ChatMessage` é uma UNIÃO DISCRIMINADA por `type` — cada tipo tem
 * seu `payload` tipado. Assim os renderizadores (bolhas e action cards) recebem
 * exatamente os dados que precisam, sem `any`, e o compilador garante a
 * exaustividade dos casos.
 */

/* ───────────────────────── Participantes ───────────────────────── */

export type ChatRole = 'client' | 'provider' | 'system';

export interface ChatParticipant {
  id: string;
  name: string;
  /** URL do avatar; ausente = usa iniciais. */
  avatarUrl?: string;
  role: ChatRole;
  /** Subtítulo do header (ex.: "Pinturas", categoria/serviço). */
  headline?: string;
  online?: boolean;
  /** Último "visto" (ISO) quando offline. */
  lastSeenAt?: string;
}

/* ───────────────────────── Conversa (sidebar) ───────────────────── */

/** Status do serviço mostrado no header e na lista. */
export type ServiceStatus =
  | 'negotiating'
  | 'visit_scheduled'
  | 'awaiting_payment'
  | 'hired'
  | 'in_progress'
  | 'finished'
  | 'canceled';

export interface ChatConversation {
  id: string;
  /** A contraparte (na visão do cliente = o prestador). */
  peer: ChatParticipant;
  serviceStatus: ServiceStatus;
  /** Prévia da última mensagem (texto já "achatado"). */
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  pinned?: boolean;
}

/* ───────────────────────── Entrega/leitura ─────────────────────── */

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/* ───────────────────────── Estado das ações ────────────────────── */

/** Estado genérico de um card acionável (dirige loading/success/disabled). */
export type ActionState = 'idle' | 'loading' | 'success' | 'error' | 'disabled';

/* ───────────────────────── Payloads por tipo ───────────────────── */

export interface TextPayload {
  text: string;
}

export interface ImagePayload {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface FilePayload {
  url: string;
  fileName: string;
  /** Bytes. */
  size?: number;
  mimeType?: string;
}

export interface SystemPayload {
  /** Texto curto centralizado (ex.: "Visita confirmada"). */
  text: string;
  icon?: 'check' | 'calendar' | 'payment' | 'flag' | 'info';
}

/** Estado de negociação de uma visita. */
export type VisitStatus = 'pending' | 'accepted' | 'declined' | 'rescheduled';

export interface VisitRequestPayload {
  visitId: string;
  suggestedDate: string; // ISO date
  suggestedTime: string; // "HH:mm"
  providerName: string;
  serviceLabel?: string;
  status: VisitStatus;
}

export type PaymentMethod = 'pix' | 'card' | 'boleto' | 'undefined';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface PaymentRequestPayload {
  paymentId: string;
  amountCents: number;
  description: string;
  method: PaymentMethod;
  installments?: number;
  dueDate?: string; // ISO
  status: PaymentStatus;
  paidAt?: string; // ISO (quando status = paid)
  receiptUrl?: string;
  invoiceUrl?: string;
}

export interface QuoteApprovedPayload {
  proposalId: string;
  amountCents: number;
  approvedAt: string; // ISO
  summary?: string;
}

export interface ServiceStartedPayload {
  professionalName: string;
  startedAt: string; // ISO
  expectedCompletionAt?: string; // ISO
  /** 0–100. */
  progress?: number;
}

export interface ServiceFinishedPayload {
  finishedAt: string; // ISO
  rating?: number; // 1–5, se já avaliado
  receiptUrl?: string;
  invoiceUrl?: string;
}

export interface ScheduleChangePayload {
  visitId: string;
  /** Quem propôs a mudança. */
  proposedBy: ChatRole;
  newDate: string; // ISO
  newTime: string; // "HH:mm"
  status: VisitStatus;
}

/** Proposta do prestador (estimativa não vinculante ou proposta final). */
export type ProposalKind = 'estimate' | 'final';
export type ProposalCardStatus = 'pending' | 'accepted' | 'rejected';

export interface ProposalPayload {
  proposalId: string;
  kind: ProposalKind;
  providerName?: string;
  /** Valor mostrado ao cliente (ou média, na estimativa em faixa). */
  amountCents: number;
  amountMinCents?: number;
  amountMaxCents?: number;
  description: string;
  leadTimeDays?: number;
  warrantyDays?: number;
  paymentMethods?: string[];
  notes?: string;
  status: ProposalCardStatus;
  /** Estimativa que pede visita técnica antes da proposta final. */
  requestsVisit?: boolean;
  /** Nº de outras propostas finais pendentes (mostra "Comparar (N)"). */
  compareCount?: number;
}

/* ───────────────────────── Mensagem (união) ────────────────────── */

interface BaseMessage {
  id: string;
  sender: ChatParticipant;
  createdAt: string; // ISO
  /** Só relevante para mensagens "minhas" (texto/imagem/arquivo). */
  deliveryStatus?: MessageDeliveryStatus;
}

export type ChatMessage =
  | (BaseMessage & { type: 'text'; payload: TextPayload })
  | (BaseMessage & { type: 'image'; payload: ImagePayload })
  | (BaseMessage & { type: 'file'; payload: FilePayload })
  | (BaseMessage & { type: 'system'; payload: SystemPayload })
  | (BaseMessage & { type: 'proposal'; payload: ProposalPayload })
  | (BaseMessage & { type: 'visit_request'; payload: VisitRequestPayload })
  | (BaseMessage & { type: 'payment_request'; payload: PaymentRequestPayload })
  | (BaseMessage & { type: 'quote_approved'; payload: QuoteApprovedPayload })
  | (BaseMessage & { type: 'schedule_change'; payload: ScheduleChangePayload })
  | (BaseMessage & { type: 'service_started'; payload: ServiceStartedPayload })
  | (BaseMessage & { type: 'service_finished'; payload: ServiceFinishedPayload });

export type ChatMessageType = ChatMessage['type'];

/** Helper: extrai o payload de um tipo específico. */
export type PayloadOf<T extends ChatMessageType> = Extract<ChatMessage, { type: T }>['payload'];

/* ───────────────────────── Callbacks das ações ─────────────────── */

/**
 * Handlers que o container liga (mutations reais). Todos assíncronos → os cards
 * derivam loading/success a partir da Promise. Passados via contexto/props.
 */
export interface ChatActionHandlers {
  onSendMessage?: (text: string) => Promise<void> | void;
  onSendAttachment?: (file: File) => Promise<void> | void;

  onAcceptProposal?: (proposalId: string) => Promise<void>;
  onRejectProposal?: (proposalId: string) => Promise<void>;
  onCompareProposals?: () => void;

  onAcceptVisit?: (visitId: string) => Promise<void>;
  onDeclineVisit?: (visitId: string) => Promise<void>;
  onSuggestNewDate?: (visitId: string, date: string, time: string) => Promise<void>;

  onPay?: (paymentId: string) => Promise<void>;
  onViewPaymentDetails?: (paymentId: string) => void;
  onDownloadReceipt?: (url: string) => void;

  onStartService?: (proposalId: string) => Promise<void>;
  onViewService?: () => void;
  onLeaveReview?: () => void;
}

/* ───────────────────────── Config de tema por card ─────────────── */

/** Accents dos cards (mapeados p/ classes de estilo no BaseActionCard). */
export type CardAccent = 'green' | 'purple' | 'blue' | 'neutral';

/** Contexto do "eu" (define lados e permissões de ação). */
export interface ChatViewer {
  id: string;
  role: Exclude<ChatRole, 'system'>;
}
