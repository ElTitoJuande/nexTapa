export default function Input({ className = "", ...props }) {
   return (
      <input
         className={`w-full p-4 rounded-xl bg-neutral-800 text-white outline-none ${className}`}
         {...props}
      />
   );
}
