// src/controllers/searchController.js
// Búsqueda global + sugerencias divididas en carga inicial y lazy

import Establishment from "../models/Establishment.model.js";
import Item from "../models/Item.model.js";
import { withIsOpen } from "../Utils/scheduleHelper.js";
import { withAvailable } from "../Utils/itemHelper.js";

// ==========================================
// KEYWORDS SEMÁNTICAS
// ==========================================
const SEMANTIC_GROUPS = [
  {
    triggers: [
      "gratis",
      "gratuito",
      "gratuita",
      "free",
      "sin coste",
      "precio 0",
    ],
    minLength: 3,
    itemFilter: {
      $or: [{ "modalities.isFree": true }, { "modalities.price": 0 }],
    },
  },
  {
    triggers: [
      "barato",
      "barata",
      "economico",
      "económico",
      "economica",
      "económica",
      "precio bajo",
      "asequible",
      "oferta",
    ],
    minLength: 4,
    itemFilter: { "modalities.price": { $gt: 0, $lte: 4 } },
  },
  {
    triggers: ["vegetariano", "vegetariana", "veggie", "sin carne"],
    minLength: 3,
    itemFilter: { dietaryOptions: /vegetarian/i },
    estFilter: {
      $or: [{ cuisineType: /vegetarian/i }, { features: /vegetarian/i }],
    },
  },
  {
    triggers: ["vegano", "vegana", "vegan"],
    minLength: 3,
    itemFilter: { dietaryOptions: /vegan/i },
    estFilter: { $or: [{ cuisineType: /vegan/i }, { features: /vegan/i }] },
  },
  {
    triggers: [
      "sin gluten",
      "gluten",
      "celiaco",
      "celíaco",
      "celiaca",
      "celíaca",
    ],
    minLength: 4,
    itemFilter: { allergens: { $not: /gluten/i } },
    estFilter: { $or: [{ cuisineType: /gluten/i }, { features: /gluten/i }] },
  },
  {
    triggers: ["pincho", "pintxo"],
    minLength: 4,
    itemFilter: { "modalities.label": /pincho|pintxo/i },
  },
  {
    triggers: ["racion", "ración"],
    minLength: 4,
    itemFilter: { "modalities.label": /ración|racion/i },
  },
  {
    triggers: ["tapa"],
    minLength: 4,
    itemFilter: { "modalities.label": /tapa/i },
  },
  {
    triggers: ["abierto", "abierta", "open", "ahora"],
    minLength: 4,
    estFilter: null,
    postFilter: "isOpen",
  },
  {
    triggers: [
      "mejor",
      "mejores",
      "top",
      "recomendado",
      "recomendada",
      "popular",
    ],
    minLength: 3,
    itemFilter: { averageRating: { $gte: 4 } },
    estFilter: { averageRating: { $gte: 4 } },
  },
  {
    triggers: ["bar", "bares"],
    minLength: 3,
    estFilter: { type: "bar" },
  },
  {
    triggers: ["restaurante", "restaurant"],
    minLength: 4,
    estFilter: { type: "restaurante" },
  },
  {
    triggers: ["cafeteria", "cafetería", "cafe", "café"],
    minLength: 4,
    estFilter: { type: /cafeteria|café/i },
  },
  {
    triggers: ["cerveceria", "cervecería"],
    minLength: 5,
    estFilter: { type: /cerveceria/i },
  },
  {
    triggers: ["verificado", "verificada", "oficial"],
    minLength: 4,
    estFilter: { verified: true },
  },
  {
    triggers: ["nuevo", "nueva", "reciente", "novedades"],
    minLength: 4,
    itemFilter: {},
    sortOverride: { createdAt: -1 },
  },
];

const resolveKeyword = (q) => {
  const term = q.trim().toLowerCase();
  for (const group of SEMANTIC_GROUPS) {
    for (const trigger of group.triggers) {
      if (
        trigger === term ||
        (trigger.startsWith(term) && term.length >= group.minLength)
      ) {
        return group;
      }
    }
  }
  return null;
};

// ── $lookup reutilizable para traer establishment en items ────────────────────
const ESTABLISHMENT_LOOKUP = [
  {
    $lookup: {
      from: "establishments",
      localField: "establishment",
      foreignField: "_id",
      pipeline: [
        { $match: { active: { $ne: false }, deleted: { $ne: true } } },
        { $project: { name: 1, slug: 1, schedule: 1 } },
      ],
      as: "establishment",
    },
  },
  { $match: { "establishment.0": { $exists: true } } },
  { $unwind: "$establishment" },
];

// ==========================================
// BÚSQUEDA GLOBAL
// GET /api/search?q=tortilla&limit=5
// ==========================================
export const globalSearch = async (req, res) => {
  try {
    const { q, limit = 6 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "El término de búsqueda debe tener al menos 2 caracteres",
      });
    }

    const regex = new RegExp(q.trim(), "i");
    const maxResults = Math.min(parseInt(limit), 16);
    const semanticGroup = resolveKeyword(q);
    const isKeyword = !!semanticGroup;

    const itemMatchStage = {
      available: true,
      deleted: { $ne: true },
      ...(isKeyword && semanticGroup.itemFilter
        ? semanticGroup.itemFilter
        : {
            $or: [
              { name: regex },
              { description: regex },
              { categories: regex },
            ],
          }),
    };

    const estMatchStage = {
      active: { $ne: false },
      deleted: { $ne: true },
      ...(isKeyword && semanticGroup.estFilter
        ? semanticGroup.estFilter
        : {
            $or: [
              { name: regex },
              { "address.neighborhood": regex },
              { "address.city": regex },
              { cuisineType: regex },
            ],
          }),
    };

    const itemSort = semanticGroup?.sortOverride || { name: 1 };

    const [establishments, items] = await Promise.all([
      isKeyword && semanticGroup.itemFilter && !semanticGroup.estFilter
        ? Promise.resolve([])
        : Establishment.aggregate([
            { $match: estMatchStage },
            { $sort: { averageRating: -1 } },
            { $limit: maxResults },
            {
              $project: {
                name: 1,
                slug: 1,
                address: 1,
                mainImage: 1,
                cuisineType: 1,
                priceRange: 1,
                schedule: 1,
                averageRating: 1,
                verified: 1,
              },
            },
          ]),

      isKeyword && semanticGroup.estFilter && !semanticGroup.itemFilter
        ? Promise.resolve([])
        : Item.aggregate([
            { $match: itemMatchStage },
            { $sort: itemSort },
            { $limit: maxResults },
            {
              $project: {
                name: 1,
                slug: 1,
                mainImage: 1,
                modalities: 1,
                establishment: 1,
                averageRating: 1,
                specialDays: 1,
              },
            },
            ...ESTABLISHMENT_LOOKUP,
          ]),
    ]);

    if (semanticGroup?.postFilter === "isOpen") {
      const openEst = establishments.filter((e) => withIsOpen(e).isOpen);
      const openItems = items.filter((i) => withIsOpen(i.establishment).isOpen);
      return res.status(200).json({
        success: true,
        query: q,
        semantic: true,
        data: {
          establishments: openEst.map((e) => ({
            ...withIsOpen(e),
            _type: "establishment",
          })),
          items: openItems.map((i) => ({
            ...withAvailable(i),
            establishment: withIsOpen(i.establishment),
            _type: "item",
          })),
          total: openEst.length + openItems.length,
        },
      });
    }

    res.status(200).json({
      success: true,
      query: q,
      semantic: isKeyword,
      data: {
        establishments: establishments.map((e) => ({
          ...withIsOpen(e),
          _type: "establishment",
        })),
        items: items.map((i) => ({
          ...withAvailable(i),
          establishment: withIsOpen(i.establishment),
          _type: "item",
        })),
        total: establishments.length + items.length,
      },
    });
  } catch (error) {
    console.error("Error en globalSearch:", error);
    res.status(500).json({
      success: false,
      message: "Error al realizar la búsqueda",
      error: error.message,
    });
  }
};

// ==========================================
// SUGERENCIAS INICIALES — carga rápida
// GET /api/search/suggestions?lat=40.4&lng=-3.7
// Solo establecimientos cercanos + tapas gratis
// Diseñado para ser el primer render visible (<200ms objetivo)
// ==========================================
export const getSuggestions = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const hasCoords = !!(lat && lng);

    const [establishments, freeItems] = await Promise.all([
      // Establecimientos: cercanos o verificados
      hasCoords
        ? Establishment.aggregate([
            {
              $geoNear: {
                near: {
                  type: "Point",
                  coordinates: [parseFloat(lng), parseFloat(lat)],
                },
                distanceField: "distance",
                spherical: true,
                query: { active: { $ne: false }, deleted: { $ne: true } },
              },
            },
            { $limit: 16 },
            {
              $project: {
                name: 1,
                slug: 1,
                mainImage: 1,
                address: 1,
                cuisineType: 1,
                priceRange: 1,
                verified: 1,
                averageRating: 1,
                schedule: 1,
                distance: 1,
              },
            },
          ])
        : Establishment.aggregate([
            {
              $match: {
                active: { $ne: false },
                deleted: { $ne: true },
                verified: true,
              },
            },
            { $sort: { averageRating: -1 } },
            { $limit: 9 },
            {
              $project: {
                name: 1,
                slug: 1,
                mainImage: 1,
                address: 1,
                cuisineType: 1,
                priceRange: 1,
                verified: 1,
                averageRating: 1,
                schedule: 1,
              },
            },
          ]),

      // Tapas gratis con $lookup inline — un solo roundtrip
      Item.aggregate([
        {
          $match: {
            available: true,
            deleted: { $ne: true },
            $or: [{ "modalities.isFree": true }, { "modalities.price": 0 }],
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 16 },
        {
          $project: {
            name: 1,
            slug: 1,
            mainImage: 1,
            modalities: 1,
            establishment: 1,
            specialDays: 1,
          },
        },
        ...ESTABLISHMENT_LOOKUP,
      ]),
    ]);

    const fmtEst = (e) => ({
      ...withIsOpen(e),
      _type: "establishment",
      _category: hasCoords ? "nearby" : "verified",
    });
    const fmtItem = (i) => ({
      ...withAvailable(i),
      establishment: withIsOpen(i.establishment),
      _type: "item",
      _category: "free",
    });

    // Intercalar establecimientos y tapas gratis para variedad en el grid
    const grid = interleave(establishments.map(fmtEst), freeItems.map(fmtItem));

    res.status(200).json({
      success: true,
      data: { grid, hasLocation: hasCoords },
    });
  } catch (error) {
    console.error("Error en getSuggestions:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener sugerencias",
      error: error.message,
    });
  }
};

// ==========================================
// SUGERENCIAS LAZY — se carga al hacer scroll
// GET /api/search/suggestions/more?lat=40.4&lng=-3.7
// Top rated + recientes — no bloquean el render inicial
// ==========================================
export const getSuggestionsMore = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const results = await Item.aggregate([
      { $match: { available: true, deleted: { $ne: true } } },
      {
        $project: {
          name: 1,
          slug: 1,
          mainImage: 1,
          modalities: 1,
          establishment: 1,
          averageRating: 1,
          specialDays: 1,
          createdAt: 1,
        },
      },
      ...ESTABLISHMENT_LOOKUP,
      {
        $facet: {
          topRated: [
            { $match: { averageRating: { $gt: 0 } } },
            { $sort: { averageRating: -1 } },
            { $limit: 16 },
          ],
          recent: [{ $sort: { createdAt: -1 } }, { $limit: 16 }],
        },
      },
    ]);

    const { topRated = [], recent = [] } = results[0] || {};

    const fmtItem = (i, cat) => ({
      ...withAvailable(i),
      establishment: withIsOpen(i.establishment),
      _type: "item",
      _category: cat,
    });

    // Deduplicar entre top y recent por si coinciden
    const seen = new Set();
    const grid = [
      ...topRated.map((i) => fmtItem(i, "top_rated")),
      ...recent.map((i) => fmtItem(i, "recent")),
    ].filter((item) => {
      const id = item._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.status(200).json({ success: true, data: { grid } });
  } catch (error) {
    console.error("Error en getSuggestionsMore:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener más sugerencias",
      error: error.message,
    });
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Intercala dos arrays para que el grid mezcle establecimientos y tapas
const interleave = (a, b) => {
  const result = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i]) result.push(a[i]);
    if (b[i]) result.push(b[i]);
  }
  return result;
};
