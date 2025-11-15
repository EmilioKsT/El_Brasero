import { confirmarPedido } from '../controllers/pedido.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function pedidoRoutes(fastify, options) {

  // [B-12] Confirmar datos y crear pedido
  fastify.post('/confirmar', {
    preHandler: [verifyJWT], // Ruta protegida, necesita que el usuario esté logueado
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

  // Aquí irán futuras rutas de pedidos (ej: GET /api/pedidos/:id, GET /api/pedidos/mis-pedidos)
  
  console.log('Rutas de pedidos registradas:');
  console.log('   POST /api/pedidos/confirmar (Protegido)');
}