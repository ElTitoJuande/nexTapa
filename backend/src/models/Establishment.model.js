import mongoose from 'mongoose';

const timeRangeSchema = new mongoose.Schema({
  open: { type: String, match: [/^\d{2}:\d{2}$/, 'Formato horario inválido (HH:MM)'] },
  close: { type: String, match: [/^\d{2}:\d{2}$/, 'Formato horario inválido (HH:MM)'] },
  closed: { type: Boolean, default: false }
}, { _id: false });

const establishmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del establecimiento es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
    // ✅ ELIMINADO: index: true (unique ya crea el índice automáticamente)
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  // Propietario del establecimiento
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Se puede crear sin propietario, pero se recomienda asignarlo después
  },
  // Tipo de establecimiento
  type: {
    type: String,
    enum: ['bar', 'restaurante', 'cafeteria', 'cerveceria', 'tasca', 'gastrobar', 'otro'],
    default: 'bar'
  },
  // Tipo de cocina
  cuisineType: [{
    type: String,
    
  }],
  // Dirección
  address: {
    street: {
      type: String,
      required: [true, 'La calle es obligatoria']
    },
    number: String,
    city: {
      type: String,
      required: [true, 'La ciudad es obligatoria']
    },
    province: {
      type: String,
      required: [true, 'La provincia es obligatoria']
    },
    postalCode: {
      type: String,
      required: [true, 'El código postal es obligatorio']
    },
    country: {
      type: String,
      default: 'España'
    }
  },
  // Geolocalización (para mapas y búsqueda por proximidad)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitud, latitud]
      required: [true, 'Las coordenadas son obligatorias'],
      validate: {
        validator: function (coords) {
          return coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 &&
            coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Coordenadas inválidas'
      }
    }
  },
  // Contacto
  phone: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor introduce un email válido']
  },
  website: {
    type: String,
    trim: true
  },
  // Horarios
  schedule: {
    lunes: { type: timeRangeSchema, default: () => ({ closed: true }) },
    martes: { type: timeRangeSchema, default: () => ({ closed: true }) },
    miercoles: { type: timeRangeSchema, default: () => ({ closed: true }) },
    jueves: { type: timeRangeSchema, default: () => ({ closed: true }) },
    viernes: { type: timeRangeSchema, default: () => ({ closed: true }) },
    sabado: { type: timeRangeSchema, default: () => ({ closed: true }) },
    domingo: { type: timeRangeSchema, default: () => ({ closed: true }) }
  },
  // Características
  features: [{
    type: String,
      }],
  // Rango de precios
  priceRange: {
    type: String,
    trim: true,
    set: function(val) {
        if (!val || val.toString().trim() === "") return ''; // Valor por defecto si viene vacío        
        const cleanValue = val.toString().replace(/€/g, '').trim();
        return `${cleanValue}€`;
    }
    },
  // Imágenes
  mainImage: {
    type: String,
    default: null
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  // Valoración
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: val => Math.round(val * 10) / 10 // Redondear a 1 decimal
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Estado
  verified: {
    type: Boolean,
    default: false // Necesita aprobación del admin
  },
  active: {
    type: Boolean,
    default: true
  },
  // Estadísticas
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


const Establishment = mongoose.model('Establishment', establishmentSchema, 'establishments');

export default Establishment;