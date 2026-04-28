import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cloudinaryPresets } from "../../../utils/cloudinaryHelpers";

export const SortablePhotoThumb = ({ photo, onDelete, onSetPrimary, deletingId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`iph-thumb ${photo.isPrimary ? "iph-thumb--primary" : ""} ${isDragging ? "iph-thumb--dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      <img
        src={cloudinaryPresets.thumbnail(photo.url)}
        alt={photo.alt || ""}
        className="iph-thumb-img"
        loading="lazy"
      />
      {photo.isPrimary && <span className="iph-thumb-badge">Principal</span>}

      <div className="iph-thumb-actions">
        {!photo.isPrimary && (
          <button
            type="button"
            className="iph-icon-btn"
            title="Establecer como principal"
            onClick={(event) => {
              event.stopPropagation();
              onSetPrimary(photo);
            }}
          >
            ⭐
          </button>
        )}
        <button
          type="button"
          className="iph-icon-btn iph-icon-btn--delete"
          title="Eliminar"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(photo._id);
          }}
          disabled={deletingId === photo._id}
        >
          {deletingId === photo._id ? "⏳" : "🗑️"}
        </button>
      </div>
    </div>
  );
};

