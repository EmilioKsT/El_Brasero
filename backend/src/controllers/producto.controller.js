import Producto from '../models/Productos.js';

/**
 * [ADMIN] POST /api/productos
 * Crear un nuevo producto
 */
export const crearProducto = async (request, reply) => {
  try {
    // request.body ya está validado (en un futuro) por el schema de Fastify,
    // pero Mongoose también validará.
    const nuevoProducto = new Producto(request.body);
    await nuevoProducto.save();
    
    console.log(`📦 Producto creado: ${nuevoProducto.nombre} (ID: ${nuevoProducto._id})`);
    
    return reply.code(201).send({
      exito: true,
      mensaje: 'Producto creado exitosamente',
      producto: nuevoProducto
    });
    
  } catch (error) {
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      console.log(`Error de validación:`, mensajes);
      
      return reply.code(400).send({
        error: 'Validación fallida',
        mensaje: mensajes[0] || 'Datos inválidos'
      });
    }
    
    console.error('Error al crear producto:', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al crear el producto'
    });
  }
};

/**
 * [PÚBLICO] GET /api/productos
 * Obtener todos los productos (para el catálogo)
 */
export const obtenerProductos = async (request, reply) => {
  try {
    // Por ahora, listamos todos.
    // En el futuro, aquí iría la lógica de filtrado y paginación.
    const productos = await Producto.find()
                            .sort({ categoria: 1, nombre: 1 });
                            
    return reply.code(200).send(productos);
    
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al obtener los productos'
    });
  }
};

/**
 * [PÚBLICO] GET /api/productos/:id
 * Obtener un producto por ID (para la pág. de detalle)
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
    console.error('Error al obtener producto por ID:', error);
    // Error común si el ID tiene formato inválido
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

/**
 * [ADMIN] PUT /api/productos/:id
 * Actualizar un producto
 */
export const actualizarProducto = async (request, reply) => {
  try {
    const { id } = request.params;
    
    const producto = await Producto.findByIdAndUpdate(
      id,
      request.body,
      { 
        new: true, // Devuelve el documento actualizado
        runValidators: true // Corre las validaciones del schema al actualizar
      }
    );
    
    if (!producto) {
      return reply.code(404).send({
        error: 'No encontrado',
        mensaje: 'Producto no encontrado'
      });
    }
    
    console.log(`📦 Producto actualizado: ${producto.nombre}`);
    
    return reply.code(200).send({
      exito: true,
      mensaje: 'Producto actualizado exitosamente',
      producto
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return reply.code(400).send({
        error: 'Validación fallida',
        mensaje: mensajes[0] || 'Datos inválidos'
      });
    }
    console.error('Error al actualizar producto:', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al actualizar el producto'
    });
  }
};

/**
 * [ADMIN] DELETE /api/productos/:id
 * Eliminar un producto
 */
export const eliminarProducto = async (request, reply) => {
  try {
    const { id } = request.params;
    
    const producto = await Producto.findByIdAndDelete(id);
    
    if (!producto) {
      return reply.code(404).send({
        error: 'No encontrado',
        mensaje: 'Producto no encontrado'
      });
    }
    
    console.log(`📦 Producto eliminado: ${producto.nombre}`);
    
    return reply.code(200).send({
      exito: true,
      mensaje: 'Producto eliminado exitosamente',
      productoId: id
    });
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    if (error.name === 'CastError') {
      return reply.code(404).send({
        error: 'ID inválido',
        mensaje: 'Producto no encontrado'
      });
    }
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al eliminar el producto'
    });
  }
};