import type { ReactNode } from 'react';
import {
  Input as HInput,
  Textarea as HTextarea,
  Select as HSelect,
  SelectItem,
} from '@heroui/react';

/**
 * Base dos campos. O **label é renderizado por nós** (bloco acima do controle),
 * NÃO pelo HeroUI — o `labelPlacement="outside"` do HeroUI, quando vários campos
 * ficam empilhados, sobrepõe o label ao campo anterior. Assim o espaçamento é
 * previsível em qualquer container (modais, drawers, grids).
 */
const fieldBase = {
  variant: 'bordered' as const,
  radius: 'md' as const,
} as const;

function Field({
  label,
  isRequired,
  error,
  children,
}: {
  label?: string;
  isRequired?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {isRequired && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Campo de texto do design system (encapsula HeroUI Input). */
export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  startContent,
  error,
  isRequired,
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
    <Field label={label} isRequired={isRequired} error={error}>
      <HInput
        {...fieldBase}
        {...rest}
        aria-label={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onValueChange={onChange}
        startContent={startContent}
        isInvalid={Boolean(error)}
      />
    </Field>
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
  isRequired,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  minRows?: number;
  error?: string;
  isRequired?: boolean;
}) {
  return (
    <Field label={label} isRequired={isRequired} error={error}>
      <HTextarea
        {...fieldBase}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onValueChange={onChange}
        minRows={minRows}
        isInvalid={Boolean(error)}
      />
    </Field>
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
  isRequired,
}: {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
}) {
  return (
    <Field label={label} isRequired={isRequired} error={error}>
      <HSelect
        {...fieldBase}
        aria-label={label}
        placeholder={placeholder}
        selectedKeys={value ? [value] : []}
        onSelectionChange={(keys) => {
          const k = Array.from(keys as Set<string>)[0];
          if (k != null) onChange?.(String(k));
        }}
        isInvalid={Boolean(error)}
        isDisabled={isDisabled}
      >
        {options.map((o) => (
          <SelectItem key={o.value}>{o.label}</SelectItem>
        ))}
      </HSelect>
    </Field>
  );
}
