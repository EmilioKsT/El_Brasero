import Pedido from '../models/Pedido.js';
import pkg from 'transbank-sdk';
const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = pkg;
import { nanoid } from 'nanoid';

// Configuración de Transbank (Integración)
const tx = new WebpayPlus.Transaction(new Options(
  IntegrationCommerceCodes.WEBPAY_PLUS,
  IntegrationApiKeys.WEBPAY,
  Environment.Integration
));

/**
 * [B-13] POST /api/pagos/iniciar
 * Inicia la transacción en WebPay
 */
export const iniciarPago = async (request, reply) => {
  try {
    const { orderId } = request.body;
    const usuarioId = request.user.sub;

    const pedido = await Pedido.findOne({ _id: orderId, usuario: usuarioId });
    if (!pedido) {
      return reply.code(404).send({ mensaje: 'Pedido no encontrado' });
    }
    if (pedido.estado !== 'Pendiente de pago') {
      return reply.code(400).send({ mensaje: 'El pedido ya no está pendiente de pago' });
    }

    const buyOrder = `O-${nanoid(10)}-${pedido._id.toString().slice(-6)}`; 
    const sessionId = request.user.sub; 
    const amount = pedido.total; 
    const returnUrl = `http://localhost:3000/api/pagos/confirmar-webpay`;

    // Crear transacción en Transbank
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    // GUARDAR buyOrder, token y registrar intento
    pedido.buyOrder = buyOrder;
    pedido.transactionToken = response.token;
    
    // Registrar intento iniciado
    if (!pedido.paymentAttempts) {
      pedido.paymentAttempts = [];
    }
    pedido.paymentAttempts.push({
      timestamp: new Date(),
      status: 'initiated',
      buyOrder: buyOrder,
      token: response.token
    });
    
    await pedido.save();

    console.log(`Transacción iniciada. BuyOrder: ${buyOrder}, Token: ${response.token}`);

    return reply.code(200).send({
      exito: true,
      url: response.url,
      token: response.token
    });
  } catch (error) {
    console.error('Error al iniciar pago WebPay:', error);
    return reply.code(500).send({ error: 'Error al conectar con WebPay' });
  }
};

/**
 * [B-13] POST/GET /api/pagos/confirmar-webpay
 */
export const confirmarPagoWebPay = async (request, reply) => {
  try {
    const token = request.body?.token_ws || request.query?.token_ws;
    
    if (!token) {
      console.log("Pago anulado por el usuario");
      const urlFrontendError = `http://localhost/El_Brasero/front/pago.html?error=cancelado`;
      return reply.redirect(urlFrontendError);
    }

    // 1. Confirmar transacción
    const confirmacion = await tx.commit(token);
    
    console.log('Respuesta de Transbank:', JSON.stringify(confirmacion, null, 2));

    // 2. Validar éxito
    if (confirmacion.status === 'AUTHORIZED' && confirmacion.response_code === 0) {
      
      // BUSCAR POR buyOrder (único y confiable)
      const pedido = await Pedido.findOne({ 
        buyOrder: confirmacion.buy_order 
      });

      if (!pedido) {
        console.error(`Pago aprobado pero pedido no encontrado. BuyOrder: ${confirmacion.buy_order}`);
        const urlFrontendError = `http://localhost/El_Brasero/front/pago.html?error=pedido-no-encontrado`;
        return reply.redirect(urlFrontendError);
      }

      // Validaciones de seguridad adicionales
      if (pedido.estado !== 'Pendiente de pago') {
        console.error(`Pedido ya procesado. Estado: ${pedido.estado}`);
        
        // REGISTRAR INTENTO DUPLICADO
        if (!pedido.paymentAttempts) pedido.paymentAttempts = [];
        pedido.paymentAttempts.push({
          timestamp: new Date(),
          status: 'duplicate',
          buyOrder: confirmacion.buy_order,
          token: token,
          errorMessage: `Pedido ya en estado: ${pedido.estado}`
        });
        await pedido.save();
        
        const urlFrontendError = `http://localhost/El_Brasero/front/pago.html?error=ya-procesado`;
        return reply.redirect(urlFrontendError);
      }

      if (pedido.total !== confirmacion.amount) {
        console.error(`Monto no coincide. Esperado: ${pedido.total}, Recibido: ${confirmacion.amount}`);
        
        // REGISTRAR INTENTO CON MONTO INCORRECTO
        if (!pedido.paymentAttempts) pedido.paymentAttempts = [];
        pedido.paymentAttempts.push({
          timestamp: new Date(),
          status: 'amount_mismatch',
          buyOrder: confirmacion.buy_order,
          token: token,
          errorMessage: `Monto esperado: ${pedido.total}, recibido: ${confirmacion.amount}`
        });
        await pedido.save();
        
        const urlFrontendError = `http://localhost/El_Brasero/front/pago.html?error=monto-invalido`;
        return reply.redirect(urlFrontendError);
      }

      // Actualizar pedido
      pedido.estado = 'Pagado';
      pedido.transactionData = {
        authorizationCode: confirmacion.authorization_code,
        transactionDate: new Date(confirmacion.transaction_date),
        cardNumber: confirmacion.card_detail?.card_number,
        paymentTypeCode: confirmacion.payment_type_code,
        installmentsNumber: confirmacion.installments_number, 
        installmentsAmount: confirmacion.installments_amount,   
        balance: confirmacion.balance                           
      };
      
      // REGISTRAR INTENTO EXITOSO
      if (!pedido.paymentAttempts) pedido.paymentAttempts = [];
      pedido.paymentAttempts.push({
        timestamp: new Date(),
        status: 'authorized',
        buyOrder: confirmacion.buy_order,
        token: token
      });
      
      await pedido.save();
      
      console.log(`Pago WebPay ÉXITO. Orden: ${confirmacion.buy_order}, Pedido ID: ${pedido._id}, Auth: ${confirmacion.authorization_code}`);
      
      const urlFrontendExito = `http://localhost/El_Brasero/front/confirmacion.html?orderId=${pedido._id}`;
      return reply.redirect(urlFrontendExito);
    }

    // Si el pago fue rechazado
    console.log(`Pago WebPay rechazado. Status: ${confirmacion.status}, Code: ${confirmacion.response_code}`);
    
    // INTENTAR REGISTRAR EL RECHAZO (si encontramos el pedido)
    try {
      const pedido = await Pedido.findOne({ buyOrder: confirmacion.buy_order });
      if (pedido) {
        if (!pedido.paymentAttempts) pedido.paymentAttempts = [];
        pedido.paymentAttempts.push({
          timestamp: new Date(),
          status: 'rejected',
          buyOrder: confirmacion.buy_order,
          token: token,
          errorMessage: `Status: ${confirmacion.status}, Code: ${confirmacion.response_code}`
        });
        await pedido.save();
      }
    } catch (err) {
      console.error('Error registrando intento rechazado:', err);
    }
    
    const urlFrontendError = `http://localhost/El_Brasero/front/pago.html?error=rechazado`;
    return reply.redirect(urlFrontendError);

  } catch (error) {
    console.error('Error confirmando pago:', error);
    
    // INTENTAR REGISTRAR EL ERROR (si tenemos el token)
    try {
      const token = request.body?.token_ws || request.query?.token_ws;
      if (token) {
        // Buscar por token como último recurso
        const pedido = await Pedido.findOne({ transactionToken: token });
        if (pedido) {
          if (!pedido.paymentAttempts) pedido.paymentAttempts = [];
          pedido.paymentAttempts.push({
            timestamp: new Date(),
            status: 'error',
            token: token,
            errorMessage: error.message || 'Error desconocido'
          });
          await pedido.save();
        }
      }
    } catch (err) {
      console.error('Error registrando intento con error:', err);
    }
    
    const urlFrontendError = `http://localhost/El_Brasero/front/pago.html?error=error-servidor`;
    return reply.redirect(urlFrontendError);
  }
};