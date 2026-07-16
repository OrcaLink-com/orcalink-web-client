/**
 * Tipos do domínio usados pela UI da slice.
 *
 * Espelham os DTOs do backend. O contrato autoritativo é o OpenAPI:
 * rode `npm run gen:api` para gerar `src/lib/api-schema.d.ts` a partir do
 * backend e, futuramente, derivar estes tipos do schema gerado (evita
 * duplicação). Mantidos à mão aqui para a slice ser auto-suficiente.
 */
export type QuoteStatus =
  | 'CREATED'
  | 'WAITING_PROPOSALS'
  | 'IN_NEGOTIATION'
  | 'PROVIDER_SELECTED'
  | 'WAITING_PAYMENT'
  | 'PAID'
  | 'EXECUTION_SCHEDULED'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELED';

export interface Category {
  id: string;
  slug: string;
  name: string;
  iconKey: string | null;
}

export interface QuoteImage {
  id: string;
  url: string;
}

export interface Quote {
  id: string;
  status: QuoteStatus;
  title: string | null;
  description: string;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  requiresVisit: boolean;
  latitude: number | null;
  longitude: number | null;
  category: { id: string; slug: string; name: string };
  images: QuoteImage[];
  proposalsCount: number;
  budgetMaxCents: number | null;
  createdAt: string;
}

export interface CreateQuoteInput {
  categoryId: string;
  title: string;
  description: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  requiresVisit?: boolean;
  latitude?: number;
  longitude?: number;
  budgetMaxCents?: number;
  imageUrls?: string[];
}

export interface UploadResult {
  url: string;
  key: string;
}

export type Role = 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'SUPER_ADMIN';
export type OtpChannel = 'EMAIL' | 'PHONE';

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

/** Perfil completo do usuário autenticado (GET /auth/me). */
export interface MeProfile {
  id: string;
  role: Role;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  hasPassword: boolean;
  providerStatus: string | null;
  termsVersion: string;
  termsAccepted: boolean;
}

/** Documento legal vigente (vindo do CMS no banco). */
export interface LegalDoc {
  slug: string;
  title: string;
  version: string;
  summary: string | null;
  contentHtml: string;
  updatedAt: string;
}

/** Documento pendente de aceite pelo usuário. */
export interface PendingLegal {
  id: string;
  slug: string;
  title: string;
  version: string;
}

/** Endereço completo retornado pelo CEP (autopreenchimento). */
export interface CepLookup {
  cep: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

/** Payload de atualização de dados pessoais + endereço (PATCH /auth/me). */
export interface UpdateMeInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

// ───────── Negociação (propostas + chat) ─────────
export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'APPROVED' | 'REJECTED' | 'FINISHED';
export type ProposalType = 'PRE' | 'FINAL';
export type ConversationStatus = 'ACTIVE' | 'BLOCKED' | 'CLOSED';
export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'PROPOSAL'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REJECTED'
  | 'VISIT_REQUEST'
  | 'VISIT_CONFIRMED'
  | 'VISIT_RESCHEDULED'
  | 'SYSTEM';

export type ProposalItemGroup = 'LABOR' | 'MATERIAL' | 'EQUIPMENT' | 'TRAVEL' | 'OTHER';

export interface ProposalItem {
  group: ProposalItemGroup;
  description: string;
  quantity: number;
  unit?: string | null;
  unitCents: number;
  subtotalCents: number;
}

export interface ProposalTechnical {
  areaText?: string | null;
  quantityText?: string | null;
  validityDays?: number | null;
  executionConditions?: string | null;
  technicalNotes?: string | null;
  warrantiesText?: string | null;
}

export interface Proposal {
  id: string;
  providerId: string;
  type: ProposalType;
  amountCents: number;
  amountMinCents?: number | null;
  amountMaxCents?: number | null;
  description: string;
  notes?: string | null;
  leadTimeDays?: number | null;
  warrantyDays?: number | null;
  paymentMethods?: string[];
  requestsVisit?: boolean;
  format?: 'SIMPLE' | 'PRO';
  items?: ProposalItem[];
  technical?: ProposalTechnical | null;
  status: ProposalStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  type: MessageType;
  body: string | null;
  senderId: string | null;
  createdAt: string;
  proposal?: Proposal;
}

export interface ConversationSummary {
  id: string;
  quoteId: string;
  status: ConversationStatus;
  quoteStatus: QuoteStatus;
  quoteTitle?: string;
  requiresVisit: boolean;
  counterpartName: string;
  counterpartId: string;
  counterpartAvatarUrl?: string;
  counterpartRating: number;
  counterpartRatingCount: number;
  lastMessage?: Message;
  unreadCount: number;
  latestProposal?: Proposal;
}

/** Item de portfólio do prestador (perfil público). */
export interface PortfolioItem {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  categoryId?: string;
  date?: string;
}

export interface PublicReview {
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

/** Perfil público do prestador (GET /providers/:id/profile). */
export interface PublicProviderProfile {
  userId: string;
  name: string;
  avatarUrl: string | null;
  companyName: string | null;
  tradeName: string | null;
  bio: string | null;
  history: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  foundedYear: number | null;
  specialties: string[];
  citiesServed: string[];
  avgResponseMinutes: number | null;
  phone: string | null;
  categoryIds: string[];
  categories: { id: string; name: string }[];
  portfolio: PortfolioItem[];
  social: { instagram?: string; facebook?: string; website?: string; whatsapp?: string };
  ratingAvg: number;
  ratingCount: number;
  serviceRadiusKm: number | null;
  workingDays: string;
  workingHourStart: number;
  workingHourEnd: number;
  reviews: PublicReview[];
}

/** Negociação na visão global do cliente (lista CRM): summary + contexto do orçamento. */
export interface ClientConversation extends ConversationSummary {
  quoteDescription: string;
  quoteCategoryName: string;
}

/** Quota de upload de imagens (janela rolante de 1h). */
export interface UploadQuota {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string | null;
}

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'RELEASED'
  | 'REFUNDED'
  | 'FAILED'
  | 'CANCELED';

export interface PricingComponent {
  type: string;
  label: string;
  amountCents: number;
}

// Visão de preço filtrada pelo backend conforme o papel (cliente vê clientTotal).
export interface PricingView {
  quoteId: string;
  role: string;
  quoteStatus: QuoteStatus;
  paymentStatus: PaymentStatus | null;
  mode: string;
  clientTotalCents?: number;
  providerNetCents?: number;
  components: PricingComponent[];
}

export type VisitType = 'IN_LOCO' | 'EXECUTION';
export type VisitStatus =
  | 'PENDING'
  | 'SUGGESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELED'
  | 'COMPLETED';

export interface Visit {
  id: string;
  quoteId: string;
  providerId: string;
  providerName: string;
  type: VisitType;
  status: VisitStatus;
  scheduledAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

/** Visita do cliente (em qualquer orçamento). C12 do doc 07. */
export interface MyVisit extends Visit {
  quoteDescription: string;
  quoteCategoryName: string;
}

export interface AvailableSlot {
  startISO: string;
  endISO: string;
  label: string;
  available: boolean;
}
export interface AvailableSlotsResponse {
  date: string;
  reason: 'OFF_DAY' | 'DAY_LIMIT_REACHED' | 'BLOCKED' | null;
  slots: AvailableSlot[];
}

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}
export interface NotificationsInbox {
  items: Notification[];
  unreadCount: number;
}

export interface Review {
  id: string;
  quoteId: string;
  providerId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
}
