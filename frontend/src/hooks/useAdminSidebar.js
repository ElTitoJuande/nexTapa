

// src/hooks/useAdminSidebar.js
// Hook para controlar el sidebar en móvil
import { useState, useEffect } from "react";

export const useAdminSidebar = () => {
   const [isOpen, setIsOpen] = useState(false);

   // Cerrar al cambiar de ruta o al hacer resize a desktop
   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth > 768) {setIsOpen(false);}
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   // Bloquear scroll del body cuando el sidebar está abierto
   useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
   }, [isOpen]);

   return {
      isOpen,
      open:  () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen(v => !v),
   };
};