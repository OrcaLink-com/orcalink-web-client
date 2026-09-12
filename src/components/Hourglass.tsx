/**
 * Indicador "aguardando" premium: uma ampulheta que vira, com a areia drenando em
 * cima e acumulando embaixo, um grão caindo no gargalo e um brilho pulsante para
 * dar destaque ao estado de espera. Herda a cor de `currentColor` (use text-warning
 * ao redor). Respeita prefers-reduced-motion (as animações ficam paradas).
 */
export function Hourglass({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-current opacity-40 blur-[5px] [animation:ol-wait-glow_3s_ease-in-out_infinite]" />
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        className="ol-hourglass relative block [animation:ol-hourglass-flip_3s_ease-in-out_infinite]"
      >
        {/* Moldura da ampulheta */}
        <path
          d="M6 3.5h12M6 20.5h12M7.5 3.5c0 4 4.5 5.5 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5.5-4.5 8.5s4.5 4.5 4.5 8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Areia de cima (drena em direção ao gargalo) */}
        <path
          d="M8.6 6.2h6.8L12 11.4z"
          fill="currentColor"
          opacity="0.9"
          style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'ol-sand-top 3s ease-in-out infinite' }}
        />
        {/* Areia de baixo (acumula) */}
        <path
          d="M12 12.6l3.4 5.2H8.6z"
          fill="currentColor"
          opacity="0.9"
          style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'ol-sand-bottom 3s ease-in-out infinite' }}
        />
        {/* Grão caindo no gargalo */}
        <circle
          cx="12"
          cy="12"
          r="0.75"
          fill="currentColor"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'ol-sand-fall 0.7s linear infinite' }}
        />
      </svg>
    </span>
  );
}
