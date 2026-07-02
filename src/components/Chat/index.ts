// Barrel exports do módulo Chat.
export * from './types';
export * from './utils';
export * from './animations';

export { ChatLayout } from './ChatLayout';
export type { ChatLayoutProps } from './ChatLayout';
export { ChatConversationView } from './ChatConversationView';
export type { ChatConversationViewProps } from './ChatConversationView';
export { ChatSidebar } from './ChatSidebar';
export { ChatHeader } from './ChatHeader';
export { ChatMessages } from './ChatMessages';
export { ChatComposer } from './ChatComposer';
export { ChatBubble } from './ChatBubble';
export { ChatDateDivider } from './ChatDateDivider';
export { ChatTyping } from './ChatTyping';
export { ChatEmptyState } from './ChatEmptyState';
export { MessageAvatar } from './MessageAvatar';
export { MessageTime } from './MessageTime';
export { MessageStatus } from './MessageStatus';

// Action Cards
export { BaseActionCard, CardButton, ACCENTS } from './ActionCards/BaseActionCard';
export { VisitRequestCard } from './ActionCards/VisitRequestCard';
export { PaymentRequestCard } from './ActionCards/PaymentRequestCard';
export { QuoteApprovedCard } from './ActionCards/QuoteApprovedCard';
export { ServiceStartedCard } from './ActionCards/ServiceStartedCard';
export { ServiceFinishedCard } from './ActionCards/ServiceFinishedCard';
export { ScheduleChangeCard } from './ActionCards/ScheduleChangeCard';
export { SystemCard } from './ActionCards/SystemCard';
export { ProposalCard } from './ActionCards/ProposalCard';
