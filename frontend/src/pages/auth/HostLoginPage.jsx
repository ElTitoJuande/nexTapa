import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDefaultRouteByRole } from "../../utils/authRedirect";

const inputWrapStyle = {
  background: "linear-gradient(180deg, #181c28, #141924)",
};

const primaryButtonStyle = {
  background: "linear-gradient(180deg, #ff7a2f, #f76622)",
  boxShadow: "0 12px 24px rgba(247, 102, 34, 0.34)",
};

export function HostLoginPage() {
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
      setError("Completa correo electrónico y contraseña");
      return;
    }

    try {
      setSubmitting(true);
      const response = await login({
        email: form.email,
        password: form.password,
        loginType: "hostelero",
      });

      const role = response?.data?.role;
      navigate(getDefaultRouteByRole(role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen px-4 pb-9 pt-7 text-slate-100">
      <div className="mx-auto w-full max-w-[430px]">
        <Link to="/login" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-300 no-underline">
          <ArrowLeft size={18} />
          Acceso cliente
        </Link>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 grid place-items-center">
            <img
              src="/Logo.png"
              alt="Logo nexTapa"
              className="h-[86px] w-[86px] object-contain drop-shadow-[0_12px_24px_rgba(247,105,34,0.35)]"
            />
          </div>
          <h1 className="m-0 text-4xl font-bold tracking-tight sm:text-5xl">nexTapa Host</h1>
          <p className="mt-1.5 text-base text-orange-400 sm:text-lg">Gestiona tu local y tus tapas</p>
        </div>

        <h2 className="m-0 text-4xl font-bold tracking-tight sm:text-5xl">Acceso hostelero</h2>
        <p className="mb-6 mt-2 text-lg text-slate-400">Entra para administrar tu establecimiento</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-300">Email</span>
            <span
              className="flex min-h-[60px] items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25"
              style={inputWrapStyle}
            >
              <Mail size={22} className="shrink-0 text-[#7787ab]" />
              <input
                type="email"
                name="email"
                placeholder="responsable@local.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                className="auth-input w-full border-0 bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]"
              />
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-300">Contraseña</span>
            <span
              className="flex min-h-[60px] items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25"
              style={inputWrapStyle}
            >
              <Lock size={22} className="shrink-0 text-[#7787ab]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="auth-input w-full border-0 bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]"
              />
              <button
                type="button"
                className="grid cursor-pointer place-items-center bg-transparent p-0 text-[#7a8cae]"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </span>
          </label>

          {error && <p className="m-0 text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl border-0 text-2xl font-bold tracking-tight text-white transition active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-75 sm:text-3xl"
            style={primaryButtonStyle}
          >
            {submitting ? "Entrando..." : "Entrar al dashboard"}
          </button>
        </form>

        <p className="mb-0 mt-5 text-center text-lg text-slate-400">
          ¿Aún no tienes cuenta de hostelero?{" "}
          <Link to="/host/register" className="font-bold text-[#ff7a2f] no-underline">
            Crear cuenta hostelero
          </Link>
        </p>

        <p className="mb-0 mt-3 text-center text-lg text-slate-400">
          Prefieres entrar como cliente?{" "}
          <Link to="/login" className="font-bold text-[#ff7a2f] no-underline">
            Inicia sesión de cliente
          </Link>
        </p>
      </div>
    </section>
  );
}
