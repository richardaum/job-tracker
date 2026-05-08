function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unknown error");
}

export async function to<T>(
  promise: Promise<T>,
): Promise<[error: Error, data: null] | [error: null, data: T]> {
  try {
    return [null, await promise];
  } catch (error) {
    return [normalizeError(error), null];
  }
}
