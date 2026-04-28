import mongoose from "mongoose";
import User from "../models/User.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canAccessUser = (requestUser, targetUserId) => {
  if (!requestUser) return false;
  if (requestUser.role === "admin") return true;
  return requestUser._id.toString() === targetUserId.toString();
};

const normalizeUsername = (username) => {
  if (typeof username !== "string") return null;
  const normalized = username.trim().replace(/^@+/, "").toLowerCase();
  return normalized || null;
};

// ==========================================
// OBTENER TODOS LOS USUARIOS (ADMIN)
// ==========================================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

// ==========================================
// OBTENER 1 USUARIO (ADMIN O PROPIO USUARIO)
// ==========================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!canAccessUser(req.user, id)) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error en getUserById:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

// ==========================================
// CREAR USUARIO (REGISTRO PUBLICO)
// ==========================================
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      passwordConfirm,
      username,
      avatar,
      phone,
      role,
      businessName,
      businessAddress,
      businessLogo,
      cif,
    } = req.body;
    const normalizedUsername = normalizeUsername(username);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona nombre, email y contraseña",
      });
    }

    if (passwordConfirm !== undefined && password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un usuario con este email",
      });
    }

    if (normalizedUsername) {
      const existingUsername = await User.findOne({ username: normalizedUsername });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un usuario con este nombre de usuario",
        });
      }
    }

    const selectedRole = role === "hostelero" ? "hostelero" : "cliente";

    const normalizedBusinessName =
      typeof businessName === "string" ? businessName.trim() : "";
    const normalizedBusinessAddress =
      typeof businessAddress === "string" ? businessAddress.trim() : "";
    const normalizedBusinessLogo =
      typeof businessLogo === "string" ? businessLogo.trim() : "";

    if (
      selectedRole === "hostelero" &&
      (!normalizedBusinessName ||
        !normalizedBusinessAddress ||
        !normalizedBusinessLogo ||
        !cif)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Para registrarte como hostelero debes indicar businessName, businessAddress, businessLogo y cif",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      username: normalizedUsername || undefined,
      avatar: typeof avatar === "string" ? avatar.trim() : null,
      phone: phone || null,
      role: selectedRole,
      businessName: selectedRole === "hostelero" ? normalizedBusinessName : null,
      businessAddress:
        selectedRole === "hostelero" ? normalizedBusinessAddress : null,
      businessLogo: selectedRole === "hostelero" ? normalizedBusinessLogo : null,
      cif: selectedRole === "hostelero" ? cif : null,
    });

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: user,
    });
  } catch (error) {
    console.error("Error en createUser:", error);

    if (error?.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern || {})[0];
      const message =
        duplicatedField === "username"
          ? "Ya existe un usuario con este nombre de usuario"
          : "Ya existe un usuario con este email";

      return res.status(409).json({
        success: false,
        message,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

// ==========================================
// BORRAR USUARIO (SOFT DELETE)
// ADMIN: puede desactivar a cualquiera
// HOSTELERO: solo puede autodesactivarse
// CLIENTE: no puede autodesactivarse
// ==========================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const requester = req.user;
    const isAdmin = requester.role === "admin";
    const isSelf = requester._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!isAdmin && requester.role === "cliente") {
      return res.status(403).json({
        success: false,
        message: "Los usuarios cliente no pueden desactivar su cuenta",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!user.active) {
      return res.status(400).json({
        success: false,
        message: "Este usuario ya está desactivado",
      });
    }

    user.active = false;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Usuario desactivado exitosamente",
      data: {
        id: user._id,
        active: user.active,
        deactivatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error al borrar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

// ==========================================
// REACTIVAR USUARIO (ADMIN)
// ==========================================
export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (user.active) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya se encuentra activo",
      });
    }

    user.active = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Usuario reactivado correctamente",
      data: {
        id: user._id,
        active: user.active,
        reactivatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error al reactivar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la reactivación",
      error: error.message,
    });
  }
};

// ==========================================
// ACTUALIZAR USUARIO
// ADMIN: cualquier usuario y más campos
// CLIENTE/HOSTELERO: solo su propio perfil
// ==========================================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isSelf = req.user._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar este usuario",
      });
    }

    const adminAllowedFields = [
      "name",
      "username",
      "email",
      "password",
      "role",
      "phone",
      "businessName",
      "businessAddress",
      "businessLogo",
      "cif",
      "avatar",
      "verified",
      "emailVerified",
      "active",
    ];

    const selfAllowedFields = ["name", "username", "phone", "avatar"];
    if (req.user.role === "hostelero") {
      selfAllowedFields.push("businessName", "businessAddress", "businessLogo", "cif");
    }

    const allowedFields = isAdmin ? adminAllowedFields : selfAllowedFields;

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionaron campos permitidos para actualizar",
      });
    }

    Object.assign(user, updates);
    await user.save();

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: user,
    });
  } catch (error) {
    console.error("Error en updateUser:", error);

    if (error?.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern || {})[0];
      const message =
        duplicatedField === "username"
          ? "Ya existe un usuario con ese nombre de usuario"
          : "Ya existe un usuario con ese email";

      return res.status(409).json({
        success: false,
        message,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};
