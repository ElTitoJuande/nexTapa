

// import { useState } from "react";

// const items = [
//    { id: "home", label: "Home", icon: "home" },
//    { id: "explore", label: "Explore", icon: "explore" },
//    { id: "saved", label: "Saved", icon: "favorite" },
//    { id: "profile", label: "Profile", icon: "person" },
// ];

// export default function Footer() {
//    const [active, setActive] = useState("home");

//    return (
//       <footer className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-50">
      
//          <div className="max-w-md mx-auto flex justify-between px-6 py-3">
//             {items.map(item => {
//                const isActive = active === item.id;

//                return (
//                   <button
//                      key={item.id}
//                      onClick={() => setActive(item.id)}
//                      className={`flex flex-col items-center gap-1 transition active:scale-95 ${
//                         isActive ? "text-orange-500" : "text-neutral-400"
//                      }`}
//                   >
//                      <span className="material-symbols-outlined text-xl">
//                         {item.icon}
//                      </span>
//                      <span
//                         className={`text-xs ${
//                            isActive ? "font-semibold" : "font-medium"
//                         }`}
//                      >
//                         {item.label}
//                      </span>
//                   </button>
//                );
//             })}
//          </div>
//       </footer>
//    );
// }



import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Array de configuración de los items del menú de navegación inferior
// Cada item tiene: id único, label visible, icono de Material Symbols y ruta de destino
const items = [
   { id: "home", label: "Home", icon: "home", path: "/" },
   { id: "explore", label: "Explore", icon: "explore", path: "/explore" },
   { id: "saved", label: "Saved", icon: "favorite", path: "/saved" },
   { id: "profile", label: "Profile", icon: "person", path: "/login" },
];

export default function Footer() {
   // useNavigate: hook de React Router para navegación programática
   const navigate = useNavigate();
   
   // useLocation: hook que nos da acceso a la ubicación actual (ruta) de la aplicación
   const location = useLocation();
   
   /**
    * Función helper para determinar qué item debe estar activo
    * Busca en el array de items cuál coincide con la ruta actual (location.pathname)
    * Si no encuentra ninguno, devuelve "home" como valor por defecto
    * @returns {string} - El id del item activo
    */
   const getActiveItem = () => {
      const currentItem = items.find(item => item.path === location.pathname);
      return currentItem ? currentItem.id : "home";
   };

   // Estado local para controlar qué item está activo en la navegación
   // Se inicializa llamando a getActiveItem() para sincronizar con la ruta actual
   const [active, setActive] = useState(getActiveItem());

   /**
    * Manejador de clicks en los items del menú
    * Actualiza el estado local (para el efecto visual) y navega a la ruta correspondiente
    * @param {Object} item - El objeto item que fue clickeado
    */
   const handleItemClick = (item) => {
      setActive(item.id); // Actualiza el estado visual
      navigate(item.path); // Navega a la ruta del item
   };

   return (
      // Footer fijado en la parte inferior con z-index alto para que esté siempre visible
      // Usa Tailwind para styling: fondo oscuro, borde superior, y posicionamiento fixed
      <footer className="p-4 max-w-3xl mx-auto">
         {/* Contenedor centrado con ancho máximo para mantener el diseño responsive */}
         <div className="max-w-md mx-auto flex justify-between px-6 py-3">
            {/* Iteramos sobre cada item del array para renderizar los botones */}
            {items.map(item => {
               // Variable auxiliar para saber si este item es el activo actualmente
               const isActive = active === item.id;

               return (
                  <button
                     key={item.id}
                     onClick={() => handleItemClick(item)}
                     // Clases condicionales: naranja si está activo, gris si no
                     // active:scale-95 da un efecto de "presión" al hacer click
                     className={`flex flex-col items-center gap-1 transition active:scale-95 ${
                        isActive ? "text-orange-500" : "text-neutral-400"
                     }`}
                  >
                     {/* Icono de Material Symbols - el nombre del icono viene del array items */}
                     <span className="material-symbols-outlined text-xl">
                        {item.icon}
                     </span>
                     
                     {/* Label del item - cambia a font-semibold cuando está activo */}
                     <span
                        className={`text-xs ${
                           isActive ? "font-semibold" : "font-medium"
                        }`}
                     >
                        {item.label}
                     </span>
                  </button>
               );
            })}
         </div>
      </footer>
   );
}