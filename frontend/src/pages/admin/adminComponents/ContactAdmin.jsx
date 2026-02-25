

//src/pages/admin/adminComponents/BasicInformationAdmin.jsx

import { memo } from 'react';
import { SaveButton } from './SaveButton';

export const ContactAdmin = memo(({ contact, onChange, saving }) => {   
   return (
      <section className="admin-section">
         <h2 className="admin-section-title">Datos de Contacto</h2>
         <div className="admin-grid-2">
            <div className="admin-field">
               <label>Telefono *</label>
               <input className="admin-input" name="phone" value={contact.phone} onChange={onChange} required />
            </div>
            <div className="admin-field">
               <label>Email</label>
               <input className="admin-input" type="email" name="email" value={contact.email} onChange={onChange} />
            </div>
            <div className="admin-field">
               <label>Website</label>
               <input className="admin-input" name="website" value={contact.website} onChange={onChange} />
            </div>
            <SaveButton saving={saving} />
         </div>
      </section>
   );
});
