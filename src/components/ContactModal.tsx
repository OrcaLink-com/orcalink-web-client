import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuCircleCheck, LuLoaderCircle, LuX } from 'react-icons/lu';
import { useSendContact } from '../lib/queries';
import { Input, Select, Textarea } from './ui';

const CATEGORIES = [
  { value: 'DUVIDA', label: 'Dúvida' },
  { value: 'SUPORTE', label: 'Suporte' },
  { value: 'SUGESTAO', label: 'Sugestão' },
  { value: 'PROBLEMA', label: 'Problema' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'OUTRO', label: 'Outro' },
];

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  /** Quando autenticado, não pede nome/e-mail (o backend usa os dados da conta). */
  authenticated?: boolean;
}

/** Canal de contato interno com a equipe Orca Link (substitui o mailto). */
export function ContactModal({ open, onClose, authenticated }: ContactModalProps) {
  const send = useSendContact();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('DUVIDA');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpa o erro de validação assim que o usuário edita qualquer campo
  // (evita a mensagem "presa" após corrigir o valor).
  useEffect(() => {
    setError(null);
  }, [name, email, subject, category, message]);

  function reset() {
    setName('');
    setEmail('');
    setSubject('');
    setCategory('DUVIDA');
    setMessage('');
    setDone(false);
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  async function submit() {
    setError(null);
    if (!subject.trim() || message.trim().length < 5) {
      setError('Preencha o assunto e uma mensagem com pelo menos 5 caracteres.');
      return;
    }
    if (!authenticated && (!name.trim() || !email.trim())) {
      setError('Informe seu nome e e-mail para retorno.');
      return;
    }
    try {
      await send.mutateAsync({
        subject: subject.trim(),
        category,
        message: message.trim(),
        ...(authenticated ? {} : { name: name.trim(), email: email.trim() }),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-content1 p-5 shadow-pop"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Falar com a Orca Link</h3>
              <button onClick={close} aria-label="Fechar" className="text-text-muted hover:text-foreground">
                <LuX size={18} />
              </button>
            </div>

            {done ? (
              <div className="py-6 text-center">
                <LuCircleCheck size={44} className="mx-auto text-success" />
                <p className="mt-3 font-semibold">Solicitação registrada!</p>
                <p className="mt-1 text-sm text-text-muted">
                  Recebemos sua mensagem. Nossa equipe responderá por e-mail em breve.
                </p>
                <button
                  onClick={close}
                  className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {!authenticated && (
                  <>
                    <Input label="Nome" value={name} onChange={setName} />
                    <Input label="E-mail" type="email" value={email} onChange={setEmail} />
                  </>
                )}
                <Input label="Assunto" value={subject} onChange={setSubject} placeholder="Resumo do que precisa" />
                <Select label="Categoria" options={CATEGORIES} value={category} onChange={setCategory} />
                <Textarea label="Mensagem" value={message} onChange={setMessage} minRows={4} placeholder="Descreva sua dúvida ou solicitação…" />
                {error && <p className="text-sm text-danger">{error}</p>}
                <button
                  onClick={() => void submit()}
                  disabled={send.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
                >
                  {send.isPending && <LuLoaderCircle size={16} className="animate-spin" />}
                  {send.isPending ? 'Enviando…' : 'Enviar mensagem'}
                </button>
                <p className="text-center text-[11px] text-text-muted">A resposta será enviada por e-mail.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
