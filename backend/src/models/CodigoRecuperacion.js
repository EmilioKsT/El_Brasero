import mongoose from "mongoose";
import { enviarCodigoRecuperacion } from '../helpers/email.service.js'; // <--- 1. IMPORTAMOS EL SERVICIO REAL

const codigoRecuperacionSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        length: 6,
        match: /^\d{6}$/,
    },
    usuarioId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    },
    fechaExpiracion: {
        type: Date,
        required: true,
    },
    usado: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

// Índice compuesto para búsquedas rápidas
codigoRecuperacionSchema.index({ codigo: 1, usuarioId: 1 });

// Índice TTL - MongoDB elimina automáticamente documentos expirados
codigoRecuperacionSchema.index(
  { fechaExpiracion: 1 }, 
  { expireAfterSeconds: 3600 }
);

// Atributos estáticos
const EXPIRACION_MINUTOS = 15;
const LONGITUD_CODIGO = 6;

// Métodos de instancia y estáticos
codigoRecuperacionSchema.methods.isValid = function() {
  const ahora = new Date();
  return !this.usado && this.fechaExpiracion > ahora;
};

codigoRecuperacionSchema.statics.generarCodigo = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

codigoRecuperacionSchema.statics.calcularExpiracion = function() {
  const expiracion = new Date();
  expiracion.setMinutes(expiracion.getMinutes() + EXPIRACION_MINUTOS);
  return expiracion;
};

// SOLICITAR CODIGO DE RECUPERACION
codigoRecuperacionSchema.statics.solicitarParaEmail = async function(email) {
  try {
    // 0. Normalizar entrada
    const emailNormalizado = email.trim().toLowerCase();
    
    // 1. Buscar usuario por email
    const Usuario = mongoose.model('Usuario');
    const usuario = await Usuario.findOne({ email: emailNormalizado });
    
    // Si no existe el usuario, responder genéricamente (seguridad)
    if (!usuario) {
      console.log(`Email ${emailNormalizado} no encontrado - Se simula envío.`);
      return true; 
    }
        
    // 2. Invalidar códigos anteriores del usuario
    await this.updateMany(
      { usuarioId: usuario._id, usado: false },
      { usado: true }
    );
    
    // 3. Generar nuevo código
    const codigo = this.generarCodigo();
    const fechaExpiracion = this.calcularExpiracion();
    
    // 4. Guardar en BD
    await this.create({
      codigo,
      usuarioId: usuario._id,
      fechaExpiracion,
      usado: false
    });
    
    // 5. ENVIAR EMAIL REAL (Aquí estaba el console.log antes)
    console.log(`Intentando enviar correo a: ${emailNormalizado}...`);
    
    // Llamamos a la función real que conecta con Gmail
    const enviado = await enviarCodigoRecuperacion(emailNormalizado, codigo);
    
    if (enviado) {
        console.log(`Correo enviado correctamente a ${emailNormalizado}`);
    } else {
        console.error(`Falló el envío del correo a ${emailNormalizado}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error en solicitarParaEmail:', error);
    throw error;
  }
};

// VERIFICAR CODIGO DE RECUPERACION
codigoRecuperacionSchema.statics.validarParaEmail = async function(email, codigo) {
    try {
        const emailNormalizado = email.trim().toLowerCase();
        const codigoNormalizado = codigo.trim();
        
        const Usuario = mongoose.model('Usuario');
        const usuario = await Usuario.findOne({ email: emailNormalizado });
        
        if (!usuario) return false;
        
        const codigoDoc = await this.findOne({
            codigo: codigoNormalizado,
            usuarioId: usuario._id,
            usado: false
        });
        
        if (!codigoDoc) return false;
        
        const esValido = codigoDoc.isValid();
        
        if (!esValido) {
            console.log(`Código expirado para ${emailNormalizado}`);
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('Error en validarParaEmail:', error);
        return false;
    }
};

codigoRecuperacionSchema.statics.resetearPasswordConCodigo = async function(email, codigo, nuevaPassword) {
    try {
        const emailNormalizado = email.trim().toLowerCase();
        const codigoNormalizado = codigo.trim();
        const passwordNormalizada = nuevaPassword.trim();
        
        const Usuario = mongoose.model('Usuario');
        const usuario = await Usuario.findOne({ email: emailNormalizado });
    
        if (!usuario) return false;
    
        const codigoDoc = await this.findOne({
            codigo: codigoNormalizado,
            usuarioId: usuario._id,
            usado: false
        });
    
        if (!codigoDoc || !codigoDoc.isValid()) return false;
    
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPolicy.test(passwordNormalizada)) {
            throw new Error('La contraseña no cumple los requisitos');
        }
    
        usuario.passwordHash = passwordNormalizada;
        await usuario.save();
    
        codigoDoc.usado = true;
        await codigoDoc.save();
    
        return true;
    
    } catch (error) {
        console.error('Error en resetearPasswordConCodigo:', error);
        if (error.message.includes('requisitos')) throw error;
        return false;
    }
};

const CodigoRecuperacion = mongoose.model('CodigoRecuperacion', codigoRecuperacionSchema);
export default CodigoRecuperacion;