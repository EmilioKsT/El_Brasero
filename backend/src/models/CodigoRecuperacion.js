import mongoose from "mongoose";
import crypto from "crypto";

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
// Elimina 1 hora después de la fecha de expiración
codigoRecuperacionSchema.index(
  { fechaExpiracion: 1 }, 
  { expireAfterSeconds: 3600 }
);

//Atributos estáticos
const EXPIRACION_MINUTOS = 15; // Tiempo de validez del código
const LONGITUD_CODIGO = 6;     // Código de 6 dígitos


//Métodos de instancia y estáticos
codigoRecuperacionSchema.methods.isValid = function() {
  const ahora = new Date();
  return !this.usado && this.fechaExpiracion > ahora;
};

codigoRecuperacionSchema.statics.generarCodigo = function() {
  // Usar crypto para generación criptográficamente segura
  const bytes = crypto.randomBytes(3); // 3 bytes = 24 bits
  const numeroAleatorio = parseInt(bytes.toString('hex'), 16);
  const codigo = numeroAleatorio % 1000000; // Obtener número entre 0-999999
  return codigo.toString().padStart(6, '0'); // Asegurar 6 dígitos con padding
};

codigoRecuperacionSchema.statics.calcularExpiracion = function() {
  const expiracion = new Date();
  expiracion.setMinutes(expiracion.getMinutes() + EXPIRACION_MINUTOS);
  return expiracion;
};


//SOLICITAR CODIGO DE RECUPERACION
codigoRecuperacionSchema.statics.solicitarParaEmail = async function(email) {
  try {
    // 0. Normalizar entrada
    const emailNormalizado = email.trim().toLowerCase();
    
    // 1. Buscar usuario por email
    const Usuario = mongoose.model('Usuario');
    const usuario = await Usuario.findOne({ email: emailNormalizado });
    
    // Si no existe el usuario, responder genéricamente
    if (!usuario) {
      console.log(`⚠️  Email ${emailNormalizado} - De existir el usuario se enviará un código de recuperación.`);
      return true; 
    }
        
    // 2. Invalidar códigos anteriores del usuario (marcar como usados)
    await this.updateMany(
      { 
        usuarioId: usuario._id, 
        usado: false 
      },
      { 
        usado: true 
      }
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
    
    // 5. Enviar email (MOCK - en producción usar Nodemailer)
    console.log('');
    console.log('📧 ============================================');
    console.log('📧 [MOCK EMAIL] Código de recuperación enviado');
    console.log('📧 ============================================');
    console.log(`📧 Para: ${emailNormalizado}`);
    console.log(`📧 Código: ${codigo}`);
    console.log(`📧 Válido hasta: ${fechaExpiracion.toLocaleString('es-CL')}`);
    console.log(`📧 Expira en: ${EXPIRACION_MINUTOS} minutos`);
    console.log('📧 ============================================');
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('Error en solicitarParaEmail:', error);
    throw error;
  }
};

//VERIFICAR CODIGO DE RECUPERACION
codigoRecuperacionSchema.statics.validarParaEmail = async function(email, codigo) {
    try {
        // 0. Normalizar entrada (trim y lowercase)
        const emailNormalizado = email.trim().toLowerCase();
        const codigoNormalizado = codigo.trim();
        
        // 1. Buscar usuario
        const Usuario = mongoose.model('Usuario');
        const usuario = await Usuario.findOne({ email: emailNormalizado });
        
        if (!usuario) {
            console.log(`⚠️  Validación fallida: usuario ${emailNormalizado} no existe`);
            return false;
        }
        
        // 2. Buscar código
        const codigoDoc = await this.findOne({
            codigo: codigoNormalizado,
            usuarioId: usuario._id,
            usado: false  // Solo códigos no usados
        });
        
        if (!codigoDoc) {
            console.log(`⚠️  Validación fallida: código ${codigoNormalizado} no encontrado o ya usado para ${emailNormalizado}`);
            return false;
        }
        
        // 3. Verificar validez (no expirado) usando método de instancia
        const esValido = codigoDoc.isValid();
        
        if (!esValido) {
            console.log(`⚠️  Validación fallida: código ${codigoNormalizado} expirado para ${emailNormalizado}`);
            console.log(`    Fecha expiración: ${codigoDoc.fechaExpiracion.toLocaleString('es-CL')}`);
            console.log(`    Fecha actual: ${new Date().toLocaleString('es-CL')}`);
            return false;
        }
        
        // 4. Todo OK - Código válido
        console.log(`✅ Código ${codigoNormalizado} VÁLIDO para ${emailNormalizado}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error en validarParaEmail:', error);
        return false;  // En caso de error, retornar false (no throw)
    }
};

codigoRecuperacionSchema.statics.resetearPasswordConCodigo = async function(
    email, 
    codigo, 
    nuevaPassword
) {
    try {
        // 0. Normalizar entrada
        const emailNormalizado = email.trim().toLowerCase();
        const codigoNormalizado = codigo.trim();
        const passwordNormalizada = nuevaPassword.trim();
        
        // 1. Buscar usuario
        const Usuario = mongoose.model('Usuario');
        const usuario = await Usuario.findOne({ email: emailNormalizado });
    
        if (!usuario) {
            console.log(`⚠️  Reset fallido: usuario ${emailNormalizado} no existe`);
            return false;
        }
    
        // 2. Buscar y validar código
        const codigoDoc = await this.findOne({
            codigo: codigoNormalizado,
            usuarioId: usuario._id,
            usado: false
        });
    
        if (!codigoDoc) {
            console.log(`⚠️  Reset fallido: código ${codigoNormalizado} no encontrado o ya usado`);
            return false;
        }
    
        if (!codigoDoc.isValid()) {
            console.log(`⚠️  Reset fallido: código ${codigoNormalizado} expirado`);
            console.log(`    Fecha expiración: ${codigoDoc.fechaExpiracion.toLocaleString('es-CL')}`);
            console.log(`    Fecha actual: ${new Date().toLocaleString('es-CL')}`);
            return false;
        }
    
        // 3. Validar política de contraseña
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordPolicy.test(passwordNormalizada)) {
            throw new Error('La contraseña no cumple los requisitos: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número');
        }
    
        // 4. Actualizar contraseña (el pre-save hook de Usuario la hasheará)
        usuario.passwordHash = passwordNormalizada;
        await usuario.save();
    
        // 5. Marcar código como usado
        codigoDoc.usado = true;
        await codigoDoc.save();
    
        console.log('');
        console.log('✅ ============================================');
        console.log(`✅ Contraseña actualizada exitosamente para ${emailNormalizado}`);
        console.log(`✅ Código ${codigoNormalizado} marcado como usado`);
        console.log('✅ ============================================');
        console.log('');
    
        return true;
    
    } catch (error) {
        console.error('❌ Error en resetearPasswordConCodigo:', error);
    
        // Re-lanzar errores de validación de contraseña
        if (error.message.includes('no cumple los requisitos')) {
            throw error;
        }
    
        return false;
    }
};

const CodigoRecuperacion = mongoose.model('CodigoRecuperacion', codigoRecuperacionSchema);
export default CodigoRecuperacion;

