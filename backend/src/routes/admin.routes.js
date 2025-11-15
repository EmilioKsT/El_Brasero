import {
  obtenerPedidosAdmin,
  actualizarEstadoPedido,
  crearAdmin
} from '../controllers/admin.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

export default async function adminRoutes(fastify, options) {

  // Aplicar ZTA (JWT + Rol Admin) a TODAS las rutas de este archivo
  fastify.addHook('preHandler', verifyJWT);
  fastify.addHook('preHandler', verifyAdmin);  
  console.log('Rutas de ADMIN (/api/admin) registradas:');

  // === B-17: Rutas de Pedidos ===
  
  // GET /api/admin/pedidos (Listar todos los pedidos)
  fastify.get('/pedidos', {
    schema: {
      description: 'Obtener todos los pedidos (Admin B-17)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }]
    }
  }, obtenerPedidosAdmin);
  
  // PUT /api/admin/pedidos/:id/estado (Actualizar estado)
  fastify.put('/pedidos/:id/estado', {
    schema: {
      description: 'Actualizar estado de un pedido (Admin B-17)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      body: {
        type: 'object',
        required: ['nuevoEstado'],
        properties: {
          nuevoEstado: { type: 'string' }
        }
      }
    }
  }, actualizarEstadoPedido);
  
  console.log('   GET  /api/admin/pedidos');
  console.log('   PUT  /api/admin/pedidos/:id/estado');

  // === Nueva Feature: Crear Admin ===

  // POST /api/admin/crear-admin
  fastify.post('/crear-admin', {
    schema: {
      description: 'Crear una nueva cuenta de Admin (Solo Admins)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, crearAdmin);
  
  console.log('   POST /api/admin/crear-admin');
}