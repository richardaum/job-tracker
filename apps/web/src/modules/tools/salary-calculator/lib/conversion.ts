const HOURS_PER_WEEK = 40;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

export function hourlyToYearly(hourly: number): number {
  return hourly * HOURS_PER_WEEK * WEEKS_PER_YEAR;
}

export function hourlyToMonthly(hourly: number): number {
  return hourlyToYearly(hourly) / MONTHS_PER_YEAR;
}

export function yearlyToHourly(yearly: number): number {
  return yearly / (HOURS_PER_WEEK * WEEKS_PER_YEAR);
}

export function yearlyToMonthly(yearly: number): number {
  return yearly / MONTHS_PER_YEAR;
}

export function monthlyToYearly(monthly: number): number {
  return monthly * MONTHS_PER_YEAR;
}

export function monthlyToHourly(monthly: number): number {
  return yearlyToHourly(monthlyToYearly(monthly));
}

export function convertCadence(
  value: number,
  from: "hourly" | "monthly" | "yearly",
  to: "hourly" | "monthly" | "yearly",
): number {
  if (from === to) return value;
  if (from === "hourly") {
    return to === "yearly" ? hourlyToYearly(value) : hourlyToMonthly(value);
  }
  if (from === "yearly") {
    return to === "hourly" ? yearlyToHourly(value) : yearlyToMonthly(value);
  }
  return to === "hourly" ? monthlyToHourly(value) : monthlyToYearly(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  locale = "en-US",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
