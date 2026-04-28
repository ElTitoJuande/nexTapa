import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createTestUser } from "./helpers/authTestUtils.js";

describe("Auth - Protect middleware", () => {
  it("deberia devolver 401 sin Authorization", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  it("deberia permitir acceso con Bearer token valido", async () => {
    const { user, password } = await createTestUser({
      emailPrefix: "protect",
      name: "Protect User",
    });

    expect(user.email).toBeDefined();

    const login = await request(app).post("/api/auth/login").send({
      email: user.email,
      password,
    });

    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty("success", true);
    expect(login.body).toHaveProperty("token");

    const token = login.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("email", user.email);
  });
});
