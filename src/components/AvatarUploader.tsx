import { useRef, useState } from 'react';
import { LuCamera, LuLoaderCircle } from 'react-icons/lu';
import { api } from '../lib/api';

interface AvatarUploaderProps {
  /** URL atual do avatar (ou undefined → iniciais). */
  value?: string | null;
  /** Nome para gerar iniciais no placeholder. */
  name: string;
  /** Chamado com a URL final após upload. */
  onChange: (url: string) => void;
  size?: number;
}

const OUTPUT = 512; // lado da imagem final (quadrada)
const BOX = 260; // lado da área de recorte na tela

/**
 * Uploader de avatar com recorte quadrado + compressão via Canvas (sem libs).
 * Fluxo: escolher arquivo → arrastar/zoom para enquadrar → salvar (gera um
 * WEBP comprimido e faz upload). O componente só devolve a URL final.
 */
export function AvatarUploader({ value, name, onChange, size = 88 }: AvatarUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  function pickFile() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use uma imagem JPEG, PNG ou WEBP.');
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setSrc(url);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setError(null);
    };
    image.src = url;
  }

  /** Escala base para "cobrir" a caixa de recorte. */
  function baseScale(image: HTMLImageElement): number {
    return BOX / Math.min(image.naturalWidth, image.naturalHeight);
  }

  function clampOffset(next: { x: number; y: number }, image: HTMLImageElement, z: number) {
    const scale = baseScale(image) * z;
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    const minX = BOX - w;
    const minY = BOX - h;
    return {
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!img) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !img) return;
    const next = { x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) };
    setOffset(clampOffset(next, img, zoom));
  }

  function onPointerUp() {
    drag.current = null;
  }

  function onZoom(z: number) {
    if (!img) return;
    setZoom(z);
    setOffset((o) => clampOffset(o, img, z));
  }

  async function save() {
    if (!img) return;
    setSaving(true);
    setError(null);
    try {
      const scale = baseScale(img) * zoom;
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas indisponível.');
      // Região de origem visível na caixa → mapeada para o canvas de saída.
      const srcSize = BOX / scale;
      const srcX = -offset.x / scale;
      const srcY = -offset.y / scale;
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT, OUTPUT);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
      if (!blob) throw new Error('Falha ao gerar a imagem.');
      const file = new File([blob], 'avatar.webp', { type: 'image/webp' });
      const res = await api.uploadImage(file, 'avatar');
      onChange(res.url);
      close();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function close() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setImg(null);
  }

  const scale = img ? baseScale(img) * zoom : 1;

  return (
    <>
      <button
        type="button"
        onClick={pickFile}
        className="group relative shrink-0 rounded-full"
        style={{ width: size, height: size }}
        aria-label="Alterar foto de perfil"
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-secondary font-semibold text-white"
            style={{ fontSize: size * 0.36 }}
          >
            {initials || '?'}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <LuCamera size={size * 0.3} className="text-white" />
        </span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {src && img && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-content1 p-5 shadow-pop">
            <p className="mb-3 text-center text-sm font-semibold">Ajuste sua foto</p>
            <div
              className="relative mx-auto touch-none overflow-hidden rounded-full border border-border"
              style={{ width: BOX, height: BOX }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                className="max-w-none select-none"
                style={{
                  width: img.naturalWidth * scale,
                  height: img.naturalHeight * scale,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => onZoom(Number(e.target.value))}
              className="mt-4 w-full accent-primary"
              aria-label="Zoom"
            />
            {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={close}
                disabled={saving}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-content2 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? <LuLoaderCircle className="animate-spin" size={16} /> : null}
                {saving ? 'Salvando…' : 'Salvar foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
