"use client";

import {
  Alert,
  Button,
  Card,
  cn,
  Input,
  Select,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@job-tracker/ui";
import { SlotsProvider } from "@job-tracker/react-slots";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { NumericFormat } from "react-number-format";

import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import { SalaryCalculatorHeaderActions } from "@/modules/tools/salary-calculator/page/salary-calculator-header.slots";

import { useExchangeRates } from "@/modules/tools/salary-calculator/hooks/useExchangeRates";
import {
  convertSalaryRateBetweenPeriods,
  formatCurrency,
  SALARY_RATE_PERIOD_BASES,
  SALARY_RATE_PERIOD_LABELS,
  type SalaryRatePeriodBasis,
} from "@/modules/tools/salary-calculator/lib/conversion";

const CURRENCIES = ["USD", "EUR", "BRL", "GBP", "CHF", "CAD"] as const;
type Currency = (typeof CURRENCIES)[number];

const RATE_PERIOD_OPTIONS = SALARY_RATE_PERIOD_BASES.map((period) => ({
  value: period,
  label: SALARY_RATE_PERIOD_LABELS[period],
}));

const CURRENCY_OPTIONS = CURRENCIES.map((currency) => ({
  value: currency,
  label: `${getFlag(currency)} ${currency}`,
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
  const [sourcePeriod, setSourcePeriod] =
    useState<SalaryRatePeriodBasis>("monthly");
  const [sourceCurrency, setSourceCurrency] = useState<Currency>("USD");

  const numericValue = parseFloat(inputValue) || 0;

  const handleCardClick = (period: SalaryRatePeriodBasis) => {
    if (period === sourcePeriod || !conversions) return;
    const value = conversions[period][sourceCurrency];
    if (value !== undefined) {
      setInputValue(String(value));
      setSourcePeriod(period);
    }
  };

  const targetCurrencies = CURRENCIES.filter(
    (currency): currency is (typeof CURRENCIES)[number] =>
      currency !== sourceCurrency,
  );

  const { rates, loading, error, lastUpdated, fetchRates } = useExchangeRates(
    sourceCurrency,
    targetCurrencies,
  );

  const conversions = buildConversions({
    numericValue,
    sourcePeriod,
    sourceCurrency,
    rates,
  });

  return (
    <SlotsProvider>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <DetailPageHeader
          trailing={
            <SalaryCalculatorHeaderActions.Slot
              className={cn("flex shrink-0 items-center gap-2 empty:hidden")}
            />
          }
        >
          <DetailPageHeader.Title>Salary Calculator</DetailPageHeader.Title>
          <DetailPageHeader.Description>
            Convert between hourly, monthly, and yearly rates.
          </DetailPageHeader.Description>
        </DetailPageHeader>
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col self-start overflow-auto p-4 sm:p-6 max-w-4xl",
          )}
        >
          <Stack gap="lg">
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
                    <Text
                      size="sm"
                      weight="medium"
                      className={cn("mb-1.5 block")}
                    >
                      Amount
                    </Text>
                    <NumericFormat
                      customInput={Input}
                      inputMode="decimal"
                      allowNegative={false}
                      thousandSeparator=","
                      decimalSeparator="."
                      decimalScale={2}
                      fixedDecimalScale={false}
                      value={inputValue}
                      valueIsNumericString
                      onValueChange={(values) => setInputValue(values.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Text
                      size="sm"
                      weight="medium"
                      className={cn("mb-1.5 block")}
                    >
                      Period
                    </Text>
                    <Select
                      options={RATE_PERIOD_OPTIONS}
                      value={sourcePeriod}
                      onValueChange={(value) =>
                        setSourcePeriod(value as SalaryRatePeriodBasis)
                      }
                    />
                  </div>

                  <div>
                    <Text
                      size="sm"
                      weight="medium"
                      className={cn("mb-1.5 block")}
                    >
                      Base Currency
                    </Text>
                    <Select
                      options={CURRENCY_OPTIONS}
                      value={sourceCurrency}
                      onValueChange={(value) =>
                        setSourceCurrency(value as Currency)
                      }
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
                        <p className={cn("text-sm/6 ")}>
                          We could not refresh exchange rates right now.
                        </p>
                        <p className={cn("text-xs text-text-error/80")}>
                          {error}
                        </p>
                      </div>
                      <div className={cn("w-full sm:w-auto sm:shrink-0")}>
                        <Button
                          intent="secondary"
                          size="md"
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
                      isStale(lastUpdated)
                        ? "text-text-error"
                        : "text-text-muted",
                    )}
                  >
                    <span>Rates updated: {formatStaleTime(lastUpdated)}</span>
                    <Button
                      intent="ghost"
                      size="md"
                      onClick={fetchRates}
                      state={loading ? "loading" : "default"}
                      leftIcon={
                        <ArrowsClockwiseIcon
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
                    {SALARY_RATE_PERIOD_BASES.map((period) => (
                      <Card
                        key={period}
                        padding="md"
                        onClick={() => handleCardClick(period)}
                        className={cn(
                          period === sourcePeriod
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
                              period === sourcePeriod
                                ? "text-text-brand"
                                : "text-text-muted",
                            )}
                          >
                            {SALARY_RATE_PERIOD_LABELS[period]}
                          </Text>

                          {CURRENCIES.map((currency) => {
                            const value = conversions[period][currency];
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
      </div>
    </SlotsProvider>
  );
}

function getFlag(currency: string): string {
  const flags: Record<string, string> = {
    USD: "🇺🇸",
    EUR: "🇪🇺",
    BRL: "🇧🇷",
    GBP: "🇬🇧",
    CHF: "🇨🇭",
    CAD: "🇨🇦",
  };
  return flags[currency] ?? "";
}

function buildConversions({
  numericValue,
  sourcePeriod,
  sourceCurrency,
  rates,
}: {
  numericValue: number;
  sourcePeriod: SalaryRatePeriodBasis;
  sourceCurrency: Currency;
  rates: Record<string, number> | null;
}): Record<SalaryRatePeriodBasis, Record<string, number>> | null {
  if (numericValue === 0) return null;

  const results: Record<SalaryRatePeriodBasis, Record<string, number>> = {
    hourly: {},
    monthly: {},
    yearly: {},
  };

  for (const period of SALARY_RATE_PERIOD_BASES) {
    const baseValue = convertSalaryRateBetweenPeriods(
      numericValue,
      sourcePeriod,
      period,
    );
    results[period][sourceCurrency] = baseValue;

    if (!rates) continue;

    for (const currency of CURRENCIES) {
      if (currency === sourceCurrency) continue;
      const rate = rates[currency];
      if (rate !== undefined) {
        results[period][currency] = baseValue * rate;
      }
    }
  }

  return results;
}
