// ============================================
// RUTAS: PERFIL DE USUARIO
// ============================================
// B-06: Rutas protegidas para gestión de perfil

import { obtenerPerfil, actualizarPerfil } from '../controllers/perfil.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

/**
 * Registrar rutas de perfil en Fastify
 * Todas las rutas están protegidas con JWT
 */
export default async function perfilRoutes(fastify, options) {
  
  // =========================================
  // GET /api/auth/perfil - Obtener perfil
  // =========================================
  fastify.get('/perfil', {
    preHandler: [verifyJWT], // Middleware: requiere token válido
    schema: {
      description: 'Obtener datos del perfil del usuario autenticado',
      tags: ['Perfil'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Perfil obtenido exitosamente',
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            nombre: { type: 'string' },
            telefono: { type: 'string' },
            direccion: { type: 'string' },
            comuna: { type: 'string' },
            rol: { type: 'string', enum: ['user', 'admin'] },
            profileComplete: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        401: {
          description: 'Token inválido o expirado',
          type: 'object',
          properties: {
            error: { type: 'string' },
            mensaje: { type: 'string' }
          }
        },
        404: {
          description: 'Usuario no encontrado',
          type: 'object',
          properties: {
            error: { type: 'string' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, obtenerPerfil);
  
  // =========================================
  // PUT /api/auth/perfil - Actualizar perfil
  // =========================================
  fastify.put('/perfil', {
    preHandler: [verifyJWT], // Middleware: requiere token válido
    schema: {
      description: 'Actualizar datos del perfil del usuario autenticado',
      tags: ['Perfil'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          nombre: { 
            type: 'string',
            minLength: 2,
            maxLength: 100
          },
          telefono: { 
            type: 'string',
            pattern: '^[0-9]{9,11}$'
          },
          direccion: { 
            type: 'string',
            minLength: 5,
            maxLength: 200
          },
          comuna: { 
            type: 'string',
            maxLength: 100
          }
        },
        // Al menos un campo debe venir
        minProperties: 1
      },
      response: {
        200: {
          description: 'Perfil actualizado exitosamente',
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' },
            usuario: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                email: { type: 'string' },
                nombre: { type: 'string' },
                telefono: { type: 'string' },
                direccion: { type: 'string' },
                comuna: { type: 'string' },
                rol: { type: 'string' },
                profileComplete: { type: 'boolean' }
              }
            }
          }
        },
        400: {
          description: 'Validación fallida',
          type: 'object',
          properties: {
            error: { type: 'string' },
            mensaje: { type: 'string' }
          }
        },
        401: {
          description: 'Token inválido o expirado',
          type: 'object',
          properties: {
            error: { type: 'string' },
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, actualizarPerfil);
}