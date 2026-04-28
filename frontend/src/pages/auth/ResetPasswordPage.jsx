// src/pages/auth/ResetPasswordPage.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

const shellStyle = {
  background:
    "radial-gradient(1200px 700px at 80% -10%, rgba(255,115,38,.18), transparent 55%), radial-gradient(800px 500px at -10% 120%, rgba(255,77,0,.14), transparent 65%), linear-gradient(180deg, #1d0e08 0%, #110906 100%)",
};

const inputWrapStyle = {
  background: "linear-gradient(180deg, #181c28, #141924)",
};

const primaryButtonStyle = {
  background: "linear-gradient(180deg, #ff7a2f, #f76622)",
  boxShadow: "0 12px 24px rgba(247, 102, 34, 0.34)",
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <section className="min-h-screen flex items-center justify-center text-slate-100" style={shellStyle}>
        <div className="text-center">
          <p className="text-rose-300 mb-4">Enlace inválido o expirado</p>
          <Link to="/forgot-password" className="text-orange-400 font-bold">
            Solicitar nuevo enlace
          </Link>
        </div>
      </section>
    );
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.password) return setError("Introduce tu nueva contraseña");
    if (form.password.length < 6) return setError("Mínimo 6 caracteres");
    if (form.password !== form.confirmPassword)
      return setError("Las contraseñas no coinciden");

    try {
      setSubmitting(true);

      await api.patch(`/auth/reset-password/${token}`, {
        password: form.password,
        passwordConfirm: form.confirmPassword,
      });

      setDone(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Token inválido o expirado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen px-4 pb-9 pt-7 text-slate-100" style={shellStyle}>
      <div className="mx-auto w-full max-w-xl">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">
            nex<span className="text-orange-500">Tapa</span>
          </h1>
        </div>

        {done ? (
          <div className="text-center p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">¡Contraseña actualizada!</h2>
            <p className="text-slate-400 mt-2">Redirigiendo al login...</p>
          </div>
        ) : (
          <>
            <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300">
              <ArrowLeft size={18} />
              Volver al login
            </Link>

            <h2 className="text-3xl font-bold mb-2">Nueva contraseña</h2>
            <p className="text-slate-400 mb-6">
              Introduce tu nueva contraseña segura
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Password */}
              <div className="flex items-center gap-2 rounded-2xl border px-3 py-3" style={inputWrapStyle}>
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nueva contraseña"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm */}
              <div className="flex items-center gap-2 rounded-2xl border px-3 py-3" style={inputWrapStyle}>
                <Lock size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="text-rose-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl py-3 font-bold text-white"
                style={primaryButtonStyle}
              >
                {submitting ? "Guardando..." : "Guardar contraseña"}
              </button>

            </form>
          </>
        )}
      </div>
    </section>
  );
}