import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('MongoDB Atlas conectado correctamente');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Base de datos: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1); // Salir si no puede conectar
  }
};

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de MongoDB:', err);
});
