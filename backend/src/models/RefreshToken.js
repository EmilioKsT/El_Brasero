import mongoose from 'mongoose';
import { config } from '../config/env.js';

const RefreshTokenSchema = new mongoose.Schema({
  tokenValue: {
    type: String,
    required: true,
  },
  
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  
  isRevoked: {
    type: Boolean,
    default: false
  },
  
  userAgent: String,
  ipAddress: String,
  
  expiresAt: {
    type: Date,
    required: true
    // NO poner index: true aquí (se declara abajo)
  }
}, {
  timestamps: true
});

// Índices (declarar solo aquí, NO en el schema arriba)
RefreshTokenSchema.index({ tokenValue: 1 }, { unique: true });
RefreshTokenSchema.index({ usuarioId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

// Métodos estáticos
RefreshTokenSchema.statics.isValid = async function(tokenValue) {
  const token = await this.findOne({
    tokenValue,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).populate('usuarioId');
  
  if (token && token.usuarioId && !token.usuarioId.activo) {
    console.log(`⚠️  ZTA: Usuario ${token.usuarioId._id} desactivado`);
    await token.revoke();
    return null;
  }
  
  return token;
};

RefreshTokenSchema.statics.revokeAllByUser = async function(usuarioId) {
  const result = await this.updateMany(
    { usuarioId, isRevoked: false },
    { $set: { isRevoked: true } }
  );
  
  console.log(`🔒 Revocados ${result.modifiedCount} tokens`);
  return result.modifiedCount;
};

RefreshTokenSchema.methods.revoke = async function() {
  this.isRevoked = true;
  await this.save();
};

/**
 * Crea un nuevo token con límite de sesiones activas
 * Si el usuario excede el límite, revoca la sesión más antigua
 */
RefreshTokenSchema.statics.createWithLimit = async function(tokenData) {
  const { usuarioId } = tokenData;
  const maxSesiones = config.sessions.maxActivePerUser;

  // Contar sesiones activas
  const sesionesActivas = await this.countDocuments({
    usuarioId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });

  // Si excede el límite, revocar la más antigua
  if (sesionesActivas >= maxSesiones) {
    const tokenMasAntiguo = await this.findOne({
      usuarioId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: 1 }); // Ordenar por fecha de creación ascendente

    if (tokenMasAntiguo) {
      await tokenMasAntiguo.revoke();
      console.log(`⚠️  Sesión más antigua revocada (límite: ${maxSesiones})`);
    }
  }

  // Crear el nuevo token
  return this.create(tokenData);
};

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

export default RefreshToken;