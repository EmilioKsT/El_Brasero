import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import perfilRoutes from './routes/perfil.routes.js';
import productoRoutes from './routes/producto.routes.js'; 
import carritoRoutes from './routes/carrito.routes.js';

// Cargar variables de entorno
dotenv.config();

// Crear instancia de Fastify con logger
const fastify = Fastify({ 
  logger: true 
});

// ============================================
// PLUGINS
// ============================================

// Registrar plugin CORS (permitir peticiones desde el frontend)
await fastify.register(cors, {
  origin: true, // En desarrollo permite todos los orígenes
  credentials: true
});

// Configurar JWT
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'brasero_jwt_secret_2024_super_seguro'
});

// ============================================
// RUTAS
// ============================================

// Ruta de prueba (raíz)
fastify.get('/', async (request, reply) => {
  return { 
    message: 'API El Brasero, el mejor pollo a las brasas',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };
});

// Ruta de health check (verificar que el servidor está vivo)
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'OK',
    uptime: process.uptime(),
    mongodb: 'connected'
  };
});

// Registrar rutas de autenticación (SOLO UNA VEZ)
await fastify.register(authRoutes, { prefix: '/api/auth' });

// Registrar rutas de perfil
await fastify.register(perfilRoutes, { prefix: '/api/auth' });

// Registrar rutas de productos
await fastify.register(productoRoutes, { prefix: '/api/productos' });

// Registrar rutas de carrito
await fastify.register(carritoRoutes, { prefix: '/api/carrito' });

// ============================================
// INICIAR SERVIDOR
// ============================================

const start = async () => {
  try {
    // 1. Conectar a MongoDB
    await connectDB();
    
    // 2. Levantar servidor
    const PORT = process.env.PORT || 3000;
    await fastify.listen({ 
      port: PORT,
      host: '0.0.0.0' // Escuchar en todas las interfaces
    });
    
    console.log('');
    console.log('🔒 ============================================');
    console.log(`🔒 EL BRASERO - ZERO TRUST ARCHITECTURE`);
    console.log('🔒 ============================================');
    console.log(`🚀 Servidor: http://localhost:${PORT}`);
    console.log('');
    console.log('📡 Endpoints disponibles:');
    console.log('   GET  /');
    console.log('   GET  /health');
    console.log('');
    console.log('🔓 PÚBLICOS:');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login (→ accessToken 15m + refreshToken 7d)');
    console.log('   POST /api/auth/refresh (renovar accessToken)');
    console.log('   POST /api/auth/logout (revocar 1 sesión)');
    console.log('   POST /api/auth/recovery/request');
    console.log('   POST /api/auth/recovery/validate');
    console.log('   POST /api/auth/recovery/reset');
    console.log('');
    console.log('🔒 PROTEGIDOS (requieren JWT):');
    console.log('   GET  /api/auth/perfil');
    console.log('   PUT  /api/auth/perfil');
    console.log('   POST /api/auth/logout-all (cerrar TODAS las sesiones)');
    console.log('');
    console.log('🛡️  ZTA ACTIVO:');
    console.log('   ✅ Cada request: JWT + Usuario activo + Token válido');
    console.log('   ✅ Access Token: 15 minutos (renovable)');
    console.log('   ✅ Refresh Token: 7 días (revocable)');
    console.log('');
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Manejo de señales para cerrar correctamente
process.on('SIGINT', async () => {
  console.log('\n🔴 Cerrando servidor...');
  await fastify.close();
  process.exit(0);
});

// Iniciar el servidor
start();