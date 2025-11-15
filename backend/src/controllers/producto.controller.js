import Producto from '../models/Productos.js';

// === LÓGICA DE ADMIN MOVIDA A admin.controller.js ===
// Se eliminan: crearProducto, actualizarProducto, eliminarProducto
// Esas funciones ahora están en admin.controller.js para cumplir con B-16
// ===

/**
 * [PÚBLICO] GET /api/productos
 * Obtener todos los productos (con filtros para el catálogo B-09)
 */
export const obtenerProductos = async (request, reply) => {
  try {
    // 1. Extraer los query parameters
    const { q, categoria, min, max } = request.query;

    // 2. Construir el objeto de consulta (filtro)
    const query = {};

    // Filtro de búsqueda por texto (q)
    if (q) {
      // 'i' significa case-insensitive (ignora mayúsculas/minúsculas)
      query.nombre = new RegExp(q, 'i'); 
    }

    // Filtro por categoría
    if (categoria) {
      query.categoria = categoria;
    }

    // Filtro por rango de precio
    if (min || max) {
      query.precio = {};
      // $gte = greater than or equal (mayor o igual)
      if (min) {
        query.precio.$gte = parseInt(min, 10);
      }
      // $lte = less than or equal (menor o igual)
      if (max) {
        query.precio.$lte = parseInt(max, 10);
      }
    }

    console.log('Filtrando productos (público) con:', query);

    // 3. Ejecutar la consulta con los filtros
    const productos = await Producto.find(query)
                                    .sort({ categoria: 1, nombre: 1 });
    
    return reply.code(200).send(productos);
    
  } catch (error) {
    console.error('Error al obtener productos (público):', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al obtener los productos'
    });
  }
};

/**
 * [PÚBLICO] GET /api/productos/:id
 * Obtener un producto por ID (para la pág. de detalle B-10)
 */
export const obtenerProductoPorId = async (request, reply) => {
  try {
    const { id } = request.params;
    
    const producto = await Producto.findById(id);
    
    if (!producto) {
      return reply.code(404).send({
        error: 'No encontrado',
        mensaje: 'Producto no encontrado'
      });
    }
    
    return reply.code(200).send(producto);
    
  } catch (error) {
    console.error('Error al obtener producto por ID (público):', error);
    if (error.name === 'CastError') {
      return reply.code(404).send({
        error: 'ID inválido',
        mensaje: 'Producto no encontrado'
      });
    }
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al obtener el producto'
    });
  }
};