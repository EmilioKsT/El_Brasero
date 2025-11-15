import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Validador de variables de entorno
 * Lanza error si alguna variable crítica no está configurada en producción
 */
const validateEnv = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const isProduction = process.env.NODE_ENV === 'production';

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      if (isProduction) {
        throw new Error(`❌ Variable de entorno ${envVar} es OBLIGATORIA en producción`);
      } else {
        console.warn(`⚠️  Variable de entorno ${envVar} no configurada (modo desarrollo)`);
      }
    }
  }
};

// Validar al cargar
validateEnv();

/**
 * Configuración centralizada de la aplicación
 */
export const config = {
  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/el_brasero_dev'
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || null, // No usar fallback en producción
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },

  // Servidor
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // CORS
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGIN?.split(',') || ['https://tudominio.com']
      : true, // En desarrollo permite todos los orígenes
    credentials: true
  },

  // Rate Limiting
  rateLimit: {
    global: {
      max: 100,
      timeWindow: '15 minutes'
    },
    auth: {
      max: 5,
      timeWindow: '15 minutes'
    },
    recovery: {
      max: 3,
      timeWindow: '1 hour'
    }
  },

  // Sesiones
  sessions: {
    maxActivePerUser: 10 // Máximo de sesiones activas por usuario
  }
};

export default config;
