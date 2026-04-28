// src/pages/auth/HostRegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDefaultRouteByRole } from "../../utils/authRedirect";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { ImageDropInput } from "../../components/common/ImageDropInput";
import { toastService } from "../../services/toastService";

const inputWrapStyle = {
  background: "linear-gradient(180deg, #181c28, #141924)",
};

const primaryButtonStyle = {
  background: "linear-gradient(180deg, #ff7a2f, #f76622)",
  boxShadow: "0 12px 24px rgba(247, 102, 34, 0.34)",
};

export function HostRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessLogo: "",
    phone: "",
    cif: "",
    businessAddress: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      "name", "email", "password", "confirmPassword",
      "businessName", "phone", "cif",
    ];

    const hasEmptyRequired = requiredFields.some(
      (field) => !String(form[field] || "").trim(),
    );

    if (hasEmptyRequired) return "Completa los campos obligatorios del registro hostelero";
    if (form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toastService.error(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const response = await register({
        role: "hostelero",
        name: form.name,
        email: form.email,
        password: form.password,
        passwordConfirm: form.confirmPassword,
        businessName: form.businessName,
        businessLogo: form.businessLogo || undefined,
        phone: form.phone,
        cif: form.cif,
        businessAddress: form.businessAddress || undefined,
      });

      const role = response?.data?.role;
      toastService.success("Registro de hostelero completado");
      navigate(getDefaultRouteByRole(role), { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "No se pudo completar el registro");
      setError(message);
      toastService.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen px-4 pb-9 pt-7 text-slate-100">
      <div className="mx-auto w-full max-w-107.5">

        <Link to="/login" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-300 no-underline">
          <ArrowLeft size={18} />
          Volver al login
        </Link>

        <h1 className="m-0 text-4xl font-bold tracking-tight sm:text-5xl">
          Registro hostelero
        </h1>
        <p className="mb-6 mt-2 text-lg text-slate-400">
          Crea tu cuenta y prepara tu local para publicarlo
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Nombre */}
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-300">Nombre del responsable</span>
            <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25" style={inputWrapStyle}>
              <User size={20} className="text-[#7787ab]" />
              <input type="text" name="name" placeholder="Ej. Marta Ruiz"
                value={form.name} onChange={handleChange}
                className="w-full bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]" />
            </span>
          </label>

          {/* Email */}
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-300">Email</span>
            <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25" style={inputWrapStyle}>
              <Mail size={20} className="text-[#7787ab]" />
              <input type="email" name="email" placeholder="responsable@local.com"
                value={form.email} onChange={handleChange}
                className="w-full bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]" />
            </span>
          </label>

          {/* Passwords */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold text-slate-300">
                Contraseña
              </span>
              <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5" style={inputWrapStyle}>
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="********"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input w-full bg-transparent text-lg outline-none"
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold text-slate-300">
                Confirmar contraseña
              </span>
              <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5" style={inputWrapStyle}>
                <Lock size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="********"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="auth-input w-full bg-transparent text-lg outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>
          </div>

          {/* Nombre del local */}
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-300">
              Nombre del local
            </span>
            <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5" style={inputWrapStyle}>
              <Store size={20} />
              <input
                type="text"
                name="businessName"
                placeholder="Nombre del local"
                value={form.businessName}
                onChange={handleChange}
                className="auth-input w-full bg-transparent text-lg outline-none"
              />
            </span>
          </label>

          <ImageDropInput
            label="Logo (opcional)"
            value={form.businessLogo}
            onChange={(val) => setForm((p) => ({ ...p, businessLogo: val }))}
          />

          {/* Teléfono + CIF */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold text-slate-300">Teléfono</span>
              <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25" style={inputWrapStyle}>
                <Phone size={20} className="text-[#7787ab]" />
                <input type="text" name="phone" placeholder="699 123 456"
                  value={form.phone} onChange={handleChange}
                  className="w-full bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]" />
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold text-slate-300">CIF</span>
              <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25" style={inputWrapStyle}>
                <IdCard size={20} className="text-[#7787ab]" />
                <input type="text" name="cif" placeholder="B12345678"
                  value={form.cif} onChange={handleChange}
                  className="w-full bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]" />
              </span>
            </label>
          </div>

          {/* Dirección */}
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-300">Dirección (opcional)</span>
            <span className="flex min-h-15 items-center gap-2.5 rounded-2xl border border-[#2f3f66] px-3.5 transition focus-within:border-[#f77827] focus-within:ring-2 focus-within:ring-[#f77827]/25" style={inputWrapStyle}>
              <MapPin size={20} className="text-[#7787ab]" />
              <input type="text" name="businessAddress" placeholder="Calle, número, ciudad"
                value={form.businessAddress} onChange={handleChange}
                className="w-full bg-transparent text-lg text-slate-200 outline-none placeholder:text-[#7181a3]" />
            </span>
          </label>

          {error && <p className="m-0 text-sm text-rose-300">{error}</p>}

          <button type="submit" disabled={submitting} style={primaryButtonStyle}
            className="inline-flex min-h-16 items-center justify-center rounded-2xl border-0 text-2xl font-bold tracking-tight text-white transition active:translate-y- disabled:cursor-not-allowed disabled:opacity-75 sm:text-3xl">
            {submitting ? "Creando..." : "Crear cuenta hostelero"}
          </button>

        </form>

        <p className="mb-0 mt-5 text-center text-lg text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-bold text-[#ff7a2f] no-underline">
            Inicia sesión
          </Link>
        </p>

      </div>
    </section>
  );
}
