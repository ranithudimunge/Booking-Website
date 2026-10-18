// Load after the existing page script.
const agreement = document.createElement("div");
agreement.id = "alcoholAgreementSection";
agreement.className = "hide";
agreement.innerHTML = '<label class="check"><input id="alcoholAgreement" type="checkbox"> I agree that alcohol will not be sold on the premises and that I accept the venue alcohol policy.</label>';
document.querySelector("#alcohol").after(agreement);

function syncAlcoholAgreement() {
  const required = document.querySelector("#alcohol").value === "true";
  agreement.classList.toggle("hide", !required);
  document.querySelector("#alcoholAgreement").required = required;
}
document.querySelector("#alcohol").addEventListener("change", syncAlcoholAgreement);
syncAlcoholAgreement();

const originalFetchForPolicy = window.fetch.bind(window);
window.fetch = function (input, init) {
  if (input === "/api/bookings" && init?.body) {
    const booking = JSON.parse(init.body);
    booking.alcoholAgreement = document.querySelector("#alcoholAgreement")?.checked ?? false;
    init = { ...init, body: JSON.stringify(booking) };
  }
  return originalFetchForPolicy(input, init);
};
