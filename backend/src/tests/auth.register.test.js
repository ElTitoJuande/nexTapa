import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createTestUser, trackCreatedUserEmail } from "./helpers/authTestUtils.js";

describe("Auth - Register", () => {
  it("deberia devolver 400 si faltan campos obligatorios", async () => {
    const res = await request(app).post("/api/auth/register").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
  });

  it("deberia devolver 400 si password y passwordConfirm no coinciden", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Cliente Nuevo",
      email: `register.mismatch.${Date.now()}@nextapa.com`,
      password: "Pass12345!",
      passwordConfirm: "Pass12345!x",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Las contraseñas no coinciden");
  });

  it("deberia registrar con username opcional y avatar", async () => {
    const email = `register.ok.${Date.now()}.${Math.round(Math.random() * 1e6)}@nextapa.com`;

    const res = await request(app).post("/api/auth/register").send({
      name: "Cliente Registro",
      email,
      password: "Pass12345!",
      passwordConfirm: "Pass12345!",
      username: "@Cliente.Nuevo",
      avatar: "/avatars/user-1.png",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.data).toHaveProperty("email", email);
    expect(res.body.data).toHaveProperty("username", "cliente.nuevo");
    expect(res.body.data).toHaveProperty("avatar", "/avatars/user-1.png");
    expect(res.body.data).toHaveProperty("role", "cliente");

    trackCreatedUserEmail(email);
  });

  it("deberia devolver 409 si el email ya existe", async () => {
    const { user } = await createTestUser({
      emailPrefix: "register-dup-email",
      name: "Register Dup Email",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Otro Usuario",
      email: user.email,
      password: "Pass12345!",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("message", "Ya existe un usuario con ese email");
  });

  it("deberia devolver 409 si el username ya existe", async () => {
    await createTestUser({
      emailPrefix: "register-dup-username-base",
      name: "Register Dup Username Base",
      username: "duplicado.user",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Otro Usuario",
      email: `register.dup.username.${Date.now()}@nextapa.com`,
      password: "Pass12345!",
      username: "@Duplicado.User",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty(
      "message",
      "Ya existe un usuario con ese nombre de usuario",
    );
  });

  it("deberia devolver 400 al registrar hostelero si faltan campos de negocio obligatorios", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Hostelero Incompleto",
      email: `host.incomplete.${Date.now()}@nextapa.com`,
      password: "Pass12345!",
      passwordConfirm: "Pass12345!",
      role: "hostelero",
      businessName: "Local incompleto",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty(
      "message",
      "Para registrarte como hostelero debes indicar nombre del local, telefono y CIF",
    );
  });

  it("deberia registrar hostelero sin logo ni direccion", async () => {
    const email = `host.minimal.${Date.now()}.${Math.round(Math.random() * 1e6)}@nextapa.com`;

    const res = await request(app).post("/api/auth/register").send({
      name: "Hostelero Minimo",
      email,
      password: "Pass12345!",
      passwordConfirm: "Pass12345!",
      role: "hostelero",
      businessName: "Bar Minimo",
      phone: "699123123",
      cif: "B12345678",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.data).toHaveProperty("email", email);
    expect(res.body.data).toHaveProperty("role", "hostelero");
    expect(res.body.data).toHaveProperty("businessName", "Bar Minimo");
    expect(res.body.data).toHaveProperty("businessLogo", null);
    expect(res.body.data).toHaveProperty("businessAddress", null);

    trackCreatedUserEmail(email);
  });

  it("deberia registrar hostelero con datos de negocio", async () => {
    const email = `host.ok.${Date.now()}.${Math.round(Math.random() * 1e6)}@nextapa.com`;

    const res = await request(app).post("/api/auth/register").send({
      name: "Hostelero Registro",
      email,
      password: "Pass12345!",
      passwordConfirm: "Pass12345!",
      role: "hostelero",
      businessName: "Bar La Plaza",
      businessLogo: "/logos/bar-la-plaza.svg",
      businessAddress: "Calle Mayor 12, Madrid",
      phone: "699123123",
      cif: "B12345678",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.data).toHaveProperty("email", email);
    expect(res.body.data).toHaveProperty("role", "hostelero");
    expect(res.body.data).toHaveProperty("businessName", "Bar La Plaza");
    expect(res.body.data).toHaveProperty("businessLogo", "/logos/bar-la-plaza.svg");
    expect(res.body.data).toHaveProperty("businessAddress", "Calle Mayor 12, Madrid");
    expect(res.body.data).toHaveProperty("phone", "699123123");
    expect(res.body.data).toHaveProperty("cif", "B12345678");

    trackCreatedUserEmail(email);
  });
});
