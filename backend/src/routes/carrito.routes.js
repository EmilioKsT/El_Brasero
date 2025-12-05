import { 
  obtenerResumen,
  obtenerCarrito,
  agregarOActualizarItem,
  eliminarItem,
  vaciarCarrito
} from '../controllers/carrito.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function carritoRoutes(fastify, options) {
  
  // [B-07] Endpoint para el Badge del Navbar
  fastify.get('/resumen', {
    preHandler: [verifyJWT],
    schema: {
      description: 'Obtener resumen de ítems en carrito (B-07)',
      tags: ['Carrito'],
      security: [{ bearerAuth: [] }]
    }
  }, obtenerResumen);

  // [B-11] Obtener el carrito completo
  fastify.get('/', {
    preHandler: [verifyJWT],
    schema: {
      description: 'Obtener carrito completo (B-11)',
      tags: ['Carrito'],
      security: [{ bearerAuth: [] }]
    }
  }, obtenerCarrito);

  // [B-11] Agregar o actualizar un item
  fastify.post('/items', {
    preHandler: [verifyJWT],
    schema: {
      description: 'Agregar o actualizar item en carrito (B-11)',
      tags: ['Carrito'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['productoId', 'cantidad'],
        properties: {
          productoId: { type: 'string' },
          cantidad: { type: 'number', minimum: 1, maximum: 10 }
        }
      }
    }
  }, agregarOActualizarItem);

  // [B-11] Eliminar un item específico
  fastify.delete('/items/:productoId', {
    preHandler: [verifyJWT],
    schema: {
      description: 'Eliminar un item del carrito (B-11)',
      tags: ['Carrito'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          productoId: { type: 'string' }
        }
      }
    }
  }, eliminarItem);

  // [B-11] Vaciar el carrito
  fastify.delete('/', {
    preHandler: [verifyJWT],
    schema: {
      description: 'Vaciar el carrito (B-11)',
      tags: ['Carrito'],
      security: [{ bearerAuth: [] }]
    }
  }, vaciarCarrito);
  
}