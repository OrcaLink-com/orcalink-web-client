import { LuMessagesSquare } from 'react-icons/lu';

export interface ChatEmptyStateProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/** Estado vazio (nenhuma conversa selecionada / sem mensagens). */
export function ChatEmptyState({
  title = 'Selecione uma conversa',
  subtitle = 'Escolha uma conversa à esquerda para ver as mensagens e negociar o serviço.',
  className = '',
}: ChatEmptyStateProps) {
  return (
    <div className={`flex max-w-sm flex-col items-center gap-3 px-8 text-center ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
        <LuMessagesSquare size={28} />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-text-muted">{subtitle}</p>
    </div>
  );
}
