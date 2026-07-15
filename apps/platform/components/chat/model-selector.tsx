'use client';

import { CaretUpDownIcon, CheckIcon } from '@phosphor-icons/react';
import { Button } from '@faraday-academy/ui/components/ui/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@faraday-academy/ui/components/ui/popover';
import { MODEL_OPTIONS, modelsByProvider } from '@/lib/chat/models';
import { ProviderIcon } from './provider-icon';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

/** 컴포저 모델 선택 — Popover + 프로바이더(svgl) 아이콘, 프로바이더별 그룹. */
export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const groups = modelsByProvider();
  const active = MODEL_OPTIONS.find((m) => m.id === value);

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          />
        }
      >
        {active ? <ProviderIcon provider={active.provider} className="size-3.5" /> : null}
        <span className="max-w-[10rem] truncate">{active?.label ?? '모델 선택'}</span>
        <CaretUpDownIcon className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="cn-popover-menu w-60">
        <div className="p-1">
          {groups.map((group) => (
            <div key={group.provider} className="py-0.5">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[0.7rem] font-medium text-muted-foreground">
              <ProviderIcon provider={group.provider} className="size-3.5" />
              {group.providerLabel}
            </div>
            {group.models.map((model) => (
              <PopoverClose
                key={model.id}
                render={
                  <button
                    type="button"
                    onClick={() => onChange(model.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:bg-muted"
                  >
                    <span className="min-w-0 flex-1 truncate text-left">{model.label}</span>
                    {model.id === value ? <CheckIcon className="size-3.5 shrink-0" /> : null}
                  </button>
                }
              />
            ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
