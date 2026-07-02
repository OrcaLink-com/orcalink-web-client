import type { ChatParticipant } from './types';
import { avatarHue, getInitials } from './utils';

/** Avatar (foto ou iniciais com cor determinística) + ponto de online opcional. */
export function MessageAvatar({
  participant,
  size = 40,
  showPresence = false,
  className = '',
}: {
  participant: Pick<ChatParticipant, 'name' | 'avatarUrl' | 'online'>;
  size?: number;
  showPresence?: boolean;
  className?: string;
}) {
  const hue = avatarHue(participant.name);
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {participant.avatarUrl ? (
        <img
          src={participant.avatarUrl}
          alt={participant.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-semibold text-white"
          style={{
            fontSize: size * 0.4,
            background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 70% 35%))`,
          }}
          aria-hidden
        >
          {getInitials(participant.name)}
        </div>
      )}
      {showPresence && participant.online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-content1 bg-success" />
      )}
    </div>
  );
}
