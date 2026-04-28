// src/config/brevo.js

/**
 * Envía un email transaccional via Brevo usando API REST
 * @param {Array<{email: string, name?: string}>} recipients
 * @param {string} subject
 * @param {string} htmlContent
 */
export const sendEmail = async (recipients, subject, htmlContent) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: recipients,
        subject,
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log(
      `[Brevo] Email enviado a ${recipients.map(r => r.email).join(", ")} — messageId: ${data.messageId}`
    );

    return data;
  } catch (error) {
    console.error("[Brevo] Error al enviar email:", error.message);
    throw error;
  }
};
console.log("BREVO KEY:", process.env.BREVO_API_KEY);