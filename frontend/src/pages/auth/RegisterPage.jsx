import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserRoundPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDefaultRouteByRole } from "../../utils/authRedirect";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { ImageDropInput } from "../../components/common/ImageDropInput";
import { toastService } from "../../services/toastService";

const avatarOptions = [
  "/avatars/avatar-1.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
  "/avatars/avatar-5.svg",
  "/avatars/avatar-f.jpg",
  "/avatars/avatar-g.jpg",
  "/avatars/avatar-h.jpg",
  "/avatars/avatar-i.jpg",
  "/avatars/avatar-j.jpg",
];

const inputWrapStyle = {
  background: "linear-gradient(180deg, #181c28, #141924)",
};

const primaryButtonStyle = {
  background: "linear-gradient(180deg, #ff7a2f, #f76622)",
  boxShadow: "0 12px 24px rgba(247, 102, 34, 0.34)",
};

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedAvatar = useMemo(() => form.avatar, [form.avatar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return "Completa los campos obligatorios";
    }

    if (form.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    if (form.password !== form.confirmPassword) {
      return "Las contraseñas no coinciden";
    }

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
        role: "cliente",
        name: form.name,
        username: form.username || undefined,
        email: form.email,
        password: form.password,
        passwordConfirm: form.confirmPassword,
        avatar: form.avatar || undefined,
      });

      const role = response?.data?.role;

      toastService.success("Verifica tu correo para activar tu cuenta");
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
      <div className="mx-auto w-full max-w-122.5">

        {/* Back */}
        <Link to="/login" className="mb-4 flex items-center gap-2 text-slate-300">
          <ArrowLeft size={18} /> Volver
        </Link>

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

        {/* Title */}
        <h2 className="mb-6 text-4xl font-bold">
          Crea tu cuenta
        </h2>

        <p className="mb-6 text-slate-400">
          Únete a la comunidad foodie de nexTapa
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name */}
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-slate-300">
              Nombre completo
            </span>
            <span
              className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5"
              style={inputWrapStyle}
            >
              <UserRoundPlus size={22} />
              <input
                type="text"
                name="name"
                placeholder="Tu nombre"
                value={form.name}
                onChange={handleChange}
                className="auth-input w-full bg-transparent outline-none"
              />
            </span>
          </label>

          {/* Username */}
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-slate-300">
              Usuario
            </span>
            <span
              className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5"
              style={inputWrapStyle}
            >
              <User size={22} />
              <input
                type="text"
                name="username"
                placeholder="@usuario (opcional)"
                value={form.username}
                onChange={handleChange}
                className="auth-input w-full bg-transparent outline-none"
              />
            </span>
          </label>

          {/* Email */}
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-slate-300">
              Correo electrónico
            </span>
            <span
              className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5"
              style={inputWrapStyle}
            >
              <Mail size={22} />
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                className="auth-input w-full bg-transparent outline-none"
              />
            </span>
          </label>

          {/* Password */}
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-slate-300">
              Contraseña
            </span>
            <span
              className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5"
              style={inputWrapStyle}
            >
              <Lock size={22} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                className="auth-input w-full bg-transparent outline-none"
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>

          {/* Confirm Password */}
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-slate-300">
              Confirmar contraseña
            </span>
            <span
              className="flex min-h-15 items-center gap-2.5 rounded-2xl border px-3.5"
              style={inputWrapStyle}
            >
              <Lock size={22} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="********"
                value={form.confirmPassword}
                onChange={handleChange}
                className="auth-input w-full bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>

          {/* Avatar */}
          <ImageDropInput
            label="Avatar (opcional)"
            value={form.avatar}
            onChange={(val) => setForm((p) => ({ ...p, avatar: val }))}
          />

          <div className="flex gap-2 overflow-x-auto">
            {avatarOptions.map((avatar) => (
              <img
                key={avatar}
                src={avatar}
                onClick={() => setForm((p) => ({ ...p, avatar }))}
                className={`w-14 h-14 rounded-full cursor-pointer ${
                  selectedAvatar === avatar ? "ring-2 ring-orange-500" : ""
                }`}
              />
            ))}
          </div>

          {error && <p className="text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={primaryButtonStyle}
            className="rounded-2xl py-4 text-xl font-bold"
          >
            {submitting ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-center text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-[#ff7a2f] font-bold">
            Inicia sesión
          </Link>
        </p>

        <p className="mt-3 text-center text-slate-400">
          ¿Eres hostelero?{" "}
          <Link to="/host/register" className="text-[#ff7a2f] font-bold">
            Regístrate como hostelero
          </Link>
        </p>
      </div>
    </section>
  );
}
