import { Search, CircleUserRound, Circle} from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";

export default function Header() {
   return (
      <header className="bg-neutral-950 border-b border-neutral-800/60 px-4 pt-5 pb-4 max-w-3xl mx-auto">

         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5">
               <Circle className="text-orange-500 text-2xl leading-none" />
               <h1 className="text-2xl font-black tracking-tight text-white">
                  nex<span className="text-orange-500">Tapa</span>
               </h1>
            </div>

            <Button className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors text-sm font-semibold text-white">
               <CircleUserRound className="w-4 h-4" />
               Login
            </Button>
         </div>

         <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            <Input
               placeholder="Tu próxima tapa aquí..."
               className="pl-9"
            />
         </div>

      </header>
   );
}