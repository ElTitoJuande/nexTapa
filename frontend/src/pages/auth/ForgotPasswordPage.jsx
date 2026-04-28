// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
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

export function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Introduce tu correo electrónico");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen px-4 pb-9 pt-7 text-slate-100" style={shellStyle}>
      <div className="mx-auto w-full max-w-122.5">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-3.5 grid h-18.5 w-18.5 place-items-center overflow-hidden rounded-[20px] border border-[#f77827]/45 bg-white/95"
            style={{ boxShadow: "0 14px 28px rgba(247, 105, 34, 0.35)" }}
          >
            <img src="/Logo.png" alt="Logo nexTapa" className="h-20 w-20 object-contain" />
          </div>
          <h1 className="m-0 text-4xl font-bold tracking-tight sm:text-5xl">
            nex<span className="text-orange-500">Tapa</span>
          </h1>
        </div>

        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 no-underline">
          <ArrowLeft size={18} />
          Volver al login
        </Link>

        {sent ? (
          /* ── Estado de éxito ── */
          <div className="mt-4 rounded-2xl border border-[#f77827]/30 bg-[#722d12]/30 p-8 text-center">
            <div
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[#f77827]/40 bg-[#f77827]/15"
            >
              <Send size={28} className="text-[#f77827]" />
            </div>
            <h2 className="m-0 text-2xl font-bold text-slate-100">¡Email enviado!</h2>
            <p className="mt-3 text-base text-slate-400 leading-relaxed">
              Si existe una cuenta con el email{" "}
              <span className="font-semibold text-orange-400">{email}</span>,
              recibirás un enlace para restablecer tu contraseña en breve.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Revisa también tu carpeta de spam.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-bold text-[#f77827] no-underline border border-[#f77827]/40 hover:bg-[#f77827]/10 transition"
            >
              Volver al login
            </Link>
          </div>
        ) : (
          /* ── Formulario ── */
          <>
            <h2 className="m-0 text-4xl font-bold tracking-tight sm:text-5xl">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="mb-6 mt-2 text-lg text-slate-400">
              Introduce tu email y te enviaremos un enlace para recuperarla.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-base font-semibold text-slate-300">
                  Correo electrónico
                </span>
                <span
                  className="flex min-h-15 items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25"
                  style={inputWrapStyle}
                >
                  <Mail size={22} className="shrink-0 text-[#7787ab]" />
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                    className="w-full border-0 bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]"
                  />
                </span>
              </label>

              {error && <p className="m-0 text-sm text-rose-300">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl border-0 text-2xl font-bold tracking-tight text-white transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-75 sm:text-3xl"
                style={primaryButtonStyle}
              >
                {submitting ? "Enviando..." : "Enviar enlace"}
                {!submitting && <Send size={22} />}
              </button>
            </form>

            <p className="mb-0 mt-5 text-center text-lg text-slate-400">
              ¿Recuerdas tu contraseña?{" "}
              <Link to="/login" className="font-bold text-[#ff7a2f] no-underline">
                Inicia sesión
              </Link>
            </p>
          </>
        )}

      </div>
    </section>
  );
}