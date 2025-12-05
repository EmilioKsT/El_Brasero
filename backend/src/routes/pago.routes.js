import { simularPago } from '../controllers/pago.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function pagoRoutes(fastify, options) {

  // [B-13] Simular un pago
  fastify.post('/simular', {
    preHandler: [verifyJWT], // Protegido por ZTA
    schema: {
      description: 'Simular un pago (B-13)',
      tags: ['Pagos'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['orderId', 'resultadoSimulacion'],
        properties: {
          orderId: { type: 'string' },
          resultadoSimulacion: { type: 'string', enum: ['exito', 'fallo'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' },
            estado: { type: 'string' }
          }
        }
      }
    }
  }, simularPago);


}