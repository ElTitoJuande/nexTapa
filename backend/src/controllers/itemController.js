// controllers/itemController.js
// Controladores para CRUD de items/tapas, con lógica de validación, slug único por establecimiento, y soft delete.
import Item from "../models/Item.model.js";
import Establishment from "../models/Establishment.model.js";
import mongoose from "mongoose";
import slugify from "slugify";
import { withIsOpen } from "../Utils/scheduleHelper.js";
import { withAvailable } from "../Utils/itemHelper.js";

// ============================================
// CREAR ITEM/TAPA
// ============================================
export const createItem = async (req, res) => {
  console.log("📦 createItem llamado, body:", JSON.stringify(req.body));
  try {
    const {
      name,
      description,
      establishment,
      modalities,
      categories,
      allergens,
      dietaryOptions,
      available,
      seasonalItem,
      specialDays,
      mainImage,
      featured,
      order,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(establishment)) {
      // Validar que el ID de establecimiento sea un ObjectId válido
      return res
        .status(400)
        .json({ success: false, message: "ID de establecimiento inválido" });
    }

    const establishmentExists = await Establishment.findById(establishment);
    if (!establishmentExists) {
      return res
        .status(404)
        .json({ success: false, message: "Establecimiento no encontrado" });
    }

    let slug = slugify(name, { lower: true, strict: true }); // Generar slug a partir del nombre, en minúsculas y sin caracteres especiales
    let slugExists = await Item.findOne({ slug, establishment });

    if (slugExists) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      while (await Item.findOne({ slug: newSlug, establishment })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      slug = newSlug;
    }

    const newItem = new Item({
      name,
      slug,
      description,
      establishment,
      modalities: modalities?.length
        ? modalities
        : [{ label: "Tapa", price: 0, isFree: false, available: true }],
      categories: categories || [],
      allergens: allergens || [],
      dietaryOptions: dietaryOptions || [],
      available: available !== undefined ? available : true,
      seasonalItem: seasonalItem || false,
      specialDays: specialDays || [],
      mainImage: mainImage || null,
      featured: featured || false,
      order: order || 0,
      createdBy: req.user?._id || null,
    });

    await newItem.save();
    await newItem.populate("establishment", "name slug address");

    res
      .status(201)
      .json({
        success: true,
        message: "Item creado exitosamente",
        data: newItem,
      });
  } catch (error) {
    console.error("Error en createItem:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error al crear el item",
        error: error.message,
      });
  }
};

// ============================================
// OBTENER TODOS LOS ITEMS — PÚBLICO (Con Lógica de Proximidad)
// Usa $geoNear sobre Establishment (índice 2dsphere) para filtrar
// por proximidad ANTES de hacer el lookup de items — mucho más eficiente.
// available: true filtra tapas desactivadas por el hostelero.
// specialDays se resuelve en JS con withAvailable (informativo, no filtra).
// ============================================
export const getAllItems = async (req, res) => {
  try {
    const { lat, lng, limit = 50 } = req.query;
    // radius en metros, default 10km. El frontend puede aumentarlo si no hay resultados.

    // ── SIN COORDENADAS ──────────────────────────────────────────────
    if (!lat || !lng) {
      const items = await Item.find({ deleted: { $ne: true }, available: true })
        .populate({
          path: "establishment",
          match: { deleted: { $ne: true }, active: { $ne: false } },
          select: "name slug schedule active",
        })
        .sort("name")
        .lean();

      // Filtrar items cuyo establishment haya sido excluido por el match del populate, y agregar isOpen a cada establecimiento
      const data = items
        .filter((item) => item.establishment)
        .map((item) => ({
          ...withAvailable(item), // Agregar campo isAvailable al item según lógica de fechas especiales
          establishment: withIsOpen(item.establishment), // Agregar campo isOpen al establecimiento según su horario
        }));

      return res.status(200).json({ success: true, data });
    }

    // ── CON COORDENADAS — $geoNear sobre Establishment ───────────────
    // Partimos desde Establishment para aprovechar el índice 2dsphere.
    // MongoDB filtra por proximidad ANTES de procesar el resto del pipeline.
    const items = await Establishment.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          spherical: true,
          query: {
            active: { $ne: false },
            deleted: { $ne: true },
          },
        },
      },
      // Lookup de items activos de cada establecimiento
      {
        $lookup: {
          from: "items",
          let: { estId: "$_id" }, // Pasar el _id del establecimiento a la variable estId para usarla en el pipeline del lookup
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$establishment", "$$estId"] },
                deleted: { $ne: true },
                available: true,
              },
            },
          ],
          as: "items",
        },
      },
      // Desplegar cada item como documento independiente
      { $unwind: "$items" },
      // Proyectar con la distancia del establecimiento en cada item
      {
        $project: {
          _id: "$items._id",
          name: "$items.name",
          slug: "$items.slug",
          mainImage: "$items.mainImage",
          modalities: "$items.modalities",
          averageRating: "$items.averageRating",
          available: "$items.available",
          specialDays: "$items.specialDays",
          distance: 1, // viene de $geoNear, metros
          establishment: {
            _id: "$_id",
            name: "$name",
            slug: "$slug",
            schedule: "$schedule",
          },
        },
      },
      { $sort: { distance: 1 } },
      { $limit: parseInt(limit) },
    ]);

    const data = items.map((item) => ({
      ...withAvailable(item),
      establishment: withIsOpen(item.establishment),
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// OBTENER ITEMS DE UN ESTABLECIMIENTO (Por ID)
// Endpoint usado por ItemGallery — también filtra desactivadas
// ============================================
export const getItemsByEstablishment = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const { available, featured, sort = "order -createdAt" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(establishmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de establecimiento inválido" });
    }

    const filters = { establishment: establishmentId, deleted: { $ne: true } };
    // Si viene el filtro explícito del admin lo respeta, si no filtra solo las activas
    if (available !== undefined && available !== "") {
      filters.available = available === "true";
    } else {
      filters.available = true; // público: solo tapas activas
    }
    if (featured !== undefined) filters.featured = featured === "true";

    const items = await Item.find(filters)
      .populate("establishment", "name slug schedule active")
      .sort(sort)
      .lean();

    const data = items.map((item) => ({
      ...withAvailable(item),
      establishment: withIsOpen(item.establishment),
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener items del local",
        error: error.message,
      });
  }
};

// ============================================
// OBTENER UN ITEM POR ID — ADMIN
// Sin filtro de available (el admin necesita ver todas)
// ============================================
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID de item inválido" });
    }

    const item = await Item.findById(id)
      .populate(
        "establishment",
        "name slug address location phone email schedule",
      )
      .populate("createdBy", "username email");

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item no encontrado" });

    item.views = (item.views || 0) + 1;
    await item.save();

    const data = withAvailable(item.toObject());
    data.establishment = withIsOpen(data.establishment);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener item",
        error: error.message,
      });
  }
};

// ============================================
// OBTENER ITEM POR SLUG — PÚBLICO
// ============================================
export const getItemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lat, lng } = req.query;

    const item = await Item.findOne({ slug, deleted: { $ne: true } }).populate(
      "establishment",
      "name slug address location phone email schedule",
    );

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item no encontrado" });

    item.views = (item.views || 0) + 1;
    await item.save();

    let data = withAvailable(item.toObject());
    data.establishment = withIsOpen(data.establishment);

    // Calcular distancia si vienen coords (caso admin con nueva pestaña)
    if (lat && lng && data.establishment?.location?.coordinates) {
      const [estLng, estLat] = data.establishment.location.coordinates;
      const R = 6371000; // metros, igual que $geoNear
      const dLat = ((estLat - parseFloat(lat)) * Math.PI) / 180;
      const dLng = ((estLng - parseFloat(lng)) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((parseFloat(lat) * Math.PI) / 180) *
          Math.cos((estLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      data.establishment.distance =
        R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener item por slug",
        error: error.message,
      });
  }
};

// ============================================
// OBTENER ITEMS POR SLUG DE ESTABLECIMIENTO
// ============================================
export const getItemsByEstablishmentSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const establishment = await Establishment.findOne({
      slug,
      deleted: { $ne: true },
    });

    if (!establishment)
      return res
        .status(404)
        .json({ success: false, message: "Local no encontrado" });

    const items = await Item.find({
      establishment: establishment._id,
      deleted: { $ne: true },
      available: true,
    })
      .populate("establishment", "name slug schedule")
      .sort("order")
      .lean();

    const data = items.map((item) => ({
      ...withAvailable(item),
      establishment: withIsOpen(item.establishment),
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener items por local",
        error: error.message,
      });
  }
};

// ============================================
// OBTENER ITEMS MEJOR VALORADOS (Top Rated)
// ============================================
export const getTopRatedItems = async (req, res) => {
  try {
    const topItems = await Item.find({
      deleted: { $ne: true },
      available: true,
    })
      .populate({
        path: "establishment",
        match: { deleted: { $ne: true }, active: { $ne: false } },
        select: "name slug schedule",
      })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit()
      .lean();

    const data = topItems
      .filter((item) => item.establishment)
      .map((item) => ({
        ...withAvailable(item),
        establishment: withIsOpen(item.establishment),
      }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener top items",
        error: error.message,
      });
  }
};

// ============================================
// ACTUALIZAR ITEM
// ============================================
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item no encontrado" });

    if (req.body.name && req.body.name !== item.name) {
      let newSlug = slugify(req.body.name, { lower: true, strict: true });
      const slugExists = await Item.findOne({
        slug: newSlug,
        establishment: item.establishment,
        _id: { $ne: id },
      });
      if (slugExists) {
        let counter = 1;
        while (
          await Item.findOne({
            slug: `${newSlug}-${counter}`,
            _id: { $ne: id },
          })
        )
          counter++;
        newSlug = `${newSlug}-${counter}`;
      }
      req.body.slug = newSlug;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?._id || null },
      { new: true, runValidators: false },
    ).populate("establishment", "name slug");

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al actualizar",
        error: error.message,
      });
  }
};

// ============================================
// ELIMINAR ITEM (Soft Delete)
// ============================================
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndUpdate(
      id,
      { deleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item no encontrado" });
    res
      .status(200)
      .json({ success: true, message: "Item eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al eliminar",
        error: error.message,
      });
  }
};

// ============================================
// REORDENAR ITEMS
// ============================================
export const reorderItems = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items))
      return res
        .status(400)
        .json({ success: false, message: "Formato inválido" });

    const updates = items.map(({ id, order }) =>
      Item.findByIdAndUpdate(id, { order }, { new: true }),
    );
    await Promise.all(updates);
    res.status(200).json({ success: true, message: "Orden actualizado" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al reordenar",
        error: error.message,
      });
  }
};
