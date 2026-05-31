import type { ApolloCache, DocumentNode, Reference } from "@apollo/client";

type RemoveDeletedEntityFromListCacheParams = {
  mutationData: unknown;
  mutation: DocumentNode;
  query: DocumentNode;
};

function getFirstQueryFieldName(query: DocumentNode): string | null {
  for (const definition of query.definitions) {
    if (definition.kind === "OperationDefinition" && definition.operation === "query") {
      const firstSelection = definition.selectionSet.selections[0];
      if (firstSelection?.kind === "Field") {
        return firstSelection.name.value;
      }
    }
  }
  return null;
}

function getFirstMutationFieldName(mutation: DocumentNode): string | null {
  for (const definition of mutation.definitions) {
    if (definition.kind === "OperationDefinition" && definition.operation === "mutation") {
      const firstSelection = definition.selectionSet.selections[0];
      if (firstSelection?.kind === "Field") {
        return firstSelection.name.value;
      }
    }
  }
  return null;
}

function getDeletedIdFromMutationResult(
  mutationData: unknown,
  mutationFieldName: string,
): string | null {
  if (!mutationData || typeof mutationData !== "object") {
    return null;
  }
  const rootField = (mutationData as Record<string, unknown>)[mutationFieldName];
  if (!rootField || typeof rootField !== "object") {
    return null;
  }
  const deletedId = (rootField as Record<string, unknown>).deletedId;
  return typeof deletedId === "string" && deletedId.length > 0 ? deletedId : null;
}

export function removeDeletedEntityFromListCache(
  cache: ApolloCache,
  { mutationData, mutation, query }: RemoveDeletedEntityFromListCacheParams,
): void {
  const listField = getFirstQueryFieldName(query);
  const mutationField = getFirstMutationFieldName(mutation);
  if (!listField || !mutationField) {
    return;
  }
  const deletedId = getDeletedIdFromMutationResult(mutationData, mutationField);
  if (!deletedId) {
    return;
  }

  let removedRefId: string | null = null;
  cache.modify({
    fields: {
      [listField](
        existing: unknown,
        { readField }: { readField: (name: string, ref: Reference) => unknown },
      ) {
        if (!Array.isArray(existing)) {
          return existing;
        }
        return existing.filter((ref) => {
          const reference = ref as Reference;
          const isDeleted = readField("id", reference) === deletedId;
          if (isDeleted && "__ref" in reference) {
            removedRefId = reference.__ref;
          }
          return !isDeleted;
        });
      },
    },
  });

  if (removedRefId) {
    cache.evict({ id: removedRefId });
  }
  cache.gc();
}
