import Item from '../models/Item.model.js';
import Establishment from '../models/Establishment.model.js';
import mongoose from 'mongoose';

// ============================================
// CREAR ITEM/TAPA
// ============================================
export const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      establishment,
      modalities,      // ← nuevo
      categories,
      allergens,
      dietaryOptions,
      available,
      seasonalItem,
      specialDays,
      mainImage,
      featured,
      order
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(establishment)) {
      return res.status(400).json({ success: false, message: 'ID de establecimiento inválido' });
    }

    const establishmentExists = await Establishment.findById(establishment);
    if (!establishmentExists) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado' });
    }

    const newItem = new Item({
      name,
      description,
      establishment,
      modalities: modalities?.length        // ← si viene del body lo usamos
        ? modalities
        : [{ label: 'Tapa', price: 0, isFree: false, available: true }], // default
      categories:     categories     || [],
      allergens:      allergens      || [],
      dietaryOptions: dietaryOptions || [],
      available:      available !== undefined ? available : true,
      seasonalItem:   seasonalItem   || false,
      specialDays:    specialDays    || [],
      mainImage:      mainImage      || null,
      featured:       featured       || false,
      order:          order          || 0,
      createdBy:      req.user?._id  || null
    });

    await newItem.save();
    await newItem.populate('establishment', 'name slug address');

    res.status(201).json({
      success: true,
      message: 'Item creado exitosamente',
      data: newItem
    });

  } catch (error) {
    console.error('Error en createItem:', error);
    res.status(500).json({ success: false, message: 'Error al crear el item', error: error.message });
  }
};


// ============================================
// OBTENER TODOS LOS ITEMS DE UN ESTABLECIMIENTO
// ============================================
export const getItemsByEstablishment = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const {
      available,
      featured,
      isFree,                          // ← filtro por modalidad gratuita
      label,                           // ← filtro por label de modalidad
      sort = 'order -createdAt'
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(establishmentId)) {
      return res.status(400).json({ success: false, message: 'ID de establecimiento inválido' });
    }

    const establishment = await Establishment.findById(establishmentId);
    if (!establishment) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado' });
    }

    const filters = {
      establishment: establishmentId,
      deleted: { $ne: true }
    };

    if (available !== undefined && available !== '') {
      filters.available = available === 'true';
    }
    if (featured !== undefined) {
      filters.featured = featured === 'true';
    }
    // Filtrar por modalidad gratuita
    if (isFree !== undefined) {
      filters['modalities.isFree'] = isFree === 'true';
    }
    // Filtrar por label de modalidad (ej: ?label=Ración)
    if (label) {
      filters['modalities.label'] = { $regex: new RegExp(label, 'i') };
    }

    const items = await Item.find(filters)
      .populate('establishment', 'name slug')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error('Error en getItemsByEstablishment:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los items', error: error.message });
  }
};


// ============================================
// OBTENER UN ITEM POR ID
// ============================================
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de item inválido' });
    }

    const item = await Item.findById(id)
      .populate('establishment', 'name slug address location phone email')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    item.views += 1;
    await item.save();

    res.status(200).json({ success: true, data: item });

  } catch (error) {
    console.error('Error en getItemById:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el item', error: error.message });
  }
};


// ============================================
// OBTENER TODOS LOS ITEMS
// ============================================
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('establishment', 'name slug')
      .sort('name');

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Error en getAllItems:', error);
    res.status(500).json({ message: 'Error al obtener los items', error: error.message });
  }
};


// ============================================
// OBTENER ITEMS MEJOR VALORADOS
// ============================================
export const getTopRatedItems = async (req, res) => {
  try {
    const topItems = await Item.find()
      .populate('establishment', 'name slug')
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(6);

    res.status(200).json({ success: true, count: topItems.length, data: topItems });
  } catch (error) {
    console.error('Error en getTopRatedItems:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los items mejor valorados', error: error.message });
  }
};


// ============================================
// ACTUALIZAR ITEM
// ============================================
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de item inválido' });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user?._id || null },
      { new: true, runValidators: false }
    ).populate('establishment', 'name slug');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Item actualizado', data: item });

  } catch (error) {
    console.error('Error en updateItem:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el item', error: error.message });
  }
};


// ============================================
// ELIMINAR ITEM
// ============================================
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de item inválido' });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { deleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    res.status(200).json({ success: true, message: 'Item eliminado correctamente' });

  } catch (error) {
    console.error('Error en deleteItem:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el item', error: error.message });
  }
};


// ============================================
// REORDENAR ITEMS
// ============================================
export const reorderItems = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Se esperaba un array de items' });
    }

    const updates = items.map(({ id, order }) =>
      Item.findByIdAndUpdate(id, { order }, { new: true })
    );
    await Promise.all(updates);

    res.status(200).json({ success: true, message: 'Orden actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al reordenar', error: error.message });
  }
};