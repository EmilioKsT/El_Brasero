// ============================================
// MIDDLEWARE: AUTENTICACIÓN CON ZTA
// ============================================
import Usuario from '../models/Usuario.js';
import RefreshToken from '../models/RefreshToken.js';

export const verifyJWT = async (request, reply) => {
  try {
    // PASO 1: Verificar JWT
    await request.jwtVerify();
    const { sub: usuarioId } = request.user;
    
    // PASO 2: Verificar usuario existe y activo
    const usuario = await Usuario.findById(usuarioId);
    
    if (!usuario) {
      console.log(`Usuario ${usuarioId} no existe`);
      return reply.code(401).send({
        error: 'Sesión inválida',
        mensaje: 'Usuario no encontrado'
      });
    }
    
    if (!usuario.activo) {
      console.log(`Usuario ${usuarioId} desactivado`);
      return reply.code(401).send({
        error: 'Cuenta desactivada',
        mensaje: 'Tu cuenta ha sido desactivada'
      });
    }
    
    // PASO 3: Verificar tiene al menos 1 token válido
    const tieneTokenValido = await RefreshToken.findOne({
      usuarioId: usuario._id,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tieneTokenValido) {
      console.log(`Sin tokens válidos`);
      return reply.code(401).send({
        error: 'Sesión revocada',
        mensaje: 'Tu sesión ha sido cerrada. Inicia sesión nuevamente.'
      });
    }
    
    console.log(`Usuario ${usuarioId} verificado`);
    request.usuario = usuario;
    
  } catch (error) {
    console.log(`Token inválido: ${error.message}`);
    return reply.code(401).send({
      error: 'No autorizado',
      mensaje: 'Token inválido o expirado'
    });
  }
};

export const verifyAdmin = async (request, reply) => {
  // Validar que el usuario esté autenticado primero
  if (!request.user) {
    return reply.code(401).send({
      error: 'No autorizado',
      mensaje: 'Debes iniciar sesión primero'
    });
  }

  // Validar que sea admin
  if (request.user.rol !== 'admin') {
    return reply.code(403).send({
      error: 'Acceso denegado',
      mensaje: 'No tienes permisos de administrador'
    });
  }
};