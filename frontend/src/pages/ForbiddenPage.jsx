import { Link, useLocation } from "react-router-dom";

const primaryButtonStyle = {
  background: "linear-gradient(180deg, #ff7a2f, #f76922)",
};

export function ForbiddenPage() {
  const location = useLocation();
  const fromPath = location.state?.from;

  return (
    <section
      className="grid min-h-screen place-items-center px-5 text-slate-100"
    >
      <div className="w-full max-w-130 rounded-2xl border border-[#2f3c55] bg-[#121824]/80 p-6">
        <p className="m-0 text-5xl font-extrabold text-orange-500 sm:text-6xl">403</p>
        <h1 className="mb-2 mt-1 text-3xl font-bold tracking-tight">Acceso denegado</h1>
        <p className="mb-4 text-slate-400">
          Esta zona esta reservada para hosteleros. Puedes seguir navegando en la parte publica.
        </p>
        {fromPath && <p className="mb-4 text-slate-400">Intentaste acceder a: {fromPath}</p>}
        <div className="flex gap-2.5">
          <Link
            to="/"
            className="inline-flex min-h-10 items-center justify-center rounded-[11px] px-3.5 font-semibold text-white no-underline"
            style={primaryButtonStyle}
          >
            Ir al inicio
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-[11px] border border-[#36455f] bg-[#181e2d] px-3.5 font-semibold text-slate-200 no-underline"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}

