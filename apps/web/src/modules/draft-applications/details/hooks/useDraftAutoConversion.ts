import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

interface UseDraftAutoConversionOptions {
  draftLoaded: boolean;
  onConvert: () => void | Promise<void>;
}

export function useDraftAutoConversion({
  draftLoaded,
  onConvert,
}: UseDraftAutoConversionOptions) {
  const searchParams = useSearchParams();
  const autoConvertAttemptedRef = useRef(false);

  useEffect(() => {
    const autoConvert = searchParams.get("autoConvert") === "true";

    if (autoConvert && draftLoaded && !autoConvertAttemptedRef.current) {
      autoConvertAttemptedRef.current = true;

      // Remove the parameter from the URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("autoConvert");
      const newRelativePathQuery =
        window.location.pathname +
        (newParams.toString() ? `?${newParams.toString()}` : "");
      window.history.replaceState(null, "", newRelativePathQuery);

      void onConvert();
    }
  }, [searchParams, draftLoaded, onConvert]);
}
