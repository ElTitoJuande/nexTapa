import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment'
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  filename: {
    type: String,
    required: [true, 'El nombre del archivo es obligatorio']
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: [true, 'La URL es obligatoria']
  },
  thumbnailUrl: String,
  storageProvider: {
    type: String,
    enum: ['cloudinary', 'aws_s3', 'local'],
    default: 'cloudinary'
  },
  publicId: String,
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede exceder 200 caracteres']
  },
  alt: {
    type: String,
    trim: true,
    maxlength: [100, 'El texto alternativo no puede exceder 100 caracteres']
  },
  tags: [{ type: String, trim: true }],
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  reported: { type: Boolean, default: false },
  reportReason: String,
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

photoSchema.pre('validate', function() {
  if (!this.establishment && !this.item) {
    throw new Error('La foto debe pertenecer a un establecimiento o a un item');
  }
});

const Photo = mongoose.model('Photo', photoSchema);
export default Photo;