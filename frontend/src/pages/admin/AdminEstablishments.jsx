// AdminEstablishments.jsx - Página de administración para listar y gestionar establecimientos
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { establishmentService } from '../../services/establishmentService';
import './styles/admin.css';

export const AdminEstablishments = () => {
   const [establishments, setEstablishments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      fetchEstablishments();
   }, []);

   const fetchEstablishments = async () => {
      try {
         setLoading(true);
         const response = await establishmentService.getAll();
         setEstablishments(response.data);
      } catch (err) {
         setError('Error loading establishments');
      } finally {
         setLoading(false);
      }
   };

   const handleToggleActive = async (id, currentActive) => {
      try {
         if (currentActive) {
            await establishmentService.delete(id);
         } else {
            await establishmentService.reactivate(id);
         }
         setEstablishments(prev =>
            prev.map(est => est._id === id ? { ...est, active: !currentActive } : est)
         );
      } catch (err) {
         setError('Error updating establishment status');
      }
   };

   if (loading) {return <p className="admin-loading">Loading...</p>;}
   if (error) {return <p className="admin-error">{error}</p>;}

   return (
      <div>
         <div className="admin-page-header">
            <h2>Establecimientos de la App</h2>
            <button
               className="admin-btn admin-btn-primary"
               onClick={() => navigate('/admin/establishments/new')}
            >
               + Nuevo establecimiento
            </button>
         </div>

         <div className="admin-table-wrapper">
            <table className="admin-table">
               <thead>
                  <tr>
                     <th>Nombre</th>
                     <th>Tipo</th>
                     <th>Ciudad</th>
                     <th>Provincia</th>
                     <th>Activo</th>
                     <th>Verificado</th>
                     <th>Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {establishments.map((est) => (
                     <tr key={est._id}>
                        <td>{est.name}</td>
                        <td>{est.type}</td>
                        <td>{est.address?.city}</td>
                        <td>{est.address?.province}</td>
                        <td>
                           <span
                              className={`admin-badge ${est.active ? 'admin-badge-success' : 'admin-badge-danger'}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggleActive(est._id, est.active)}
                              title={est.active ? 'Click para desactivar' : 'Click para activar'}
                           >
                              {est.active ? 'Yes' : 'No'}
                           </span>
                        </td>
                        <td>
                           <span className={`admin-badge ${est.verified ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                              {est.verified ? 'Verificado' : 'Pendiente'}
                           </span>
                        </td>
                        <td>
                           <div className="admin-actions">
                              <button
                                 className="admin-btn admin-btn-warning admin-btn-sm"
                                 onClick={() => navigate(`/admin/establishments/${est._id}`)}
                              >
                                 Editar
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};