function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function buildScheduledAtWithBrowserTimezone(dateTimeLocalValue: string): string | null {
  if (!dateTimeLocalValue) return null;

  const parsedDate = new Date(dateTimeLocalValue);
  if (Number.isNaN(parsedDate.getTime())) return null;

  const offsetMinutes = -parsedDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const offsetRemainderMinutes = String(absoluteOffset % 60).padStart(2, "0");

  return `${dateTimeLocalValue}:00${sign}${offsetHours}:${offsetRemainderMinutes}`;
}

export function getDateTimeInputValueFromNow(offsetDays = 0): string {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setDate(date.getDate() + offsetDays);
  return toDateTimeLocalValue(date);
}

export function getDateTimeInputValueFromIso(isoDateTimeValue?: string | null): string {
  if (!isoDateTimeValue) return "";

  const date = new Date(isoDateTimeValue);
  if (Number.isNaN(date.getTime())) return "";
  return toDateTimeLocalValue(date);
}
