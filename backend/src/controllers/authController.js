import User from "../models/User.model.js";
import { generateToken } from "../Utils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña obligatorios",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const isPasswordValid = await user.correctPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Usuario desactivado",
      });
    }

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    user.password = undefined;

    return res.status(200).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error en login",
      error: error.message,
    });
  }
};
