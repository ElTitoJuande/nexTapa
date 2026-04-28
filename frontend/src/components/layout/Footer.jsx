import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ChefHat, Home, LayoutDashboard, Search, User } from "lucide-react";

const baseItems = [
  { id: "home", label: "Inicio", Icon: Home, path: "/" },
  { id: "search", label: "Buscar", Icon: Search, path: "/search" },
];

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Estado para controlar la visibilidad
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef(null);

  // Lógica para ocultar/mostrar
  const showNavbar = useCallback(() => {
    setIsVisible(true);

    // Limpiamos el temporizador anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Ocultar después de 2.5 segundos de inactividad
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
  }, []);

  useEffect(() => {
    // Eventos que disparan la visibilidad: scroll, mover ratón, tocar pantalla
    const events = ["scroll", "mousemove", "touchstart", "keydown"];

    events.forEach((event) => window.addEventListener(event, showNavbar));

    // Mostrarla al cargar la página
    showNavbar();

    return () => {
      events.forEach((event) => window.removeEventListener(event, showNavbar));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showNavbar]);

  // --- Lógica de items original ---
  const profileAvatar =
    isAuthenticated && user?.role === "cliente" ? user?.avatar : null;

  const profileItem = {
    id: "profile",
    label: isAuthenticated ? "Perfil" : "Entrar",
    Icon: User,
    path: "/profile",
    avatar: profileAvatar,
  };

  const adminItem = (() => {
    if (user?.role === "admin") {
      return {
        id: "admin",
        label: "Panel",
        Icon: LayoutDashboard,
        path: "/admin",
      };
    }
    if (user?.role === "hostelero") {
      return {
        id: "admin",
        label: "Panel",
        Icon: ChefHat,
        path: "/host/dashboard",
      };
    }
    return null;
  })();

  const items = [...baseItems, ...(adminItem ? [adminItem] : []), profileItem];

  const isPathActive = (path) => {
    if (path === "/admin") {
      return location.pathname.startsWith("/admin");
    }
    if (path === "/host/dashboard") {
      return location.pathname.startsWith("/host");
    }
    return location.pathname === path;
  };

  return (
    <>
      <div className="h-24" />
      <footer
        className={`fixed inset-x-0 bottom-0 z-50 pb-3 transition-all duration-500 ease-in-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto flex w-full max-w-5xl justify-center px-4">
          <nav
            onMouseEnter={() => {
              // Si el ratón está encima, cancelamos el ocultado automático
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              setIsVisible(true);
            }}
            onMouseLeave={showNavbar}
            className="flex items-center gap-1 rounded-2xl border border-neutral-700/80 bg-neutral-900/88 p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl pointer-events-auto"
            aria-label="Navegación principal"
          >
            {items.map((item) => {
              const isActive = isPathActive(item.path);
              const ItemIcon = item.Icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`group flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-orange-500/15 text-orange-400"
                      : "text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-200"
                  }`}
                >
                  <div className="relative flex h-6 items-center justify-center">
                    {item.id === "profile" && item.avatar ? (
                      <img
                        src={item.avatar}
                        alt="avatar"
                        className={`h-6 w-6 rounded-full object-cover ${
                          isActive
                            ? "ring-2 ring-orange-500/90"
                            : "ring-1 ring-neutral-600"
                        }`}
                      />
                    ) : (
                      <ItemIcon
                        size={20}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        fill={isActive ? "currentColor" : "none"}
                      />
                    )}

                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-orange-500/85" />
                    )}
                  </div>

                  <span
                    className={`text-[10px] tracking-wide ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </footer>
    </>
  );
};

// import { useAuth } from "../../context/AuthContext";
// import { useLocation, useNavigate } from "react-router-dom";
// import { ChefHat, Home, LayoutDashboard, Search, User } from "lucide-react";

// const baseItems = [
//   { id: "home", label: "Inicio", Icon: Home, path: "/" },
//   { id: "search", label: "Buscar", Icon: Search, path: "/search" },
// ];

// export const Footer = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isAuthenticated, user } = useAuth();

//   const profileAvatar =
//     isAuthenticated && user?.role === "cliente" ? user?.avatar : null;

//   const profileItem = {
//     id: "profile",
//     label: isAuthenticated ? "Perfil" : "Entrar",
//     Icon: User,
//     path: "/profile",
//     avatar: profileAvatar,
//   };

//   const adminItem = (() => {
//     if (user?.role === "admin") {
//       return {
//         id: "admin",
//         label: "Panel",
//         Icon: LayoutDashboard,
//         path: "/admin",
//       };
//     }

//     if (user?.role === "hostelero") {
//       return {
//         id: "admin",
//         label: "Panel",
//         Icon: ChefHat,
//         path: "/host/dashboard",
//       };
//     }

//     return null;
//   })();

//   const items = [...baseItems, ...(adminItem ? [adminItem] : []), profileItem];

//   const isPathActive = (path) => {
//     if (path === "/admin") {
//       return location.pathname.startsWith("/admin");
//     }

//     if (path === "/host/dashboard") {
//       return location.pathname.startsWith("/host");
//     }

//     return location.pathname === path;
//   };

//   return (
//     <>
//       <div className="h-24" />
//       <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-50 pb-3">
//         <div className="mx-auto flex w-full max-w-5xl justify-center px-4">
//           <nav
//             className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-neutral-700/80 bg-neutral-900/88 p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl"
//             aria-label="Navegación principal"
//           >
//             {items.map((item) => {
//               const isActive = isPathActive(item.path);
//               const ItemIcon = item.Icon;

//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => navigate(item.path)}
//                   className={`group flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95 ${
//                     isActive
//                       ? "bg-orange-500/15 text-orange-400"
//                       : "text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-200"
//                   }`}
//                 >
//                   <div className="relative flex h-6 items-center justify-center">
//                     {item.id === "profile" && item.avatar ? (
//                       <img
//                         src={item.avatar}
//                         alt="avatar"
//                         className={`h-6 w-6 rounded-full object-cover ${
//                           isActive
//                             ? "ring-2 ring-orange-500/90"
//                             : "ring-1 ring-neutral-600"
//                         }`}
//                       />
//                     ) : (
//                       <ItemIcon
//                         size={20}
//                         strokeWidth={isActive ? 2.5 : 1.8}
//                         fill={isActive ? "currentColor" : "none"}
//                       />
//                     )}

//                     {isActive && (
//                       <span className="absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-orange-500/85" />
//                     )}
//                   </div>

//                   <span
//                     className={`text-[10px] tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}
//                   >
//                     {item.label}
//                   </span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </footer>
//     </>
//   );
// };
