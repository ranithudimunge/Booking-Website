export function datesOverlap(existing, requested) {
  return existing.startDate < requested.endDate && existing.endDate > requested.startDate;
}

export function timesOverlap(existing, requested) {
  return existing.bookingDate === requested.bookingDate && existing.startTime < requested.endTime && existing.endTime > requested.startTime;
}

export function validateDateRange(startDate, endDate, allowSameDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate ?? "")) return "Dates must use yyyy-mm-dd.";
  if (endDate < startDate || (!allowSameDay && endDate === startDate)) return "End date must be after start date.";
  return null;
}

export function validateTimes(input) {
  if (!/^\d{2}:\d{2}$/.test(input.startTime ?? "") || !/^\d{2}:\d{2}$/.test(input.endTime ?? "")) return "Choose a start and end time.";
  if (input.endTime <= input.startTime) return "End time must be after start time.";
  return null;
}

export function validateDeskSlot(input) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.bookingDate ?? "")) return "Choose a valid desk booking date.";
  return validateTimes(input);
}

export function validateBooking(input, space) {
  const required = ["spaceId", "customerName", "customerContact"];
  const missing = required.filter((field) => !String(input[field] ?? "").trim());
  if (missing.length) return `Missing required fields: ${missing.join(", ")}`;
  if (space.type === "desk") return validateDeskSlot(input);
  const sameDayTimedRoom = ["training", "room"].includes(space.type) && input.startDate === input.endDate;
  const dateError = validateDateRange(input.startDate, input.endDate, sameDayTimedRoom);
  return dateError || (sameDayTimedRoom ? validateTimes(input) : null);
}
