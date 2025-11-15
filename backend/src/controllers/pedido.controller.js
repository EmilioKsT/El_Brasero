import Pedido from '../models/Pedido.js';
import Carrito from '../models/Carrito.js';
import Producto from '../models/Productos.js';

/**
 * [B-12] POST /api/pedidos/confirmar
 * Crea un pedido a partir del carrito y los datos del formulario
 */
export const confirmarPedido = async (request, reply) => {
  try {
    const usuarioId = request.user.sub; // Viene del token JWT
    const { nombre, telefono, direccion, comuna } = request.body;

    // 1. Validar datos del formulario
    if (!nombre || !telefono || !direccion || !comuna) {
      return reply.code(400).send({ mensaje: 'Todos los datos del cliente son requeridos' });
    }

    // 2. Obtener el carrito del usuario
    const carrito = await Carrito.findOne({ usuario: usuarioId })
      .populate({
        path: 'items.producto',
        model: 'Producto',
        select: 'nombre precio'
      });

    if (!carrito || carrito.items.length === 0) {
      return reply.code(404).send({ mensaje: 'Tu carrito está vacío' });
    }

    // 3. Recalcular total y crear el "snapshot" de items
    let totalCalculado = 0;
    const itemsSnapshot = [];

    for (const item of carrito.items) {
      if (!item.producto) continue;

      // Validar disponibilidad del producto antes de confirmar
      const productoActual = await Producto.findById(item.producto._id);
      if (!productoActual || !productoActual.disponible) {
        return reply.code(400).send({
          mensaje: `El producto "${item.producto.nombre}" ya no está disponible`
        });
      } 

      const subtotal = item.producto.precio * item.cantidad;
      totalCalculado += subtotal;
      
      itemsSnapshot.push({
        producto: item.producto._id,
        nombre: item.producto.nombre,
        precioUnitario: item.producto.precio,
        cantidad: item.cantidad,
        subtotal: subtotal
      });
    }
    
    if (itemsSnapshot.length === 0) {
        return reply.code(400).send({ mensaje: 'No hay productos válidos en el carrito' });
    }

    // 4. Crear el nuevo pedido
    const nuevoPedido = new Pedido({
      usuario: usuarioId,
      items: itemsSnapshot,
      total: totalCalculado,
      estado: 'Pendiente de pago', 
      nombreCliente: nombre,
      telefono: telefono,
      direccion: direccion,
      comuna: comuna
    });
    
    await nuevoPedido.save();

    // 5. Vaciar el carrito
    carrito.items = [];
    await carrito.save();
    
    console.log(`✅ Pedido ${nuevoPedido._id} creado para usuario ${usuarioId}`);

    // 6. Responder con el ID del pedido
    return reply.code(200).send({
      exito: true,
      orderId: nuevoPedido._id 
    });

  } catch (error) {
    console.error('Error al confirmar pedido:', error);
    if (error.name === 'ValidationError') {
        return reply.code(400).send({ mensaje: 'Datos del pedido inválidos', error: error.message });
    }
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};


/**
 * [B-14] GET /api/pedidos/confirmacion/:orderId
 * Obtiene los datos de un pedido para la página de confirmación.
 * Protegido por ZTA: solo devuelve el pedido si coincide con el usuario logueado.
 */
export const obtenerConfirmacion = async (request, reply) => {
  try {
    const usuarioId = request.user.sub; // De verifyJWT
    const { orderId } = request.params;  // ID desde el parámetro de ruta

    // ZTA: Buscar el pedido por ID Y que además pertenezca al usuario del token.
    const pedido = await Pedido.findOne({
      _id: orderId,
      usuario: usuarioId
    });

    // Si no hay pedido (o no le pertenece)
    if (!pedido) {
      return reply.code(404).send({ mensaje: 'Pedido no encontrado' });
    }
    
    // Éxito
    return reply.code(200).send({
      pedido: {
        id: pedido._id,
        fecha: pedido.createdAt, // Usamos 'createdAt' del timestamp
        cliente: pedido.nombreCliente,
        total: pedido.total,
        items: pedido.items // Ya tenemos el snapshot de B-12
      }
    });

  } catch (error) {
    console.error('Error al obtener confirmación:', error);
    // Manejar CastError si el orderId tiene formato inválido
    if (error.name === 'CastError') {
      return reply.code(404).send({ mensaje: 'Pedido no encontrado (ID inválido)' });
    }
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};