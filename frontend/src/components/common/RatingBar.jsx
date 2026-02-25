export default function RatingBar({ stars, value }) {
   return (
      <div className="flex items-center gap-2">
         <span className="text-sm w-8">{stars}★</span>
         <div className="flex-1 bg-neutral-800 rounded-full h-2">
            <div 
               className="bg-orange-500 h-2 rounded-full transition-all" 
               style={{ width: `${value}%` }}
            />
         </div>
      </div>
   );
}