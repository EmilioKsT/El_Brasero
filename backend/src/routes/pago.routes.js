import { iniciarPago, confirmarPagoWebPay } from '../controllers/pago.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

export default async function pagoRoutes(fastify, options) {
  
  // [B-13] POST /api/pagos/iniciar - Iniciar transacción WebPay
  fastify.post('/iniciar', {
    preHandler: [verifyJWT], // Protegido por ZTA
    schema: {
      description: 'Iniciar transacción de pago con WebPay Plus',
      tags: ['Pagos'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['orderId'],
        properties: {
          orderId: { 
            type: 'string',
            description: 'ID del pedido a pagar'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            exito: { type: 'boolean' },
            url: { 
              type: 'string',
              description: 'URL de WebPay para redirigir al usuario'
            },
            token: { 
              type: 'string',
              description: 'Token de la transacción'
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            mensaje: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            mensaje: { type: 'string' }
          }
        }
      }
    }
  }, iniciarPago);

  // [B-13] POST/GET /api/pagos/confirmar-webpay - Callback de WebPay
  fastify.post('/confirmar-webpay', {
    schema: {
      description: 'Callback de confirmación de WebPay (POST)',
      tags: ['Pagos'],
      body: {
        type: 'object',
        properties: {
          token_ws: { 
            type: 'string',
            description: 'Token de WebPay'
          }
        }
      }
    }
  }, confirmarPagoWebPay);

  fastify.get('/confirmar-webpay', {
    schema: {
      description: 'Callback de confirmación de WebPay (GET)',
      tags: ['Pagos'],
      querystring: {
        type: 'object',
        properties: {
          token_ws: { 
            type: 'string',
            description: 'Token de WebPay'
          }
        }
      }
    }
  }, confirmarPagoWebPay);
}