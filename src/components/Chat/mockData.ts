import type { ChatConversation, ChatMessage, ChatParticipant, ChatViewer } from './types';

/** Helper: ISO de N minutos atrás. */
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

/* ───────── Participantes ───────── */

export const mockViewer: ChatViewer = { id: 'me', role: 'client' };

const me: ChatParticipant = { id: 'me', name: 'Você', role: 'client' };

const joao: ChatParticipant = {
  id: 'p1',
  name: 'João Silva',
  role: 'provider',
  headline: 'Pinturas',
  online: true,
};
const marina: ChatParticipant = {
  id: 'p2',
  name: 'Marina Costa',
  role: 'provider',
  headline: 'Elétrica',
  online: false,
  lastSeenAt: ago(90),
};
const studio: ChatParticipant = {
  id: 'p3',
  name: 'Studio Reforma',
  role: 'provider',
  headline: 'Reforma geral',
  online: true,
};

/* ───────── Conversas (sidebar) ───────── */

export const mockConversations: ChatConversation[] = [
  {
    id: 'c1',
    peer: joao,
    serviceStatus: 'in_progress',
    lastMessagePreview: 'Serviço em andamento — 40% concluído',
    lastMessageAt: ago(2),
    unreadCount: 2,
    pinned: true,
  },
  {
    id: 'c2',
    peer: marina,
    serviceStatus: 'visit_scheduled',
    lastMessagePreview: 'Solicitação de visita',
    lastMessageAt: ago(140),
    unreadCount: 0,
  },
  {
    id: 'c3',
    peer: studio,
    serviceStatus: 'finished',
    lastMessagePreview: 'Serviço concluído — avalie o profissional',
    lastMessageAt: ago(60 * 26),
    unreadCount: 0,
  },
];

/* ───────── Mensagens por conversa ───────── */

const c1Messages: ChatMessage[] = [
  {
    id: 'm1',
    type: 'system',
    sender: { id: 'sys', name: 'Sistema', role: 'system' },
    createdAt: ago(320),
    payload: { text: 'Conversa iniciada com João Silva', icon: 'info' },
  },
  {
    id: 'm2',
    type: 'text',
    sender: joao,
    createdAt: ago(315),
    payload: { text: 'Olá! Tudo bem? Gostaria de solicitar uma visita para avaliar o serviço de pintura.' },
  },
  {
    id: 'm3',
    type: 'visit_request',
    sender: joao,
    createdAt: ago(314),
    payload: {
      visitId: 'v1',
      suggestedDate: ago(-60 * 24 * 3), // daqui a 3 dias
      suggestedTime: '10:00',
      providerName: 'João Silva',
      serviceLabel: 'Pintura',
      status: 'accepted',
    },
  },
  {
    id: 'm4',
    type: 'text',
    sender: me,
    createdAt: ago(312),
    deliveryStatus: 'read',
    payload: { text: 'Olá! Posso sim. Confirmado para o dia sugerido às 10h. 👍' },
  },
  {
    id: 'm5',
    type: 'system',
    sender: { id: 'sys', name: 'Sistema', role: 'system' },
    createdAt: ago(310),
    payload: { text: 'Visita confirmada', icon: 'calendar' },
  },
  {
    id: 'm6',
    type: 'image',
    sender: joao,
    createdAt: ago(200),
    payload: {
      url: 'https://picsum.photos/seed/parede/640/420',
      caption: 'Foto da parede que precisa de pintura.',
    },
  },
  {
    id: 'm7',
    type: 'file',
    sender: joao,
    createdAt: ago(198),
    payload: { url: '#', fileName: 'Orcamento-detalhado.pdf', size: 284_540, mimeType: 'application/pdf' },
  },
  {
    id: 'm7b',
    type: 'proposal',
    sender: joao,
    createdAt: ago(160),
    payload: {
      proposalId: 'prop1',
      kind: 'final',
      providerName: 'João Silva',
      amountCents: 300_000,
      description: 'Pintura completa de 2 quartos (~12m² cada) com massa corrida e 2 demãos.',
      leadTimeDays: 5,
      warrantyDays: 90,
      paymentMethods: ['PIX', 'CARD'],
      status: 'accepted',
    },
  },
  {
    id: 'm8',
    type: 'quote_approved',
    sender: joao,
    createdAt: ago(120),
    payload: {
      proposalId: 'pr1',
      amountCents: 300_000,
      approvedAt: ago(120),
      summary: 'Pintura de 2 quartos com massa corrida e 2 demãos.',
    },
  },
  {
    id: 'm9',
    type: 'payment_request',
    sender: joao,
    createdAt: ago(90),
    payload: {
      paymentId: 'pay1',
      amountCents: 85_000,
      description: 'Entrada para início do serviço',
      method: 'pix',
      installments: 1,
      dueDate: ago(-60 * 24), // amanhã
      status: 'pending',
    },
  },
  {
    id: 'm10',
    type: 'system',
    sender: { id: 'sys', name: 'Sistema', role: 'system' },
    createdAt: ago(30),
    payload: { text: 'Profissional chegou ao local', icon: 'flag' },
  },
  {
    id: 'm11',
    type: 'service_started',
    sender: joao,
    createdAt: ago(20),
    payload: {
      professionalName: 'João Silva',
      startedAt: ago(20),
      expectedCompletionAt: ago(-60 * 24 * 2),
      progress: 40,
    },
  },
  {
    id: 'm12',
    type: 'text',
    sender: joao,
    createdAt: ago(2),
    payload: { text: 'Primeiro quarto pronto! Já comecei o segundo. 🎨' },
  },
];

const c2Messages: ChatMessage[] = [
  {
    id: 'n1',
    type: 'text',
    sender: marina,
    createdAt: ago(150),
    payload: { text: 'Oi! Consigo passar aí pra avaliar a parte elétrica.' },
  },
  {
    id: 'n2',
    type: 'visit_request',
    sender: marina,
    createdAt: ago(145),
    payload: {
      visitId: 'v2',
      suggestedDate: ago(-60 * 24 * 2),
      suggestedTime: '14:30',
      providerName: 'Marina Costa',
      serviceLabel: 'Elétrica',
      status: 'pending',
    },
  },
  {
    id: 'n1b',
    type: 'proposal',
    sender: marina,
    createdAt: ago(130),
    payload: {
      proposalId: 'prop2',
      kind: 'estimate',
      providerName: 'Marina Costa',
      amountCents: 45_000,
      amountMinCents: 40_000,
      amountMaxCents: 50_000,
      description: 'Troca de disjuntores e revisão do quadro elétrico.',
      leadTimeDays: 2,
      requestsVisit: true,
      status: 'pending',
      compareCount: 1,
    },
  },
  {
    id: 'n3',
    type: 'schedule_change',
    sender: me,
    createdAt: ago(120),
    deliveryStatus: 'delivered',
    payload: { visitId: 'v2', proposedBy: 'client', newDate: ago(-60 * 24 * 4), newTime: '09:00', status: 'pending' },
  },
];

const c3Messages: ChatMessage[] = [
  {
    id: 'o1',
    type: 'text',
    sender: studio,
    createdAt: ago(60 * 30),
    payload: { text: 'Serviço finalizado, muito obrigado pela confiança!' },
  },
  {
    id: 'o2',
    type: 'service_finished',
    sender: studio,
    createdAt: ago(60 * 26),
    payload: { finishedAt: ago(60 * 26), receiptUrl: '#' },
  },
];

export const mockMessagesByConversation: Record<string, ChatMessage[]> = {
  c1: c1Messages,
  c2: c2Messages,
  c3: c3Messages,
};
