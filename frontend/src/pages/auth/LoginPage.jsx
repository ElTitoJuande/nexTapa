import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDefaultRouteByRole } from "../../utils/authRedirect";
import { toastService } from "../../services/toastService";

const inputWrapStyle = {
  background: "linear-gradient(180deg, #181c28, #141924)",
};

const primaryButtonStyle = {
  background: "linear-gradient(180deg, #ff7a2f, #f76622)",
  boxShadow: "0 12px 24px rgba(247, 102, 34, 0.34)",
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      const message = "Completa correo electrónico y contraseña";
      setError(message);
      toastService.error(message);
      return;
    }

    try {
      setSubmitting(true);

      const response = await login({
        email: form.email,
        password: form.password,
      });

      const role = response?.data?.role;

      toastService.success("Sesión iniciada correctamente");
      navigate(getDefaultRouteByRole(role), { replace: true });

    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "No se pudo iniciar sesión";

      setError(message);
      toastService.error(message);

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen px-4 pb-9 pt-7 text-slate-100">
      <div className="mx-auto w-full max-w-122.5">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 grid place-items-center">
            <img
              src="/Logo.png"
              alt="Logo nexTapa"
              className="h-21.5 w-21.5 object-contain drop-shadow-[0_12px_24px_rgba(247,105,34,0.35)]"
            />
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl">
            nex<span className="text-orange-500">Tapa</span>
          </h1>

          <p className="text-orange-400">
            Tus tapas favoritas a un click
          </p>
        </div>

        {/* Título */}
        <h2 className="mb-6 text-4xl font-bold">
          Bienvenido de nuevo
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email */}
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-300">
              Correo electrónico
            </span>
            <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5" style={inputWrapStyle}>
              <Mail size={22} />
              <input
                type="email"
                name="email"
                placeholder= "Ingresa tu correo electrónico"
                value={form.email}
                onChange={handleChange}
                className="auth-input w-full bg-transparent outline-none"
              />
            </span>
          </label>

          {/* Password */}
          <label className="flex flex-col gap-2">
            <span className="flex justify-between">
              <span className="font-semibold text-slate-300">
                Contraseña
              </span>
              <Link to="/forgot-password" className="text-[#f77827] text-sm">
                ¿Olvidaste tu contraseña?
              </Link>
            </span>

            <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5" style={inputWrapStyle}>
              <Lock size={22} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Ingresa tu contraseña"
                value={form.password}
                onChange={handleChange}
                className="auth-input w-full bg-transparent outline-none"
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>

          {error && <p className="text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={primaryButtonStyle}
            className="rounded-2xl py-4 text-xl font-bold"
          >
            {submitting ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Registro */}
        <p className="mt-5 text-center text-slate-400">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-[#ff7a2f] font-bold">
            Regístrate
          </Link>
        </p>

      </div>
    </section>
  );
}