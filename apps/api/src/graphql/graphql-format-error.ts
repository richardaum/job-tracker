import { randomUUID } from "node:crypto";

import { unwrapResolverError } from "@apollo/server/errors";
import { ForbiddenException, Logger, NotFoundException } from "@nestjs/common";
import type { GraphQLFormattedError } from "graphql";

const log = new Logger("GraphQLFormatError");

export const RESOURCE_NOT_FOUND_MESSAGE = "Resource not found";

function stripSensitiveExtensions(extensions: Record<string, unknown>): Record<string, unknown> {
  const next = { ...extensions };
  delete next.status;
  delete next.statusCode;
  return next;
}

function stripTracesForProd(extensions: Record<string, unknown>): Record<string, unknown> {
  if (process.env.NODE_ENV === "production") {
    const next = { ...extensions };
    delete next.stacktrace;
    delete next.exception;
    const orig = next.originalError;
    if (orig && typeof orig === "object") {
      const { stack: _s, ...rest } = orig as Record<string, unknown>;
      next.originalError = rest;
    }
    return next;
  }
  return extensions;
}

function shouldMaskAsNotFound(root: unknown): boolean {
  return root instanceof NotFoundException || root instanceof ForbiddenException;
}

/**
 * Normalizes GraphQL errors for clients: NOT_FOUND contract, no auth/id leakage,
 * no HTTP status hints on generic errors. Logs the resolver cause server-side.
 */
export function graphqlFormatError(
  formattedError: GraphQLFormattedError,
  rawError: unknown,
): GraphQLFormattedError {
  const traceId = randomUUID();
  const root = unwrapResolverError(rawError);

  if (shouldMaskAsNotFound(root)) {
    log.error({
      traceId,
      graphqlPath: formattedError.path,
      maskedAs: "NOT_FOUND",
      originalType: root instanceof Error ? root.constructor.name : typeof root,
      originalMessage: root instanceof Error ? root.message : String(root),
      ...(process.env.NODE_ENV !== "production" && root instanceof Error
        ? { stack: root.stack }
        : {}),
    });

    const base = (formattedError.extensions ?? {}) as Record<string, unknown>;
    return {
      ...formattedError,
      message: RESOURCE_NOT_FOUND_MESSAGE,
      extensions: stripTracesForProd({
        ...stripSensitiveExtensions(base),
        code: "NOT_FOUND",
      }),
    };
  }

  log.warn(
    `[${traceId}] path=${JSON.stringify(formattedError.path)} message=${formattedError.message}`,
  );

  let ext = {
    ...((formattedError.extensions ?? {}) as Record<string, unknown>),
  };

  if (ext.status === 404 || ext.status === 403) {
    ext = stripSensitiveExtensions(ext);
  }

  return { ...formattedError, extensions: stripTracesForProd(ext) };
}
