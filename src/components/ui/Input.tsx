import type { ReactNode } from 'react';
import {
  Input as HInput,
  Textarea as HTextarea,
  Select as HSelect,
  SelectItem,
} from '@heroui/react';

const fieldBase = {
  variant: 'bordered' as const,
  radius: 'md' as const,
  labelPlacement: 'outside' as const,
};

/** Campo de texto do design system (encapsula HeroUI Input). */
export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  startContent,
  error,
  ...rest
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  startContent?: ReactNode;
  error?: string;
  isRequired?: boolean;
}) {
  return (
    <HInput
      {...fieldBase}
      {...rest}
      type={type}
      label={label}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      startContent={startContent}
      isInvalid={Boolean(error)}
      errorMessage={error}
    />
  );
}

/** Área de texto do design system. */
export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  minRows = 3,
  error,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  minRows?: number;
  error?: string;
}) {
  return (
    <HTextarea
      {...fieldBase}
      label={label}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      minRows={minRows}
      isInvalid={Boolean(error)}
      errorMessage={error}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

/** Seleção do design system (encapsula HeroUI Select). */
export function Select({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  isDisabled,
}: {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
  isDisabled?: boolean;
}) {
  return (
    <HSelect
      {...fieldBase}
      label={label}
      placeholder={placeholder}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const k = Array.from(keys as Set<string>)[0];
        if (k != null) onChange?.(String(k));
      }}
      isInvalid={Boolean(error)}
      errorMessage={error}
      isDisabled={isDisabled}
    >
      {options.map((o) => (
        <SelectItem key={o.value}>{o.label}</SelectItem>
      ))}
    </HSelect>
  );
}
