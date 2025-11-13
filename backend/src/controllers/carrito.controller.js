import Carrito from '../models/Carrito.js';
import Producto from '../models/Productos.js'; // Necesitamos Producto para los precios

/**
 * Helper: Busca o crea un carrito para el usuario
 */
const getOrCreateCarrito = async (usuarioId) => {
  let carrito = await Carrito.findOne({ usuario: usuarioId });
  if (!carrito) {
    carrito = new Carrito({ usuario: usuarioId, items: [] });
    await carrito.save();
  }
  return carrito;
};

/**
 * Helper: Formatea y calcula el carrito
 * (Popula productos, calcula subtotales y total)
 */
const formatAndCalculateCart = async (carrito) => {
  // 1. Traer los datos de los productos
  await carrito.populate({
    path: 'items.producto',
    model: 'Producto',
    select: 'nombre precio imagenUrl' // Solo los campos necesarios
  });

  let totalCalculado = 0;
  
  // 2. Calcular subtotales
  const itemsFormateados = carrito.items.map(item => {
    if (!item.producto) return null; // Si el producto fue borrado
    
    const subtotal = item.producto.precio * item.cantidad;
    totalCalculado += subtotal;
    
    return {
      producto: item.producto._id,
      nombre: item.producto.nombre,
      imagenUrl: item.producto.imagenUrl,
      precio: item.producto.precio,
      cantidad: item.cantidad,
      subtotal: subtotal
    };
  }).filter(item => item !== null); // Limpiar nulos
  
  return {
    _id: carrito._id,
    usuario: carrito.usuario,
    items: itemsFormateados,
    total: totalCalculado,
    totalItems: carrito.calcularTotalItems()
  };
};

// ============================================
// ENDPOINTS DE LA API (B-11 y B-07)
// ============================================

/**
 * [B-07] GET /api/carrito/resumen
 * (Lo creamos aquí para que B-11 funcione y B-07 se desbloquee)
 */
export const obtenerResumen = async (request, reply) => {
  try {
    const usuarioId = request.user.sub;
    const carrito = await Carrito.findOne({ usuario: usuarioId });
    
    if (!carrito) {
      return reply.code(200).send({ totalItems: 0 });
    }
    
    const totalItems = carrito.calcularTotalItems();
    return reply.code(200).send({ totalItems });
    
  } catch (error) {
    console.error('Error al obtener resumen de carrito:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};

/**
 * [B-11] GET /api/carrito
 * Obtener el carrito completo (para la página /carrito)
 */
export const obtenerCarrito = async (request, reply) => {
  try {
    const usuarioId = request.user.sub;
    const carrito = await getOrCreateCarrito(usuarioId);
    const carritoCalculado = await formatAndCalculateCart(carrito);
    return reply.code(200).send(carritoCalculado);
    
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};

/**
 * [B-11] POST /api/carrito/items
 * Agregar o actualizar un item en el carrito
 */
export const agregarOActualizarItem = async (request, reply) => {
  try {
    const usuarioId = request.user.sub;
    const { productoId, cantidad } = request.body;

    if (!productoId || !cantidad) {
      return reply.code(400).send({ mensaje: 'productoId y cantidad son requeridos' });
    }
    
    const cantNum = parseInt(cantidad, 10);
    if (isNaN(cantNum) || cantNum < 1 || cantNum > 10) {
      return reply.code(400).send({ mensaje: 'La cantidad debe ser un número entre 1 y 10' });
    }
    
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return reply.code(404).send({ mensaje: 'Producto no encontrado' });
    }
    
    const carrito = await getOrCreateCarrito(usuarioId);
    const itemExistente = carrito.items.find(
      (item) => item.producto.toString() === productoId
    );
    
    if (itemExistente) {
      itemExistente.cantidad = cantNum;
    } else {
      carrito.items.push({ producto: productoId, cantidad: cantNum });
    }
    
    await carrito.save();
    
    const carritoCalculado = await formatAndCalculateCart(carrito);
    return reply.code(200).send(carritoCalculado);

  } catch (error) {
    console.error('Error al agregar/actualizar item:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};

/**
 * [B-11] DELETE /api/carrito/items/:productoId
 * Eliminar un item del carrito
 */
export const eliminarItem = async (request, reply) => {
  try {
    const usuarioId = request.user.sub;
    const { productoId } = request.params;
    
    const carrito = await getOrCreateCarrito(usuarioId);
    
    await carrito.updateOne({ $pull: { items: { producto: productoId } } });
    
    const carritoActualizado = await Carrito.findById(carrito._id);
    const carritoCalculado = await formatAndCalculateCart(carritoActualizado);
    return reply.code(200).send(carritoCalculado);
    
  } catch (error) {
    console.error('Error al eliminar item:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};

/**
 * [B-11] DELETE /api/carrito
 * Vaciar el carrito (eliminar todos los items)
 */
export const vaciarCarrito = async (request, reply) => {
  try {
    const usuarioId = request.user.sub;
    const carrito = await getOrCreateCarrito(usuarioId);
    
    carrito.items = [];
    await carrito.save();
    
    const carritoCalculado = await formatAndCalculateCart(carrito);
    return reply.code(200).send(carritoCalculado);
    
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};