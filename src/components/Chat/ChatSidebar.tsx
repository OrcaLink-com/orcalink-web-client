import { useMemo, useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import type { ChatConversation, ServiceStatus } from './types';
import { MessageAvatar } from './MessageAvatar';

export interface ChatSidebarProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

const STATUS_DOT: Record<ServiceStatus, string> = {
  negotiating: 'bg-primary',
  visit_scheduled: 'bg-sky-400',
  awaiting_payment: 'bg-amber-400',
  hired: 'bg-emerald-400',
  in_progress: 'bg-sky-400',
  finished: 'bg-emerald-400',
  canceled: 'bg-danger',
};

export function ChatSidebar({ conversations, selectedId, onSelect, className = '' }: ChatSidebarProps) {
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...conversations]
      .filter((c) => !q || c.peer.name.toLowerCase().includes(q) || c.lastMessagePreview.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.lastMessageAt.localeCompare(a.lastMessageAt);
      });
  }, [conversations, query]);

  return (
    <aside className={`min-h-0 bg-background ${className}`}>
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-4">
        <h1 className="mb-3 text-lg font-bold tracking-tight">Conversas</h1>
        <div className="relative">
          <LuSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            aria-label="Buscar conversas"
            className="h-10 w-full rounded-full border border-border bg-content1 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {list.map((c) => (
          <li key={c.id}>
            <ConversationRow conversation={c} selected={c.id === selectedId} onSelect={() => onSelect(c.id)} />
          </li>
        ))}
        {list.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-text-muted">Nenhuma conversa.</li>
        )}
      </ul>
    </aside>
  );
}

function ConversationRow({
  conversation: c,
  selected,
  onSelect,
}: {
  conversation: ChatConversation;
  selected: boolean;
  onSelect: () => void;
}) {
  const time = new Date(c.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    <button
      onClick={onSelect}
      aria-current={selected}
      className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
        selected ? 'bg-primary/12' : 'hover:bg-content1'
      }`}
    >
      <div className="relative">
        <MessageAvatar participant={c.peer} size={48} showPresence />
        <span
          className={`absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-background ${STATUS_DOT[c.serviceStatus]}`}
          title="Status do serviço"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold">{c.peer.name}</span>
          <span className={`shrink-0 text-[11px] ${c.unreadCount > 0 ? 'font-semibold text-primary' : 'text-text-muted'}`}>
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-text-muted">{c.lastMessagePreview}</span>
          {c.unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
              {c.unreadCount > 9 ? '9+' : c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
