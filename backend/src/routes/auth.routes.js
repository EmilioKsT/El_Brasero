import {
  registrarUsuario,
  iniciarSesion,
  solicitarRecuperacion,      // NUEVO
  validarCodigoRecuperacion,  // NUEVO
  resetearPassword            // NUEVO
} from '../controllers/auth.controller.js';

export default async function authRoutes(fastify, options) {
  
  // ============================================
  // RUTAS EXISTENTES (B-03, B-04)
  // ============================================
  
  // POST /api/auth/register - Registrar usuario
  fastify.post('/register', {
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

  // POST /api/auth/login - Iniciar sesión
  fastify.post('/login', {
    schema: {
      description: 'Iniciar sesión y obtener JWT',
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
  // RUTAS NUEVAS - RECUPERACIÓN DE CONTRASEÑA (B-05)
  // ============================================

  /**
   * POST /api/auth/recovery/request
   * Solicitar código de recuperación de contraseña
   * SIEMPRE responde 200 OK (respuesta genérica por seguridad)
   */
  fastify.post('/recovery/request', {
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
   * Valida el código y actualiza la contraseña
   */
  fastify.post('/recovery/reset', {
    schema: {
      description: 'Resetear contraseña usando código de recuperación',
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

}