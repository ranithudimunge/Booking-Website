export function cancellationPenalty(booking, space, now = new Date()) {
  if (!["training", "auditorium"].includes(space.type)) return { rate: 0, amount: 0 };
  const start = new Date(`${booking.startDate}T${booking.startTime || "00:00"}:00`);
  const hours = (start - now) / 3600000;
  const rate = hours > 24 ? 0 : hours > 12 ? 0.25 : hours > 6 ? 0.4 : 0.5;
  const total = space.dailyRate * Math.max(1, Math.ceil((new Date(`${booking.endDate}T00:00:00`) - new Date(`${booking.startDate}T00:00:00`)) / 86400000));
  return { rate, amount: total * rate };
}
