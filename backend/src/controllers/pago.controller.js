import Pedido from '../models/Pedido.js';

/**
 * [B-13 SIMULADO] POST /api/pagos/simular
 * Simula el procesamiento de un pago y actualiza el estado del pedido.
 */
export const simularPago = async (request, reply) => {
  try {
    const usuarioId = request.user.sub; // Protegido por ZTA
    const { orderId, resultadoSimulacion } = request.body;

    if (!orderId || !resultadoSimulacion) {
      return reply.code(400).send({ mensaje: 'orderId y resultadoSimulacion son requeridos' });
    }

    // 1. Buscar el pedido
    const pedido = await Pedido.findOne({
      _id: orderId,
      usuario: usuarioId // ZTA: Asegura que el usuario solo pague SUS pedidos
    });

    if (!pedido) {
      return reply.code(404).send({ mensaje: 'Pedido no encontrado o no pertenece al usuario' });
    }

    // 2. Verificar estado (solo se puede pagar si está 'Pendiente de pago')
    if (pedido.estado !== 'Pendiente de pago') {
      return reply.code(400).send({ 
        mensaje: 'Este pedido ya fue procesado',
        estado: pedido.estado 
      });
    }

    // 3. Simular el resultado
    if (resultadoSimulacion === 'exito') {
      // Escenario 1: Pago exitoso 
      pedido.estado = 'Pagado'; // <-- ¡El cambio de estado!
      await pedido.save();
      
      console.log(`✅ Pago (simulado) exitoso para Pedido ${pedido._id}`);
      
      return reply.code(200).send({
        exito: true,
        mensaje: 'Pago simulado exitoso',
        estado: pedido.estado
      });
      
    } else {
      // Escenario 2: Pago fallido
      console.log(`❌ Pago (simulado) fallido para Pedido ${pedido._id}`);
      
      return reply.code(400).send({
        exito: false,
        mensaje: 'Pago simulado rechazado',
        estado: pedido.estado // Sigue 'Pendiente de pago'
      });
    }

  } catch (error) {
    console.error('Error en simularPago:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};