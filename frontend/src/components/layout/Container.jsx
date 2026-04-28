

export default function Container({ children, className = "" }) {
   return (
      <main className={`mx-auto max-w-3xl p-4 ${className}`}>
         {children}
      </main>
   );
}
