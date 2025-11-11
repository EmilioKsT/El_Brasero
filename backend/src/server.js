import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';


// Cargar variables de entorno
dotenv.config();

// Crear instancia de Fastify con logger
const fastify = Fastify({ 
  logger: true 
});

// Registrar plugin CORS (permitir peticiones desde el frontend)
await fastify.register(cors, {
  origin: true, // En desarrollo permite todos los orígenes
  credentials: true
});
await fastify.register(authRoutes, { prefix: '/api/auth' });

// ============================================
// RUTAS
// ============================================

// Ruta de prueba (raíz)
fastify.get('/', async (request, reply) => {
  return { 
    message: 'API El Brasero funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };
});

// Ruta de health check (verificar que el servidor está vivo)
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'OK',
    uptime: process.uptime(),
    mongodb: fastify.mongoose ? 'connected' : 'disconnected'
  };
});

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
    console.log('🚀 ============================================');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('🚀 ============================================');
    console.log('');
    console.log('📝 Rutas disponibles:');
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log('');
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Manejo de señales para cerrar correctamente
process.on('SIGINT', async () => {
  console.log('\n Cerrando servidor...');
  await fastify.close();
  process.exit(0);
});

// Iniciar el servidor
start();