import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  
  // DATOS BÁSICOS DE IDENTIDAD
    
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true, // Normalización: evita duplicados por mayúsculas/minúsculas
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor introduce un email válido']
  },
  
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // CRÍTICO: Nunca se incluye en queries por defecto, previene leaks accidentales
  },

  // ==========================================
  // SISTEMA DE ROLES Y PERMISOS
  // ==========================================
  
  role: {
    type: String,
    enum: {
      values: ['cliente', 'hostelero', 'admin'],
      message: 'El rol {VALUE} no está permitido' // Mensaje personalizado para valores inválidos
    },
    default: 'cliente'
  },

  // ==========================================
  // PERFIL PÚBLICO DEL USUARIO
  // ==========================================
  
  avatar: {
    type: String,
    default: null,
    // VALIDACIÓN AÑADIDA: Previene URLs malformadas que podrían causar XSS o errores de carga
    validate: {
      validator: function(v) {
        return v === null || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'La URL del avatar debe ser válida (http:// o https://)'
    }
  },
  
  phone: {
  type: String,
  default: null,
  trim: true,
  validate: {
    validator: function(v) {
      // Acepta formato con espacios, guiones, paréntesis
      return v === null || /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{0,9}$/.test(v);
    },
    message: 'Formato de teléfono inválido'
  }
},

  // ==========================================
  // DATOS ESPECÍFICOS DE HOSTELEROS
  // ==========================================
  
  businessName: {
    type: String,
    trim: true,
    default: null,
    maxlength: [100, 'El nombre del negocio no puede exceder 100 caracteres']
  },
  
  cif: {
    type: String,
    trim: true,
    default: null,
    uppercase: true, // Normalización: siempre almacenado en mayúsculas
    // VALIDACIÓN ESPECÍFICA AÑADIDA: Algoritmo básico de CIF español
    // NOTA: No es obligatorio (default: null), pero si se proporciona debe ser válido
    validate: {
      validator: function(v) {
        if (v === null) return true; // No es obligatorio
        
        // Formato: Letra (A-H, J, N-P, Q, R, S, U, V, W) + 7 dígitos + dígito/letra control
        const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i;
        return cifRegex.test(v);
      },
      message: 'El CIF no tiene un formato válido para España (ej: B12345678)'
    }
  },
  
  // Campo crítico: Los hosteleros deben ser verificados por admin antes de operar
  verified: {
    type: Boolean,
    default: false
    // ✅ ELIMINADO: index: true (se define abajo con schema.index)
  },

  // ==========================================
  // FUNCIONALIDADES DEL USUARIO
  // ==========================================
  
  // Array de referencias a establecimientos favoritos (clientes)
  // Técnica: Referencias en lugar de embedding para evitar duplicación de datos
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    index: true // Optimiza queries de "establecimientos favoritos de X usuario"
  }],

  // ==========================================
  // SEGURIDAD Y ESTADO DE CUENTA
  // ==========================================
  
  active: {
    type: Boolean,
    default: true
    // SOFT DELETE: En lugar de borrar documentos, desactivamos
    // Preserva integridad referencial y permite recuperación
  },
  
  // PROTECCIÓN CONTRA FUERZA BRUTA AÑADIDA
  // Estos campos permiten implementar rate limiting sin dependencias externas
  failedLoginAttempts: {
    type: Number,
    default: 0,
    max: [10, 'Límite de intentos alcanzado'] // Prevenir manipulación manual
  },
  
  lockUntil: {
    type: Date,
    default: null
    // Si lockUntil > Date.now(), la cuenta está temporalmente bloqueada
  },

  // ==========================================
  // VERIFICACIÓN DE EMAIL
  // ==========================================
  
  emailVerificationToken: {
    type: String,
    select: false // Nunca exponer en queries, incluso si se fuerza el populate
  },
  
  emailVerified: {
    type: Boolean,
    default: false
    // Requisito crítico: Previene spam y asegura comunicación efectiva
  },

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================
  
  passwordResetToken: {
    type: String,
    select: false // Seguridad: Token hashado, pero igual no lo exponemos
  },
  
  passwordResetExpires: {
    type: Date,
    default: null
    // Ventana de tiempo corta (10 min) reduce riesgo de interceptación
  },

  // ==========================================
  // AUDITORÍA Y TRAZABILIDAD
  // ==========================================
  
  lastLogin: {
    type: Date,
    default: null
    // Útil para: Detectar cuentas inactivas, análisis de engagement, alertas de seguridad
  }
  
}, {
  timestamps: true, // Automáticamente añade createdAt y updatedAt
  
  // CONFIGURACIÓN DE SERIALIZACIÓN
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // LIMPIEZA AUTOMÁTICA AÑADIDA:
      // Elimina campos sensibles incluso si se olvida select: false
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v; // Versión interna de mongoose, no útil para frontend
      
      // Renombra _id a id para consistencia con convenciones REST/JSON
      ret.id = ret._id;
      delete ret._id;
      
      return ret;
    }
  },
  
  toObject: { 
    virtuals: true,
    // Misma transformación para consistencia
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

userSchema.pre('save', async function () {
  // Si password NO cambia (update de name/avatar/etc), no re-hashea
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

//Verifico que la contraseña sea correcta
userSchema.methods.correctPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};



const User = mongoose.model('User', userSchema);

export default User;