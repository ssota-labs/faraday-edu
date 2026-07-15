"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@ai-sdk/workflow";
import { getToolName, isToolUIPart } from "ai";
import { ChatCircleIcon, PlusIcon } from "@phosphor-icons/react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@faraday-academy/ui/components/ui/message-scroller";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@faraday-academy/ui/components/ui/marker";
import { Spinner } from "@faraday-academy/ui/components/ui/spinner";
import { Button } from "@faraday-academy/ui/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@faraday-academy/ui/components/ui/resizable";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import type { StudioUIMessage } from "@/lib/bridge/session-events";
import { PreviewPanel } from "./preview-panel";

interface StudioSessionProps {
  courseId: string;
  draftId: string;
  courseTitle: string;
  sessionId: string;
  initialMessages?: StudioUIMessage[];
  canChat?: boolean;
  initialPrompt?: string;
  onNewChat?: () => void;
  userId?: string;
}

/**
 * Faraday Studio — mirror-dimension identical full-bleed resizable 2-pane
 * (chat left · preview right). Driven by one useChat + WorkflowChatTransport
 * against /api/studio/chat (WDK WorkflowAgent).
 */
export function StudioSession({
  courseId,
  draftId,
  courseTitle,
  sessionId,
  initialMessages = [],
  canChat = true,
  initialPrompt,
  onNewChat,
  userId = "creator_demo",
}: StudioSessionProps) {
  const transportRef = useRef<WorkflowChatTransport<StudioUIMessage> | null>(
    null,
  );
  if (!transportRef.current) {
    transportRef.current = new WorkflowChatTransport<StudioUIMessage>({
      api: "/api/studio/chat",
      prepareSendMessagesRequest: ({ body, messages, headers }) => ({
        body: { ...body, courseId, draftId, sessionId, messages },
        headers: {
          "Content-Type": "application/json",
          "x-faraday-user-id": userId,
          ...(headers as Record<string, string> | undefined),
        },
      }),
      prepareReconnectToStreamRequest: ({ headers }) => ({
        headers: {
          "x-faraday-user-id": userId,
          ...(headers as Record<string, string> | undefined),
        },
      }),
    });
  }

  const { messages, sendMessage, status, stop } = useChat<StudioUIMessage>({
    id: sessionId,
    messages: initialMessages,
    transport: transportRef.current,
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const previewUrl = derivePreviewUrl(messages);

  const sentInitial = useRef(false);
  useEffect(() => {
    if (sentInitial.current) return;
    const prompt = initialPrompt?.trim();
    if (!prompt || !canChat || initialMessages.length > 0) return;
    sentInitial.current = true;
    void sendMessage({ text: prompt });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState(null, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full bg-background">
      <ResizablePanel defaultSize="32%" minSize="24%" className="min-h-0">
        <div className="h-full p-3 pe-1.5">
          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
              <div className="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-foreground">
                <ChatCircleIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{courseTitle}</span>
              </div>
              <div className="flex-1" />
              {canChat && onNewChat ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="새 채팅"
                  onClick={onNewChat}
                >
                  <PlusIcon />
                </Button>
              ) : null}
            </header>

            <MessageScrollerProvider autoScroll scrollPreviousItemPeek={64}>
              <MessageScroller className="min-h-0 flex-1">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-4 py-16">
                    <p className="text-center text-sm text-muted-foreground">
                      {canChat
                        ? "메시지를 보내 대화를 시작하세요"
                        : "이 프로젝트는 공개 열람 중입니다"}
                    </p>
                  </div>
                ) : (
                  <MessageScrollerViewport>
                    <MessageScrollerContent
                      aria-busy={isStreaming}
                      className="mx-auto w-full max-w-2xl px-4 py-6"
                    >
                      {messages.map((message) => (
                        <MessageScrollerItem
                          key={message.id}
                          messageId={message.id}
                          scrollAnchor={message.role === "user"}
                        >
                          <ChatMessage message={message} />
                        </MessageScrollerItem>
                      ))}
                      {status === "submitted" ? (
                        <MessageScrollerItem messageId="__thinking__">
                          <Marker role="status">
                            <MarkerIcon>
                              <Spinner />
                            </MarkerIcon>
                            <MarkerContent className="shimmer">
                              생각 중…
                            </MarkerContent>
                          </Marker>
                        </MessageScrollerItem>
                      ) : null}
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                )}
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>

            {canChat ? (
              <div className="border-t p-3">
                <ChatInput
                  disabled={isStreaming}
                  onStop={stop}
                  courseId={courseId}
                  onSend={({ text, files, modelId }) => {
                    void sendMessage(
                      files.length > 0 ? { text, files } : { text },
                      { body: { modelId } },
                    );
                  }}
                />
              </div>
            ) : null}
          </section>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize="68%" minSize="30%" className="min-h-0">
        <div className="h-full p-3 ps-1.5">
          <PreviewPanel
            url={previewUrl}
            isBuilding={isStreaming}
            hasStarted={messages.length > 0}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/**
 * Preview URL from stream — identical to mirror-dimension:
 * data-md-preview + mirror_dev / mirror_build tool output.url
 */
function derivePreviewUrl(messages: StudioUIMessage[]): string | null {
  let url: string | null = null;
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "data-md-preview") {
        if (part.data.status === "ready" && part.data.url) url = part.data.url;
        else if (part.data.status === "invalidated") url = null;
      } else if (isToolUIPart(part) && "output" in part) {
        const name = getToolName(part);
        if (name === "mirror_dev" || name === "mirror_build") {
          const out = part.output as { url?: unknown } | undefined;
          if (out && typeof out.url === "string" && out.url) url = out.url;
        }
      }
    }
  }
  return url;
}
