import jwt from "jsonwebtoken";
import User from "../models/User.model.js"

export const verifyToken = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No autorizado, token no proporcionado"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token invalido"
        });
    };

};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // verifyToken con req.user = user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "No autorizado"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para realizar esta acción"
            });
        }

        next();
    };
}