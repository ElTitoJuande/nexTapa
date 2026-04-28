import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { photoService } from "../../services/photoService";
import { toastService } from "../../services/toastService";

const MAX_FILE_SIZE_MB = 8;

export function ImageDropInput({
  label = "Imagen",
  value = "",
  onChange,
  uploadFolder = "nextapa/temp",
  helperText = "Haz click o arrastra una imagen (JPG, PNG, WEBP).",
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (!file) return "No se encontro ningun archivo";
    if (!file.type?.startsWith("image/")) return "Solo se permiten imagenes";

    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `La imagen supera ${MAX_FILE_SIZE_MB}MB`;
    }

    return "";
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toastService.error(validationError);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const response = await photoService.uploadTemporary(file, {
        folder: uploadFolder,
      });
      const uploadedUrl = response?.data?.url;

      if (!uploadedUrl) {
        throw new Error("No se pudo obtener la URL de la imagen subida");
      }

      onChange?.(uploadedUrl);
      toastService.success("Imagen subida correctamente");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Error al subir imagen";
      setError(message);
      toastService.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = async (event) => {
    const file = event.target.files?.[0];
    await uploadFile(file);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);

    if (uploading) return;

    const file = event.dataTransfer?.files?.[0];
    await uploadFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-base font-semibold text-slate-300">{label}</span>}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!uploading) inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        className={`relative rounded-2xl border border-dashed px-4 py-5 transition ${
          dragging
            ? "border-[#f77827] bg-[#f77827]/10"
            : "border-[#2f3f66] bg-[#111828]/70 hover:border-[#f77827]/70"
        } ${uploading ? "cursor-wait" : "cursor-pointer"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />

        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f77827]/15 text-[#ff893f]">
            {uploading ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : value ? (
              <ImagePlus size={20} />
            ) : (
              <Upload size={20} />
            )}
          </div>

          <div className="min-w-0">
            <p className="m-0 text-sm font-semibold text-slate-200">
              {uploading ? "Subiendo imagen..." : value ? "Imagen cargada" : "Click o arrastra una imagen"}
            </p>
            <p className="m-0 mt-1 text-xs text-slate-400">{helperText}</p>
          </div>
        </div>

        {value && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#2f3f66] bg-[#0d1219] p-2">
            <img
              src={value}
              alt="Preview"
              className="h-16 w-16 rounded-lg border border-[#34425f] object-cover"
            />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange?.("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
            >
              <Trash2 size={14} />
              Quitar
            </button>
          </div>
        )}
      </div>

      {error && <p className="m-0 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
