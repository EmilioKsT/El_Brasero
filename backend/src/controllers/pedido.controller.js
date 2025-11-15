import Pedido from '../models/Pedido.js';
import Carrito from '../models/Carrito.js';
import Producto from '../models/Productos.js'; // Necesario para 'populate'

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
    // Usamos populate para tener los datos del producto (precio, nombre)
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
    // (Lógica similar a formatAndCalculateCart de B-11)
    
    let totalCalculado = 0;
    const itemsSnapshot = [];

    for (const item of carrito.items) {
      if (!item.producto) continue; // Si el producto fue borrado, lo saltamos

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
      estado: 'Pendiente de pago', // Estado inicial [cite: 29]
      // Datos del formulario
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

    // 6. Responder con el ID del pedido (como pide el DoR) 
    return reply.code(200).send({
      exito: true,
      orderId: nuevoPedido._id // El frontend usará esto para B-13 (Pago)
    });

  } catch (error) {
    console.error('Error al confirmar pedido:', error);
    if (error.name === 'ValidationError') {
        return reply.code(400).send({ mensaje: 'Datos del pedido inválidos', error: error.message });
    }
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};