import Producto from '../models/Productos.js';

export const obtenerProductos = async (request, reply) => {
  try {
    // 1. Obtener parámetros de paginación (con valores por defecto)
    // Page 1, 8 productos por página si no se especifica nada
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Filtros existentes (búsqueda, categoría, precio)
    const { q, categoria, min, max } = request.query;
    const query = {};
    if (q) query.nombre = new RegExp(q, 'i');
    if (categoria && categoria !== 'Todas') query.categoria = categoria;
    if (min || max) {
      query.precio = {};
      if (min) query.precio.$gte = parseInt(min);
      if (max) query.precio.$lte = parseInt(max);
    }
    
    // 2. Consultar productos con paginación y filtros
    const [productos, total] = await Promise.all([
      Producto.find(query)
        .sort({ categoria: 1, nombre: 1 })
        .skip(skip)
        .limit(limit),
      Producto.countDocuments(query)
    ]);

    const totalPaginas = Math.ceil(total / limit);

    // 3. Responder con metadatos de paginación
    return reply.code(200).send({
      productos,
      paginacion: {
        total,
        page,
        limit,
        totalPaginas
      }
    });
    
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
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