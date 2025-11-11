import Usuario from '../models/Usuario.js';

//validar política de contraseñas
function validarPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

//validar formato email
function validarEmail(email) {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
}

//POST /api/auth/register
export const registrarUsuario = async (request, reply) => {
    try {
        const { email, password } = request.body;

        //Validar que los datos estén
        if (!email || !password) {
            return reply.status(400).send({ 
                exito: false,
                message: 'Email y contraseña son obligatorios'
            });
        }

        //Validar formato email
        if (!validarEmail(email)) {
            return reply.status(400).send({ 
                exito: false,
                message: 'Formato de email inválido o no está activo'
            });
        }

        //Validar política de contraseñas
        if (!validarPassword(password)) {
            return reply.status(400).send({
                exito: false,
                message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
            });
        }

        //Verificar si el email ya existe
        const usuarioExistente = await Usuario.findOne({ email});
        if (usuarioExistente) {
            return reply.status(409).send({
                exito: false,
                message: 'El email ya está en uso'
            });
        }

        //Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            email,
            passwordHash: password
        });

        await nuevoUsuario.save();

        //Responder con éxito
        return reply.status(201).send({
            exito: true,
            message: 'Usuario registrado exitosamente, porfavor iniciar sesión',
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        //manejar error de duplicado de mongoDB
        if (error.code === 11000) {
            return reply.status(409).send({
                exito: false,
                message: 'El email ya está en uso'
            });
        }

        return reply.status(500).send({
            exito: false,
            message: 'Error interno del servidor'
        });
    }
};
