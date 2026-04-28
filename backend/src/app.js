import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { authRouter } from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { userRouter } from "./routes/userRoutes.js";
import { establishmentRouter } from "./routes/establishmentRoutes.js";
import { itemRouter } from "./routes/itemRoutes.js";
import { photoRouter } from "./routes/photoRoutes.js";
import { searchRouter } from "./routes/searchRoutes.js";
import { reservationRouter } from "./routes/reservationRoutes.js";
import { couponRouter } from "./routes/couponRoutes.js";
import { reviewRouter } from "./routes/reviewRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

// ─────────────────────────────────────────────
//  Express app + HTTP server
// ─────────────────────────────────────────────

const app = express();
export const server = http.createServer(app);

// ─────────────────────────────────────────────
//  CORS
// ─────────────────────────────────────────────

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─────────────────────────────────────────────
//  WebSocket — Sistema de notificaciones
// ─────────────────────────────────────────────

const wss = new WebSocketServer({ server, path: "/ws" });

let adminSocket = null;
const establishmentSockets = new Map();
const clientSockets = new Map();

wss.on("connection", (ws, req) => {
  const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const role = params.get("role");
  const userId = params.get("userId");

  if (role === "admin") {
    if (adminSocket && adminSocket.readyState === WebSocket.OPEN) {
      console.warn(
        "[WS] Panel admin previo desconectado al recibir nueva conexión",
      );
      adminSocket.close(1001, "Replaced by a new admin connection");
    }
    adminSocket = ws;
    console.log("[WS] Panel admin conectado");
    ws.send(
      JSON.stringify({
        type: "connected",
        role: "admin",
        message: "Admin panel connected",
        timestamp: new Date().toISOString(),
      }),
    );
    ws.on("close", () => {
      console.log("[WS] Panel admin desconectado");
      adminSocket = null;
    });
    ws.on("error", (err) => {
      console.error("[WS] Error en socket admin:", err.message);
      adminSocket = null;
    });
    return;
  }

  if (!userId) {
    ws.close(1008, "Unauthorized: userId required");
    console.warn(`[WS] Conexión rechazada — role '${role}' sin userId`);
    return;
  }

  if (role === "establishment") {
    const prev = establishmentSockets.get(userId);
    if (prev && prev.readyState === WebSocket.OPEN)
      prev.close(1001, "Replaced by a new connection");
    establishmentSockets.set(userId, ws);
    console.log(`[WS] Establecimiento conectado — userId: ${userId}`);
    ws.send(
      JSON.stringify({
        type: "connected",
        role: "establishment",
        message: "Establishment panel connected",
        timestamp: new Date().toISOString(),
      }),
    );
    ws.on("close", () => {
      establishmentSockets.delete(userId);
      console.log(`[WS] Establecimiento desconectado — userId: ${userId}`);
    });
    ws.on("error", (err) => {
      console.error(
        `[WS] Error en socket establishment (${userId}):`,
        err.message,
      );
      establishmentSockets.delete(userId);
    });
    return;
  }

  if (role === "client") {
    const prev = clientSockets.get(userId);
    if (prev && prev.readyState === WebSocket.OPEN)
      prev.close(1001, "Replaced by a new connection");
    clientSockets.set(userId, ws);
    console.log(`[WS] Cliente conectado — userId: ${userId}`);
    ws.send(
      JSON.stringify({
        type: "connected",
        role: "client",
        message: "Client connected",
        timestamp: new Date().toISOString(),
      }),
    );
    ws.on("close", () => {
      clientSockets.delete(userId);
      console.log(`[WS] Cliente desconectado — userId: ${userId}`);
    });
    ws.on("error", (err) => {
      console.error(`[WS] Error en socket client (${userId}):`, err.message);
      clientSockets.delete(userId);
    });
    return;
  }

  ws.close(1008, "Unauthorized: unknown role");
  console.warn(`[WS] Conexión rechazada — role desconocido: '${role}'`);
});

// ─────────────────────────────────────────────
//  Funciones de notificación exportadas
// ─────────────────────────────────────────────

export function notifyAdmin(payload) {
  if (!adminSocket || adminSocket.readyState !== WebSocket.OPEN) {
    console.warn(
      "[WS] notifyAdmin: admin no conectado, notificación descartada",
    );
    return;
  }
  adminSocket.send(
    JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
  );
  console.log(`[WS] Admin notificado — type: ${payload.type}`);
}

export function notifyEstablishment(ownerUserId, payload) {
  const ws = establishmentSockets.get(ownerUserId);
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn(
      `[WS] notifyEstablishment: hostelero ${ownerUserId} no conectado`,
    );
    return;
  }
  ws.send(JSON.stringify({ ...payload, timestamp: new Date().toISOString() }));
  console.log(`[WS] Establecimiento notificado — userId: ${ownerUserId}`);
}

export function notifyClient(clientUserId, payload) {
  const ws = clientSockets.get(clientUserId);
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn(`[WS] notifyClient: cliente ${clientUserId} no conectado`);
    return;
  }
  ws.send(JSON.stringify({ ...payload, timestamp: new Date().toISOString() }));
  console.log(`[WS] Cliente notificado — userId: ${clientUserId}`);
}

// ─────────────────────────────────────────────
//  Rutas base
// ─────────────────────────────────────────────

app.get("/", (_req, res) => res.send("NEXTAPA API running ✅"));
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "nextapa-backend" }),
);
app.get("/test-error", () => {
  throw new Error("Error de prueba");
});
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/establishment", establishmentRouter);
app.use("/api/items", itemRouter);
app.use("/api/photos", photoRouter);
app.use("/api/search", searchRouter);
app.use("/api/reservations", reservationRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);

// ─────────────────────────────────────────────
//  Error handler (siempre al final)
// ─────────────────────────────────────────────

app.use(errorHandler);

export default app;