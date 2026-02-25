export default function ActionButton({ label, onClick }) {
   return (
      <button 
         onClick={onClick}
         className="bg-neutral-800 text-white py-2 px-4 rounded-lg text-sm hover:bg-neutral-700 transition-colors"
      >
         {label}
      </button>
   );
}