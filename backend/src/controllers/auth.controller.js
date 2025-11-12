import Usuario from '../models/Usuario.js';
import CodigoRecuperacion from '../models/CodigoRecuperacion.js';

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Validar política de contraseñas
function validarPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

// Validar formato email
function validarEmail(email) {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
}

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
                mensaje: 'Formato de email inválido o no está activo'
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
// ENDPOINT: INICIAR SESIÓN (B-04)
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
        console.log('request.server.jwt existe?', !!request.server.jwt);

        // Generar token JWT
        const token = request.server.jwt.sign({
            sub: usuario._id.toString(),
            rol: usuario.rol
        }, {
            expiresIn: '24h'
        });

        console.log('Token generado:', token ? 'SÍ' : 'NO');
        console.log('Token:', token);

        // Ver si el perfil está completo (adelanto para B-06)
        const profileComplete = false;

        const respuesta = {
            exito: true,
            accessToken: token,
            rol: usuario.rol,
            profileComplete
        };
        
        console.log('Enviando respuesta:', JSON.stringify(respuesta));

        // Responder con el token
        return reply.code(200).send(respuesta);

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        console.error('Stack:', error.stack);
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Ingresa un email válido'
            });
        }

        // Validar formato código (6 dígitos)
        if (!/^\d{6}$/.test(codigo)) {
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
// ENDPOINT: RESETEAR CONTRASEÑA (B-05)
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'Ingresa un email válido'
            });
        }

        // Validar formato código (6 dígitos)
        if (!/^\d{6}$/.test(codigo)) {
            return reply.code(400).send({
                exito: false,
                mensaje: 'El código debe ser de 6 dígitos'
            });
        }

        // Delegar al modelo
        const exito = await CodigoRecuperacion.resetearPasswordConCodigo(
            email,
            codigo,
            nuevaPassword
        );
        
        if (exito) {
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