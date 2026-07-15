'use client';

import { useRef, useState } from 'react';
import { ArrowUpIcon, ImageIcon, StopIcon, XIcon } from '@phosphor-icons/react';
import type { FileUIPart } from 'ai';
import { Button } from '@faraday-academy/ui/components/ui/button';
import { Spinner } from '@faraday-academy/ui/components/ui/spinner';
import { ModelSelector } from './model-selector';
import { DEFAULT_MODEL_ID } from '@/lib/chat/models';
import { uploadChatImage } from '@/lib/chat/upload-attachment';

interface SendPayload {
  text: string;
  files: FileUIPart[];
  modelId: string;
}

interface ChatInputProps {
  onSend: (payload: SendPayload) => void;
  onStop: () => void;
  disabled: boolean;
  /** Course id — scopes attachment upload (data URL stub today). */
  courseId: string;
}

interface PendingAttachment {
  id: string;
  name: string;
  status: 'uploading' | 'ready' | 'error';
  url?: string;
  mediaType?: string;
  previewUrl: string;
}

/**
 * 하단 입력 composer — 둥근 카드.
 * - 이미지 첨부(dimension-assets 업로드 → file parts), 모델 선택(popover)
 * - 자동 높이 textarea, Enter 전송 / Shift+Enter 줄바꿈 (IME 안전)
 * - 스트리밍 중(disabled)에는 전송 버튼이 Stop 으로 토글
 */
export function ChatInput({ onSend, onStop, disabled, courseId }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [model, setModel] = useState(DEFAULT_MODEL_ID);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  const uploading = attachments.some((a) => a.status === 'uploading');
  const readyFiles = attachments.filter((a) => a.status === 'ready');
  const canSend = (value.trim().length > 0 || readyFiles.length > 0) && !uploading && !disabled;

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function addFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const previewUrl = URL.createObjectURL(file);
      setAttachments((prev) => [...prev, { id, name: file.name, status: 'uploading', previewUrl }]);
      uploadChatImage(courseId, file)
        .then((up) =>
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, status: 'ready', url: up.url, mediaType: up.mediaType } : a,
            ),
          ),
        )
        .catch(() =>
          setAttachments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: 'error' } : a)),
          ),
        );
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }

  function submit() {
    const text = value.trim();
    if (!canSend) return;
    const files: FileUIPart[] = readyFiles.map((a) => ({
      type: 'file',
      mediaType: a.mediaType ?? 'image/png',
      url: a.url!,
      filename: a.name,
    }));
    onSend({ text, files, modelId: model });
    setValue('');
    attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    setAttachments([]);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = 'auto';
    });
  }

  return (
    <form
      className="relative rounded-2xl border bg-background p-2 shadow-sm transition-colors focus-within:border-ring"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-2 px-1 pb-1.5">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="relative size-16 overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.previewUrl} alt={a.name} className="size-full object-cover" />
              {a.status !== 'ready' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  {a.status === 'uploading' ? (
                    <Spinner className="size-4" />
                  ) : (
                    <span className="text-[0.6rem] text-destructive">오류</span>
                  )}
                </div>
              ) : null}
              <button
                type="button"
                aria-label="첨부 제거"
                onClick={() => removeAttachment(a.id)}
                className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        placeholder="메시지를 입력하세요…"
        aria-label="메시지 입력"
        className="max-h-[200px] w-full resize-none bg-transparent px-2 py-1.5 text-sm focus:outline-none"
        onChange={(e) => {
          setValue(e.target.value);
          resize();
        }}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
        onPaste={(e) => {
          const images = Array.from(e.clipboardData?.items ?? [])
            .filter((it) => it.type.startsWith('image/'))
            .map((it) => it.getAsFile())
            .filter((f): f is File => f !== null);
          if (images.length > 0) {
            e.preventDefault();
            addFiles(images);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
            e.preventDefault();
            submit();
          }
        }}
      />

      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="이미지 첨부"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon />
          </Button>
          <ModelSelector value={model} onChange={setModel} disabled={disabled} />
        </div>
        {disabled ? (
          <Button type="button" size="icon" variant="secondary" aria-label="생성 중지" onClick={onStop}>
            <StopIcon weight="fill" />
          </Button>
        ) : (
          <Button type="submit" size="icon" aria-label="전송" disabled={!canSend}>
            <ArrowUpIcon />
          </Button>
        )}
      </div>
    </form>
  );
}
