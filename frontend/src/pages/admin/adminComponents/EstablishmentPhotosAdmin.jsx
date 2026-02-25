import { useState, useEffect, useRef } from 'react';
import { photoService } from '../../../services/photoService';
import '../styles/adminPhotos.css';

export const EstablishmentPhotosAdmin = ({ establishmentId, mainImage, onMainImageChange }) => {
   const [photos, setPhotos] = useState([]);
   const [loading, setLoading] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [error, setError] = useState(null);
   const [successMsg, setSuccessMsg] = useState(null);
   const [deletingId, setDeletingId] = useState(null);

   const fileInputRef = useRef(null);

   useEffect(() => {
      fetchPhotos();
   }, [establishmentId]);

   const fetchPhotos = async () => {
      try {
         setLoading(true);
         setError(null);
         const res = await photoService.getByEstablishment(establishmentId);
         setPhotos(res || []);
      } catch (err) {
         setError('Error al cargar las fotos');
      } finally {
         setLoading(false);
      }
   };

   const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) {return;}

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) { setError('Formato no válido. Usa JPG, PNG o WEBP.'); return; }
      if (file.size > 5 * 1024 * 1024) { setError('La imagen no puede superar los 5MB.'); return; }

      try {
         setUploading(true);
         setError(null);
         await photoService.uploadToEstablishment(file, establishmentId);
         setSuccessMsg('Foto subida correctamente');
         setTimeout(() => setSuccessMsg(null), 3000);
         await fetchPhotos();
      } catch (err) {
         setError(err.response?.data?.message || 'Error al subir la foto');
      } finally {
         setUploading(false);
         if (fileInputRef.current) {fileInputRef.current.value = '';}
      }
   };

   const handleDelete = async (photoId) => {
      if (!window.confirm('¿Eliminar esta foto?')) {return;}
      try {
         setDeletingId(photoId);
         await photoService.delete(photoId);
         setPhotos(prev => prev.filter(p => p._id !== photoId));
         setSuccessMsg('Foto eliminada');
         setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
         setError('Error al eliminar la foto');
      } finally {
         setDeletingId(null);
      }
   };

   const handleSetPrimary = async (photo) => {
      try {
         await photoService.setPrimary(photo._id);
         await fetchPhotos();
         if (onMainImageChange) {onMainImageChange(photo.url);}  // ← notifica al padre
         setSuccessMsg('Foto marcada como principal');
         setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
         setError('Error al marcar como principal');
      }
   };

   return (
      <div className="establishment-photos-admin">
         <div className="photos-panel">
            <div className="photos-panel-header">
               <h3 className="photos-panel-title">
                  Fotos del establecimiento
                  <span className="photos-count">
                     {photos.length} foto{photos.length !== 1 ? 's' : ''}
                  </span>
               </h3>
               <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
               >
                  {uploading ? 'Subiendo...' : '+ Añadir foto'}
               </button>
               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
               />
            </div>

            {error && <div className="admin-alert admin-alert-error">{error}</div>}
            {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
            {loading && <p className="admin-loading">Cargando fotos...</p>}

            {!loading && (
               <>
                  {mainImage && (
                     <div className="photos-main-image">
                        <h3>Foto principal:</h3>
                        <img src={mainImage} alt="Foto principal" className="main-image" loading="lazy" />
                     </div>
                  )}

                  {photos.length === 0 ? (
                     <div className="photos-empty">
                        <p>No hay fotos del local todavía.</p>
                        <p>Añade la primera usando el botón de arriba.</p>
                     </div>
                  ) : (
                     <div className="photos-grid">
                        
                        {photos.map(photo => (
                           <div key={photo._id} className="photo-card">
                              <div className="photo-card-img-wrapper">
                                 <img src={photo.url} alt={photo.alt || 'Foto del establecimiento'} className="photo-card-img" loading="lazy" />
                                 {photo.isPrimary && <span className="photo-badge-primary">Principal</span>}
                              </div>
                              <div className="photo-card-footer">
                                 {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                                 <button
                                    type="button"
                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                    onClick={() => handleDelete(photo._id)}
                                    disabled={deletingId === photo._id}
                                 >
                                    {deletingId === photo._id ? 'Eliminando...' : 'Eliminar'}
                                 </button>
                                 <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary admin-btn-sm"
                                    onClick={() => handleSetPrimary(photo)}
                                    disabled={photo.isPrimary}
                                 >
                                    {photo.isPrimary ? '⭐ Principal' : 'Hacer principal'}
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {uploading && (
                     <div className="photos-uploading-overlay">
                        <div className="photos-uploading-msg">⏳ Subiendo imagen a Cloudinary...</div>
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   );
};