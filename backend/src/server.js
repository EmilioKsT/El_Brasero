import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/env.js';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import perfilRoutes from './routes/perfil.routes.js';
import productoRoutes from './routes/producto.routes.js';
import carritoRoutes from './routes/carrito.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Validar JWT_SECRET antes de continuar
if (!config.jwt.secret) {
  throw new Error('❌ JWT_SECRET no puede estar vacío. Configura tu archivo .env');
}

// Crear instancia de Fastify con logger Pino
const fastify = Fastify({
  logger: {
    level: config.server.nodeEnv === 'development' ? 'info' : 'warn',
    transport: config.server.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    } : undefined
  }
});

// ============================================
// PLUGINS DE SEGURIDAD
// ============================================

// 1. Helmet - Headers de seguridad HTTP
await fastify.register(helmet, {
  contentSecurityPolicy: config.server.nodeEnv === 'production' ? undefined : false,
  global: true
});

// 2. CORS - Control de orígenes permitidos
await fastify.register(cors, config.cors);

// 3. Rate Limiting - Protección contra fuerza bruta
await fastify.register(rateLimit, {
  global: false, // Aplicaremos selectivamente
  max: config.rateLimit.global.max,
  timeWindow: config.rateLimit.global.timeWindow
});

// 4. JWT - Autenticación con tokens
await fastify.register(jwt, {
  secret: config.jwt.secret
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
    await fastify.listen({
      port: config.server.port,
      host: config.server.host
    });

    console.log('');
    console.log('🔒 ============================================');
    console.log('🔒 EL BRASERO - API REST');
    console.log('🔒 ============================================');
    console.log(`🚀 Servidor: http://localhost:${config.server.port}`);
    console.log(`🌍 Entorno: ${config.server.nodeEnv}`);
    console.log(`🔐 CORS: ${config.server.nodeEnv === 'production' ? 'Restringido' : 'Desarrollo (abierto)'}`);
    console.log(`🛡️  Helmet: Activado`);
    console.log(`⏱️  Rate Limit: ${config.rateLimit.global.max} req/${config.rateLimit.global.timeWindow}`);
    console.log('🔒 ============================================');
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