// ============================================
// CONTROLADOR: PERFIL DE USUARIO
// ============================================
// B-06: Obtener y editar perfil (protegido con JWT)

import Usuario from '../models/Usuario.js';

/**
 * GET /api/auth/perfil
 * Obtener datos del perfil del usuario autenticado
 */
export const obtenerPerfil = async (request, reply) => {
  try {
    // request.user viene del middleware verifyJWT
    // Contiene: { sub: usuarioId, rol: 'user'|'admin', exp: timestamp }
    const usuarioId = request.user.sub;
    
    console.log(`Obteniendo perfil del usuario: ${usuarioId}`);
    
    // Buscar usuario por ID
    const usuario = await Usuario.findById(usuarioId);
    
    if (!usuario) {
      console.log(`Usuario no encontrado: ${usuarioId}`);
      return reply.code(404).send({
        error: 'No encontrado',
        mensaje: 'Usuario no existe'
      });
    }
    
    // Calcular si el perfil está completo
    const profileComplete = usuario.perfilCompleto();
    
    console.log(`Perfil obtenido exitosamente`);
    console.log(`Nombre: ${usuario.nombre || '(sin completar)'}`);
    console.log(`Perfil completo: ${profileComplete}`);
    
    // Devolver datos del perfil (sin password)
    return reply.code(200).send({
      _id: usuario._id,
      email: usuario.email,
      nombre: usuario.nombre,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      comuna: usuario.comuna,
      rol: usuario.rol,
      profileComplete,
      createdAt: usuario.createdAt
    });
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al obtener perfil'
    });
  }
};

/**
 * PUT /api/auth/perfil
 * Actualizar datos del perfil del usuario autenticado
 */
export const actualizarPerfil = async (request, reply) => {
  try {
    const usuarioId = request.user.sub;
    const { nombre, telefono, direccion, comuna } = request.body;
    
    console.log(`📝 Actualizando perfil del usuario: ${usuarioId}`);
    console.log(`   Datos recibidos:`, { nombre, telefono, direccion, comuna });
    
    // Buscar usuario
    const usuario = await Usuario.findById(usuarioId);
    
    if (!usuario) {
      console.log(`Usuario no encontrado: ${usuarioId}`);
      return reply.code(404).send({
        error: 'No encontrado',
        mensaje: 'Usuario no existe'
      });
    }
    
    // Validación manual adicional (Mongoose ya valida por el schema)
    if (nombre !== undefined && nombre.trim().length < 2) {
      return reply.code(400).send({
        error: 'Validación fallida',
        mensaje: 'El nombre debe tener mínimo 2 caracteres'
      });
    }
    
    if (telefono !== undefined && !/^[0-9]{9,11}$/.test(telefono)) {
      return reply.code(400).send({
        error: 'Validación fallida',
        mensaje: 'Ingresa un teléfono válido (9-11 dígitos)'
      });
    }
    
    if (direccion !== undefined && direccion.trim().length < 5) {
      return reply.code(400).send({
        error: 'Validación fallida',
        mensaje: 'La dirección debe tener mínimo 5 caracteres'
      });
    }
    
    // Actualizar usando el método del modelo
    const usuarioActualizado = await usuario.actualizarPerfil({
      nombre,
      telefono,
      direccion,
      comuna
    });
    
    // Calcular nuevo estado de profileComplete
    const profileComplete = usuarioActualizado.perfilCompleto();
    
    console.log(`Perfil actualizado exitosamente`);
    console.log(`Nuevo nombre: ${usuarioActualizado.nombre}`);
    console.log(`Perfil completo: ${profileComplete}`);
    
    return reply.code(200).send({
      exito: true,
      mensaje: 'Datos actualizados',
      usuario: {
        _id: usuarioActualizado._id,
        email: usuarioActualizado.email,
        nombre: usuarioActualizado.nombre,
        telefono: usuarioActualizado.telefono,
        direccion: usuarioActualizado.direccion,
        comuna: usuarioActualizado.comuna,
        rol: usuarioActualizado.rol,
        profileComplete
      }
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
    
    console.error('Error al actualizar perfil:', error);
    return reply.code(500).send({
      error: 'Error del servidor',
      mensaje: 'Error al actualizar perfil'
    });
  }
};