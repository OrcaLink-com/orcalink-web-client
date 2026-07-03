import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuSmile, LuPaperclip, LuImage, LuCamera, LuSendHorizontal } from 'react-icons/lu';
import { popIn } from './animations';

export interface ChatComposerProps {
  disabled?: boolean;
  placeholder?: string;
  onSend: (text: string) => Promise<void> | void;
  onAttach?: (file: File) => Promise<void> | void;
  /** Chamado a cada tecla digitada (sinaliza "digitando…"). */
  onType?: () => void;
  className?: string;
}

const EMOJIS = ['😀', '😉', '👍', '🙏', '🎉', '🔥', '✅', '❤️', '😅', '👏', '🤝', '💰', '🛠️', '📍', '⏰', '📎'];

/** Composer premium: emoji · anexo · imagem · câmera · enviar (sem microfone). */
export function ChatComposer({ disabled, placeholder = 'Mensagem', onSend, onAttach, onType, className = '' }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const canSend = text.trim().length > 0 && !disabled && !sending;

  async function submit() {
    if (!canSend) return;
    const value = text.trim();
    setText('');
    setSending(true);
    try {
      await onSend(value);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  function pickFile(ref: React.RefObject<HTMLInputElement>) {
    return () => ref.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && onAttach) void onAttach(file);
  }

  function insertEmoji(emoji: string) {
    setText((t) => t + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  }

  return (
    <div className={`relative border-t border-border bg-content1/90 px-3 py-2.5 backdrop-blur ${className}`}>
      {/* Popover de emojis */}
      <AnimatePresence>
        {emojiOpen && (
          <motion.div
            variants={popIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute bottom-full left-3 mb-2 grid grid-cols-8 gap-1 rounded-2xl border border-border bg-content1 p-2 shadow-pop"
          >
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => insertEmoji(e)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-content2"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex items-end gap-2"
      >
        <div className="flex items-center gap-0.5">
          <IconButton label="Emoji" active={emojiOpen} onClick={() => setEmojiOpen((v) => !v)} disabled={disabled}>
            <LuSmile size={20} />
          </IconButton>
          {onAttach && (
            <>
              <IconButton label="Anexar arquivo" onClick={pickFile(fileRef)} disabled={disabled}>
                <LuPaperclip size={20} />
              </IconButton>
              <IconButton label="Enviar imagem" onClick={pickFile(imageRef)} disabled={disabled}>
                <LuImage size={20} />
              </IconButton>
              <IconButton label="Tirar foto" onClick={pickFile(cameraRef)} disabled={disabled} className="hidden sm:inline-flex">
                <LuCamera size={20} />
              </IconButton>
            </>
          )}
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) onType?.();
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Escrever mensagem"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-tight outline-none transition-colors placeholder:text-text-muted focus:border-primary disabled:opacity-60"
        />

        <motion.button
          type="submit"
          disabled={!canSend}
          aria-label="Enviar"
          whileTap={{ scale: 0.9 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-secondary text-white shadow-md transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-content1 disabled:opacity-40"
        >
          <LuSendHorizontal size={20} />
        </motion.button>
      </form>

      {/* Inputs ocultos */}
      <input ref={fileRef} type="file" onChange={onFile} className="hidden" />
      <input ref={imageRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  active,
  className = '',
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40 ${
        active ? 'bg-primary/15 text-primary' : 'text-text-muted hover:bg-content2 hover:text-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
}
