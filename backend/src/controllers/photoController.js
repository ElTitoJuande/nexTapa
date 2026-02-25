
// controllers/photoController.js - Controladores para manejar las operaciones relacionadas con las fotos en el backend

import Photo from '../models/Photo.model.js';
import User from '../models/User.model.js';
import Establishment from '../models/Establishment.model.js';
import Item from '../models/Item.model.js';

import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinary.js';





// ============================================
// SUBIR FOTO A CLOUDINARY
// ============================================
export const uploadPhoto = async (req, res) => {
  
  try {
    
    const { establishment, item, caption, alt, tags, isPrimary, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se ha enviado ningún archivo' });
    }

    if (!establishment && !item) {
      return res.status(400).json({ success: false, message: 'Debe especificar un establecimiento o un item' });
    }

    // Subir a Cloudinary envuelto en Promise
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: establishment ? 'establishments' : 'items',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Guardar en MongoDB
    const newPhoto = new Photo({
      uploadedBy: req.user ? req.user._id : null,
      establishment: establishment || null,
      item: item || null,
      filename: uploadResult.public_id,
      originalName: req.file.originalname,
      url: uploadResult.secure_url,
      thumbnailUrl: uploadResult.secure_url,
      storageProvider: 'cloudinary',
      publicId: uploadResult.public_id,
      size: uploadResult.bytes,
      mimeType: req.file.mimetype,
      dimensions: {
        width: uploadResult.width,
        height: uploadResult.height
      },
      caption: caption || '',
      alt: alt || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isPrimary: isPrimary === 'true' || false,
      order: order || 0,
      verified: true
    });

    await newPhoto.save();

    res.status(201).json({
      success: true,
      message: 'Foto subida exitosamente',
      data: newPhoto
    });

  } catch (error) {
    console.error('Error en uploadPhoto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la subida de foto',
      error: error.message
    });
  }
};

// ============================================
// OBTENER FOTOS DE UN ESTABLECIMIENTO
// ============================================
export const getPhotosByEstablishment = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const { verified = true, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(establishmentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de establecimiento inválido'
      });
    }

 
const filters = {
   establishment: establishmentId,
   ...(req.query.verified !== undefined && { verified: verified === 'true' })
};
    const photos = await Photo.find(filters)
      .populate('uploadedBy', 'username avatar')
      .sort('-isPrimary -order -createdAt')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: photos.length,
      data: photos
    });

  } catch (error) {
    console.error('Error en getPhotosByEstablishment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las fotos del establecimiento',
      error: error.message
    });
  }
};


// ============================================
// OBTENER UNA FOTO POR ID
// ============================================
export const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foto inválido'
      });
    }

    const photo = await Photo.findById(id)
      .populate('uploadedBy', 'username email avatar')
      .populate('establishment', 'name slug address')
      .populate('item', 'name type price')
      .populate('reportedBy', 'username email');

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    // Incrementar vistas
    photo.views += 1;
    await photo.save();

    res.status(200).json({
      success: true,
      data: photo
    });

  } catch (error) {
    console.error('Error en getPhotoById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la foto',
      error: error.message
    });
  }
};


// ============================================
// ELIMINAR FOTO
// ============================================
export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de foto inválido'
      });
    }

    const photo = await Photo.findByIdAndDelete(id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Foto eliminada exitosamente',
      data: photo
    });

  } catch (error) {
    console.error('Error en deletePhoto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la foto',
      error: error.message
    });
  }
};

// ============================================
// MARCAR FOTO COMO PRINCIPAL
// ============================================
export const setPrimaryPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ success: false, message: 'Foto no encontrada' });

    if (photo.item) {
      // ── Foto de tapa ──
      await Photo.updateMany(
        { item: photo.item },
        { isPrimary: false }
      );
      photo.isPrimary = true;
      await photo.save();

      await Item.findByIdAndUpdate(photo.item, {
        mainImage: photo.url
      });

    } else if (photo.establishment) {
      // ── Foto de establecimiento ──
      await Photo.updateMany(
        { establishment: photo.establishment },
        { isPrimary: false }
      );
      photo.isPrimary = true;
      await photo.save();

      await Establishment.findByIdAndUpdate(photo.establishment, {
        mainImage: photo.url
      });
    }

    res.status(200).json({ success: true, message: 'Imagen principal actualizada', data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//=============================================
// ORDENAR FOTOS  SIRVE PARA EL DRAG AND DROP EN EL PANEL ADMINISTRADOR DE FOTOS
//=============================================
export const reorderPhotos = async (req, res) => {
   try {
      const { photos } = req.body; // [{ id: '...', order: 0 }, ...]
      if (!Array.isArray(photos)) {
         return res.status(400).json({ success: false, message: 'Se esperaba un array de fotos' });
      }

      const updates = photos.map(({ id, order }) =>
         Photo.findByIdAndUpdate(id, { order }, { new: true })
      );
      await Promise.all(updates);

      res.status(200).json({ success: true, message: 'Orden actualizado' });
   } catch (error) {
      res.status(500).json({ success: false, message: 'Error al reordenar', error: error.message });
   }
};


// ============================================
// OBTENER FOTOS DE UN ITEM/TAPA
// ============================================
export const getPhotosByItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de item inválido'
      });
    }

    const photos = await Photo.find({ item: itemId })
      .populate('uploadedBy', 'username avatar')
      .sort('-isPrimary order -createdAt')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: photos.length,
      data: photos
    });

  } catch (error) {
    console.error('Error en getPhotosByItem:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las fotos del item',
      error: error.message
    });
  }
};