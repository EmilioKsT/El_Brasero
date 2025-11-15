import {
  obtenerProductos,
  obtenerProductoPorId
} from '../controllers/producto.controller.js';

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

  console.log('Rutas de productos (PÚBLICAS) registradas:');
  console.log('   GET  /api/productos (Público)');
  console.log('   GET  /api/productos/:id (Público)');
 }