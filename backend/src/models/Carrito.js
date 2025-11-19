import mongoose from 'mongoose';
const { Schema } = mongoose;

// Este es el schema para un item DENTRO del carrito
const itemCarritoSchema = new Schema({
  producto: {
    type: Schema.Types.ObjectId,
    ref: 'Producto', // Referencia al modelo Producto
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: [1,],
    default: 1
  }
}, {
  _id: false // No es una colección separada
});

// Este es el schema del Carrito principal
const carritoSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true // Cada usuario tiene UN solo carrito
  },
  items: [itemCarritoSchema],
}, {
  timestamps: true // Para saber cuándo fue la última modificación
});

/**
 * Método para calcular el total de ítems (para el badge B-07)
 */
carritoSchema.methods.calcularTotalItems = function() {
  if (!this.items || this.items.length === 0) {
    return 0;
  }
  // Suma la 'cantidad' de cada item en el array
  return this.items.reduce((total, item) => total + item.cantidad, 0);
};

// Índice para encontrar rápido el carrito de un usuario
carritoSchema.index({ usuario: 1 });

const Carrito = mongoose.model('Carrito', carritoSchema);
export default Carrito;