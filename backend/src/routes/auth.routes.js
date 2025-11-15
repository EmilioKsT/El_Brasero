import {
  registrarUsuario,
  iniciarSesion,
  renovarToken,              // ← NUEVO
  logout,                    // ← NUEVO
  logoutAll,                 // ← NUEVO
  solicitarRecuperacion,
  validarCodigoRecuperacion,
  resetearPassword,
  obtenerStatus
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'; // ← NUEVO
import { config } from '../config/env.js';

export default async function authRoutes(fastify, options) {
  
  // ============================================
  // RUTAS EXISTENTES (B-03, B-04)
  // ============================================
  
  // POST /api/auth/register - Registrar usuario
  fastify.post('/register', {
    config: {
      rateLimit: {
        max: config.rateLimit.auth.max,
        timeWindow: config.rateLimit.auth.timeWindow
      }
    },
    schema: {
      description: 'Registrar un nuevo usuario',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            description: 'Email del usuario'
          },
          password: { 
            type: 'string', 
            minLength: 8,
            description: 'Contraseña (mín 8 chars, 1 mayúscula, 1 minúscula, 1 número)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        409: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, registrarUsuario);

  // POST /api/auth/login - Iniciar sesión (AHORA CON REFRESH TOKEN)
  fastify.post('/login', {
    config: {
      rateLimit: {
        max: config.rateLimit.auth.max,
        timeWindow: config.rateLimit.auth.timeWindow
      }
    },
    schema: {
      description: 'Iniciar sesión y obtener JWT (ZTA: access + refresh token)',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            description: 'Email del usuario'
          },
          password: { 
            type: 'string',
            description: 'Contraseña del usuario'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },  // ← NUEVO
            rol: { type: 'string' },
            profileComplete: { type: 'boolean' }
          }
        },
        400: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        403: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, iniciarSesion);

  // ============================================
  // RUTAS NUEVAS - ZTA (B-04)
  // ============================================

  /**
   * POST /api/auth/refresh
   * Renovar access token usando refresh token
   * Cliente debe enviar el refreshToken en el body
   */
  fastify.post('/refresh', {
    schema: {
      description: 'Renovar access token con refresh token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { 
            type: 'string',
            description: 'Refresh token recibido en el login'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            accessToken: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, renovarToken);

  /**
   * POST /api/auth/logout
   * Cerrar sesión (revocar refresh token)
   * Cierra la sesión del dispositivo actual
   */
  fastify.post('/logout', {
    schema: {
      description: 'Cerrar sesión (revocar refresh token)',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { 
            type: 'string',
            description: 'Refresh token a revocar'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, logout);

  /**
   * POST /api/auth/logout-all
   * Cerrar TODAS las sesiones del usuario (protegido)
   * Requiere estar autenticado con JWT
   */
  fastify.post('/logout-all', {
    preHandler: [verifyJWT],  // ← Requiere JWT válido
    schema: {
      description: 'Cerrar todas las sesiones del usuario',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' },
            sesionesRevocadas: { type: 'number' }
          }
        }
      }
    }
  }, logoutAll);

  // ============================================
  // RUTAS RECUPERACIÓN DE CONTRASEÑA (B-05)
  // ============================================

  /**
   * POST /api/auth/recovery/request
   * Solicitar código de recuperación de contraseña
   * SIEMPRE responde 200 OK (respuesta genérica por seguridad)
   */
  fastify.post('/recovery/request', {
    config: {
      rateLimit: {
        max: config.rateLimit.recovery.max,
        timeWindow: config.rateLimit.recovery.timeWindow
      }
    },
    schema: {
      description: 'Solicitar código de recuperación de contraseña',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            description: 'Email del usuario'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, solicitarRecuperacion);

  /**
   * POST /api/auth/recovery/validate
   * Validar código de recuperación
   * Verifica que el código sea válido (no usado, no expirado)
   */
  fastify.post('/recovery/validate', {
    config: {
      rateLimit: {
        max: config.rateLimit.recovery.max,
        timeWindow: config.rateLimit.recovery.timeWindow
      }
    },
    schema: {
      description: 'Validar código de recuperación',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'codigo'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            description: 'Email del usuario'
          },
          codigo: { 
            type: 'string', 
            pattern: '^\\d{6}$',
            description: 'Código de 6 dígitos numéricos'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, validarCodigoRecuperacion);

  /**
   * POST /api/auth/recovery/reset
   * Resetear contraseña usando código de recuperación
   * ZTA: Al cambiar password se revocan TODAS las sesiones
   */
  fastify.post('/recovery/reset', {
    schema: {
      description: 'Resetear contraseña (ZTA: revoca todas las sesiones)',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'codigo', 'nuevaPassword'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            description: 'Email del usuario'
          },
          codigo: { 
            type: 'string', 
            pattern: '^\\d{6}$',
            description: 'Código de 6 dígitos numéricos'
          },
          nuevaPassword: { 
            type: 'string', 
            minLength: 8,
            description: 'Nueva contraseña (mín 8 chars, 1 mayúscula, 1 minúscula, 1 número)'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, resetearPassword);

  /**
   * GET /api/auth/status
   * Verifica el token y devuelve datos del usuario (para Navbar)
   */
  fastify.get('/status', {
    preHandler: [verifyJWT], // <-- PROTEGIDO
    schema: {
      description: 'Verificar token y obtener estado de sesión (B-07)',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Token válido, usuario autenticado',
          type: 'object',
          properties: {
            autenticado: { type: 'boolean' },
            usuario: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                email: { type: 'string' },
                rol: { type: 'string' },
                nombre: { type: 'string' },
                profileComplete: { type: 'boolean' }
              }
            }
          }
        },
        401: {
          description: 'Token inválido o expirado',
          type: 'object', // <-- Faltaba esto
          properties: {  // <-- Y esto
            error: { type: 'string' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, obtenerStatus);

}