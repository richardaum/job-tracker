"use client";

import {
  Alert,
  Button,
  Card,
  cn,
  CurrencyCombobox,
  Heading,
  Input,
  Select,
  Spinner,
  Stack,
  Text,
} from "@job-tracker/ui";
import {
  ArrowCounterClockwiseIcon,
  CalculatorIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { useExchangeRates } from "@/modules/tools/salary-calculator/hooks/useExchangeRates";
import {
  convertCadence,
  formatCurrency,
} from "@/modules/tools/salary-calculator/lib/conversion";

const CADENCES = ["hourly", "monthly", "yearly"] as const;
type Cadence = (typeof CADENCES)[number];

const CURRENCIES = ["USD", "EUR", "BRL", "GBP", "CHF"] as const;
type Currency = (typeof CURRENCIES)[number];

const CADENCE_LABELS: Record<Cadence, string> = {
  hourly: "Hourly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const CADENCE_OPTIONS = CADENCES.map((cadence) => ({
  value: cadence,
  label: CADENCE_LABELS[cadence],
}));

function isStale(lastUpdated: Date | null): boolean {
  if (!lastUpdated) return true;
  return Date.now() - lastUpdated.getTime() > 60 * 60 * 1000;
}

function formatStaleTime(lastUpdated: Date | null): string {
  if (!lastUpdated) return "Unknown";
  const diff = Date.now() - lastUpdated.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

export function SalaryCalculatorPage() {
  const [inputValue, setInputValue] = useState("8000");
  const [sourceCadence, setSourceCadence] = useState<Cadence>("monthly");
  const [sourceCurrency, setSourceCurrency] = useState<Currency>("USD");

  const handleSourceCurrencyChange = (nextValue: string) => {
    if (CURRENCIES.includes(nextValue as Currency)) {
      setSourceCurrency(nextValue as Currency);
    }
  };

  const numericValue = parseFloat(inputValue) || 0;

  const targetCurrencies = useMemo(
    () =>
      CURRENCIES.filter(
        (c): c is (typeof CURRENCIES)[number] => c !== sourceCurrency,
      ),
    [sourceCurrency],
  );

  const { rates, loading, error, lastUpdated, fetchRates } = useExchangeRates(
    sourceCurrency,
    targetCurrencies,
  );

  const conversions = useMemo(() => {
    if (numericValue === 0) return null;

    const results: Record<Cadence, Record<string, number>> = {
      hourly: {},
      monthly: {},
      yearly: {},
    };

    for (const cadence of CADENCES) {
      const baseValue = convertCadence(numericValue, sourceCadence, cadence);
      results[cadence][sourceCurrency] = baseValue;

      if (rates) {
        for (const currency of CURRENCIES) {
          if (currency === sourceCurrency) continue;
          const rate = rates[currency];
          if (rate !== undefined) {
            results[cadence][currency] = baseValue * rate;
          }
        }
      }
    }

    return results;
  }, [numericValue, sourceCadence, sourceCurrency, rates]);

  return (
    <div className={cn("mx-auto max-w-4xl px-4 py-8")}>
      <Stack gap="lg">
        <div className={cn("flex items-center gap-3")}>
          <CalculatorIcon size={28} weight="duotone" />
          <Heading as="h1" size="2xl">
            Salary Calculator
          </Heading>
        </div>

        <Text color="muted">
          Convert between hourly, monthly, and yearly rates. View equivalent
          values across USD, EUR, BRL, GBP, and CHF.
        </Text>

        <Card padding="lg">
          <Stack gap="lg">
            <Heading as="h2" size="lg">
              Enter Rate
            </Heading>

            <div
              className={cn(
                "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
              )}
            >
              <div>
                <Text size="sm" weight="medium" className={cn("mb-1.5 block")}>
                  Amount
                </Text>
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="any"
                />
              </div>

              <div>
                <Text size="sm" weight="medium" className={cn("mb-1.5 block")}>
                  Cadence
                </Text>
                <Select
                  options={CADENCE_OPTIONS}
                  value={sourceCadence}
                  onValueChange={(value) => setSourceCadence(value as Cadence)}
                />
              </div>

              <div>
                <Text size="sm" weight="medium" className={cn("mb-1.5 block")}>
                  Base Currency
                </Text>
                <CurrencyCombobox
                  value={sourceCurrency}
                  onValueChange={handleSourceCurrencyChange}
                  presets={CURRENCIES.map((code) => ({
                    code,
                    name: code,
                    flag: getFlag(code),
                  }))}
                  size="md"
                />
              </div>
            </div>

            {error && (
              <Alert intent="error" title="Exchange Rate Error">
                <div
                  className={cn(
                    "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
                  )}
                >
                  <div className={cn("min-w-0 space-y-1")}>
                    <p className={cn("text-sm leading-6")}>
                      We could not refresh exchange rates right now.
                    </p>
                    <p className={cn("text-xs text-text-error/80")}>{error}</p>
                  </div>
                  <div className={cn("w-full sm:w-auto sm:shrink-0")}>
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={fetchRates}
                      className={cn("w-full sm:w-auto")}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </Alert>
            )}

            {lastUpdated && (
              <div
                className={cn(
                  "flex items-center justify-between text-xs",
                  isStale(lastUpdated) ? "text-text-error" : "text-text-muted",
                )}
              >
                <span>Rates updated: {formatStaleTime(lastUpdated)}</span>
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={fetchRates}
                  state={loading ? "loading" : "default"}
                  leftIcon={
                    <ArrowCounterClockwiseIcon
                      size={14}
                      className={cn(loading ? "animate-spin" : "")}
                    />
                  }
                  className={cn("px-2")}
                >
                  Refresh
                </Button>
              </div>
            )}
          </Stack>
        </Card>

        {loading && !rates && (
          <div className={cn("flex justify-center py-12")}>
            <Spinner size="lg" />
          </div>
        )}

        {conversions && (
          <Card padding="lg">
            <Stack gap="md">
              <Heading as="h2" size="lg">
                Conversions
              </Heading>

              <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3")}>
                {CADENCES.map((cadence) => (
                  <Card
                    key={cadence}
                    padding="md"
                    className={cn(
                      cadence === sourceCadence
                        ? "border-border-brand"
                        : "border-border-subtle",
                    )}
                  >
                    <Stack gap="sm">
                      <Text
                        size="sm"
                        weight="semibold"
                        className={cn(
                          "uppercase tracking-wide",
                          cadence === sourceCadence
                            ? "text-text-brand"
                            : "text-text-muted",
                        )}
                      >
                        {CADENCE_LABELS[cadence]}
                      </Text>

                      {CURRENCIES.map((currency) => {
                        const value = conversions[cadence][currency];
                        if (value === undefined) return null;
                        return (
                          <div
                            key={currency}
                            className={cn(
                              "flex items-baseline justify-between",
                              currency === sourceCurrency
                                ? "font-semibold"
                                : "text-text-secondary",
                            )}
                          >
                            <span className={cn("text-sm")}>
                              {getFlag(currency)} {currency}
                            </span>
                            <span className={cn("font-mono text-sm")}>
                              {formatCurrency(value, currency)}
                            </span>
                          </div>
                        );
                      })}
                    </Stack>
                  </Card>
                ))}
              </div>
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
}

function getFlag(currency: string): string {
  const flags: Record<string, string> = {
    USD: "🇺🇸",
    EUR: "🇪🇺",
    BRL: "🇧🇷",
    GBP: "🇬🇧",
    CHF: "🇨🇭",
  };
  return flags[currency] ?? "";
}
