# 📊 Esquema de Base de Datos - nexTapa

## 🗂️ Modelos y Relaciones

### 1. **User** (Usuario)
Gestiona todos los usuarios de la plataforma con 3 roles diferentes.

**Campos principales:**
- `name`, `email`, `password` (hasheada con bcrypt)
- `role`: 'cliente' | 'hostelero' | 'admin'
- `avatar`: URL de la foto de perfil
- `phone`: Teléfono de contacto
- `businessName`, `cif`: Datos para hosteleros
- `verified`: Verificación del hostelero por admin
- `favorites`: Array de IDs de establecimientos favoritos
- `emailVerified`: Si ha verificado el email
- `active`: Estado de la cuenta

**Relaciones:**
- Un usuario puede tener **muchos** Establecimientos (si es hostelero)
- Un usuario puede hacer **muchas** Reviews
- Un usuario puede hacer **muchos** Comments
- Un usuario puede subir **muchas** Photos

**Índices:**
```javascript
{ email: 1 }          // Búsqueda rápida y login
{ role: 1 }           // Filtrar por rol
{ verified: 1 }       // Hosteleros verificados
{ createdAt: -1 }     // Ordenar por fecha de registro
```

---

### 2. **Establishment** (Establecimiento)
Representa bares, restaurantes y locales de hostelería.

**Campos principales:**
- `name`, `slug`, `description`
- `owner`: ObjectId → User (hostelero propietario)
- `type`: 'bar' | 'restaurante' | 'cafeteria' | 'cerveceria' | 'tasca' | 'gastrobar'
- `cuisineType`: Array de tipos de cocina
- `address`: Objeto con calle, ciudad, provincia, código postal
- `location`: GeoJSON Point para geolocalización (coordenadas)
- `phone`, `email`, `website`
- `schedule`: Horarios de cada día de la semana
- `features`: Array de características (terraza, wifi, tapas_gratis, etc.)
- `priceRange`: '€' | '€€' | '€€€' | '€€€€'
- `mainImage`: URL de imagen principal
- `images`: Array de ObjectId → Photo
- `averageRating`, `totalReviews`: Calculados automáticamente
- `verified`: Aprobado por admin
- `active`: Estado del establecimiento
- `views`, `favorites`: Estadísticas

**Relaciones:**
- Pertenece a **un** User (owner)
- Tiene **muchos** Items (tapas/raciones)
- Tiene **muchas** Reviews
- Tiene **muchos** Comments
- Tiene **muchas** Photos

**Índices:**
```javascript
{ location: '2dsphere' }           // Búsquedas geoespaciales (cercanos)
{ slug: 1 }                        // URLs amigables
{ owner: 1 }                       // Establecimientos de un hostelero
{ verified: 1, active: 1 }         // Establecimientos públicos
{ averageRating: -1 }              // Ordenar por valoración
{ 'address.city': 1 }              // Filtrar por ciudad
{ 'address.province': 1 }          // Filtrar por provincia
{ type: 1 }                        // Filtrar por tipo
{ name: 'text', description: 'text' }  // Búsqueda de texto
```

**Métodos especiales:**
- `distanceTo(lng, lat)`: Calcula distancia a un punto
- `findNearby(lng, lat, maxDistance)`: Busca establecimientos cercanos

---

### 3. **Item** (Tapa/Ración)
Representa las tapas, raciones y platos de un establecimiento.

**Campos principales:**
- `name`, `description`
- `establishment`: ObjectId → Establishment
- `type`: 'tapa' | 'racion' | 'media_racion' | 'entrante' | 'plato' | 'postre'
- `isFree`: Si es tapa gratis (con consumición)
- `price`: Precio (0 si es gratis)
- `categories`: Array (carne, pescado, marisco, etc.)
- `allergens`: Array de alérgenos
- `dietaryOptions`: Array (vegetariano, vegano, sin_gluten, etc.)
- `available`: Si está disponible actualmente
- `seasonalItem`: Si es de temporada
- `specialDay`: Día especial de la semana (ej: miércoles de tapas)
- `mainImage`: URL de imagen principal
- `images`: Array de ObjectId → Photo
- `averageRating`, `totalReviews`
- `views`, `orders`: Estadísticas
- `featured`: Destacado por el hostelero
- `order`: Orden de visualización

**Relaciones:**
- Pertenece a **un** Establishment
- Tiene **muchas** Reviews
- Tiene **muchos** Comments
- Tiene **muchas** Photos

**Índices:**
```javascript
{ establishment: 1 }                        // Items de un establecimiento
{ isFree: 1 }                               // Filtrar tapas gratis
{ available: 1 }                            // Solo disponibles
{ averageRating: -1 }                       // Ordenar por valoración
{ featured: -1 }                            // Items destacados primero
{ establishment: 1, available: 1, order: 1 } // Índice compuesto optimizado
{ name: 'text', description: 'text' }       // Búsqueda de texto
```

**Métodos especiales:**
- `findFreeTapas(establishmentId)`: Obtiene tapas gratis
- `findTopRated(establishmentId)`: Obtiene más valoradas
- `hasAllergen(allergen)`: Verifica alérgenos
- `isCompatibleWith(diet)`: Verifica compatibilidad dietética

---

### 4. **Review** (Valoración)
Valoraciones con sistema de estrellas (1-5) de establecimientos o items.

**Campos principales:**
- `user`: ObjectId → User (quien valora)
- `establishment`: ObjectId → Establishment (opcional)
- `item`: ObjectId → Item (opcional)
- `rating`: Número entero 1-5 (obligatorio)
- `title`: Título de la review (opcional)
- `comment`: Texto del comentario (opcional)
- `aspects`: Objeto con valoraciones específicas:
  - `quality`: 1-5
  - `service`: 1-5
  - `ambiance`: 1-5
  - `priceQuality`: 1-5
- `response`: Respuesta del hostelero (objeto con texto, usuario, fecha)
- `helpful`: Contador de "útil"
- `helpfulBy`: Array de usuarios que lo marcaron
- `reported`: Si ha sido reportada
- `verified`: Moderada por admin

**Relaciones:**
- Pertenece a **un** User
- Pertenece a **un** Establishment OR **un** Item (mutuamente excluyente)

**Restricciones:**
- Un usuario solo puede valorar **una vez** cada establecimiento
- Un usuario solo puede valorar **una vez** cada item
- Debe tener establecimiento O item, no ambos ni ninguno

**Índices:**
```javascript
{ user: 1 }
{ establishment: 1 }
{ item: 1 }
{ rating: -1 }
{ createdAt: -1 }
{ user: 1, establishment: 1 } // Unique para evitar duplicados
{ user: 1, item: 1 }          // Unique para evitar duplicados
```

**Hooks automáticos:**
- Al crear/actualizar/eliminar → Recalcula `averageRating` y `totalReviews` del establecimiento/item

**Métodos especiales:**
- `calculateAverageRating()`: Recalcula media de valoraciones
- `markAsHelpful(userId)`: Marca como útil
- `addResponse(text, userId)`: Hostelero responde
- `report(userId, reason)`: Reportar review

---

### 5. **Comment** (Comentario)
Sistema de comentarios con respuestas anidadas (hasta 3 niveles).

**Campos principales:**
- `user`: ObjectId → User
- `establishment`: ObjectId → Establishment (opcional)
- `item`: ObjectId → Item (opcional)
- `content`: Texto del comentario (obligatorio)
- `parentComment`: ObjectId → Comment (para respuestas)
- `depth`: Profundidad de anidamiento (0, 1, 2, 3 máximo)
- `likes`: Contador de likes
- `likedBy`: Array de usuarios
- `edited`: Si fue editado
- `editedAt`: Fecha de edición
- `reported`: Si ha sido reportado
- `deleted`: Soft delete

**Relaciones:**
- Pertenece a **un** User
- Pertenece a **un** Establishment OR **un** Item
- Puede tener **un** parentComment (para respuestas)
- Puede tener **muchas** respuestas (replies)

**Índices:**
```javascript
{ user: 1 }
{ establishment: 1 }
{ item: 1 }
{ parentComment: 1 }
{ createdAt: -1 }
{ verified: 1, deleted: 0 }
```

**Hooks automáticos:**
- Al crear respuesta → Calcula automáticamente la `depth` y hereda establecimiento/item

**Métodos especiales:**
- `addLike(userId)`: Dar like
- `removeLike(userId)`: Quitar like
- `editContent(newContent)`: Editar comentario
- `report(userId, reason)`: Reportar
- `softDelete()`: Eliminar (mantiene registro)
- `findWithReplies()`: Obtiene comentarios con sus respuestas

---

### 6. **Photo** (Foto)
Gestión de imágenes de establecimientos y tapas.

**Campos principales:**
- `uploadedBy`: ObjectId → User
- `establishment`: ObjectId → Establishment (opcional)
- `item`: ObjectId → Item (opcional)
- `filename`: Nombre del archivo
- `originalName`: Nombre original
- `url`: URL pública de la imagen
- `thumbnailUrl`: URL del thumbnail
- `storageProvider`: 'cloudinary' | 'aws_s3' | 'local'
- `publicId`: ID en el proveedor (para eliminar)
- `size`: Tamaño en bytes
- `mimeType`: Tipo de imagen (jpeg, png, webp, gif)
- `dimensions`: Objeto con width y height
- `caption`: Descripción de la foto
- `alt`: Texto alternativo para accesibilidad
- `tags`: Array de etiquetas
- `isPrimary`: Si es la imagen principal
- `order`: Orden de visualización
- `verified`: Moderada
- `reported`: Reportada
- `views`: Contador de vistas

**Relaciones:**
- Pertenece a **un** User (quien sube)
- Pertenece a **un** Establishment OR **un** Item

**Índices:**
```javascript
{ uploadedBy: 1 }
{ establishment: 1 }
{ item: 1 }
{ isPrimary: 1 }
{ establishment: 1, order: 1 }
{ item: 1, order: 1 }
```

**Hooks automáticos:**
- Al marcar como `isPrimary` → Desmarca las demás del mismo establecimiento/item
- Al marcar como `isPrimary` → Actualiza `mainImage` en Establishment/Item
- Al eliminar → Actualiza la siguiente foto como principal si era la principal

**Métodos especiales:**
- `setAsPrimary()`: Marca como imagen principal
- `report(userId, reason)`: Reportar foto
- `deletePhoto(photoId)`: Elimina de servidor y BD

---

## 🔗 Diagrama de Relaciones

```
USER
├── tiene muchos → ESTABLISHMENT (si es hostelero)
├── tiene muchos → REVIEW
├── tiene muchos → COMMENT
├── tiene muchos → PHOTO (uploaded)
└── tiene muchos → ESTABLISHMENT (favoritos)

ESTABLISHMENT
├── pertenece a → USER (owner)
├── tiene muchos → ITEM (tapas/raciones)
├── tiene muchos → REVIEW
├── tiene muchos → COMMENT
└── tiene muchas → PHOTO

ITEM
├── pertenece a → ESTABLISHMENT
├── tiene muchas → REVIEW
├── tiene muchos → COMMENT
└── tiene muchas → PHOTO

REVIEW
├── pertenece a → USER
└── pertenece a → ESTABLISHMENT o ITEM

COMMENT
├── pertenece a → USER
├── pertenece a → ESTABLISHMENT o ITEM
└── puede tener → COMMENT (parent/reply)

PHOTO
├── pertenece a → USER (uploader)
└── pertenece a → ESTABLISHMENT o ITEM
```

---

## 🎯 Índices para Optimización

### Índices Geoespaciales
```javascript
Establishment: { location: '2dsphere' }
// Permite búsquedas del tipo "establecimientos a menos de 5km"
```

### Índices de Texto (Full-Text Search)
```javascript
Establishment: { name: 'text', description: 'text' }
Item: { name: 'text', description: 'text' }
// Permite búsquedas: "buscar 'pulpo gallega'"
```

### Índices Compuestos (Optimización de queries)
```javascript
User: { email: 1 }  // Login rápido
Establishment: { verified: 1, active: 1 }  // Listar públicos
Establishment: { owner: 1 }  // Establecimientos de un hostelero
Item: { establishment: 1, available: 1, order: 1 }  // Items ordenados de un local
Review: { user: 1, establishment: 1 }  // Prevenir duplicados
Comment: { verified: 1, deleted: 0 }  // Comentarios visibles
```

---

## 📝 Validaciones Importantes

### User
- Email único y válido
- Contraseña mínimo 6 caracteres (hasheada con bcrypt)
- Role solo puede ser: cliente | hostelero | admin
- Hosteleros necesitan verificación

### Establishment
- Coordenadas válidas (longitud: -180 a 180, latitud: -90 a 90)
- Teléfono obligatorio
- Slug único generado automáticamente
- Necesita aprobación de admin antes de ser público

### Item
- Si `isFree` es true → `price` debe ser 0
- Si `isFree` es false → `price` debe ser > 0
- Debe pertenecer a un establecimiento

### Review
- Rating debe ser entero entre 1 y 5
- Debe tener establecimiento O item (no ambos)
- Usuario no puede valorar dos veces el mismo elemento

### Comment
- Debe tener establecimiento O item (no ambos)
- Profundidad máxima: 3 niveles
- Respuestas heredan establecimiento/item del padre

### Photo
- Solo tipos permitidos: jpeg, jpg, png, webp, gif
- Debe tener establecimiento O item (no ambos)
- Solo una foto puede ser `isPrimary` por elemento

---

## 🚀 Scripts Disponibles

### Seeder (Datos de Prueba)
```bash
node seeders/seed.js
```
Crea:
- 5 usuarios (1 admin, 2 hosteleros, 2 clientes)
- 2 establecimientos en Vigo
- 6 tapas/raciones variadas
- 5 valoraciones
- 3 comentarios
- Favoritos

### Crear Admin
```bash
# Modo interactivo
node scripts/createAdmin.js

# Modo con argumentos
node scripts/createAdmin.js "Admin" "admin@nextapa.com" "password123"
```

---

## 💡 Notas de Implementación

### Geolocalización
- Usar MongoDB Geospatial Queries con GeoJSON
- Formato: `{ type: 'Point', coordinates: [longitud, latitud] }`
- **Importante**: MongoDB guarda [lng, lat], NO [lat, lng]

### Cálculo de Valoraciones
- Se recalcula automáticamente con hooks en Review
- Redondeo a 1 decimal: `Math.round(rating * 10) / 10`
- Se actualiza `averageRating` y `totalReviews`

### Imágenes
- Recomendado: Cloudinary (CDN, optimización automática)
- Almacenar URLs, no archivos en MongoDB
- Generar thumbnails para listados
- Lazy loading en frontend

### Búsquedas
- Text Search: Para nombre y descripción
- Geoespacial: Para establecimientos cercanos
- Filtros: Por tipo, valoración, características, precio, tapas gratis

### Seguridad
- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT para autenticación
- Validación de roles en middleware
- Sanitización de inputs
- Rate limiting en API

---

## 📦 Dependencias Necesarias

```json
{
  "mongoose": "^8.x",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "express-validator": "^7.0.1",
  "cloudinary": "^2.0.0"
}
```

---

Creado para **nexTapa** 🍷🍤