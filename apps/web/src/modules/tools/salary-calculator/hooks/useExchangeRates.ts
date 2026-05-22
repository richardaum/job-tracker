import { useCallback } from "react";

import { useExchangeRatesQuery } from "@/gql/hooks";

type ExchangeRates = Record<string, number>;

export interface UseExchangeRatesReturn {
  rates: ExchangeRates | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchRates: () => void;
}

export function useExchangeRates(
  baseCurrency: string,
  targetCurrencies: string[],
): UseExchangeRatesReturn {
  const { data, loading, error, refetch } = useExchangeRatesQuery({
    variables: { base: baseCurrency, currencies: targetCurrencies },
    fetchPolicy: "cache-and-network",
    skip: !targetCurrencies.length,
  });

  const rates = data?.exchangeRates
    ? data.exchangeRates.rates.reduce((acc, { currency, rate }) => {
        acc[currency] = rate;
        return acc;
      }, {} as ExchangeRates)
    : null;

  const lastUpdated = data?.exchangeRates ? new Date() : null;

  const fetchRates = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    rates,
    loading,
    error: error?.message ?? null,
    lastUpdated,
    fetchRates,
  };
}
