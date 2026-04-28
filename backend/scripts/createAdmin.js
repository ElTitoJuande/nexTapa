import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.model.js";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({ email: "juande@ejemplo.com" });

    if (existingAdmin) {
      console.log("Ya existe un admin con ese email");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Juande",
      email: "juande@ejemplo.com",
      password: "123456",
      phone: "+34612345678",
      role: "admin",
    });

    console.log("Admin creado correctamente:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creando admin:", error);
    process.exit(1);
  }
}

createAdmin();