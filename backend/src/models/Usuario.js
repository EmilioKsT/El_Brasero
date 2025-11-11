import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UsuarioSchema = new mongoose.Schema({
    email: {
        type : String,
        required : [true, 'El email es obligatorio'],
        unique : true,
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
    }
}, {
    timestamps : true
});

//Hashear contraseña antes de guardar
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

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

const Usuario = mongoose.model('Usuario', UsuarioSchema);
export default Usuario;
