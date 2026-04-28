import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "../../services/api";

const shellStyle = {
  background:
    "radial-gradient(1200px 700px at 80% -10%, rgba(255,115,38,.18), transparent 55%), radial-gradient(800px 500px at -10% 120%, rgba(255,77,0,.14), transparent 65%), linear-gradient(180deg, #1d0e08 0%, #110906 100%)",
};

const primaryButtonStyle = {
  background: "linear-gradient(180deg, #ff7a2f, #f76622)",
  boxShadow: "0 12px 24px rgba(247, 102, 34, 0.34)",
};

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const hasVerified = useRef(false);

  useEffect(() => {
    // ✅ DEBUG LOGS
    console.log("VerifyEmailPage mounted");
    console.log("Token:", token);

    if (!token) {
      setStatus("error");
      setMessage("Enlace de verificación inválido.");
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        const data = response.data;

        // ❌ quitamos auto login
        // NO loginWithToken

        setStatus("success");
        setMessage(data.message || "¡Email verificado correctamente!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
          "El enlace no es válido o ya fue utilizado."
        );
      }
    };

    verify();
  }, [token]);

  const handleContinue = () => {
    navigate("/login", { replace: true });
  };

  return (
    <section className="min-h-screen px-4 pb-9 pt-7 text-slate-100" style={shellStyle}>
      <div className="mx-auto w-full max-w-122.5">

        {/* Logo */}
        <div className="mb-12 text-center">
          <div
            className="mx-auto mb-3.5 grid h-18.5 w-18.5 place-items-center overflow-hidden rounded-[20px] border border-[#f77827]/45 bg-white/95"
            style={{ boxShadow: "0 14px 28px rgba(247, 105, 34, 0.35)" }}
          >
            <img src="/Logo.png" alt="Logo nexTapa" className="h-20 w-20 object-contain" />
          </div>

          <h1 className="text-4xl font-bold">
            nex<span className="text-orange-500">Tapa</span>
          </h1>
        </div>

        {/* LOADING */}
        {status === "loading" && (
          <div className="text-center">
            <Loader2 size={40} className="animate-spin mx-auto text-orange-500" />
            <p className="mt-4">Verificando tu email...</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="text-center bg-[#722d12]/30 p-8 rounded-2xl">
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />

            <h2 className="text-2xl font-bold">¡Email verificado!</h2>
            <p className="mt-2 text-gray-400">{message}</p>

            <button
              onClick={handleContinue}
              className="mt-6 px-6 py-3 rounded-xl text-white font-bold"
              style={primaryButtonStyle}
            >
              Ir al login
            </button>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="text-center bg-red-500/10 p-8 rounded-2xl">
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />

            <h2 className="text-2xl font-bold">Error</h2>
            <p className="mt-2 text-gray-400">{message}</p>

            <Link to="/login" className="text-orange-500 mt-4 inline-block">
              Volver al login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}