

/**
 * INPUT REUTILIZABLE PARA FORMULARIOS
 * 
 */
export default function FormInput({ 
   label, 
   error, 
   icon,
   register,
   ...inputProps 
}) {
   return (
      <div className="space-y-2">
         {/* Label */}
         {label && (
            <label 
               htmlFor={inputProps.id} 
               className="block text-sm font-medium text-neutral-300"
            >
               {label}
            </label>
         )}
      
         {/* Input con icono opcional */}
         <div className="relative">
            {icon && (
               <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-500">
                  {icon}
               </span>
            )}
        
            <input
               className={`
            w-full px-4 py-3 rounded-xl
            ${icon ? 'pl-11' : ''}
            bg-neutral-900 border
            text-white placeholder-neutral-500
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-orange-500
            ${error 
         ? 'border-red-500 focus:ring-red-500' 
         : 'border-neutral-700'
      }
          `}
               {...register}
               {...inputProps}
            />
         </div>
      
         {/* Error message */}
         {error && (
            <p className="text-red-500 text-sm flex items-center gap-1">
               <span className="material-symbols-outlined text-base">error</span>
               {error.message}
            </p>
         )}
      </div>
   );
}