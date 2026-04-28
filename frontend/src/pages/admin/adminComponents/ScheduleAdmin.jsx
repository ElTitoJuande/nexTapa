

// src/pages/admin/adminComponents/ScheduleAdmin.jsx

import { memo } from 'react';
import { SaveButton } from './SaveButton';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const TimeRange = ({ openVal, closeVal, onChangeOpen, onChangeClose, disabled }) => (
   <div className="admin-schedule-timerange">
      <input
         className="admin-input admin-input-time"
         type="time"
         value={openVal || ''}
         onChange={e => onChangeOpen(e.target.value)}
         disabled={disabled}
      />
      <span className="admin-schedule-separator">–</span>
      <input
         className="admin-input admin-input-time"
         type="time"
         value={closeVal || ''}
         onChange={e => onChangeClose(e.target.value)}
         disabled={disabled}
      />
   </div>
);

export const ScheduleAdmin = memo(({
   schedule,
   onChange,
   saving,
   showSaveButton = true,
}) => {
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Horarios</h2>
         <div className="admin-schedule">
            {DAYS.map(day => {
               const d = schedule[day] || {};
               return (
                  <div key={day} className="admin-schedule-row">

                     {/* Nombre del día */}
                     <span className="admin-schedule-day">{day}</span>

                     {/* Toggle abierto/cerrado */}
                     <button
                        type="button"
                        className={`admin-toggle-btn ${d.closed ? 'is-closed' : 'is-open'}`}
                        onClick={() => onChange(day, 'closed', !d.closed)}
                     >
                        {d.closed ? 'Cerrado' : 'Abierto'}
                     </button>

                     {d.closed ? (
                        <span className="admin-schedule-closed-label">Cerrado</span>
                     ) : (
                        <div className="admin-schedule-times">

                           {/* Turno único o turno de mañana si está partido */}
                           <div className="admin-schedule-shift">
                              {d.split && (
                                 <span className="admin-schedule-shift-label">Mañana</span>
                              )}
                              <TimeRange
                                 openVal={d.open}
                                 closeVal={d.close}
                                 onChangeOpen={v => onChange(day, 'open', v)}
                                 onChangeClose={v => onChange(day, 'close', v)}
                              />
                           </div>

                           {/* Turno de tarde — solo si split activo */}
                           {d.split && (
                              <div className="admin-schedule-shift">
                                 <span className="admin-schedule-shift-label">Tarde</span>
                                 <TimeRange
                                    openVal={d.afternoon?.open}
                                    closeVal={d.afternoon?.close}
                                    onChangeOpen={v => onChange(day, 'afternoon', { open: v })}
                                    onChangeClose={v => onChange(day, 'afternoon', { close: v })}
                                 />
                              </div>
                           )}

                           {/* Toggle horario partido */}
                           <button
                              type="button"
                              className={`admin-toggle-split ${d.split ? 'is-active' : ''}`}
                              onClick={() => onChange(day, 'split', !d.split)}
                              title="Horario partido"
                           >
                              {d.split ? '✕ Turno partido' : '+ Turno partido'}
                           </button>

                        </div>
                     )}
                  </div>
               );
            })}
         </div>
         {showSaveButton && <SaveButton saving={saving} />}
      </section>
   );
});
