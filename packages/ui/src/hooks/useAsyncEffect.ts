import { type DependencyList, useEffect, useRef } from "react";

type AsyncEffectCleanup = void | (() => void);
type AsyncEffect = () => Promise<AsyncEffectCleanup> | AsyncEffectCleanup;

export function useAsyncEffect(
  effect: AsyncEffect,
  deps: DependencyList,
): void {
  const cleanupRef = useRef<AsyncEffectCleanup>(undefined);
  const depsRef = useRef<DependencyList | undefined>(undefined);

  useEffect(() => {
    const previousDeps = depsRef.current;
    const depsChanged =
      !previousDeps ||
      previousDeps.length !== deps.length ||
      previousDeps.some((value, index) => !Object.is(value, deps[index]));

    if (!depsChanged) return;

    depsRef.current = deps;
    cleanupRef.current?.();
    cleanupRef.current = undefined;

    let isCancelled = false;
    void Promise.resolve(effect()).then((nextCleanup) => {
      if (isCancelled) {
        nextCleanup?.();
        return;
      }

      cleanupRef.current = nextCleanup;
    });

    return () => {
      isCancelled = true;
    };
  });

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
    };
  }, []);
}
