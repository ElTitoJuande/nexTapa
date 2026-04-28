// src/email-templates/generateTemplates.js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Cargar templates HTML ─────────────────────────────────────────────────────
const verifyEmailTemplate         = readFileSync(join(__dirname, "VerifyEmail.html"), "utf-8");
const resetPasswordTemplate       = readFileSync(join(__dirname, "ResetPassword.html"), "utf-8");
const reservationConfirmedTemplate = readFileSync(join(__dirname, "ReservationConfirmed.html"), "utf-8");
const reservationRejectedTemplate  = readFileSync(join(__dirname, "ReservationRejected.html"), "utf-8");

const formatDate = (date) =>
  new Date(date).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

// ─────────────────────────────────────────────
//  Verificación de email
// ─────────────────────────────────────────────
export const verifyEmailMail = (name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  return verifyEmailTemplate
    .replace(/{{name}}/g,       name)
    .replace(/{{verify_url}}/g, verifyUrl);
};

// ─────────────────────────────────────────────
//  Recuperación de contraseña
// ─────────────────────────────────────────────
export const resetPasswordMail = (name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  return resetPasswordTemplate
    .replace(/{{name}}/g,      name)
    .replace(/{{reset_url}}/g, resetUrl);
};

// ─────────────────────────────────────────────
//  Reserva confirmada + cupón
// ─────────────────────────────────────────────
export const reservationConfirmedMail = ({ clientName, establishmentName, date, time, guests }) => {
  return reservationConfirmedTemplate
    .replace(/{{clientName}}/g,        clientName)
    .replace(/{{establishmentName}}/g, establishmentName)
    .replace(/{{date}}/g,              formatDate(date))
    .replace(/{{time}}/g,              time)
    .replace(/{{guests}}/g,            `${guests} ${guests === 1 ? "persona" : "personas"}`)
    .replace(/{{year}}/g,              new Date().getFullYear());
};

// ─────────────────────────────────────────────
//  Reserva rechazada
// ─────────────────────────────────────────────
export const reservationRejectedMail = ({ clientName, establishmentName, date, time, guests, rejectionReason }) => {
  let html = reservationRejectedTemplate
    .replace(/{{clientName}}/g,        clientName)
    .replace(/{{establishmentName}}/g, establishmentName)
    .replace(/{{date}}/g,              formatDate(date))
    .replace(/{{time}}/g,              time)
    .replace(/{{guests}}/g,            `${guests} ${guests === 1 ? "persona" : "personas"}`)
    .replace(/{{year}}/g,              new Date().getFullYear());

  // Bloque del motivo — mostrar solo si hay razón
  if (rejectionReason) {
    html = html
      .replace('{{#if rejectionReason}}', '')
      .replace('{{/if}}', '')
      .replace(/{{rejectionReason}}/g, rejectionReason);
  } else {
    // Eliminar el bloque completo si no hay motivo
    html = html.replace(/{{#if rejectionReason}}[\s\S]*?{{\/if}}/g, '');
  }

  return html;
};