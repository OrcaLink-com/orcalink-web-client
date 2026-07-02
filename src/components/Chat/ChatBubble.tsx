import { motion } from 'framer-motion';
import { LuFileText, LuDownload } from 'react-icons/lu';
import type { ChatMessage } from './types';
import { MessageTime } from './MessageTime';
import { MessageStatus } from './MessageStatus';
import { formatBytes } from './utils';
import { bubbleIn } from './animations';

/** Bolha de conversa (texto / imagem / arquivo). Cards de ação NÃO passam por aqui. */
type BubbleMessage = Extract<ChatMessage, { type: 'text' | 'image' | 'file' }>;

export function ChatBubble({ message, mine }: { message: BubbleMessage; mine: boolean }) {
  return (
    <motion.div
      variants={bubbleIn}
      initial="initial"
      animate="animate"
      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] overflow-hidden text-sm shadow-sm sm:max-w-[70%] ${
          mine
            ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-brand-secondary text-white'
            : 'rounded-2xl rounded-bl-md border border-border bg-content2 text-foreground'
        }`}
      >
        {message.type === 'image' && <ImageBody message={message} mine={mine} />}
        {message.type === 'file' && <FileBody message={message} mine={mine} />}
        {message.type === 'text' && (
          <div className="px-3.5 py-2.5">
            <Text mine={mine} text={message.payload.text} createdAt={message.createdAt} status={message.deliveryStatus} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Text({
  text,
  createdAt,
  status,
  mine,
}: {
  text: string;
  createdAt: string;
  status?: BubbleMessage['deliveryStatus'];
  mine: boolean;
}) {
  return (
    <>
      <p className="whitespace-pre-wrap break-words">{text}</p>
      <div className={`mt-1 flex items-center justify-end gap-1 ${mine ? 'text-white/70' : 'text-text-muted'}`}>
        <MessageTime iso={createdAt} />
        {mine && <MessageStatus status={status} />}
      </div>
    </>
  );
}

function ImageBody({ message, mine }: { message: Extract<BubbleMessage, { type: 'image' }>; mine: boolean }) {
  const { url, alt, caption } = message.payload;
  return (
    <figure>
      <img
        src={url}
        alt={alt ?? caption ?? 'imagem'}
        loading="lazy"
        decoding="async"
        className="max-h-80 w-full object-cover"
      />
      <figcaption className="px-3.5 py-2">
        {caption && <p className="mb-1 whitespace-pre-wrap break-words">{caption}</p>}
        <div className={`flex items-center justify-end gap-1 ${mine ? 'text-white/70' : 'text-text-muted'}`}>
          <MessageTime iso={message.createdAt} />
          {mine && <MessageStatus status={message.deliveryStatus} />}
        </div>
      </figcaption>
    </figure>
  );
}

function FileBody({ message, mine }: { message: Extract<BubbleMessage, { type: 'file' }>; mine: boolean }) {
  const { url, fileName, size } = message.payload;
  return (
    <div className="px-3 py-2.5">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors ${
          mine ? 'hover:bg-white/10' : 'hover:bg-content1'
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            mine ? 'bg-white/20 text-white' : 'bg-primary/15 text-primary'
          }`}
        >
          <LuFileText size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{fileName}</span>
          {size ? <span className={`text-xs ${mine ? 'text-white/70' : 'text-text-muted'}`}>{formatBytes(size)}</span> : null}
        </span>
        <LuDownload size={18} className={mine ? 'text-white/80' : 'text-text-muted'} />
      </a>
      <div className={`mt-1 flex items-center justify-end gap-1 ${mine ? 'text-white/70' : 'text-text-muted'}`}>
        <MessageTime iso={message.createdAt} />
        {mine && <MessageStatus status={message.deliveryStatus} />}
      </div>
    </div>
  );
}
