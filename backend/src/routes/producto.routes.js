import {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} from '../controllers/producto.controller.js';

// Importamos los middlewares de ZTA
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

export default async function productoRoutes(fastify, options) {

  // ============================================
  // RUTAS PÚBLICAS (Para el catálogo)
  // ============================================

  // GET /api/productos - Listar todos los productos
  fastify.get('/', {
    schema: {
      description: 'Obtener lista de productos (Público)',
      tags: ['Productos']
    }
  }, obtenerProductos);

  // GET /api/productos/:id - Ver detalle de un producto
  fastify.get('/:id', {
    schema: {
      description: 'Obtener un producto por ID (Público)',
      tags: ['Productos'],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de MongoDB' } }
      }
    }
  }, obtenerProductoPorId);

  // ============================================
  // RUTAS PROTEGIDAS (Solo Admin)
  // ============================================

  // POST /api/productos - Crear un nuevo producto
  fastify.post('/', {
    preHandler: [verifyJWT, verifyAdmin], // Requiere JWT válido + Rol Admin
    schema: {
      description: 'Crear un producto (Admin)',
      tags: ['Productos (Admin)'],
      security: [{ bearerAuth: [] }]
      // Aquí iría el schema del body para validar la entrada
    }
  }, crearProducto);

  // PUT /api/productos/:id - Actualizar un producto
  fastify.put('/:id', {
    preHandler: [verifyJWT, verifyAdmin], // Requiere JWT válido + Rol Admin
    schema: {
      description: 'Actualizar un producto (Admin)',
      tags: ['Productos (Admin)'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de MongoDB' } }
      }
    }
  }, actualizarProducto);

  // DELETE /api/productos/:id - Eliminar un producto
  fastify.delete('/:id', {
    preHandler: [verifyJWT, verifyAdmin], // Requiere JWT válido + Rol Admin
    schema: {
      description: 'Eliminar un producto (Admin)',
      tags: ['Productos (Admin)'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID de MongoDB' } }
      }
    }
  }, eliminarProducto);
  
  console.log('Rutas de productos registradas:');
  console.log('   GET  /api/productos (Público)');
  console.log('   GET  /api/productos/:id (Público)');
  console.log('   POST /api/productos (Admin)');
  console.log('   PUT  /api/productos/:id (Admin)');
  console.log('   DELETE /api/productos/:id (Admin)');
}