import { Tabs, Tab } from '@heroui/react';

export interface Segment<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Controle segmentado (encapsula HeroUI Tabs). Filtro/abas com contador opcional. */
export function SegmentedTabs<T extends string>({
  segments,
  value,
  onChange,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <Tabs
      aria-label="Filtro"
      selectedKey={value}
      onSelectionChange={(k) => onChange(k as T)}
      variant="solid"
      color="primary"
      radius="full"
      fullWidth
      classNames={{
        tabList: 'bg-content2 p-1',
        cursor: 'shadow-card',
        tab: 'h-9',
        tabContent: 'text-text-muted group-data-[selected=true]:text-white font-medium',
      }}
    >
      {segments.map((s) => (
        <Tab
          key={s.value}
          title={
            <span className="flex items-center gap-1.5">
              {s.label}
              {s.count != null && s.count > 0 && <span className="text-xs opacity-70">{s.count}</span>}
            </span>
          }
        />
      ))}
    </Tabs>
  );
}
