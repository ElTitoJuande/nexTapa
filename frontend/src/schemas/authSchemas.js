

import { z } from 'zod';

/**
 * SCHEMAS DE VALIDACIÓN PARA AUTENTICACIÓN
 * 
 * Usamos Zod para definir esquemas de validación tipo-seguro y reutilizables.
 * Cada schema valida una parte específica del flujo de autenticación.
 */

// ============================================
// VALIDACIONES COMUNES (reutilizables)
// ============================================

const emailSchema = z
   .string()
   .min(1, 'El email es obligatorio')
   .email('Formato de email inválido')
   .toLowerCase()
   .trim();

const passwordSchema = z
   .string()
   .min(6, 'La contraseña debe tener al menos 6 caracteres')
   .max(50, 'La contraseña no puede exceder 50 caracteres')
   .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener al menos una mayúscula, una minúscula y un número'
   );

const nombreSchema = z
   .string()
   .min(2, 'El nombre debe tener al menos 2 caracteres')
   .max(50, 'El nombre no puede exceder 50 caracteres')
   .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras')
   .trim();

const apellidosSchema = z
   .string()
   .min(2, 'Los apellidos deben tener al menos 2 caracteres')
   .max(100, 'Los apellidos no pueden exceder 100 caracteres')
   .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras')
   .trim();

// ============================================
// SCHEMA DE LOGIN
// ============================================

export const loginSchema = z.object({
   email: emailSchema,
   password: z.string().min(1, 'La contraseña es obligatoria'), // No validamos formato en login
});

// ============================================
// SCHEMAS DEL FLUJO DE REGISTRO (por pasos)
// ============================================

/**
 * STEP 1: Captura del email
 * Solo validamos que sea un email válido
 */
export const emailStepSchema = z.object({
   email: emailSchema,
});

/**
 * STEP 2: Selección del tipo de usuario
 * Valores permitidos: 'cliente' o 'hostelero'
 */
export const userTypeStepSchema = z.object({
   tipoUsuario: z.enum(['cliente', 'hostelero'], {
      required_error: 'Debes seleccionar un tipo de usuario',
      invalid_type_error: 'Tipo de usuario inválido',
   }),
});

/**
 * STEP 3A: Datos del CLIENTE
 * Información personal básica + contraseña
 */
export const clientDataStepSchema = z.object({
   nombre: nombreSchema,
   apellidos: apellidosSchema,
   password: passwordSchema,
   confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
   message: 'Las contraseñas no coinciden',
   path: ['confirmPassword'], // El error se muestra en el campo confirmPassword
});

/**
 * STEP 3B: Datos del HOSTELERO (persona física)
 * Mismos campos que cliente + nombre comercial
 */
export const hosteleroDataStepSchema = z.object({
   nombre: nombreSchema,
   apellidos: apellidosSchema,
   nombreComercial: z
      .string()
      .min(2, 'El nombre comercial debe tener al menos 2 caracteres')
      .max(100, 'El nombre comercial no puede exceder 100 caracteres')
      .trim(),
   password: passwordSchema,
   confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
   message: 'Las contraseñas no coinciden',
   path: ['confirmPassword'],
});

/**
 * STEP 4: Datos del ESTABLECIMIENTO (solo para hosteleros)
 * Información del local/negocio
 */
export const establishmentStepSchema = z.object({
   nombre: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .trim(),
   tipo: z.enum(['bar', 'restaurante', 'cafeteria', 'taperia', 'gastrobar'], {
      required_error: 'Debes seleccionar un tipo de establecimiento',
      invalid_type_error: 'Tipo de establecimiento inválido',
   }),
   descripcion: z
      .string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(500, 'La descripción no puede exceder 500 caracteres')
      .trim()
      .optional()
      .or(z.literal('')), // Permite string vacío
   direccion: z
      .string()
      .min(5, 'La dirección debe tener al menos 5 caracteres')
      .max(200, 'La dirección no puede exceder 200 caracteres')
      .trim(),
   codigoPostal: z
      .string()
      .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos')
      .trim(),
   ciudad: z
      .string()
      .min(2, 'La ciudad debe tener al menos 2 caracteres')
      .max(100, 'La ciudad no puede exceder 100 caracteres')
      .trim(),
   provincia: z
      .string()
      .min(2, 'La provincia debe tener al menos 2 caracteres')
      .max(100, 'La provincia no puede exceder 100 caracteres')
      .trim(),
   telefono: z
      .string()
      .regex(/^[6-9]\d{8}$/, 'Teléfono inválido (9 dígitos, empieza por 6, 7, 8 o 9)')
      .trim()
      .optional()
      .or(z.literal('')),
});

/**
 * SCHEMA COMPLETO DE REGISTRO
 * Combina todos los pasos en un solo objeto para la petición final al backend
 */
export const fullRegisterSchema = z.object({
   email: emailSchema,
   tipoUsuario: z.enum(['cliente', 'hostelero']),
   nombre: nombreSchema,
   apellidos: apellidosSchema,
   password: passwordSchema,
   // Campos opcionales según el tipo de usuario
   nombreComercial: z.string().optional(),
   establecimiento: establishmentStepSchema.optional(),
});

// PRUEBA RÁPIDA (borra esto después)
console.log('✅ Schemas cargados correctamente');

// Prueba de validación de email
try {
   emailStepSchema.parse({ email: 'test@example.com' });
   console.log('✅ Email válido');
} catch (error) {
   console.log('❌ Error:', error.errors);
}
