async function cancelBooking(id) {
  const quoteResponse = await fetch(`/api/bookings/${id}/cancellation`), quote = await quoteResponse.json();
  if (!quoteResponse.ok) return alert(quote.error);
  if (!confirm(`Cancel this booking?\n\nPenalty: ${quote.penalty.rate * 100}%\nLKR ${quote.penalty.amount.toLocaleString()}`)) return;
  const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" }), result = await response.json();
  if (!response.ok) return alert(result.error);
  alert(`Booking cancelled. Penalty: LKR ${result.penalty.amount.toLocaleString()}`); location.reload();
}
const baseFetch = window.fetch.bind(window);
window.fetch = async function (input, init) {
  const response = await baseFetch(input, init);
  if (input === "/api/bookings" && (!init || init.method === "GET")) window.cancellableBookings = await response.clone().json();
  return response;
};
new MutationObserver(() => {
  document.querySelectorAll("#list li").forEach((item, index) => {
    const booking = window.cancellableBookings?.[index];
    if (booking && !item.querySelector("button")) item.insertAdjacentHTML("beforeend", `<br><button type="button" onclick="cancelBooking('${booking.id}')">Cancel booking</button>`);
  });
}).observe(document.querySelector("#list"), { childList: true });
