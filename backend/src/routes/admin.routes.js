import {
  obtenerPedidosAdmin,
  actualizarEstadoPedido,
  crearAdmin,
  obtenerProductosAdmin,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerDashboard
} from '../controllers/admin.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

export default async function adminRoutes(fastify, options) {

  // Aplicar ZTA (JWT + Rol Admin) a TODAS las rutas de este archivo
  fastify.addHook('preHandler', verifyJWT);
  fastify.addHook('preHandler', verifyAdmin);  
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
  

  // GET /api/admin/productos (Listar productos para el admin)
  fastify.get('/productos', {
    schema: {
      description: 'Obtener lista de productos (Admin B-16)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }]
    }
  }, obtenerProductosAdmin);

  // POST /api/admin/productos (Crear producto)
  fastify.post('/productos', {
    schema: {
      description: 'Crear un producto (Admin B-16)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }]
      // Aquí iría el schema del body para validar la entrada
    }
  }, crearProducto);

  // PUT /api/admin/productos/:id (Actualizar producto)
  fastify.put('/productos/:id', {
    schema: {
      description: 'Actualizar un producto (Admin B-16)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: { 
        type: 'object',
        properties: {
          id: { type: 'string' , description: 'ID del producto' } }
      }
      // Aquí iría el schema del body para validar la entrada
    }
  }, actualizarProducto);

  // DELETE /api/admin/productos/:id (Eliminar producto)
  fastify.delete('/productos/:id', {
    schema: {
      description: 'Eliminar un producto (Admin B-16)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: { 
        type: 'object',
        properties: {
          id: { type: 'string' , description: 'ID del producto' } }
      }
    }
  }, eliminarProducto);

  fastify.get('/dashboard', {
    schema: {
      description: 'Obtener KPIs y actividad para el dashboard (Admin)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }]
    }
  }, obtenerDashboard);
  
}