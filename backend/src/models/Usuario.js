import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UsuarioSchema = new mongoose.Schema({
    email: {
        type : String,
        required : [true, 'El email es obligatorio'],
        lowercase : true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido']
    },
    passwordHash: {
        type : String,
        required : [true, 'La contraseña es obligatoria']
    },
    emailVerificado: {
        type : Boolean,
        default : false
    },
    rol: {
        type : String,
        enum : ['user', 'admin'],
        default : 'user'
    },
    activo: {
	    type: Boolean,
	    default: true
    },

    //B06
    nombre: {
        type: String,
        trim: true,
        minlength: [2, 'El nombre debe tener mínimo 2 caracteres'],
        maxlength: [100, 'El nombre debe tener máximo 100 caracteres']
    },
    telefono: {
        type: String,
        trim: true,
        match: [/^[0-9]{9,11}$/, 'El teléfono debe tener entre 9 y 11 dígitos']
    },
    direccion: {
        type: String,
        trim: true,
        minlength: [5, 'La dirección debe tener mínimo 5 caracteres'],
        maxlength: [200, 'La dirección debe tener máximo 200 caracteres']
    },
    comuna: {
        type: String,
        trim: true,
        maxlength: [100, 'La comuna debe tener máximo 100 caracteres']  
    }
}, {
    timestamps : true
});

UsuarioSchema.index({ email: 1 }, { unique: true });

//Hashear contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});
//metodo para encontrar usuario por email
UsuarioSchema.statics.findByEmail = async function(email) {
  const emailNormalizado = email.trim().toLowerCase();
  return await this.findOne({ email: emailNormalizado });
};

//Método para verificar si existe un email
UsuarioSchema.statics.existeEmail = async function(email) {
  const emailNormalizado = email.trim().toLowerCase();
  const count = await this.countDocuments({ email: emailNormalizado });
  return count > 0;
};

//Método para comparar contraseñas
UsuarioSchema.methods.compararPassword = async function(passwordPlain) {
    return await bcrypt.compare(passwordPlain, this.passwordHash);
};

//Ocultar campos sensibles al convertir a JSON
UsuarioSchema.methods.toJSON = function() {
    const usuario = this.toObject();
    delete usuario.passwordHash;
    delete usuario.__v;
    return usuario; 
};

UsuarioSchema.methods.perfilCompleto = function() {
  return !!(
    this.nombre &&
    this.telefono &&
    this.direccion &&
    this.comuna
  );
};

UsuarioSchema.methods.actualizarPerfil = async function(datos) {
  // Solo actualizar campos que vengan en datos
  if (datos.nombre !== undefined) this.nombre = datos.nombre;
  if (datos.telefono !== undefined) this.telefono = datos.telefono;
  if (datos.direccion !== undefined) this.direccion = datos.direccion;
  if (datos.comuna !== undefined) this.comuna = datos.comuna;
  
  return await this.save();
};

UsuarioSchema.methods.compararPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.passwordHash);
};

// ===== TRANSFORMACIÓN JSON =====
UsuarioSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);
export default Usuario;
