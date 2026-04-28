import { useState, useEffect, useRef, useCallback } from "react";
import {
   DndContext,
   closestCenter,
   PointerSensor,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { photoService } from "../../../services/photoService";
import { cloudinaryPresets } from "../../../utils/cloudinaryHelpers";
import { SortablePhotoThumb } from "../shared/SortablePhotoThumb";
import {
   assignSequentialOrder,
   buildOrderPayload,
   moveByDndIds,
   sortByOrder,
} from "../utils/sortableOrder";
import "../styles/itemPhotoSection.css";

export const EstablishmentPhotosAdmin = ({ establishmentId, mainImage, onMainImageChange }) => {
   const [photos, setPhotos] = useState([]);
   const [loading, setLoading] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [successMsg, setSuccessMsg] = useState(null);
   const [deletingId, setDeletingId] = useState(null);
   const [orderChanged, setOrderChanged] = useState(false);

   const fileInputRef = useRef(null);
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
   );

   const fetchPhotos = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await photoService.getByEstablishment(establishmentId);
         setPhotos(sortByOrder(response || []));
         setOrderChanged(false);
      } catch {
         setError("Error al cargar las fotos");
      } finally {
         setLoading(false);
      }
   }, [establishmentId]);

   useEffect(() => {
      if (establishmentId) {
         fetchPhotos();
      }
   }, [establishmentId, fetchPhotos]);

   const showSuccess = (msg) => {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
   };

   const handleDragEnd = useCallback((event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
         return;
      }

      setPhotos((prev) => moveByDndIds(prev, active.id, over.id));
      setOrderChanged(true);
   }, []);

   const handleSaveOrder = async () => {
      try {
         setSaving(true);
         const payload = buildOrderPayload(photos);
         await photoService.reorder(payload);
         setPhotos((prev) => assignSequentialOrder(prev));
         setOrderChanged(false);
         showSuccess("Orden guardado correctamente");
      } catch {
         setError("Error al guardar el orden");
      } finally {
         setSaving(false);
      }
   };

   const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
         return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
         setError("Formato no valido. Usa JPG, PNG o WEBP.");
         return;
      }
      if (file.size > 5 * 1024 * 1024) {
         setError("La imagen no puede superar los 5MB.");
         return;
      }

      try {
         setUploading(true);
         setError(null);
         await photoService.uploadToEstablishment(file, establishmentId);
         showSuccess("Foto subida correctamente");
         await fetchPhotos();
      } catch (err) {
         setError(err.response?.data?.message || "Error al subir la foto");
      } finally {
         setUploading(false);
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      }
   };

   const handleDelete = async (photoId) => {
      if (!window.confirm("Eliminar esta foto?")) {
         return;
      }

      try {
         setDeletingId(photoId);
         await photoService.delete(photoId);
         setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
         showSuccess("Foto eliminada");
      } catch {
         setError("Error al eliminar la foto");
      } finally {
         setDeletingId(null);
      }
   };

   const handleSetPrimary = async (photo) => {
      try {
         await photoService.setPrimary(photo._id);
         await fetchPhotos();
         if (onMainImageChange) {
            onMainImageChange(photo.url);
         }
         showSuccess("Foto marcada como principal");
      } catch {
         setError("Error al marcar como principal");
      }
   };

   const primaryPhoto = photos.find((photo) => photo.isPrimary);
   const displayImage = primaryPhoto?.url || mainImage;
   const nonPrimaryPhotos = photos.filter((photo) => !photo.isPrimary);

   return (
      <div className="iph-wrapper">
         <div className="iph-estab-header">
            <span className="iph-count">
               {photos.length} foto{photos.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
               {orderChanged && (
                  <button
                     type="button"
                     className="admin-btn admin-btn-primary admin-btn-sm"
                     onClick={handleSaveOrder}
                     disabled={saving}
                  >
                     {saving ? "Guardando..." : "Guardar orden"}
                  </button>
               )}
               <button
                  type="button"
                  className="admin-btn admin-btn-primary admin-btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
               >
                  {uploading ? "Subiendo..." : "+ Anadir foto"}
               </button>
            </div>
            <input
               ref={fileInputRef}
               type="file"
               accept="image/jpeg,image/jpg,image/png,image/webp"
               onChange={handleFileChange}
               style={{ display: "none" }}
            />
         </div>

         {error && <div className="admin-alert admin-alert-error">{error}</div>}
         {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}
         {loading && <p className="admin-loading">Cargando fotos...</p>}

         {!loading && (
            <div className="iph-estab-layout">
               <div className="iph-estab-main-wrapper">
                  {displayImage ? (
                     <img
                        src={cloudinaryPresets.gallery(displayImage)}
                        alt="Imagen principal"
                        className="iph-estab-main-img"
                     />
                  ) : (
                     <div className="iph-main-empty">
                        <span>📷</span>
                        <p>Sin imagen principal</p>
                     </div>
                  )}
               </div>

               {photos.length === 0 ? (
                  <div className="iph-thumbs-empty">
                     <p>No hay fotos todavia. Anade la primera usando el boton de arriba.</p>
                  </div>
               ) : (
                  <>
                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                           items={nonPrimaryPhotos.map((photo) => photo._id)}
                           strategy={rectSortingStrategy}
                        >
                           <div className="iph-thumbs-grid">
                              {nonPrimaryPhotos.map((photo) => (
                                 <SortablePhotoThumb
                                    key={photo._id}
                                    photo={photo}
                                    onDelete={handleDelete}
                                    onSetPrimary={handleSetPrimary}
                                    deletingId={deletingId}
                                 />
                              ))}
                           </div>
                        </SortableContext>
                     </DndContext>

                     <div className="iph-drag-footer">
                        <p className="iph-drag-hint">Arrastra para cambiar el orden</p>
                     </div>
                  </>
               )}

               {uploading && <div className="iph-uploading">Subiendo imagen a Cloudinary...</div>}
            </div>
         )}
      </div>
   );
};
