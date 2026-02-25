export default function Badge({ children, variant = "primary", className = "" }) {
   const variants = {
      primary: "bg-orange-500 text-white",
      feature: "bg-neutral-800 text-white",
      outline: "bg-orange-500/20 text-orange-500"
   };

   return (
      <span className={`text-xs px-3 py-1 rounded-full ${variants[variant]} ${className}`}>
         {children}
      </span>
   );
}
