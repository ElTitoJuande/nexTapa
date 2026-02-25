export function errorHandler(err, req, res, next) {
    
  // Mongo duplicate key (unique index)
  if (err?.code === 11000) {
    // ejemplo: { email: "test@test.com" } o { slug: "bar-pepe-123abc" }
    const fields = err.keyValue ? Object.keys(err.keyValue) : [];
    const field = fields[0] || "campo";

    return res.status(409).json({
      status: "error",
      code: "DUPLICATE_KEY",
      message: `Ya existe un registro con ese ${field}.`,
      details: err.keyValue || null,
    });
  }

  // Mongoose validation errors
  if (err?.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Datos inválidos.",
      errors,
    });
  }

  // CastError (ObjectId inválido, etc.)
  if (err?.name === "CastError") {
    return res.status(400).json({
      status: "error",
      code: "CAST_ERROR",
      message: `Valor inválido para ${err.path}.`,
    });
  }

  // Fallback
  console.error(err);
  return res.status(500).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor.",
  });
}
