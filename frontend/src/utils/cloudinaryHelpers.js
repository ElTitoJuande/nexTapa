// utils/cloudinaryHelpers.js

// Inserta transformaciones dinámicas en una URL de Cloudinary sin necesidad de resubir la imagen

const DEFAULT_IMAGE = "/Logo.png";

export const getCloudinaryUrl = (originalUrl, options = {}) => {
  if (!originalUrl || typeof originalUrl !== "string") return DEFAULT_IMAGE;
  if (!originalUrl.includes("/upload/")) return originalUrl;

  const {
    width,
    height,
    crop = "limit",
    quality = "auto:best",
  } = options;

  // Detectar si la imagen original es JPEG para forzar el formato
  const isJpeg = /\.(jpg|jpeg)$/i.test(originalUrl.split("?")[0]);
  const format = isJpeg ? "jpg" : "auto";

  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(",");

  return originalUrl.replace("/upload/", `/upload/${transforms}/`);
};

// Presets listos para usar en componentes
export const cloudinaryPresets = {
  // Thumbnail en listas y admin panel
  thumbnail: (url) =>
    getCloudinaryUrl(url, { width: 200, height: 150, crop: "fill" }),

  // Card de establecimiento en listados
  card: (url) =>
    getCloudinaryUrl(url, { width: 600, height: 400, crop: "fill" }),

  // Galería pública (imagen mediana)
  gallery: (url) =>
    getCloudinaryUrl(url, { width: 800, height: 600, crop: "limit" }),

  // Vista de detalle / hero
  detail: (url) =>
    getCloudinaryUrl(url, { width: 1200, height: 900, crop: "limit" }),

  // Tapa en card
  tapaCard: (url) =>
    getCloudinaryUrl(url, { width: 400, height: 300, crop: "fill" }),

  // Tapa en detalle
  tapaDetail: (url) =>
    getCloudinaryUrl(url, { width: 800, height: 600, crop: "limit" }),
};