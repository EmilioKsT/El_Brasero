import mongoose from 'mongoose';
const { Schema } = mongoose;

// Este es el sub-documento para CADA item dentro del pedido
// Hacemos un "snapshot" de los datos del producto al momento de la compra
const itemPedidoSchema = new Schema({
  producto: {
    type: Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  precioUnitario: {
    type: Number,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
}, {
  _id: false // No es necesario un _id para cada item
});

// Este es el schema del Pedido principal
const pedidoSchema = new Schema({
  // Referencia al usuario que compró
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  
  // Array de items (el snapshot que definimos arriba)
  items: [itemPedidoSchema],
  
  // Total del pedido (calculado en el backend)
  total: {
    type: Number,
    required: true
  },
  
  // Estado inicial del pedido
  estado: {
    type: String,
    required: true,
    enum: ['Pendiente de pago', 'Pagado', 'En preparación', 'Despachado', 'Entregado', 'Anulado'],
    default: 'Pendiente de pago'
  },
  
  // --- Datos del cliente (del formulario B-12) ---
  nombreCliente: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  comuna: {
    type: String,
    required: [true, 'La comuna es obligatoria'],
    trim: true
  },
  
  // --- 🔥 NUEVOS CAMPOS PARA WEBPAY ---
  
  // ID único de la orden en Transbank (formato: O-xxxxx-xxxxx)
  buyOrder: {
    type: String,
    unique: true,     // Evita duplicados
    sparse: true,     // Permite null/undefined para pedidos sin iniciar pago
  },
  
  // Token de la transacción (útil para debugging y trazabilidad)
  transactionToken: {
    type: String,
    sparse: true
  },
  
  // Datos de la transacción completada (se guarda después de tx.commit())
  transactionData: {
    // Código de autorización del banco
    authorizationCode: String,
    
    // Fecha y hora de la transacción
    transactionDate: Date,
    
    // Últimos 4 dígitos de la tarjeta (para mostrar al cliente)
    cardNumber: String,
    
    // Tipo de pago (VD=Venta Débito, VN=Venta Normal, etc.)
    paymentTypeCode: String,
    
    // Cuotas (si aplica)
    installmentsNumber: Number,
    
    // Monto de cada cuota
    installmentsAmount: Number,
    
    // Balance (para validaciones)
    balance: Number
  },
  
  // Historial de intentos de pago (útil para debugging)
  paymentAttempts: [{
    timestamp: { type: Date, default: Date.now },
    status: String,      // 'initiated', 'authorized', 'rejected', 'cancelled'
    buyOrder: String,
    token: String,
    errorMessage: String
  }]
  
}, {
  timestamps: true // Para saber cuándo se creó (createdAt) y actualizó (updatedAt)
});

// --- ÍNDICES PARA OPTIMIZAR BÚSQUEDAS ---

// Índice para buscar rápido los pedidos de un usuario
pedidoSchema.index({ usuario: 1, createdAt: -1 });
// Índice para buscar por buyOrder (crítico para confirmarPagoWebPay)
// Índice compuesto para buscar pedidos pendientes de un usuario
pedidoSchema.index({ usuario: 1, estado: 1 });

// --- MÉTODOS VIRTUALES (OPCIONAL) ---

// Método para obtener el último intento de pago
pedidoSchema.virtual('ultimoIntentoPago').get(function() {
  if (!this.paymentAttempts || this.paymentAttempts.length === 0) return null;
  return this.paymentAttempts[this.paymentAttempts.length - 1];
});

// --- MÉTODOS DE INSTANCIA (OPCIONAL) ---

// Método helper para registrar un intento de pago
pedidoSchema.methods.registrarIntentoPago = function(status, buyOrder, token, errorMessage = null) {
  if (!this.paymentAttempts) {
    this.paymentAttempts = [];
  }
  
  this.paymentAttempts.push({
    timestamp: new Date(),
    status,
    buyOrder,
    token,
    errorMessage
  });
  
  return this.save();
};

// Método helper para verificar si el pedido está pagable
pedidoSchema.methods.esPagable = function() {
  return this.estado === 'Pendiente de pago' && this.total > 0;
};

// --- MIDDLEWARE PRE-SAVE (OPCIONAL) ---

// Validar que el total coincida con la suma de subtotales
pedidoSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    const calculatedTotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Tolerancia de 1 peso por redondeos
    if (Math.abs(this.total - calculatedTotal) > 1) {
      return next(new Error(`El total (${this.total}) no coincide con la suma de subtotales (${calculatedTotal})`));
    }
  }
  next();
});

const Pedido = mongoose.model('Pedido', pedidoSchema);
export default Pedido;