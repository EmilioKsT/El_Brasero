import Pedido from '../models/Pedido.js';
import Usuario from '../models/Usuario.js';
import Producto from '../models/Productos.js';
import { validarEmail, validarPassword } from '../helpers/validators.js';

// ============================================
// B-17: GESTIÓN DE PEDIDOS
// ============================================

/**
 * [B-17] GET /api/admin/pedidos
 * Obtiene todos los pedidos para el panel de admin.
 */
export const obtenerPedidosAdmin = async (request, reply) => {
  try {
    // Buscamos todos los pedidos, ordenados por más reciente
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    
    // NOTA: El DoR B-17 pide formato CLP[cite: 315]. 
    // Es mejor que el frontend formatee esto. El backend solo entrega los números.
    return reply.code(200).send(pedidos);

  } catch (error) {
    console.error('Error al obtener pedidos de admin:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};

/**
 * [B-17] PUT /api/admin/pedidos/:id/estado
 * Actualiza el estado de un pedido específico.
 */
export const actualizarEstadoPedido = async (request, reply) => {
  try {
    const { id } = request.params;
    const { nuevoEstado } = request.body;

    const pedido = await Pedido.findById(id);
    if (!pedido) {
      return reply.code(404).send({ mensaje: 'Pedido no encontrado' });
    }

    const estadoAnterior = pedido.estado;

    // === REGLAS DE NEGOCIO (DoR B-17) ===

    // Regla AC 4: No se puede anular si no está 'Pendiente' [cite: 324-325]
    if (nuevoEstado === 'Anulado' && estadoAnterior !== 'Pendiente de pago') {
      return reply.code(400).send({ 
        mensaje: 'No se puede anular un pedido que ya está en preparación' 
      });
    }

    // Regla AC 8 (Opcional pero recomendada): No se puede revertir un estado final [cite: 337]
    if (estadoAnterior === 'Entregado' || estadoAnterior === 'Anulado') {
      return reply.code(400).send({ 
        mensaje: `No se puede cambiar el estado de un pedido que ya fue ${estadoAnterior.toLowerCase()}` 
      });
    }

    // === Fin Reglas ===

    pedido.estado = nuevoEstado;
    await pedido.save();
    
    console.log(`Estado de Pedido ${id} actualizado: ${estadoAnterior} -> ${nuevoEstado}`);
    
    return reply.code(200).send({
      exito: true,
      mensaje: 'Estado actualizado',
      pedido
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};
// 

// ============================================
// NUEVA FEATURE: GESTIÓN DE USUARIOS (ADMIN)
// ============================================

/**
 * [NUEVO] POST /api/admin/crear-admin
 * Permite a un admin existente crear una nueva cuenta de admin.
 */
export const crearAdmin = async (request, reply) => {
  try {
    const { email, password } = request.body;

    // 1. Validar entradas
    if (!validarEmail(email) || !validarPassword(password)) {
      return reply.code(400).send({
        exito: false,
        mensaje: 'Email o contraseña no cumplen con los requisitos'
      });
    }

    // 2. Verificar si ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return reply.code(409).send({
        exito: false,
        mensaje: 'El email ya está en uso'
      });
    }

    // 3. Crear el nuevo usuario FORZANDO el rol 'admin'
    const nuevoAdmin = new Usuario({
      email,
      passwordHash: password,
      rol: 'admin' // <-- Aquí está la clave
    });

    await nuevoAdmin.save();
    
    console.log(`Un admin ha creado una nueva cuenta admin: ${email}`);

    // No devolvemos tokens, solo confirmamos la creación
    return reply.code(201).send({
      exito: true,
      mensaje: 'Cuenta de administrador creada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear admin:', error);
    return reply.code(500).send({ error: 'Error interno del servidor' });
  }
};

/**
 * [B-16] GET /api/admin/productos
 * Obtiene todos los productos (sin filtros) para el panel de admin.
 */
export const obtenerProductosAdmin = async (request, reply) => {
  try {
    const productos = await Producto.find().sort({ categoria: 1, nombre: 1 });
    return reply.code(200).send(productos);
  } catch (error) {
    console.error('Error al obtener productos de admin:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};

/**
 * [B-16] POST /api/admin/productos
 * (Movido desde producto.controller.js)
 */
export const crearProducto = async (request, reply) => {
  try {
    const nuevoProducto = new Producto(request.body);
    await nuevoProducto.save();
    
    console.log(`[Admin] Producto creado: ${nuevoProducto.nombre}`);
    
    return reply.code(201).send({
      exito: true,
      mensaje: 'Producto creado exitosamente',
      producto: nuevoProducto
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return reply.code(400).send({
        error: 'Validación fallida',
        mensaje: mensajes[0] || 'Datos inválidos'
      });
    }
    console.error('Error al crear producto (admin):', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al crear el producto'
    });
  }
};

/**
 * [B-16] PUT /api/admin/productos/:id
 * (Movido desde producto.controller.js)
 */
export const actualizarProducto = async (request, reply) => {
  try {
    const { id } = request.params;
    
    const producto = await Producto.findByIdAndUpdate(
      id,
      request.body,
      { new: true, runValidators: true }
    );
    
    if (!producto) {
      return reply.code(404).send({
        error: 'No encontrado',
        mensaje: 'Producto no encontrado'
      });
    }
    
    console.log(`[Admin] Producto actualizado: ${producto.nombre}`);
    
    return reply.code(200).send({
      exito: true,
      mensaje: 'Producto actualizado exitosamente',
      producto
    });
    
  } catch (error) {
    // ... (manejo de errores idéntico al de crearProducto) ...
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return reply.code(400).send({
        error: 'Validación fallida',
        mensaje: mensajes[0] || 'Datos inválidos'
      });
    }
    console.error('Error al actualizar producto (admin):', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al actualizar el producto'
    });
  }
};

/**
 * [B-16] DELETE /api/admin/productos/:id
 * (Movido desde producto.controller.js)
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
    
    console.log(`[Admin] Producto eliminado: ${producto.nombre}`);
    
    return reply.code(200).send({
      exito: true,
      mensaje: 'Producto eliminado exitosamente',
      productoId: id
    });
    
  } catch (error) {
    // ... (manejo de errores idéntico) ...
    console.error('Error al eliminar producto (admin):', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al eliminar el producto'
    });
  }
};

/**
 * [B-15] GET /api/admin/dashboard
 * Obtiene KPIs y actividad reciente real para el dashboard.
 */
export const obtenerDashboard = async (request, reply) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del día actual

    // 1. KPI: Pedidos de Hoy
    const pedidosHoy = await Pedido.countDocuments({
      createdAt: { $gte: hoy }
    });

    // 2. KPI: Ventas de Hoy (Suma de total de pedidos pagados/entregados hoy)
    const resultadoVentas = await Pedido.aggregate([
      { 
        $match: { 
          createdAt: { $gte: hoy },
          estado: { $in: ['Pagado', 'En preparación', 'Despachado', 'Entregado'] } // Solo ventas válidas
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalVentas: { $sum: "$total" } 
        } 
      }
    ]);
    const ventasHoy = resultadoVentas.length > 0 ? resultadoVentas[0].totalVentas : 0;

    // 3. KPI: En Cocina (Pedidos "En preparación")
    const enCocina = await Pedido.countDocuments({
      estado: 'En preparación'
    });

    // 4. Actividad Reciente (Últimos 5 pedidos)
    const ultimosPedidos = await Pedido.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('estado nombreCliente total createdAt'); // Solo campos necesarios

    return reply.code(200).send({
      kpis: {
        pedidosHoy,
        ventasHoy,
        enCocina
      },
      actividad: ultimosPedidos
    });

  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    return reply.code(500).send({ error: 'Error del servidor' });
  }
};