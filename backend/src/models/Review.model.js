import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Usuario que hace la valoración
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  // Puede ser de un establecimiento O de un item (tapa)
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment'
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  // Valoración (1-5 estrellas)
  rating: {
    type: Number,
    required: [true, 'La valoración es obligatoria'],
    min: [1, 'La valoración mínima es 1'],
    max: [5, 'La valoración máxima es 5'],
    validate: {
      validator: Number.isInteger,
      message: 'La valoración debe ser un número entero'
    }
  },
  // Título de la review (opcional)
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  // Comentario (opcional)
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  // Aspectos específicos (opcional)
  aspects: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    ambiance: {
      type: Number,
      min: 1,
      max: 5
    },
    priceQuality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Respuesta del hostelero
  response: {
    text: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date
  },
  // Likes de otros usuarios
  helpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Estado
  reported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified: {
    type: Boolean,
    default: true // Puede ser moderado por admin
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

const Review = mongoose.model('Review', reviewSchema);

export default Review;