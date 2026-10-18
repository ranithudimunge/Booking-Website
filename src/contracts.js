/** Dates use ISO yyyy-mm-dd and intervals are [startDate, endDate). */
export function datesOverlap(existing, requested) {
  return existing.startDate < requested.endDate && existing.endDate > requested.startDate;
}

export function validateBooking(input) {
  const required = ["spaceId", "customerName", "customerContact", "startDate", "endDate"];
  const missing = required.filter((field) => !String(input[field] ?? "").trim());
  if (missing.length) return `Missing required fields: ${missing.join(", ")}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) {
    return "Dates must use yyyy-mm-dd.";
  }
  if (input.endDate <= input.startDate) return "End date must be after start date.";
  return null;
}
