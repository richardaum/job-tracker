"use client";

import { tryRun } from "@job-tracker/try-run";
import { useCallback, useEffect, useRef, useState } from "react";

import { AiMessageStreamedDocument, AiMessageStreamPhase, type AiMessageStreamedSubscription } from "@/gql/hooks";
import { useLazySubscription } from "@/modules/jobs/shared/hooks/useLazySubscription";

export interface StartAiMessageStreamInput {
  conversationId: string;
  content: string;
}

export interface AiMessageStreamCompletePayload {
  input: StartAiMessageStreamInput;
  userMessageId?: string | null;
  aiMessageId?: string | null;
  streamContent: string;
}

export interface UseAiMessageStreamOptions {
  onReady?: (input: StartAiMessageStreamInput) => void | Promise<void>;
  onComplete?: (payload: AiMessageStreamCompletePayload) => void;
  onFailed?: () => void;
}

export interface AiMessageStream {
  streamContent: string;
  isStreaming: boolean;
  startStream: (input: StartAiMessageStreamInput) => void;
  stopStream: () => void;
  resetStream: () => void;
}

/** GraphQL subscription hook for token-by-token AI response streaming. */
export function useAiMessageStream(options: UseAiMessageStreamOptions = {}): AiMessageStream {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");

  const onReadyRef = useRef(options.onReady);
  const onCompleteRef = useRef(options.onComplete);
  const onFailedRef = useRef(options.onFailed);
  useEffect(() => {
    onReadyRef.current = options.onReady;
    onCompleteRef.current = options.onComplete;
    onFailedRef.current = options.onFailed;
  }, [options.onReady, options.onComplete, options.onFailed]);

  const [lazySubscribe, lazyUnsubscribe] =
    useLazySubscription<AiMessageStreamedSubscription>(AiMessageStreamedDocument);

  const stopStream = useCallback(() => {
    lazyUnsubscribe();
    setStreamContent("");
  }, [lazyUnsubscribe]);

  const resetStream = useCallback(() => {
    stopStream();
    setIsStreaming(false);
  }, [stopStream]);

  const startStream = useCallback(
    (input: StartAiMessageStreamInput): void => {
      lazyUnsubscribe();
      setStreamContent("");
      setIsStreaming(true);

      let accumulatedContent = "";

      void lazySubscribe(
        { conversationId: input.conversationId },
        {
          async onData(data) {
            const event = data.aiMessageStreamed;
            if (!event) return;

            switch (event.phase) {
              case AiMessageStreamPhase.Ready:
                {
                  const result = onReadyRef.current?.(input);
                  if (result) {
                    const [err] = await tryRun(result);
                    if (err) {
                      resetStream();
                      onFailedRef.current?.();
                    }
                  }
                }
                break;
              case AiMessageStreamPhase.Streaming:
                if (event.token) {
                  accumulatedContent += event.token;
                  setStreamContent(accumulatedContent);
                }
                break;
              case AiMessageStreamPhase.Complete:
                setIsStreaming(false);
                onCompleteRef.current?.({
                  input,
                  userMessageId: event.userMessageId,
                  aiMessageId: event.aiMessageId,
                  streamContent: accumulatedContent,
                });
                setStreamContent("");
                break;
              case AiMessageStreamPhase.Failed:
                resetStream();
                onFailedRef.current?.();
                break;
            }
          },
          onError() {
            resetStream();
            onFailedRef.current?.();
          },
        },
      );
    },
    [lazySubscribe, lazyUnsubscribe, resetStream],
  );

  return { streamContent, isStreaming, startStream, stopStream, resetStream };
}
