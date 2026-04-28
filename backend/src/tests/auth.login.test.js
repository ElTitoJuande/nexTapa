import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createTestUser } from "./helpers/authTestUtils.js";

describe("Auth - Login", () => {
  it("deberia devolver 400 si faltan credenciales", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
  });

  it("deberia loguear y devolver token + user", async () => {
    const { user, password } = await createTestUser({
      emailPrefix: "testlogin",
      name: "Test Login",
    });

    expect(user.email).toBeDefined();

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("email", user.email);
  });

  it("deberia permitir login de hostelero desde el formulario general", async () => {
    const { user, password } = await createTestUser({
      emailPrefix: "testlogin-host-general",
      name: "Test Host General Login",
      role: "hostelero",
      businessName: "Bar de prueba",
      phone: "699123123",
      cif: "B12345678",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.data).toHaveProperty("role", "hostelero");
  });

  it("deberia ignorar loginType legado sin bloquear acceso", async () => {
    const { user, password } = await createTestUser({
      emailPrefix: "testlogin-legacy-logintype",
      name: "Test Client As Host",
      role: "cliente",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password,
      loginType: "hostelero",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.data).toHaveProperty("role", "cliente");
  });
});
