// src/pages/admin/adminComponents/ScheduleAdmin.jsx

import { memo } from 'react';
import { SaveButton } from './SaveButton';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const ScheduleAdmin = memo(({ schedule, onChange, saving }) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Horarios</h2>
         <div className="admin-schedule">
            {DAYS.map(day => (
               <div key={day} className="admin-schedule-row">
                  <span className="admin-schedule-day">{day}</span>

                  <div className="admin-toggle">
                     <button
                        type="button"
                        className={`admin-toggle-btn ${schedule[day]?.closed ? 'is-closed' : 'is-open'}`}
                        onClick={() => onChange(day, 'closed', !schedule[day]?.closed)}
                     >
                        {schedule[day]?.closed ? 'Cerrado' : 'Abierto'}
                     </button>
                     <label htmlFor={`closed-${day}`}>Cerrado</label>
                  </div>

                  {!schedule[day]?.closed ? (
                     <>
                        <input
                           className="admin-input admin-input-time"
                           type="time"
                           value={schedule[day]?.open || ''}
                           onChange={e => onChange(day, 'open', e.target.value)}
                        />
                        <span className="admin-schedule-separator">–</span>
                        <input
                           className="admin-input admin-input-time"
                           type="time"
                           value={schedule[day]?.close || ''}
                           onChange={e => onChange(day, 'close', e.target.value)}
                        />
                     </>
                  ) : (
                     <span className="admin-schedule-closed">Cerrado</span>
                  )}
               </div>
            ))}
         </div>
         <SaveButton saving={saving} />
      </section>
   );
});