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
  }
  
}, {
  timestamps: true // Para saber cuándo se creó (fechaCreacion)
});

// Índice para buscar rápido los pedidos de un usuario
pedidoSchema.index({ usuario: 1, createdAt: -1 });

const Pedido = mongoose.model('Pedido', pedidoSchema);
export default Pedido;