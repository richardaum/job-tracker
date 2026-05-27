type RuntimeMessage = { kind: string; [key: string]: unknown };

type RuntimeMessageHandler<
  TMessage extends RuntimeMessage,
  TResponse = unknown,
> = (message: TMessage) => Promise<TResponse | void> | TResponse | void;

type RuntimeMessageHandlers = Record<
  string,
  RuntimeMessageHandler<RuntimeMessage, unknown>
>;

const hasKind = (rawMessage: unknown): rawMessage is RuntimeMessage => {
  if (typeof rawMessage !== "object" || rawMessage == null) return false;

  return "kind" in rawMessage && typeof rawMessage.kind === "string";
};

const isPromise = <T>(value: Promise<T> | T): value is Promise<T> => {
  return value instanceof Promise;
};

export const registerMessageListenerByKind = (
  handlers: RuntimeMessageHandlers,
) => {
  chrome.runtime.onMessage.addListener((rawMessage, _sender, sendResponse) => {
    if (!hasKind(rawMessage)) return;

    const handler = handlers[rawMessage.kind];
    if (!handler) return;

    const result = handler(rawMessage);
    if (!isPromise(result)) {
      sendResponse(result);
      return;
    }

    void result
      .then((response) => sendResponse(response))
      .catch(() => sendResponse(null));

    return true;
  });
};
