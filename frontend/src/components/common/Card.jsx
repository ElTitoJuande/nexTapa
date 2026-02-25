export default function Card({ children, className, onClick }) {
   return (
      <div
         onClick={onClick} 
         className={`bg-neutral-900 rounded-2xl overflow-hidden ${className}`}>
         {children}
      </div>
   );
}
