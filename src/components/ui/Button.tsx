import type { ReactNode } from 'react';
import { Button as HButton } from '@heroui/react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, 'sm' | 'md' | 'lg'> = { sm: 'sm', md: 'md', lg: 'lg' };

function mapVariant(variant: ButtonVariant): {
  color: 'primary' | 'default' | 'danger' | 'success';
  variant: 'solid' | 'bordered' | 'light';
} {
  switch (variant) {
    case 'secondary':
      return { color: 'default', variant: 'bordered' };
    case 'ghost':
      return { color: 'default', variant: 'light' };
    case 'danger':
      return { color: 'danger', variant: 'solid' };
    case 'success':
      return { color: 'success', variant: 'solid' };
    default:
      return { color: 'primary', variant: 'solid' };
  }
}

interface BaseProps {
  variant?: ButtonVariant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  loading?: boolean;
}

/** Botão do design system (encapsula HeroUI Button). */
export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled,
  type = 'button',
  className = '',
  children,
  startContent,
  endContent,
  onClick,
}: BaseProps & {
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}) {
  const m = mapVariant(variant);
  return (
    <HButton
      type={type}
      color={m.color}
      variant={m.variant}
      size={sizeMap[size]}
      fullWidth={full}
      isDisabled={disabled}
      isLoading={loading}
      onPress={onClick}
      startContent={startContent}
      endContent={endContent}
      className={`font-medium ${className}`}
    >
      {children}
    </HButton>
  );
}

/** Botão que navega (encapsula HeroUI Button como React Router Link). */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  startContent,
  endContent,
  to,
}: BaseProps & { to: string }) {
  const m = mapVariant(variant);
  return (
    <HButton
      as={Link}
      to={to}
      color={m.color}
      variant={m.variant}
      size={sizeMap[size]}
      fullWidth={full}
      startContent={startContent}
      endContent={endContent}
      className={`font-medium ${className}`}
    >
      {children}
    </HButton>
  );
}
