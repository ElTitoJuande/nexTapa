export default function Button({ children, className = "", ...props }) {
   return (
      <button
         className={`px-4 py-2 rounded-full bg-orange-500 text-white font-semibold ${className}`}
         {...props}
      >
         {children}
      </button>
   );
}
