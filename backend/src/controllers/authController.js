import crypto from "crypto";
import User from "../models/User.model.js";
import { generateToken } from "../Utils/generateToken.js";
import { sendEmail } from "../config/brevo.js";
import {
  verifyEmailMail,
  resetPasswordMail,
} from "../email-templates/generateTemplates.js";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const normalizeUsername = (username) => {
  if (typeof username !== "string") return null;
  const normalized = username.trim().replace(/^@+/, "").toLowerCase();
  return normalized || null;
};

const normalizeLoginType = (loginType) => {
  if (typeof loginType !== "string") return null;
  return loginType.trim().toLowerCase();
};

const mapRegisterError = (error) => {
  if (error?.code === 11000) {
    const keyValue = error.keyValue || {};
    const field = Object.keys(keyValue)[0] || "campo";

    if (field === "email") {
      return {
        status: 409,
        code: "DUPLICATE_KEY",
        message: "Ya existe un usuario con ese email",
      };
    }

    if (field === "username") {
      return {
        status: 409,
        code: "DUPLICATE_KEY",
        message: "Ya existe un usuario con ese nombre de usuario",
      };
    }

    return {
      status: 409,
      code: "DUPLICATE_KEY",
      message: `Ya existe un registro con ese ${field}`,
      details: keyValue,
    };
  }

  if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors || {})
      .map((item) => item?.message)
      .filter(Boolean);

    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: errors[0] || "Datos inválidos",
      errors,
    };
  }

  if (error?.name === "CastError") {
    return {
      status: 400,
      code: "CAST_ERROR",
      message: `Valor inválido para ${error.path}`,
    };
  }

  const explicitStatus = Number(error?.statusCode || error?.status);
  const hasMessage = typeof error?.message === "string" && error.message.trim().length > 0;

  if (Number.isInteger(explicitStatus) && explicitStatus >= 400 && explicitStatus < 600) {
    return {
      status: explicitStatus,
      message: hasMessage ? error.message.trim() : "No se pudo crear la cuenta",
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: hasMessage ? error.message.trim() : "No se pudo crear la cuenta",
  };
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
    const normalizedType = normalizeLoginType(loginType);

    if (normalizedType && normalizedType !== "cliente" && normalizedType !== "hostelero") {
      return res.status(400).json({ success: false, message: "Tipo de login inválido" });
    }
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña obligatorios" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const isPasswordValid = await user.correctPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }
    if (!user.active) {
      return res.status(403).json({ success: false, message: "Usuario desactivado" });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Debes verificar tu email antes de iniciar sesión.", code: "EMAIL_NOT_VERIFIED" });
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    user.password = undefined;

    return res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ success: false, message: "Error en login" });
  }
};

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      passwordConfirm,
      username,
      role,
      businessName,
      phone,
      cif,
      avatar,
    } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = normalizeUsername(username);
    const normalizedAvatar = typeof avatar === "string" ? avatar.trim() : null;
    const selectedRole = role === "hostelero" ? "hostelero" : "cliente";

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Nombre, email y contraseña son obligatorios" });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, message: "Las contraseñas no coinciden" });
    }
    if (normalizedUsername && !/^[a-z0-9._]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario solo permite letras minúsculas, números, punto y guion bajo",
      });
    }
    if (selectedRole === "hostelero" && (!businessName || !phone || !cif)) {
      return res.status(400).json({ success: false, message: "Para registrarte como hostelero debes indicar nombre del local, teléfono y CIF" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Ya existe un usuario con ese email" });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const hashedVerifyToken = crypto.createHash("sha256").update(verifyToken).digest("hex");

    const user = await User.create({
      name, email: normalizedEmail, password,
      username: normalizedUsername || undefined,
      avatar: normalizedAvatar || undefined,
      role: selectedRole,
      businessName: selectedRole === "hostelero" ? businessName : undefined,
      phone: selectedRole === "hostelero" ? phone : undefined,
      cif: selectedRole === "hostelero" ? cif : undefined,
      emailVerified: false,
      emailVerificationToken: hashedVerifyToken,
    });

    // ── Enviar email de verificación (desacoplado) ────────────────────────
    setTimeout(() => {
      sendEmail(
        [{ email: user.email, name: user.name }],
        "Verifica tu email — nexTapa ✉️",
        verifyEmailMail(user.name, verifyToken)
      ).catch((err) => console.error("[Brevo] Error en email de verificación:", err.message));
    }, 0);

    return res.status(201).json({
      success: true,
      message: "Cuenta creada. Revisa tu email para verificar tu cuenta.",
    });
  } catch (error) {
    console.error("Error en register:", error);
    const mappedError = mapRegisterError(error);

    return res.status(mappedError.status).json({
      success: false,
      message: mappedError.message,
      ...(mappedError.code ? { code: mappedError.code } : {}),
      ...(mappedError.errors ? { errors: mappedError.errors } : {}),
      ...(mappedError.details ? { details: mappedError.details } : {}),
    });
  }
};

// ─────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ emailVerificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token inválido o expirado" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    const jwtToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verificado correctamente. ¡Ya puedes acceder a nexTapa!",
      token: jwtToken,
      data: user,
    });
  } catch (error) {
    console.error("Error en verifyEmail:", error);
    return res.status(500).json({ success: false, message: "Error al verificar email" });
  }
};

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email obligatorio" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: "Si el email existe, recibirás un enlace" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    setTimeout(() => {
      sendEmail(
        [{ email: user.email, name: user.name }],
        "Recupera tu contraseña — nexTapa 🔑",
        resetPasswordMail(user.name, resetToken)
      ).catch((err) => console.error("[Brevo] Error en email de reset:", err.message));
    }, 0);

    return res.status(200).json({ success: true, message: "Si el email existe, recibirás un enlace" });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ success: false, message: "Error al procesar solicitud" });
  }
};

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token inválido o expirado" });
    }

    const { password, passwordConfirm } = req.body;
    if (!password || password !== passwordConfirm) {
      return res.status(400).json({ success: false, message: "Las contraseñas no coinciden o están vacías" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
      token: jwtToken,
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(500).json({ success: false, message: "Error al resetear contraseña" });
  }
};
