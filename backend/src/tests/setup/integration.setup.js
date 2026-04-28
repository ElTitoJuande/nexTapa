import "dotenv/config";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";
import { connectDB } from "../../config/database.js";
import { cleanupCreatedUsers } from "../helpers/authTestUtils.js";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await cleanupCreatedUsers();
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await cleanupCreatedUsers();
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
