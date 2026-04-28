// src/controllers/establishmentController.js
import slugify from "slugify";
import Establishment from "../models/Establishment.model.js";
import { withIsOpen } from "../Utils/scheduleHelper.js";
import { notifyAdmin } from "../app.js";

// ==========================================
// OBTENER TODOS LOS ESTABLECIMIENTOS
// ==========================================
export const getEstablishments = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const includeDeleted = req.query.includeDeleted === "true";

    const filter = {};
    if (!includeDeleted) filter.deleted = { $ne: true };
    if (!includeInactive) filter.active = { $ne: false };

    const establishments = await Establishment.find(filter)
      .populate("owner", "name email businessName")
      .sort({ createdAt: -1 })
      .lean();

    const data = establishments.map((e) => withIsOpen(e));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Error al obtener establecimientos", error);
    res.status(500).json({ success: false, message: "Error al obtener establecimientos", error: error.message });
  }
};

// ==========================================
// OBTENER ESTABLECIMIENTO POR ID
// ==========================================
export const getEstablishmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findOne({ _id: id, deleted: { $ne: true } }).lean();

    if (!establishment) {
      return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });
    }

    res.status(200).json({ success: true, data: withIsOpen(establishment) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener el establecimiento por ID", error: error.message });
  }
};

// ==========================================
// OBTENER ESTABLECIMIENTO POR SLUG
// ==========================================
export const getEstablishmentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lat, lng } = req.query;

    let establishment;

    if (lat && lng) {
      const results = await Establishment.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: "distance",
            spherical: true,
            query: { slug, active: { $ne: false }, deleted: { $ne: true } },
          },
        },
        { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      ]);

      if (results[0]) establishment = withIsOpen(results[0]);
    } else {
      const doc = await Establishment.findOne({ slug, active: { $ne: false }, deleted: { $ne: true } })
        .populate("owner", "name email businessName")
        .lean();

      if (doc) establishment = withIsOpen(doc);
    }

    if (!establishment) {
      return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });
    }

    res.status(200).json({ success: true, data: establishment });
  } catch (error) {
    console.error("Error en getEstablishmentBySlug:", error);
    res.status(500).json({ success: false, message: "Error al obtener establecimiento", error: error.message });
  }
};

// ==========================================
// CREAR NUEVO ESTABLECIMIENTO
// ==========================================
export const createEstablishment = async (req, res) => {
  try {
    const { name, description, type, cuisineType, address, location, phone, email, website, socialLinks, schedule, features, priceRange, mainImage, owner } = req.body;

    if (!name || !description || !address || !location || !phone) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios: name, description, address, location, phone" });
    }

    if (!address.street || !address.city || !address.province || !address.postalCode) {
      return res.status(400).json({ success: false, message: "La dirección debe incluir: street, city, province, postalCode" });
    }

    if (!location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: "Las coordenadas deben ser [longitud, latitud]" });
    }

    let slug = slugify(name, { lower: true, strict: true });
    let slugExists = await Establishment.findOne({ slug });

    if (slugExists) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      while (await Establishment.findOne({ slug: newSlug })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      slug = newSlug;
    }

    const establishment = await Establishment.create({
      name, slug, description,
      owner: owner && owner.trim() !== "" ? owner : undefined,
      type: type || "bar",
      cuisineType: cuisineType || [],
      address,
      location: { type: "Point", coordinates: location.coordinates },
      phone, email, website,
      socialLinks: socialLinks || {},
      schedule: schedule || {},
      features: features || [],
      priceRange: priceRange || "€€",
      mainImage,
      verified: false,
    });

    notifyAdmin({
      type: "new_establishment_pending",
      establishmentId: establishment._id.toString(),
      name: establishment.name,
      email: establishment.email,
      message: `Nuevo establecimiento pendiente: ${establishment.name}`,
    });

    await establishment.populate("owner", "name email businessName");
    const data = establishment.toObject();
    res.status(201).json({ success: true, message: "Establecimiento creado exitosamente", data: withIsOpen(data) });
  } catch (error) {
    console.error("Error en createEstablishment:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Error de validación", errors: messages });
    }
    res.status(500).json({ success: false, message: "Error al crear establecimiento", error: error.message });
  }
};

// ==========================================
// BORRAR ESTABLECIMIENTO (Soft delete)
// ==========================================
export const deleteEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findById(id);

    if (!establishment) return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });
    if (establishment.deleted) return res.status(400).json({ success: false, message: "Establecimiento ya eliminado" });

    await Establishment.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date(), active: false }, { runValidators: false });

    res.status(200).json({ success: true, message: "Establecimiento eliminado correctamente", data: { id, deleted: true, deletedAt: new Date() } });
  } catch (error) {
    console.error("Error al borrar establecimiento", error);
    res.status(500).json({ success: false, message: "Error al eliminar establecimiento", error: error.message });
  }
};

// ==========================================
// DESACTIVAR ESTABLECIMIENTO
// ==========================================
export const deactivateEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findOne({ _id: id, deleted: { $ne: true } });

    if (!establishment) return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });
    if (!establishment.active) return res.status(400).json({ success: false, message: "Establecimiento ya desactivado" });

    await Establishment.findByIdAndUpdate(id, { active: false }, { runValidators: false });
    res.status(200).json({ success: true, message: "Establecimiento desactivado correctamente", data: { id, active: false } });
  } catch (error) {
    console.error("Error al desactivar establecimiento", error);
    res.status(500).json({ success: false, message: "Error al desactivar establecimiento", error: error.message });
  }
};

// ==========================================
// REACTIVAR ESTABLECIMIENTO
// ==========================================
export const reactivateEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findOne({ _id: id, deleted: { $ne: true } });

    if (!establishment) return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });
    if (establishment.active) return res.status(400).json({ success: false, message: "El establecimiento ya se encuentra activo" });

    await Establishment.findByIdAndUpdate(id, { active: true }, { runValidators: false });
    res.status(200).json({ success: true, message: "Establecimiento reactivado correctamente", data: { id, active: true } });
  } catch (error) {
    console.error("Error al reactivar establecimiento", error);
    res.status(500).json({ success: false, message: "Error al procesar la reactivación", error: error.message });
  }
};

// ==========================================
// ACTUALIZAR ESTABLECIMIENTO
// ==========================================
export const updateEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findOne({ _id: id, deleted: { $ne: true } });

    if (!establishment) return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });

    const allowedFields = ["name", "description", "type", "cuisineType", "address", "location", "phone", "email", "website", "socialLinks", "schedule", "features", "priceRange", "mainImage", "verified", "active"];

    const updates = {};
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    if (updates.name && updates.name !== establishment.name) {
      let newSlug = slugify(updates.name, { lower: true, strict: true });
      let slugExists = await Establishment.findOne({ slug: newSlug, _id: { $ne: id } });

      if (slugExists) {
        let counter = 1;
        let tempSlug = `${newSlug}-${counter}`;
        while (await Establishment.findOne({ slug: tempSlug, _id: { $ne: id } })) {
          counter++;
          tempSlug = `${newSlug}-${counter}`;
        }
        newSlug = tempSlug;
      }
      updates.slug = newSlug;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No se proporcionaron campos para actualizar" });
    }

    const updated = await Establishment.findByIdAndUpdate(id, updates, { new: true, runValidators: false })
      .populate("owner", "name email businessName")
      .lean();

    res.status(200).json({ success: true, message: "Establecimiento actualizado exitosamente", data: withIsOpen(updated) });
  } catch (error) {
    console.error("Error al actualizar establecimiento:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Error de validación", errors: messages });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID de establecimiento inválido" });
    }
    res.status(500).json({ success: false, message: "Error al actualizar establecimiento", error: error.message });
  }
};

// ==========================================
// OBTENER ESTABLECIMIENTOS CERCANOS
// ==========================================
export const getNearbyEstablishments = async (req, res) => {
  try {
    const { lat, lng, limit = 15 } = req.query;

    if (!lat || !lng) return res.status(400).json({ success: false, message: "Se requieren los parámetros lat y lng" });

    const establishments = await Establishment.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          spherical: true,
          query: { active: true, deleted: { $ne: true } },
        },
      },
      { $limit: parseInt(limit) },
      { $project: { name: 1, slug: 1, type: 1, address: 1, mainImage: 1, averageRating: 1, priceRange: 1, location: 1, cuisineType: 1, distance: 1, schedule: 1 } },
    ]);

    const data = establishments.map((e) => withIsOpen(e));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Error en getNearbyEstablishments:", error);
    res.status(500).json({ success: false, message: "Error al obtener establecimientos cercanos", error: error.message });
  }
};

// ==========================================
// ACTUALIZAR REDES SOCIALES
// ==========================================
export const updateSocialLinks = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findOne({ _id: id, deleted: { $ne: true } });

    if (!establishment) return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });

    const allowedFields = ["instagram", "facebook", "twitter", "googleBusiness"];
    const socialLinks = {};
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) socialLinks[field] = req.body[field]; });

    if (Object.keys(socialLinks).length === 0) {
      return res.status(400).json({ success: false, message: "No se proporcionaron redes sociales para actualizar" });
    }

    const updated = await Establishment.findByIdAndUpdate(
      id,
      { $set: { socialLinks: { ...establishment.socialLinks.toObject(), ...socialLinks } } },
      { new: true, runValidators: false }
    ).lean();

    res.status(200).json({ success: true, message: "Redes sociales actualizadas correctamente", data: updated.socialLinks });
  } catch (error) {
    console.error("Error al actualizar redes sociales:", error);
    res.status(500).json({ success: false, message: "Error al actualizar redes sociales", error: error.message });
  }
};


// ==========================================
// OBTENER ESTABLECIMIENTOS PENDIENTES DE VERIFICACIÓN (Admin)
// GET /api/establishment/pending
// ==========================================
export const getPending = async (req, res) => {
  try {
    const establishments = await Establishment.find({
      verified: false,
      deleted:  { $ne: true },
      active:   { $ne: false },
    })
      .populate("owner", "name email businessName")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: establishments.length,
      data: establishments.map((e) => withIsOpen(e)),
    });
  } catch (error) {
    console.error("Error en getPending:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener establecimientos pendientes",
      error: error.message,
    });
  }
};

// ==========================================
// OBTENER ESTABLECIMIENTO DEL HOSTELERO AUTENTICADO
// GET /api/establishment/mine
// ==========================================
export const getMine = async (req, res) => {
  try {
    const userId = req.user?._id;
    console.log("[getMine] userId buscado:", userId?.toString());

    const establishment = await Establishment.findOne({
      $or: [{ owner: userId }, { createdBy: userId }],
      deleted: { $ne: true },
    })
      .populate("owner", "name email businessName")
      .lean();

    console.log("[getMine] establishment encontrado:", establishment?._id?.toString() || "null");

    if (!establishment) {
      return res.status(404).json({
        success: false,
        message: "No tienes ningún establecimiento asociado",
      });
    }

    res.status(200).json({ success: true, data: withIsOpen(establishment) });
  } catch (error) {
    console.error("Error en getMine:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener tu establecimiento",
      error: error.message,
    });
  }
};

// ==========================================
// VERIFICAR ESTABLECIMIENTO (Admin)
// PATCH /api/establishment/:id/verify
// ==========================================
export const verifyEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findOne({ _id: id, deleted: { $ne: true } });

    if (!establishment) return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });
    if (establishment.verified) return res.status(400).json({ success: false, message: "El establecimiento ya está verificado" });

    await Establishment.findByIdAndUpdate(id, { verified: true }, { runValidators: false });

    res.status(200).json({ success: true, message: "Establecimiento verificado correctamente", data: { id, verified: true } });
  } catch (error) {
    console.error("Error al verificar establecimiento:", error);
    res.status(500).json({ success: false, message: "Error al verificar establecimiento", error: error.message });
  }
};


// ==========================================
// RECHAZAR ALTA DE ESTABLECIMIENTO (Admin)
// PATCH /api/establishment/:id/reject
// ==========================================
export const rejectEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findOne({ _id: id, deleted: { $ne: true } })
      .populate('owner', 'name email');

    if (!establishment) {
      return res.status(404).json({ success: false, message: "Establecimiento no encontrado" });
    }

    // Soft delete — el establecimiento desaparece sin posibilidad de recuperación por el hostelero
    await Establishment.findByIdAndUpdate(
      id,
      { deleted: true, deletedAt: new Date(), active: false },
      { runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "Alta de establecimiento rechazada correctamente",
      data: { id, rejected: true },
    });
  } catch (error) {
    console.error("Error al rechazar establecimiento:", error);
    res.status(500).json({
      success: false,
      message: "Error al rechazar el alta del establecimiento",
      error: error.message,
    });
  }
};