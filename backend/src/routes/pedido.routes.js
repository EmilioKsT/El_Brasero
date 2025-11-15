import { confirmarPedido, obtenerConfirmacion } from '../controllers/pedido.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function pedidoRoutes(fastify, options) {

  // [B-12] Confirmar datos y crear pedido
  fastify.post('/confirmar', {
    preHandler: [verifyJWT], // Ruta protegida
    schema: {
      description: 'Confirmar datos de checkout y crear un pedido (B-12)',
      tags: ['Pedidos'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['nombre', 'telefono', 'direccion', 'comuna'],
        properties: {
          nombre: { type: 'string' },
          telefono: { type: 'string' },
          direccion: { type: 'string' },
          comuna: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            orderId: { type: 'string' }
          }
        }
      }
    }
  }, confirmarPedido);

  
  // [B-14] Obtener datos de confirmación
  fastify.get('/confirmacion/:orderId', {
    preHandler: [verifyJWT], // ¡Protegido por ZTA!
    schema: {
      description: 'Obtener datos de un pedido para la confirmación (B-14)',
      tags: ['Pedidos'],
      security: [{ bearerAuth: [] }],
      params: { // Usamos 'params' para el :orderId
        type: 'object',
        required: ['orderId'],
        properties: {
          orderId: { type: 'string', description: 'ID del pedido' }
        }
      },
      response: {
        200: {
          description: 'Datos del pedido',
          type: 'object',
          properties: {
            pedido: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                fecha: { type: 'string', format: 'date-time' },
                cliente: { type: 'string' },
                total: { type: 'number' },
                items: { type: 'array' }
              }
            }
          }
        }
      }
    }
  }, obtenerConfirmacion);
  

  console.log('Rutas de pedidos registradas:');
  console.log('   POST /api/pedidos/confirmar (Protegido)');
  console.log('   GET  /api/pedidos/confirmacion/:orderId (Protegido)');
}