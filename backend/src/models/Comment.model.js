import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // Usuario que comenta
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
  // Contenido del comentario
  content: {
    type: String,
    required: [true, 'El contenido es obligatorio'],
    trim: true,
    minlength: [1, 'El comentario debe tener al menos 1 carácter'],
    maxlength: [500, 'El comentario no puede exceder 500 caracteres']
  },
  // Sistema de respuestas (comentario padre)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // Profundidad del comentario (0 = principal, 1 = respuesta, etc.)
  depth: {
    type: Number,
    default: 0,
    max: 3 // Límite de anidamiento
  },
  // Likes
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Estado
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
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
  deleted: {
    type: Boolean,
    default: false
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
//
//

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;