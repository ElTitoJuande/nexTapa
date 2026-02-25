// controllers/establishmentController.js - Controladores para manejar las operaciones relacionadas con los establecimientos en el backend

import slugify from 'slugify';
import Establishment from '../models/Establishment.model.js';


// ==========================================
// OBTENER TODOS LOS ESTABLECIMIENTOS
// ==========================================
export const getEstablishments = async (req, res) => {
  try {
    const establishments = await Establishment.find({})
      .populate('owner', 'name email businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: establishments.length,
      data: establishments
    });
  } catch (error) {
    console.error('Error al obtener establecimientos', error);
    res.status(500).json({ success: false, message: 'Error al obtener establecimientos', error: error.message });
  }
};


// ==========================================
// OBTENER ESTABLECIMIENTO POR ID
// ==========================================
export const getEstablishmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findById(id);

    if (!establishment) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado' });
    }

    res.status(200).json({ success: true, data: establishment });
  } catch (error) {
    res.status(400).json({ message: 'Establecimiento no encontrado' });
  }
};


// ==========================================
// OBTENER ESTABLECIMIENTO POR SLUG
// ==========================================
export const getEstablishmentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const establishment = await Establishment.findOne({ slug })
      .populate('owner', 'name email businessName');

    if (!establishment) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado' });
    }

    res.status(200).json({ success: true, data: establishment });
  } catch (error) {
    console.error('Error en getEstablishmentBySlug:', error);
    res.status(500).json({ success: false, message: 'Error al obtener establecimiento', error: error.message });
  }
};


// ==========================================
// CREAR NUEVO ESTABLECIMIENTO
// ==========================================
export const createEstablishment = async (req, res) => {
  try {
    const {
      name, description, type, cuisineType, address, location,
      phone, email, website, schedule, features, priceRange, mainImage, owner
    } = req.body;

    if (!name || !description || !address || !location || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: name, description, address, location, phone'
      });
    }

    if (!address.street || !address.city || !address.province || !address.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'La dirección debe incluir: street, city, province, postalCode'
      });
    }

    if (!location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Las coordenadas deben ser [longitud, latitud]'
      });
    }

    // if (!owner) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Debe especificar el propietario (owner) del establecimiento'
    //   });
    // }

    // Generar slug único
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
      owner: owner && owner.trim() !== '' ? owner : undefined,
      type: type || 'bar',
      cuisineType: cuisineType || [],
      address,
      location: { type: 'Point', coordinates: location.coordinates },
      phone, email, website,
      schedule: schedule || {},
      features: features || [],
      priceRange: priceRange || '€€',
      mainImage,
      
      verified: false
    });

    await establishment.populate('owner', 'name email businessName');

    res.status(201).json({
      success: true,
      message: 'Establecimiento creado exitosamente',
      data: establishment
    });

  } catch (error) {
    console.error('Error en createEstablishment:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
    }

    res.status(500).json({ success: false, message: 'Error al crear establecimiento', error: error.message });
  }
};


// ==========================================
// BORRAR / DESACTIVAR ESTABLECIMIENTO (soft delete)
// ==========================================
export const deleteEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findById(id);

    if (!establishment) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado' });
    }

    if (!establishment.active) {
      return res.status(400).json({ success: false, message: 'Establecimiento ya desactivado' });
    }

    await Establishment.findByIdAndUpdate(id, { active: false }, { runValidators: false });

    res.status(200).json({
      success: true,
      message: 'Establecimiento desactivado correctamente',
      data: { id, active: false, desactivatedAt: new Date() }
    });

  } catch (error) {
    console.error('Error al borrar establecimiento', error);
    res.status(500).json({ success: false, message: 'Error al eliminar establecimiento', error: error.message });
  }
};


// ==========================================
// REACTIVAR ESTABLECIMIENTO
// ==========================================
export const reactivateEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findById(id);

    if (!establishment) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado' });
    }

    if (establishment.active) {
      return res.status(400).json({ success: false, message: 'El establecimiento ya se encuentra activo' });
    }

    await Establishment.findByIdAndUpdate(id, { active: true }, { runValidators: false });

    res.status(200).json({
      success: true,
      message: 'Establecimiento reactivado correctamente',
      data: { id, active: true, reactivatedAt: new Date() }
    });

  } catch (error) {
    console.error('Error al reactivar establecimiento', error);
    res.status(500).json({ success: false, message: 'Error al procesar la reactivación', error: error.message });
  }
};


// ==========================================
// ACTUALIZAR ESTABLECIMIENTO
// ==========================================
export const updateEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const establishment = await Establishment.findById(id);

    if (!establishment) {
      return res.status(404).json({ success: false, message: 'Establecimiento no encontrado' });
    }

    const allowedFields = [
      'name', 'description', 'type', 'cuisineType', 'address', 'location',
      'phone', 'email', 'website', 'schedule', 'features', 'priceRange',
      'mainImage', 'verified', 'active'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Si cambia el nombre, generar nuevo slug único
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
      return res.status(400).json({ success: false, message: 'No se proporcionaron campos para actualizar' });
    }

    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: false }
    ).populate('owner', 'name email businessName');

    res.status(200).json({
      success: true,
      message: 'Establecimiento actualizado exitosamente',
      data: updatedEstablishment
    });

  } catch (error) {
    console.error('Error al actualizar establecimiento:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de establecimiento inválido' });
    }

    res.status(500).json({ success: false, message: 'Error al actualizar establecimiento', error: error.message });
  }
};