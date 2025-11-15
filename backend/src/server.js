import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import perfilRoutes from './routes/perfil.routes.js';
import productoRoutes from './routes/producto.routes.js'; 
import carritoRoutes from './routes/carrito.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import adminRoutes from './routes/admin.routes.js';

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

// Registrar rutas de pedidos
await fastify.register(pedidoRoutes, { prefix: '/api/pedidos' });

// Registrar rutas de pagos
await fastify.register(pagoRoutes, { prefix: '/api/pagos' });

// Registrar rutas de admin
await fastify.register(adminRoutes, { prefix: '/api/admin' });

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
    console.log(`🔒 EL BRASERO `);
    console.log('🔒 ============================================');
    console.log(`🚀 Servidor: http://localhost:${PORT}`);
 
    
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