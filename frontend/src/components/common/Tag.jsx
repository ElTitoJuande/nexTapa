export default function Tag({ label, className = "" }) {
   return (
      <span className={`inline-block bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm mr-2 mb-2 ${className}`}>
         {label}
      </span>
   );
}