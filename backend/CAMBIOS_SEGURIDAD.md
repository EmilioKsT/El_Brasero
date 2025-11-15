# Cambios de Seguridad - Backend El Brasero

## Resumen
Se implementaron mejoras críticas de seguridad en el backend, manteniendo compatibilidad con el modo desarrollo.

---

## 🔒 Cambios Implementados

### 1. **Configuración de Variables de Entorno** ✅
**Archivo:** `src/config/env.js` (NUEVO)

- Validación estricta de variables críticas en producción
- Configuración centralizada de toda la aplicación
- Valores por defecto solo en desarrollo

**Qué hace:**
```javascript
// Valida que JWT_SECRET y MONGODB_URI existan en producción
// Centraliza configuración de CORS, rate limiting, etc.
```

**Variables requeridas:**
- `JWT_SECRET` - OBLIGATORIO (sin fallback inseguro)
- `MONGODB_URI` - Conexión a MongoDB
- `NODE_ENV` - Entorno (development/production)
- `PORT` - Puerto del servidor
- `CORS_ORIGIN` - Orígenes permitidos (producción)

---

### 2. **Logger Profesional (Pino)** ✅
**Archivo:** `src/server.js`

- Reemplazamos `console.log` por logger estructurado
- Formato pretty en desarrollo, JSON en producción
- Mejor rendimiento que Winston o Morgan

**Antes:**
```javascript
logger: true
```

**Ahora:**
```javascript
logger: {
  level: 'info',
  transport: { target: 'pino-pretty' } // Solo en dev
}
```

---

### 3. **Helmet - Headers de Seguridad** ✅
**Archivo:** `src/server.js`

- Protección contra XSS, clickjacking, MIME sniffing
- CSP (Content Security Policy) deshabilitado en dev
- Headers de seguridad HTTP estándar

**Configuración:**
```javascript
await fastify.register(helmet, {
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  global: true
});
```

---

### 4. **Rate Limiting** ✅
**Archivos:** `src/server.js`, `src/routes/auth.routes.js`

**Protección contra ataques de fuerza bruta:**

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Global | 100 req | 15 min |
| `/login` | 5 req | 15 min |
| `/register` | 5 req | 15 min |
| `/recovery/*` | 3 req | 1 hora |

**Ejemplo:**
```javascript
config: {
  rateLimit: {
    max: 5,
    timeWindow: '15 minutes'
  }
}
```

---

### 5. **CORS Adaptativo** ✅
**Archivo:** `src/server.js`

**Antes (VULNERABLE):**
```javascript
origin: true  // ❌ Permite CUALQUIER origen
```

**Ahora (SEGURO):**
```javascript
origin: NODE_ENV === 'production'
  ? process.env.CORS_ORIGIN?.split(',')
  : true  // ✅ Restringido en producción
```

**En producción:** Solo dominios en `CORS_ORIGIN`
**En desarrollo:** Todos los orígenes (para facilitar desarrollo)

---

### 6. **Generación Segura de Códigos** ✅
**Archivo:** `src/models/CodigoRecuperacion.js`

**Antes (VULNERABLE):**
```javascript
Math.floor(100000 + Math.random() * 900000)  // ❌ Predecible
```

**Ahora (SEGURO):**
```javascript
const bytes = crypto.randomBytes(3);
const codigo = parseInt(bytes.toString('hex'), 16) % 1000000;
return codigo.toString().padStart(6, '0');  // ✅ Criptográficamente seguro
```

---

### 7. **Validaciones Mejoradas** ✅
**Archivo:** `src/helpers/validators.js`

**Cambios:**
- Validación de email con regex mejorado + librería `validator`
- Nuevas funciones: `sanitizarString()`, `sanitizarCampos()`
- Escape de caracteres HTML peligrosos

**Antes:**
```javascript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/  // ❌ Acepta emails inválidos
```

**Ahora:**
```javascript
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// ✅ + validación con librería validator
```

---

### 8. **Middleware de Sanitización** ✅
**Archivo:** `src/middlewares/sanitize.middleware.js` (NUEVO)

- Previene ataques XSS
- Escapa caracteres HTML en inputs
- Sanitiza body, query params y params

**Uso:**
```javascript
import { sanitizeInput } from './middlewares/sanitize.middleware.js';

fastify.post('/ruta', {
  preHandler: [sanitizeInput]
}, handler);
```

---

### 9. **Validación de Disponibilidad de Productos** ✅
**Archivos:** `src/controllers/carrito.controller.js`, `src/controllers/pedido.controller.js`

**Cambios:**
- Verifica `producto.disponible === true` antes de agregar al carrito
- Valida disponibilidad antes de confirmar pedido
- Previene compra de productos deshabilitados

**Código agregado:**
```javascript
if (!producto.disponible) {
  return reply.code(400).send({
    mensaje: 'Este producto no está disponible actualmente'
  });
}
```

---

### 10. **Límite de Sesiones Activas** ✅
**Archivo:** `src/models/RefreshToken.js`

- Máximo 10 sesiones activas por usuario (configurable)
- Revoca automáticamente la sesión más antigua
- Previene acumulación infinita de tokens

**Método nuevo:**
```javascript
RefreshToken.createWithLimit({
  usuarioId, tokenValue, ...
});
// Si el usuario tiene 10+ sesiones, revoca la más antigua
```

---

### 11. **Conexión Optimizada a MongoDB** ✅
**Archivo:** `src/config/database.js`

**Opciones agregadas:**
```javascript
{
  maxPoolSize: 10,          // Pool de conexiones
  minPoolSize: 2,
  socketTimeoutMS: 45000,   // Timeouts
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'             // Write concern
}
```

---

### 12. **Corrección de Bugs** ✅

**Bug corregido:**
- `precioUnitARIO` → `precioUnitario` en `src/controllers/pedido.controller.js:44`

---

## 📦 Dependencias Agregadas

```json
{
  "@fastify/helmet": "^10.1.1",
  "@fastify/rate-limit": "^8.1.1",
  "validator": "^13.11.0",
  "pino": "^8.19.0",
  "pino-pretty": "^11.0.0"
}
```

**Instalación:**
```bash
npm install
```

---

## 🚀 Configuración Inicial

### 1. Crear archivo `.env`
```bash
cp .env.example .env
```

### 2. Configurar variables OBLIGATORIAS
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secreto_super_seguro_CAMBIALO
NODE_ENV=development
```

### 3. Iniciar servidor
```bash
npm run dev
```

---

## 🔐 Diferencias Desarrollo vs Producción

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| CORS | Todos los orígenes | Lista blanca |
| Logger | Pretty format | JSON |
| CSP | Deshabilitado | Habilitado |
| Validación JWT_SECRET | Warning | Error Fatal |
| Rate Limiting | Aplicado | Aplicado |

---

## ⚠️ IMPORTANTE para Producción

**Antes de deployar:**

1. ✅ Configurar `JWT_SECRET` seguro (min 32 chars aleatorios)
2. ✅ Configurar `CORS_ORIGIN` con dominios específicos
3. ✅ Cambiar `NODE_ENV=production`
4. ✅ Verificar que MongoDB tenga autenticación
5. ✅ Configurar HTTPS (no HTTP)
6. ✅ Revisar logs periódicamente

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Testing

**Verificar que el servidor arranca:**
```bash
npm start
```

**Verificar rate limiting:**
```bash
# Hacer 6 requests rápidos a /login
# El 6to debe retornar 429 Too Many Requests
```

**Verificar CORS:**
```bash
curl -H "Origin: http://evil.com" http://localhost:3000/api/productos
# En producción debe ser bloqueado
```

---

## 📊 Resumen de Impacto

### Vulnerabilidades Corregidas:
- ❌ JWT_SECRET hardcoded → ✅ Validación estricta
- ❌ CORS abierto → ✅ Restringido en producción
- ❌ Math.random() → ✅ crypto.randomBytes()
- ❌ Sin rate limiting → ✅ Implementado
- ❌ Sin validación de disponibilidad → ✅ Implementado

### Mejoras Agregadas:
- ✅ Logger profesional (Pino)
- ✅ Helmet headers de seguridad
- ✅ Sanitización de inputs
- ✅ Límite de sesiones activas
- ✅ Conexión optimizada a MongoDB
- ✅ Validaciones mejoradas

---

## 🐛 Problemas Conocidos

1. **Warning de Mongoose:** "Duplicate schema index on {usuario:1}"
   - **Impacto:** Bajo (solo warning)
   - **Solución:** Revisar modelos que usan `index: true` y `schema.index()`

---

## 📝 Próximos Pasos Sugeridos

1. Implementar tests (Jest/Vitest)
2. Agregar Swagger/OpenAPI para documentación
3. Implementar CAPTCHA en recovery
4. Agregar logging de eventos de seguridad
5. Implementar auditoría de acciones de admin
6. Configurar CI/CD con tests automáticos

---

## 👨‍💻 Autor
Implementado por: Claude Code
Fecha: 2025-11-15
Proyecto: El Brasero - Backend

---

## 📄 Licencia
ISC - Emilio Castillo
