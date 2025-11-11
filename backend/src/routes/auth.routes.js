import { registrarUsuario } from "../controllers/auth.controller.js";

async function authRoutes(fastify, options) {

    //POST /api/auth/register
    fastify.post('/register', {
        schema: {
            description: 'Registrar nuevo usuario',
            tags: ['auth'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email'},
                    password: { type: 'string', minLength: 8 }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        exito: { type: 'boolean' },
                        mensaje: { type: 'string' }
                    }
                }
            }
        }

    }, registrarUsuario);
    
    //POST
}

export default authRoutes;