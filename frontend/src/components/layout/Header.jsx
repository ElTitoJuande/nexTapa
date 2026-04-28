import { useEffect, useRef, useState } from "react";
import {
   CircleUserRound,
   ChevronDown,
   LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAccountRouteByRole } from "../../utils/authRedirect";
import { SearchDropdown } from "../search/SearchDropdown";
import { toastService } from "../../services/toastService";

export default function Header({ showSearch = true }) {
   const navigate = useNavigate();
   const { isAuthenticated, user, logout } = useAuth();
   const [menuOpen, setMenuOpen] = useState(false);
   const menuRef = useRef(null);

   const accountPath = getAccountRouteByRole(user?.role);
   const accountLabel = user?.role === "cliente" ? "Mi perfil" : "Mi panel";

   useEffect(() => {
      const handleOutsideClick = (event) => {
         if (!menuRef.current?.contains(event.target)) {
            setMenuOpen(false);
         }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
         document.removeEventListener("mousedown", handleOutsideClick);
      };
   }, []);

   const handleLogout = () => {
      logout();
      setMenuOpen(false);
      toastService.success("Sesión cerrada correctamente");
      navigate("/");
   };

   return (
      <header className="mx-auto max-w-5xl bg-transparent px-4 pb-3 pt-4">
         <div className={`relative z-[60] flex items-center justify-between ${showSearch ? "mb-3" : "mb-0"}`}>
            <Link to="/" className="flex items-center gap-2.5 no-underline">
               <img
                  src="/Logo.png"
                  alt="Logo de nexTapa"
                  className="h-12 w-12 object-contain drop-shadow-[0_0_16px_rgba(255,105,0,0.5)]"
               />
               <h1 className="text-2xl font-black tracking-tight leading-none text-white">
                  nex<span className="text-[#ff6900]">Tapa</span>
               </h1>
            </Link>

            {!isAuthenticated ? (
               <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/85 px-4 py-2 text-xs font-semibold text-white no-underline transition-colors hover:bg-orange-600"
               >
                  <CircleUserRound className="h-4 w-4" />
                  Login
               </Link>
            ) : (
               <div className="relative z-[120]" ref={menuRef}>
                  <button
                     type="button"
                     onClick={() => setMenuOpen((prev) => !prev)}
                     className="flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                     <CircleUserRound className="h-4 w-4" />
                     <span className="max-w-24 truncate">{user?.name || "Cuenta"}</span>
                     <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {menuOpen && (
                     <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
                        <div className="border-b border-neutral-800 px-4 py-3">
                           <p className="m-0 text-xs text-neutral-400">Sesión iniciada como</p>
                           <p className="m-0 truncate text-sm font-semibold text-white">
                              {user?.email || "usuario"}
                           </p>
                        </div>

                        <Link
                           to={accountPath}
                           onClick={() => setMenuOpen(false)}
                           className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-100 no-underline transition-colors hover:bg-neutral-800"
                        >
                           <CircleUserRound className="h-4 w-4 text-orange-400" />
                           {accountLabel}
                        </Link>

                        <button
                           type="button"
                           onClick={handleLogout}
                           className="flex w-full items-center gap-2 border-t border-neutral-800 px-4 py-3 text-left text-sm text-rose-300 transition-colors hover:bg-neutral-800"
                        >
                           <LogOut className="h-4 w-4" />
                           Cerrar sesión
                        </button>
                     </div>
                  )}
               </div>
            )}
         </div>

         {showSearch && (
            <div className="relative z-40">
               <SearchDropdown placeholder="Tu próxima tapa aquí..." />
            </div>
         )}
      </header>
   );
}

