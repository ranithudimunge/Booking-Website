import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { datesOverlap, timesOverlap, validateBooking } from "./contracts.js";
import { cancellationPenalty } from "./cancellation-rules.js";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const storePath = join(root, "data", "store.json");
const publicPath = join(root, "public");
const mimeTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".png": "image/png" };
const ADVANCE_RATE = 0.5;
const getStore = () => JSON.parse(readFileSync(storePath, "utf8"));
const saveStore = (store) => writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`);
function sendJson(response, status, body) { response.writeHead(status, { "Content-Type": "application/json" }); response.end(JSON.stringify(body)); }
function readJson(request) { return new Promise((resolve, reject) => { let raw = ""; request.on("data", part => raw += part); request.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { reject(new Error("Request body must be valid JSON.")); } }); }); }
function nextDay(date) { const d = new Date(`${date}T00:00:00`); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }
function bookingDays(input) {
  if (input.startDate === input.endDate) return 1;
  return Math.max(1, Math.round((new Date(`${input.endDate}T00:00:00`) - new Date(`${input.startDate}T00:00:00`)) / 86400000));
}
function roomConflicts(existing, requested) {
  const timedExisting = existing.startDate === existing.endDate && existing.startTime && existing.endTime;
  const timedRequested = requested.startDate === requested.endDate && requested.startTime && requested.endTime;
  if (timedExisting && timedRequested) return existing.startDate === requested.startDate && existing.startTime < requested.endTime && existing.endTime > requested.startTime;
  const fullExisting = { startDate: existing.startDate, endDate: timedExisting ? nextDay(existing.startDate) : existing.endDate };
  const fullRequested = { startDate: requested.startDate, endDate: timedRequested ? nextDay(requested.startDate) : requested.endDate };
  return datesOverlap(fullExisting, fullRequested);
}
function conflicts(existing, requested, space) { return space.type === "desk" ? timesOverlap(existing, requested) : roomConflicts(existing, requested); }
function serveStatic(pathname, response) { const file = pathname === "/" ? "index.html" : pathname.slice(1); if (file.includes("..")) return sendJson(response, 404, { error: "Not found." }); try { const content = readFileSync(join(publicPath, file)); response.writeHead(200, { "Content-Type": mimeTypes[extname(file)] ?? "application/octet-stream" }); response.end(content); } catch { sendJson(response, 404, { error: "Page file not found." }); } }
const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`); const { pathname } = url;
  if (request.method === "GET" && pathname === "/api/spaces") return sendJson(response, 200, getStore().spaces);
  if (request.method === "GET" && pathname === "/api/bookings") return sendJson(response, 200, getStore().bookings);
  if (request.method === "GET" && pathname.startsWith("/api/bookings/") && pathname.endsWith("/cancellation")) {
    const id = pathname.split("/")[3], store = getStore(), booking = store.bookings.find(item => item.id === id);
    if (!booking) return sendJson(response, 404, { error: "Booking not found." });
    return sendJson(response, 200, { penalty: cancellationPenalty(booking, store.spaces.find(item => item.id === booking.spaceId)) });
  }
  if (request.method === "DELETE" && pathname.startsWith("/api/bookings/")) {
    const id = pathname.split("/").pop(), store = getStore(), index = store.bookings.findIndex(item => item.id === id);
    if (index < 0) return sendJson(response, 404, { error: "Booking not found." });
    const booking = store.bookings[index], penalty = cancellationPenalty(booking, store.spaces.find(item => item.id === booking.spaceId));
    store.bookings.splice(index, 1); saveStore(store); return sendJson(response, 200, { message: "Booking cancelled.", penalty });
  }
  if (request.method === "POST" && pathname === "/api/bookings") try {
    const input = await readJson(request), store = getStore(), space = store.spaces.find(item => item.id === input.spaceId);
    if (!space) return sendJson(response, 400, { error: "Selected space does not exist." });
    const error = validateBooking(input, space); if (error) return sendJson(response, 400, { error });
    const requiresAdvance = ["training", "auditorium"].includes(space.type);
    const requiredAdvance = requiresAdvance ? space.dailyRate * bookingDays(input) * ADVANCE_RATE : 0;
    const advancePayment = Number(input.advancePayment ?? 0);
    if (requiresAdvance && (!Number.isFinite(advancePayment) || advancePayment < requiredAdvance)) return sendJson(response, 400, { error: `An advance payment of at least LKR ${requiredAdvance.toLocaleString()} is required.`, requiredAdvance });
    if (store.bookings.some(booking => booking.spaceId === space.id && conflicts(booking, input, space))) return sendJson(response, 409, { error: "This space is already booked for part of that period." });
    const booking = { id: randomUUID(), spaceId: space.id, customerName: input.customerName.trim(), customerContact: input.customerContact.trim(), usesAlcohol: Boolean(input.usesAlcohol), services: Array.isArray(input.services) ? input.services : [], notes: String(input.notes ?? "").trim(), advancePayment: requiresAdvance ? advancePayment : 0, requiredAdvance, createdAt: new Date().toISOString() };
    if (space.type === "desk") Object.assign(booking, { bookingDate: input.bookingDate, startTime: input.startTime, endTime: input.endTime }); else Object.assign(booking, { startDate: input.startDate, endDate: input.endDate, ...(input.startTime ? { startTime: input.startTime, endTime: input.endTime } : {}) });
    store.bookings.push(booking); saveStore(store); return sendJson(response, 201, booking);
  } catch (error) { return sendJson(response, 400, { error: error.message }); }
  return serveStatic(pathname, response);
});
const port = Number(process.env.PORT ?? 3000); server.listen(port, () => { const address = server.address(); console.log(`Booking app running at http://localhost:${typeof address === "object" ? address.port : port}`); });
