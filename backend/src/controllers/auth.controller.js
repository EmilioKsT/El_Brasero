import Usuario from '../models/Usuario.js';
import CodigoRecuperacion from '../models/CodigoRecuperacion.js';
import RefreshToken from '../models/RefreshToken.js';
import crypto from 'crypto';
import { validarEmail, validarPassword, validarCodigoRecuperacion as validarFormatoCodigo } from '../helpers/validators.js';

// ============================================
// ENDPOINT: REGISTRAR USUARIO (B-03)
// ============================================

// POST /api/auth/register
export const registrarUsuario = async (request, reply) => {
    try {
        const { email, password } = request.body;

        // Validar que los datos estén
        if (!email || !password) {
            return reply.code(400).send({ 
                exito: false,
                mensaje: 'Email y contraseña son obligatorios'
            });
        }

        // Validar formato email
        if (!validarEmail(email)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Formato de email inválido'
            });
        }

        // Validar política de contraseñas
        if (!validarPassword(password)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
            });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return reply.code(409).send({
                exito: false,
                mensaje: 'El email ya está en uso'
            });
        }

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            email,
            passwordHash: password
        });

        await nuevoUsuario.save();

        // Responder con éxito
        return reply.code(201).send({
            exito: true,
            mensaje: 'Usuario registrado exitosamente, por favor iniciar sesión'
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        // Manejar error de duplicado de MongoDB
        if (error.code === 11000) {
            return reply.code(409).send({
                exito: false,
                mensaje: 'El email ya está en uso'
            });
        }

        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// ============================================
// ENDPOINT: INICIAR SESIÓN (B-04) - CON ZTA
// ============================================

// POST /api/auth/login
export const iniciarSesion = async (request, reply) => {
    try {
        const { email, password } = request.body;

        // Validar que los datos estén
        if (!email || !password) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Email y contraseña son obligatorios'
            });
        }

        // Buscar usuario por email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return reply.code(401).send({
                exito: false,
                mensaje: 'Credenciales inválidas'
            });
        }

        // Verificar si la cuenta está activa
        if (!usuario.activo) {
            return reply.code(403).send({
                exito: false,
                mensaje: 'La cuenta está desactivada. Contacta al administrador.'
            });
        }

        // Comparar contraseñas
        const passwordValida = await usuario.compararPassword(password);
        if (!passwordValida) {
            return reply.code(401).send({
                exito: false,
                mensaje: 'Credenciales inválidas'
            });
        }

        console.log('Usuario autenticado:', usuario.email);

        // ===== ZTA: GENERAR TOKENS ===== ← NUEVO
        
        // 1. Access Token (corto, 15 minutos)
        const accessToken = request.server.jwt.sign({
            sub: usuario._id.toString(),
            rol: usuario.rol
        }, {
            expiresIn: '15m'  // ← CAMBIO: era 24h, ahora 15m
        });

        // 2. Refresh Token (largo, 7 días) - almacenado en BD ← NUEVO
        const refreshTokenValue = crypto.randomBytes(64).toString('hex');
        
        const refreshToken = new RefreshToken({
            tokenValue: refreshTokenValue,
            usuarioId: usuario._id,
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        });
        
        await refreshToken.save();
        
        console.log('   Access Token: 15m');
        console.log('   Refresh Token: 7d (ID:', refreshToken._id, ')');

        // Ver si el perfil está completo (adelanto para B-06)
        const profileComplete = usuario.perfilCompleto ? usuario.perfilCompleto() : false;

        // Responder con AMBOS tokens ← CAMBIO
        return reply.code(200).send({
            exito: true,
            accessToken,
            refreshToken: refreshTokenValue,  // ← NUEVO
            rol: usuario.rol,
            profileComplete
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// ============================================
// ENDPOINT: RENOVAR ACCESS TOKEN (B-04) - NUEVO
// ============================================

// POST /api/auth/refresh
export const renovarToken = async (request, reply) => {
    try {
        const { refreshToken } = request.body;

        if (!refreshToken) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'El refresh token es obligatorio'
            });
        }

        console.log('Intentando renovar token...');

        // ZTA: Verificar que el refresh token sea válido
        const tokenValido = await RefreshToken.isValid(refreshToken);

        if (!tokenValido) {
            console.log('Refresh token inválido o revocado');
            return reply.code(401).send({
                exito: false,
                mensaje: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
            });
        }

        // Generar nuevo access token
        const nuevoAccessToken = request.server.jwt.sign({
            sub: tokenValido.usuarioId._id.toString(),
            rol: tokenValido.usuarioId.rol
        }, {
            expiresIn: '15m'
        });

        console.log('Token renovado para usuario:', tokenValido.usuarioId._id);

        return reply.code(200).send({
            exito: true,
            accessToken: nuevoAccessToken
        });

    } catch (error) {
        console.error('Error al renovar token:', error);
        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// ============================================
// ENDPOINT: LOGOUT (B-04) - NUEVO
// ============================================

// POST /api/auth/logout
export const logout = async (request, reply) => {
    try {
        const { refreshToken } = request.body;

        if (!refreshToken) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'El refresh token es obligatorio'
            });
        }

        console.log('🚪 Intentando logout...');

        // Buscar y revocar el token
        const token = await RefreshToken.findOne({ tokenValue: refreshToken });

        if (token) {
            await token.revoke();
            console.log('Logout exitoso - Token revocado');
        }

        return reply.code(200).send({
            exito: true,
            mensaje: 'Sesión cerrada exitosamente'
        });

    } catch (error) {
        console.error('Error en logout:', error);
        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// ============================================
// ENDPOINT: LOGOUT ALL (B-04) - NUEVO
// ============================================

// POST /api/auth/logout-all
export const logoutAll = async (request, reply) => {
    try {
        // request.user viene del middleware verifyJWT
        const usuarioId = request.user.sub;

        console.log('Cerrando todas las sesiones del usuario:', usuarioId);

        // ZTA: Revocar TODOS los tokens del usuario
        const tokensRevocados = await RefreshToken.revokeAllByUser(usuarioId);

        console.log(`${tokensRevocados} sesiones cerradas`);

        return reply.code(200).send({
            exito: true,
            mensaje: 'Todas las sesiones han sido cerradas',
            sesionesRevocadas: tokensRevocados
        });

    } catch (error) {
        console.error('Error en logout all:', error);
        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// ============================================
// ENDPOINT: SOLICITAR RECUPERACIÓN (B-05)
// ============================================

// POST /api/auth/recovery/request
export const solicitarRecuperacion = async (request, reply) => {
    try {
        const { email } = request.body;

        // Validar campo obligatorio
        if (!email) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'El email es obligatorio'
            });
        }

        // Validar formato email
        if (!validarEmail(email)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Ingresa un email válido'
            });
        }

        // Delegar al modelo
        await CodigoRecuperacion.solicitarParaEmail(email);

        // SIEMPRE respuesta genérica (seguridad)
        return reply.code(200).send({
            exito: true,
            mensaje: 'Si existe una cuenta, te enviaremos un correo con instrucciones'
        });

    } catch (error) {
        console.error('Error en solicitarRecuperacion:', error);
        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// ============================================
// ENDPOINT: VALIDAR CÓDIGO (B-05)
// ============================================

// POST /api/auth/recovery/validate
export const validarCodigoRecuperacion = async (request, reply) => {
    try {
        const { email, codigo } = request.body;

        // Validar campos obligatorios
        if (!email || !codigo) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Email y código son obligatorios'
            });
        }

        // Validar formato email
        if (!validarEmail(email)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Ingresa un email válido'
            });
        }

        // Validar formato código (6 dígitos)
        if (!validarFormatoCodigo(codigo)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'El código debe ser de 6 dígitos'
            });
        }

        // Delegar al modelo
        const esValido = await CodigoRecuperacion.validarParaEmail(email, codigo);
        
        if (esValido) {
            return reply.code(200).send({
                exito: true,
                mensaje: 'Código válido'
            });
        } else {
            return reply.code(401).send({
                exito: false,
                mensaje: 'Código inválido o expirado'
            });
        }

    } catch (error) {
        console.error('Error en validarCodigoRecuperacion:', error);
        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// ============================================
// ENDPOINT: RESETEAR CONTRASEÑA (B-05) - CON ZTA
// ============================================

// POST /api/auth/recovery/reset
export const resetearPassword = async (request, reply) => {
    try {
        const { email, codigo, nuevaPassword } = request.body;

        // Validar campos obligatorios
        if (!email || !codigo || !nuevaPassword) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Email, código y nueva contraseña son obligatorios'
            });
        }

        // Validar formato email
        if (!validarEmail(email)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Ingresa un email válido'
            });
        }

        // Validar formato código (6 dígitos)
        if (!validarFormatoCodigo(codigo)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'El código debe ser de 6 dígitos'
            });
        }

        // Delegar al modelo
        const resultado = await CodigoRecuperacion.resetearPasswordConCodigo(
            email,
            codigo,
            nuevaPassword
        );
        
        if (resultado) {
            // ===== ZTA: REVOCAR TODAS LAS SESIONES ===== ← NUEVO
            // Por seguridad, al cambiar password se cierran todas las sesiones
            const usuario = await Usuario.findOne({ email });
            if (usuario) {
                await RefreshToken.revokeAllByUser(usuario._id);
                console.log('🔒 Todas las sesiones revocadas por cambio de password');
            }

            return reply.code(200).send({
                exito: true,
                mensaje: 'Contraseña actualizada correctamente'
            });
        } else {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Código inválido o expirado'
            });
        }

    } catch (error) {
        console.error('Error en resetearPassword:', error);
        
        // Error específico de validación de contraseña
        if (error.message && error.message.includes('no cumple los requisitos')) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'La contraseña no cumple los requisitos: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número'
            });
        }

        return reply.code(500).send({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};