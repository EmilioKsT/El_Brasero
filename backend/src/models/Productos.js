import mongoose from 'mongoose';

// Definimos las categorías basándonos en tu frontend (productos.html)
const CATEGORIAS_VALIDAS = [
  'Pollos', 
  'Combos', 
  'Acompañamientos', 
  'Bebidas',
  'Ensaladas' // Agregada desde GridProductos.html
];

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener mínimo 3 caracteres']
  },
  
  descripcion: {
    type: String,
    trim: true,
    default: ''
  },
  
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [1, 'El precio debe ser mayor a 0']
  },
  
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: CATEGORIAS_VALIDAS,
      message: 'Categoría no válida'
    }
  },
  
  imagenUrl: {
    type: String,
    trim: true,
    // Opcionalmente, puedes validar que sea una URL con 'match'
  },
  
  disponible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt
});

// Índice para búsquedas rápidas por nombre y categoría
productoSchema.index({ nombre: 'text' });
productoSchema.index({ categoria: 1 });

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;