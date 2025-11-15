import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Conectar a MongoDB con opciones optimizadas
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      // Opciones de pool de conexiones
      maxPoolSize: 10,          // Máximo de conexiones en el pool
      minPoolSize: 2,           // Mínimo de conexiones en el pool

      // Timeouts
      socketTimeoutMS: 45000,   // Cerrar sockets inactivos tras 45s
      serverSelectionTimeoutMS: 5000, // Timeout al seleccionar servidor

      // Retry writes (útil para replica sets)
      retryWrites: true,

      // Write concern (garantía de escritura)
      w: 'majority'
    });

    console.log('✅ MongoDB conectado correctamente');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Base de datos: ${conn.connection.name}`);

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1); // Salir si no puede conectar
  }
};

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de MongoDB:', err);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconectado');
});
