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

export const ItemPhotoSection = ({ itemId, mainImage, onMainImageChange }) => {
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

   useEffect(() => {
      if (itemId) {
         fetchPhotos();
      }
   }, [itemId]);

   const fetchPhotos = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await photoService.getByItem(itemId);
         setPhotos(sortByOrder(data || []));
         setOrderChanged(false);
      } catch {
         setError("Error al cargar las fotos");
      } finally {
         setLoading(false);
      }
   };

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
         showSuccess("Orden guardado");
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

      if (!file.type.startsWith("image/")) {
         setError("Solo JPG, PNG o WEBP");
         return;
      }
      if (file.size > 5 * 1024 * 1024) {
         setError("Máximo 5MB");
         return;
      }

      try {
         setUploading(true);
         setError(null);
         const isPrimary = photos.length === 0;
         await photoService.uploadToItem(file, itemId, { isPrimary });
         showSuccess("Foto subida correctamente");
         await fetchPhotos();

         if (isPrimary && onMainImageChange) {
            const updated = await photoService.getByItem(itemId);
            const primary = updated?.find((photo) => photo.isPrimary);
            if (primary) {
               onMainImageChange(primary.url);
            }
         }
      } catch {
         setError("Error al subir la foto");
      } finally {
         setUploading(false);
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      }
   };

   const handleDelete = async (photoId) => {
      if (!window.confirm("¿Eliminar esta foto?")) {
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

   if (!itemId) {
      return <div className="iph-new-notice">💡 Guarda la tapa primero para poder añadir fotos.</div>;
   }

   const primaryPhoto = photos.find((photo) => photo.isPrimary);
   const displayImage = primaryPhoto?.url || mainImage;

   return (
      <div className="iph-wrapper">
         {error && <div className="admin-alert admin-alert-error">{error}</div>}
         {successMsg && <div className="admin-alert admin-alert-success">{successMsg}</div>}

         {loading ? (
            <p className="admin-loading">Cargando fotos...</p>
         ) : (
            <div className="iph-layout">
               <div className="iph-col-main">
                  <div className="iph-main-img-wrapper">
                     {displayImage ? (
                        <img
                           src={cloudinaryPresets.tapaDetail(displayImage)}
                           alt="Imagen principal"
                           className="iph-main-img"
                        />
                     ) : (
                        <div className="iph-main-empty">
                           <span>📷</span>
                           <p>Sin imagen</p>
                        </div>
                     )}
                  </div>
                  <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/jpeg,image/jpg,image/png,image/webp"
                     onChange={handleFileChange}
                     style={{ display: "none" }}
                  />
                  <button
                     type="button"
                     className="admin-btn admin-btn-primary iph-upload-btn"
                     onClick={() => fileInputRef.current?.click()}
                     disabled={uploading}
                  >
                     {uploading ? "⏳ Subiendo..." : "+ Añadir foto"}
                  </button>
               </div>

               <div className="iph-col-thumbs">
                  {photos.length === 0 ? (
                     <div className="iph-thumbs-empty">
                        <p>Las fotos aparecerán aquí</p>
                     </div>
                  ) : (
                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={photos.map((photo) => photo._id)} strategy={rectSortingStrategy}>
                           <div className="iph-thumbs-grid">
                              {photos.map((photo) => (
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
                  )}

                  <div className="iph-drag-footer">
                     {orderChanged ? (
                        <button
                           type="button"
                           className="admin-btn admin-btn-primary admin-btn-sm"
                           onClick={handleSaveOrder}
                           disabled={saving}
                        >
                           {saving ? "Guardando..." : "💾 Guardar orden"}
                        </button>
                     ) : (
                        <p className="iph-drag-hint">⠿ Arrastra para cambiar el orden</p>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

