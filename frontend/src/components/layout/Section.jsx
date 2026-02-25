export default function Section({ title, children, className = "" }) {
   return (
      <div className={`mt-6 ${className}`}>
         <h2 className="text-lg font-semibold mb-3">{title}</h2>
         {children}
      </div>
   );
}