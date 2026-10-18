// Add this script after index.html's existing inline script.
const depositRate = 0.5;
const originalPick = window.pick;
const originalFetch = window.fetch.bind(window);

function selectedSpace() {
  const title = document.querySelector("#title")?.textContent ?? "";
  if (title.includes("Atlas Training Room")) return { deposit: true, dailyRate: 12000 };
  if (title.includes("Nova Auditorium")) return { deposit: true, dailyRate: 35000 };
  return { deposit: false, dailyRate: 0 };
}

function isDepositSpace() {
  return selectedSpace().deposit;
}

function dateCount() {
  const start = document.querySelector("#start")?.value;
  const end = document.querySelector("#end")?.value;
  if (!start || !end || end <= start) return 1;
  return Math.max(1, Math.round((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000));
}

function refreshDeposit() {
  const section = document.querySelector("#depositSection");
  if (!section) return;
  const needed = isDepositSpace();
  section.classList.toggle("hide", !needed);
  document.querySelector("#advancePayment").required = needed;
  if (needed) {
    const amount = selectedSpace().dailyRate * dateCount() * depositRate;
    document.querySelector("#advancePayment").min = amount;
    document.querySelector("#depositMessage").textContent = `Required advance payment: LKR ${amount.toLocaleString()} (50%)`;
  }
}

window.pick = function (id) {
  originalPick(id);
  refreshDeposit();
  document.querySelectorAll(".meta").forEach((element) => { element.style.textTransform = "capitalize"; });
};

["#start", "#end"].forEach((selector) => document.querySelector(selector)?.addEventListener("change", refreshDeposit));

window.fetch = function (input, init) {
  if (input === "/api/bookings" && init?.body) {
    const booking = JSON.parse(init.body);
    booking.advancePayment = isDepositSpace() ? Number(document.querySelector("#advancePayment").value) : 0;
    init = { ...init, body: JSON.stringify(booking) };
  }
  return originalFetch(input, init);
};

document.head.insertAdjacentHTML("beforeend", "<style>.meta{text-transform:capitalize}</style>");

const deposit = document.createElement("div");
deposit.id = "depositSection";
deposit.className = "hide";
deposit.innerHTML = '<label>Advance payment (LKR)<input id="advancePayment" type="number" min="0" step="1" placeholder="Enter amount paid" required></label><p id="depositMessage" class="small"></p>';
document.querySelector("#deskTimes").after(deposit);
