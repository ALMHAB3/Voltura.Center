const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** The single price formatter for the whole store: whole Libyan dinars, e.g. "2,160 د.ل". */
export function formatPrice(value: number | null | undefined): string {
  return `${numberFormat.format(Math.round(value ?? 0))} د.ل`;
}

export function formatNumber(value: number | null | undefined): string {
  return numberFormat.format(value ?? 0);
}

const dateFormat = new Intl.DateTimeFormat("ar-LY", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Africa/Tripoli",
});
const dateTimeFormat = new Intl.DateTimeFormat("ar-LY", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Tripoli",
});

export function formatDate(value: string | Date): string {
  return dateFormat.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormat.format(new Date(value));
}

/**
 * Mirrors public.discounted_price() in the database: round the discounted price UP
 * to the next multiple of 5. Used only for previews in the admin form; the database is the source of truth.
 */
export function discountedPrice(price: number, percent: number): number {
  if (!percent || percent <= 0) return price;
  return Math.min(price, Math.ceil((price * (100 - percent)) / 100 / 5) * 5);
}

/** Same normalisation the database applies to search_text. */
export function normalizeSearch(text: string): string {
  return text
    .trim()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[ً-ْ]/g, "")
    .toLowerCase();
}
