

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.model.js";

dotenv.config();

async function createAdminFer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({ email: "fernando@nextapa.es" });

    if (existingAdmin) {
      console.log("Ya existe un admin con ese email");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Fernando",
      email: "fernando@nextapa.es",
      password: "Admin123??",
       role: "admin",
    });

    console.log("Admin creado correctamente:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creando admin:", error);
    process.exit(1);
  }
}

createAdminFer();