import {
  EventPayloadSchemas,
  MessageEnvelopeSchema,
  RequestPayloadSchemas,
} from "./schema";
import type {
  EventPayloadByType,
  EventType,
  RequestPayloadByType,
  RequestType,
  RuntimeKind,
} from "./types";

type RequestHandler = (
  payload: RequestPayloadByType[RequestType],
) => Promise<unknown> | unknown;
type EventHandler<K extends EventType> = (
  payload: EventPayloadByType[K],
) => Promise<void> | void;

type RuntimeAdapter = { kind: RuntimeKind };

type RequestOptions<K extends RequestType> = {
  to: RuntimeKind;
  payload: RequestPayloadByType[K];
  tabId?: number;
};

type PublishOptions<K extends EventType> = {
  to: RuntimeKind;
  kind: K;
  payload: EventPayloadByType[K];
  tabId?: number;
};

export class MessagingService {
  private readonly runtimeAdapter: RuntimeAdapter;
  private readonly requestHandlers = new Map<RequestType, RequestHandler>();
  private readonly eventHandlers = new Map<
    EventType,
    Set<EventHandler<EventType>>
  >();
  private started = false;

  constructor(kind: RuntimeKind) {
    this.runtimeAdapter = { kind };
  }

  async request<K extends RequestType, R = unknown>({
    to,
    payload,
    tabId,
  }: RequestOptions<K>): Promise<R> {
    const kind = payload.kind;
    const requestEnvelope = MessageEnvelopeSchema.parse({
      id: crypto.randomUUID(),
      mode: "request",
      kind,
      from: this.runtimeAdapter.kind,
      to,
      tabId,
      payload,
      timestamp: new Date().toISOString(),
    });

    if (to === "content") {
      if (tabId == null) {
        throw new Error("tabId is required when target is content");
      }
      for (let attempt = 1; attempt <= 3; attempt++) {
        // eslint-disable-next-line job-tracker/prefer-try-run-over-try-catch
        try {
          return await chrome.tabs.sendMessage(tabId, requestEnvelope);
        } catch (err) {
          const isChannelClosed =
            err instanceof Error &&
            err.message.includes("message channel closed");
          if (isChannelClosed && attempt < 3) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          throw err;
        }
      }
    }

    return await chrome.runtime.sendMessage(requestEnvelope);
  }

  async publish<K extends EventType>({
    to,
    kind,
    payload,
    tabId,
  }: PublishOptions<K>): Promise<void> {
    const eventEnvelope = MessageEnvelopeSchema.parse({
      id: crypto.randomUUID(),
      mode: "event",
      kind,
      from: this.runtimeAdapter.kind,
      to,
      tabId,
      payload,
      timestamp: new Date().toISOString(),
    });

    if (to === "content") {
      if (tabId == null) {
        throw new Error("tabId is required when target is content");
      }
      await chrome.tabs.sendMessage(tabId, eventEnvelope);
      return;
    }

    await chrome.runtime.sendMessage(eventEnvelope);
  }

  handle<K extends RequestType>(kind: K, handler: RequestHandler) {
    this.requestHandlers.set(kind, handler);
  }

  on<K extends EventType>(kind: K, handler: EventHandler<K>) {
    const handlers = this.eventHandlers.get(kind) ?? new Set();
    handlers.add(handler as EventHandler<EventType>);
    this.eventHandlers.set(kind, handlers);
  }

  start() {
    if (this.started) return;
    this.started = true;

    chrome.runtime.onMessage.addListener(
      (rawMessage, _sender, sendResponse) => {
        const parsedEnvelope = MessageEnvelopeSchema.safeParse(rawMessage);
        if (!parsedEnvelope.success) return;

        const envelope = parsedEnvelope.data;
        if (envelope.to !== this.runtimeAdapter.kind) return;

        if (envelope.mode === "request") {
          if (!(envelope.kind in RequestPayloadSchemas)) return;

          const requestKind = envelope.kind as RequestType;
          const payloadSchema = RequestPayloadSchemas[requestKind];
          const payloadResult = payloadSchema.safeParse(envelope.payload);
          if (!payloadResult.success) return;

          const handler = this.requestHandlers.get(requestKind);
          if (handler == null) return;

          Promise.resolve(handler(payloadResult.data))
            .then((result) => sendResponse(result))
            .catch((err) => {
              const msg = err instanceof Error ? err.message : String(err);
              sendResponse({ __handlerError: true, errorMessage: msg });
            });
          return true;
        }

        if (envelope.mode === "event") {
          if (!(envelope.kind in EventPayloadSchemas)) return;

          const eventKind = envelope.kind as EventType;
          const payloadSchema = EventPayloadSchemas[eventKind];
          const payloadResult = payloadSchema.safeParse(envelope.payload);
          if (!payloadResult.success) return;

          const handlers = this.eventHandlers.get(eventKind);
          if (handlers == null || handlers.size === 0) return;

          for (const handler of handlers) {
            void Promise.resolve(
              handler(
                payloadResult.data as EventPayloadByType[typeof eventKind],
              ),
            );
          }
        }
      },
    );
  }
}
