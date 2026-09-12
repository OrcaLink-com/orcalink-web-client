import { useCallback, useEffect, useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu';

interface Photo {
  id: string;
  url: string;
}

/**
 * Fotos de referência do orçamento: um carrossel horizontal (arrasta pro lado) e,
 * ao tocar, um lightbox em tela cheia que abre a foto ali mesmo (sem nova aba),
 * com navegação por setas, teclado e swipe. Some quando não há imagens.
 */
export function QuotePhotos({ images, label = 'Fotos de referência' }: { images: Photo[]; label?: string }) {
  const count = images.length;
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => setOpen((o) => (o == null ? o : (o - 1 + count) % count)), [count]);
  const next = useCallback(() => setOpen((o) => (o == null ? o : (o + 1) % count)), [count]);

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  if (count === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium text-text-muted">
        {label}
        {count > 1 && ` · ${count}`}
      </p>
      {/* Carrossel: arraste para o lado (scroll-snap). Sem barra de rolagem visível. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative aspect-[4/3] h-28 shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-medium border border-border bg-content2 sm:h-32"
            aria-label={`Abrir foto ${i + 1} de ${count}`}
          >
            <img
              src={img.url}
              alt={`Foto de referência ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {open != null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da foto"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx > 50) prev();
            else if (dx < -50) next();
            touchX.current = null;
          }}
        >
          <button
            onClick={close}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <LuX size={20} />
          </button>

          {count > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Foto anterior"
              className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <LuChevronLeft size={24} />
            </button>
          )}

          <img
            src={images[open].url}
            alt={`Foto de referência ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />

          {count > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Próxima foto"
              className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <LuChevronRight size={24} />
            </button>
          )}

          {count > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
              {open + 1} / {count}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
