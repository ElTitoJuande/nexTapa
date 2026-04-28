

//src/components/common/ScheduleDisplay.jsx
// Componente para mostrar el horario de un establecimiento, con agrupación de días y estado actual
const formatTime = (t) => t?.slice(0, 5) || "";

const serializeDay = (d) => {
   if (!d || d.closed) {return "closed";}
   if (d.split && d.afternoon?.open && d.afternoon?.close) {
      return `${formatTime(d.open)}-${formatTime(d.close)}|${formatTime(d.afternoon.open)}-${formatTime(d.afternoon.close)}`;
   }
   return `${formatTime(d.open)}-${formatTime(d.close)}`;
};

const DAYS_ES = [
   "lunes",
   "martes",
   "miercoles",
   "jueves",
   "viernes",
   "sabado",
   "domingo",
];

const DAY_LABEL = {
   lunes: "Lunes",
   martes: "Martes",
   miercoles: "Miércoles",
   jueves: "Jueves",
   viernes: "Viernes",
   sabado: "Sábado",
   domingo: "Domingo",
};

// ✅ Recibe isOpen directamente del backend — sin recalcular
export const ScheduleDisplay = ({ schedule, isOpen }) => {
   const todayIndex = new Date().getDay(); // 0 domingo
   const todayMapIndex = todayIndex === 0 ? 6 : todayIndex - 1;
   const todayName = DAYS_ES[todayMapIndex];
   const todayData = schedule?.[todayName];

   // Agrupar días consecutivos con mismo horario
   const groups = [];
   DAYS_ES.forEach((day) => {
      const sig = serializeDay(schedule?.[day] || { closed: true });
      const last = groups[groups.length - 1];
      if (last && last.sig === sig) {
         last.days.push(day);
      } else {
         groups.push({ sig, days: [day], data: schedule?.[day] });
      }
   });

   // Mensaje de "abierto hasta las X" — solo para horario partido
   const openUntil = () => {
      if (!todayData || todayData.closed) {return null;}
      if (!isOpen) {return null;}

      const now = new Date();
      const current = now.getHours() * 60 + now.getMinutes();

      // Turno mañana
      const [ch, cm] = (todayData.close || "").split(":").map(Number);
      const closeMain = ch * 60 + cm;
      if (!todayData.split || current < closeMain) {
         return formatTime(todayData.close);
      }

      // Turno tarde
      return formatTime(todayData.afternoon?.close);
   };

   const until = openUntil();

   return (
      <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 w-full max-w-sm">
         {/* Estado actual */}
         <div className="mb-6">
            {isOpen ? (
               <p className="text-green-400 font-semibold">
            Abierto{until ? ` hasta las ${until}` : ""}
               </p>
            ) : (
               <p className="text-red-400 font-semibold">Cerrado ahora</p>
            )}
         </div>

         {/* Lista agrupada */}
         <div className="space-y-2 text-sm">
            {groups.map(({ days, data, sig }, i) => {
               const first = DAY_LABEL[days[0]];
               const last  = DAY_LABEL[days[days.length - 1]];
               const dayLabel = days.length === 1 ? first : `${first} – ${last}`;

               let hoursLabel;
               if (sig === "closed") {
                  hoursLabel = <span className="text-neutral-500">Cerrado</span>;
               } else if (data?.split && data?.afternoon?.open && data?.afternoon?.close) {
                  hoursLabel = (
                     <span className="text-neutral-300">
                        {formatTime(data.open)}–{formatTime(data.close)}
                        <span className="text-neutral-500 mx-1">/</span>
                        {formatTime(data.afternoon.open)}–{formatTime(data.afternoon.close)}
                     </span>
                  );
               } else {
                  hoursLabel = (
                     <span className="text-neutral-300">
                        {formatTime(data?.open)}–{formatTime(data?.close)}
                     </span>
                  );
               }

               return (
                  <div
                     key={i}
                     className={`flex justify-between py-1 ${
                        days.includes(todayName)
                           ? "text-white font-semibold"
                           : "text-neutral-400"
                     }`}
                  >
                     <span>{dayLabel}</span>
                     {hoursLabel}
                  </div>
               );
            })}
         </div>
      </div>
   );
};